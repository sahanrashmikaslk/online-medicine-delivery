require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const amqp = require('amqplib');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const orderSchema = z.object({
  items: z.array(z.object({
    medicine_id: z.number().int().positive(),
    quantity: z.number().int().positive()
  })),
  address: z.string().min(5)
});

let amqpConn, channel;
async function connectMQ(){
  try {
    amqpConn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await amqpConn.createChannel();
    await channel.assertExchange('events', 'topic', { durable: true });
  } catch (err) {
    console.error('RabbitMQ connect error', err);
  }
}
connectMQ().catch(console.error);

function getUser(req){
  const auth = req.headers.authorization || '';
  if(!auth.startsWith('Bearer ')) return null;
  try { return jwt.decode(auth.slice(7)); } catch(e){ return null; }
}

app.get('/health', (req,res)=>res.json({ok:true, service:'order'}));

/** Create order */
app.post('/', async (req,res)=>{
  try{
    const user = getUser(req);
    if(!user) return res.status(401).json({error:'unauthorized'});

    const data = orderSchema.parse(req.body);

    // coerce and validate ids defensively (in case frontend sends strings)
    const ids = data.items.map(i => Number(i.medicine_id));
    if (ids.some(n => !Number.isInteger(n) || n <= 0)) {
      return res.status(400).json({ error: 'invalid medicine_id(s)' });
    }

    // fetch meds
    const meds = await pool.query(
      'SELECT id, price, stock FROM medicines WHERE id = ANY($1::int[])',
      [ids]
    );
    if (meds.rows.length !== ids.length) return res.status(400).json({error:'invalid medicine id(s)'});

    // compute total & stock check
    let total = 0;
    for(const item of data.items){
      const m = meds.rows.find(r=>r.id === Number(item.medicine_id));
      if (!m) return res.status(400).json({error:`medicine ${item.medicine_id} not found`});
      if (m.stock < item.quantity) return res.status(400).json({error:`insufficient stock for med ${m.id}`});
      total += Number(m.price) * item.quantity;
    }

    // create order
    const o = await pool.query(
      'INSERT INTO orders(user_id,total_amount,status,delivery_address) VALUES ($1,$2,$3,$4) RETURNING *',
      [user.sub, total, 'PLACED', data.address]
    );

    // items + stock deduction
    for(const item of data.items){
      const m = meds.rows.find(r=>r.id === Number(item.medicine_id));
      await pool.query(
        'INSERT INTO order_items(order_id, medicine_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [o.rows[0].id, Number(item.medicine_id), item.quantity, m.price]
      );
      await pool.query('UPDATE medicines SET stock = stock - $1 WHERE id = $2',
        [item.quantity, Number(item.medicine_id)]);
    }

    // publish event with customer details for email
    const customerInfo = await pool.query('SELECT email, name FROM users WHERE id = $1', [user.sub]);
    const customer = customerInfo.rows[0] || { email: user.email, name: user.name };
    
    // Get order items for email
    const orderItems = await Promise.all(data.items.map(async (item) => {
      const med = meds.rows.find(r => r.id === Number(item.medicine_id));
      return {
        name: med.name || `Medicine ${med.id}`,
        quantity: item.quantity,
        price: Number(med.price).toFixed(2)
      };
    }));
    
    const evt = { 
      type: 'order.created', 
      orderId: o.rows[0].id, 
      userId: user.sub, 
      address: data.address, 
      total: total.toFixed(2),
      customerEmail: customer.email,
      customerName: customer.name || customer.email.split('@')[0],
      orderDetails: {
        orderId: o.rows[0].id,
        items: orderItems,
        total: total.toFixed(2),
        deliveryAddress: data.address
      }
    };
    if (channel) channel.publish('events', 'order.created', Buffer.from(JSON.stringify(evt)), { persistent: true });

    res.json({ order: o.rows[0] });
  }catch(e){
    console.error(e);
    res.status(400).json({error:e.message});
  }
});

/** List my orders */
app.get('/', async (req,res)=>{
  try{
    const user = getUser(req);
    if(!user) return res.status(401).json({error:'unauthorized'});
    const orders = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC', [user.sub]);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.rows.map(async (order) => {
      const items = await pool.query(`
        SELECT oi.*, m.name as medicine_name 
        FROM order_items oi 
        LEFT JOIN medicines m ON oi.medicine_id = m.id 
        WHERE oi.order_id = $1
      `, [order.id]);
      return { ...order, items: items.rows };
    }));
    
    res.json(ordersWithItems);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'internal'});
  }
});

/** List all orders (ADMIN) — MUST be BEFORE '/:id' */
app.get('/all', async (req,res)=>{
  try{
    const user = getUser(req);
    if (!user) return res.status(401).json({error:'unauthorized'});
    if (user.role !== 'ADMIN') return res.status(403).json({error:'forbidden'});
    const r = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(r.rows);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'internal'});
  }
});

/** Get one order by id (digits only) */
app.get('/:id(\\d+)', async (req,res)=>{
  try{
    const user = getUser(req);
    if(!user) return res.status(401).json({error:'unauthorized'});
    const id = Number(req.params.id);
    const o = await pool.query('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [id, user.sub]);
    if(!o.rows[0]) return res.status(404).json({error:'not found'});
    const items = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [id]);
    res.json({ order: o.rows[0], items: items.rows });
  }catch(e){
    console.error(e);
    res.status(400).json({error:e.message});
  }
});

const port = process.env.PORT || 3003;
app.listen(port, ()=> console.log(`Order service on ${port}`));
