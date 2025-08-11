require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const { createClient } = require('redis');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch(console.error);

const medSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative()
});

// simple admin guard (defense-in-depth; gateway already enforces)
function requireAdmin(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    if (payload.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

async function clearMedCache() {
  // delete keys with prefix meds:
  for await (const key of redis.scanIterator({ MATCH: 'meds:*' })) {
    await redis.del(key);
  }
}

app.get('/health', (req, res) => res.json({ ok: true, service: 'catalog' }));

app.get('/medicines', async (req, res) => {
  const q = (req.query.search || '').toString().toLowerCase();
  const cacheKey = `meds:${q}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  let sql = 'SELECT * FROM medicines';
  let params = [];
  if (q) {
    sql += ' WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1';
    params.push(`%${q}%`);
  }
  const r = await pool.query(sql, params);
  await redis.set(cacheKey, JSON.stringify(r.rows), { EX: 30 });
  res.json(r.rows);
});

app.get('/medicines/:id', async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query('SELECT * FROM medicines WHERE id=$1', [id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(r.rows[0]);
});

// CREATE (ADMIN)
app.post('/medicines', requireAdmin, async (req, res) => {
  try {
    const data = medSchema.parse(req.body);
    const r = await pool.query(
      'INSERT INTO medicines(name, description, price, stock) VALUES ($1,$2,$3,$4) RETURNING *',
      [data.name, data.description || '', data.price, data.stock]
    );
    await clearMedCache();
    res.json(r.rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE (ADMIN)
app.put('/medicines/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const partial = medSchema.partial();
  try {
    const data = partial.parse(req.body);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [k, v] of Object.entries(data)) {
      fields.push(`${k}=$${idx++}`);
      values.push(v);
    }
    if (!fields.length) return res.status(400).json({ error: 'no fields' });
    values.push(id);
    const r = await pool.query(`UPDATE medicines SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`, values);
    if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
    await clearMedCache();
    res.json(r.rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE (ADMIN)
app.delete('/medicines/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query('DELETE FROM medicines WHERE id=$1 RETURNING id', [id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
  await clearMedCache();
  res.json({ ok: true });
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Catalog service on ${port}`));
