require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    params: req.params
  });
  next();
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let channel;
async function connectMQ(){
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  await channel.assertExchange('events', 'topic', { durable: true });
  const q = await channel.assertQueue('delivery-service', { durable: true });
  await channel.bindQueue(q.queue, 'events', 'order.created');
  await channel.consume(q.queue, async (msg)=>{
    if (!msg) return;
    const evt = JSON.parse(msg.content.toString());
    if (evt.type === 'order.created'){
      // create delivery record
      await pool.query('INSERT INTO deliveries(order_id, status, address, courier) VALUES ($1,$2,$3,$4)',
        [evt.orderId, 'PENDING', evt.address, 'SpeedX']);
      // emit delivery.updated
      const upd = { type:'delivery.updated', orderId: evt.orderId, status:'PENDING' };
      channel.publish('events', 'delivery.updated', Buffer.from(JSON.stringify(upd)), { persistent: true });
    }
    channel.ack(msg);
  });
}
connectMQ().catch(console.error);

app.get('/health', (req,res)=>res.json({ok:true, service:'delivery'}));

app.get('/:orderId(\\d+)', async (req,res)=>{
  const id = Number(req.params.orderId);
  const r = await pool.query(
    'SELECT * FROM deliveries WHERE order_id=$1 ORDER BY updated_at DESC LIMIT 1', [id]
  );
  if (!r.rows[0]) return res.status(404).json({error:'not found'});
  res.json(r.rows[0]);
});


app.patch('/:orderId(\\d+)', async (req,res)=>{
  try {
    const id = Number(req.params.orderId);
    console.log('PATCH delivery request:', { orderId: id, body: req.body });
    
    const status = (req.body?.status || '').toUpperCase();
    const allowed = ['PENDING','DISPATCHED','IN_TRANSIT','DELIVERED','FAILED'];
    
    if (!status) {
      console.log('No status provided in request body');
      return res.status(400).json({error:'status required'});
    }
    
    if (!allowed.includes(status)) {
      console.log('Invalid status:', status, 'allowed:', allowed);
      return res.status(400).json({error:'bad status', received: status, allowed});
    }

  // Try update first
  const upd = await pool.query(
    'UPDATE deliveries SET status=$1, updated_at=NOW() WHERE order_id=$2 RETURNING *',
    [status, id]
  );
  let row = upd.rows[0];

  // If missing, create a record so admin can manage it anyway
  if (!row) {
    // We don't have the original address here (it came via event),
    // so store a placeholder. (Optional: extend `orders` to store address.)
    const ins = await pool.query(
      'INSERT INTO deliveries(order_id, status, address, courier) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, status, 'UNKNOWN', 'SpeedX']
    );
    row = ins.rows[0];
  }

  // publish update
  if (channel){
    const evt = { type:'delivery.updated', orderId:id, status };
    channel.publish('events', 'delivery.updated', Buffer.from(JSON.stringify(evt)), { persistent: true });
  }

  console.log('Delivery status updated successfully:', row);
  res.json(row);
  } catch (error) {
    console.error('Delivery update error:', error);
    res.status(500).json({error: 'Internal server error', details: error.message});
  }
});


});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const port = process.env.PORT || 3004;
app.listen(port, ()=> console.log(`Delivery service on ${port}`));
