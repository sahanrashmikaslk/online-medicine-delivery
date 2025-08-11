require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const amqp = require('amqplib');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

let channel;
async function connectMQ(){
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await conn.createChannel();
  await channel.assertExchange('events', 'topic', { durable: true });
  const q = await channel.assertQueue('notification-service', { durable: true });
  await channel.bindQueue(q.queue, 'events', 'order.created');
  await channel.bindQueue(q.queue, 'events', 'delivery.updated');
  await channel.consume(q.queue, (msg)=>{
    if (!msg) return;
    const evt = JSON.parse(msg.content.toString());
    // Demo: log. In production, send email/SMS/push.
    console.log('[Notification] Event:', evt);
    channel.ack(msg);
  });
}
connectMQ().catch(console.error);

app.get('/health', (req,res)=>res.json({ok:true, service:'notification'}));

const port = process.env.PORT || 3005;
app.listen(port, ()=> console.log(`Notification service on ${port}`));
