require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const amqp = require('amqplib');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize notifications table
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      order_id INT,
      user_id INT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
initDB().catch(console.error);

let channel;
async function connectMQ(){
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  await channel.assertExchange('events', 'topic', { durable: true });
  const q = await channel.assertQueue('notification-service', { durable: true });
  await channel.bindQueue(q.queue, 'events', 'order.created');
  await channel.bindQueue(q.queue, 'events', 'delivery.updated');
  await channel.consume(q.queue, async (msg)=>{
    if (!msg) return;
    const evt = JSON.parse(msg.content.toString());
    console.log('[Notification] Event:', evt);
    
    try {
      if (evt.type === 'order.created') {
        // Create notification for admin
        await pool.query(
          'INSERT INTO notifications (type, title, message, order_id, user_id) VALUES ($1, $2, $3, $4, NULL)',
          ['order', 'New Order Received', `Order #${evt.orderId} placed by user ${evt.userId} for Rs. ${evt.total}`, evt.orderId]
        );
        
        // Create notification for customer
        await pool.query(
          'INSERT INTO notifications (type, title, message, order_id, user_id) VALUES ($1, $2, $3, $4, $5)',
          ['order', 'Order Placed Successfully', `Your order #${evt.orderId} has been placed and is being processed`, evt.orderId, evt.userId]
        );
        
        // Send email to auth service for customer confirmation
        await sendNotificationEmail({
          to: evt.customerEmail,
          subject: `Order Confirmation - #${evt.orderId}`,
          type: 'order_confirmation',
          orderId: evt.orderId,
          customerName: evt.customerName,
          orderDetails: evt.orderDetails
        });
        
      } else if (evt.type === 'delivery.updated') {
        // Create notification for customer about delivery status
        const customer = await pool.query('SELECT email, name FROM users u JOIN orders o ON u.id = o.user_id WHERE o.id = $1', [evt.orderId]);
        if (customer.rows[0]) {
          await pool.query(
            'INSERT INTO notifications (type, title, message, order_id, user_id) VALUES ($1, $2, $3, $4, $5)',
            ['delivery', 'Delivery Update', `Your order #${evt.orderId} status: ${evt.status}`, evt.orderId, customer.rows[0].id]
          );
        }
      }
    } catch (error) {
      console.error('Notification processing error:', error);
    }
    
    channel.ack(msg);
  });
}
connectMQ().catch(console.error);

// Send email via auth service
async function sendNotificationEmail(emailData) {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-cluster-ip:3001';
    const response = await fetch(`${authServiceUrl}/send-order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
    } else {
      console.log('Email sent successfully to:', emailData.to);
    }
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

app.get('/health', (req,res)=>res.json({ok:true, service:'notification'}));

// Get notifications (for admin dashboard or user notifications)
app.get('/notifications', async (req, res) => {
  try {
    const { type, limit = 50, user_id } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    let params = [];
    
    if (type) {
      query += ' AND type = $' + (params.length + 1);
      params.push(type);
    }
    
    if (user_id) {
      // For specific user notifications
      query += ' AND user_id = $' + (params.length + 1);
      params.push(Number(user_id));
    } else {
      // For admin notifications (user_id is NULL)
      query += ' AND user_id IS NULL';
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(Number(limit));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count (for admin or specific user)
app.get('/notifications/unread/count', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT COUNT(*) FROM notifications WHERE read = FALSE';
    let params = [];
    
    if (user_id) {
      query += ' AND user_id = $1';
      params.push(Number(user_id));
    } else {
      query += ' AND user_id IS NULL';
    }
    
    const result = await pool.query(query, params);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
app.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

const port = process.env.PORT || 3005;
app.listen(port, ()=> console.log(`Notification service on ${port}`));
