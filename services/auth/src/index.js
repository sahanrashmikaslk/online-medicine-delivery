require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN','CUSTOMER']).optional()
});

app.get('/health', async (req,res)=>{
  try { await pool.query('SELECT 1'); res.json({ok:true, service:'auth'}); }
  catch(e){ res.status(500).json({ok:false, error:e.message}); }
});

app.post('/register', async (req,res)=>{
  try {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);
    const role = data.role || 'CUSTOMER';
    const r = await pool.query('INSERT INTO users(email, password_hash, role) VALUES ($1,$2,$3) RETURNING id,email,role', [data.email, hash, role]);
    res.json(r.rows[0]);
  } catch(e){
    res.status(400).json({error: e.message});
  }
});

app.post('/login', async (req,res)=>{
  const {email, password} = req.body;
  if(!email || !password) return res.status(400).json({error:'email/password required'});
  const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const u = r.rows[0];
  if(!u) return res.status(401).json({error:'invalid credentials'});
  const ok = await bcrypt.compare(password, u.password_hash);
  if(!ok) return res.status(401).json({error:'invalid credentials'});
  const token = jwt.sign({ sub: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.get('/me', async (req,res)=>{
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ')? auth.slice(7):null;
  if(!token) return res.status(401).json({error:'missing token'});
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    res.json(payload);
  }catch(e){
    res.status(401).json({error:'invalid token'});
  }
});

const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log(`Auth service on ${port}`));
