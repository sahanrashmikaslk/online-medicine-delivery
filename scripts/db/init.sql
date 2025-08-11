-- Postgres bootstrap for Online Medicine Delivery
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id INT NOT NULL REFERENCES medicines(id),
  quantity INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  address TEXT NOT NULL,
  courier TEXT DEFAULT 'N/A',
  updated_at TIMESTAMP DEFAULT NOW()
);
-- Seed admin user (password: Admin@123)
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@meds.com',
    '$2b$10$/lIg12Kx3s7EZmcmwbFAfuBl/jFVMXUz206WYmMgDwT48MQqbiBv6',
    'ADMIN'
  ) ON CONFLICT (email) DO NOTHING;
-- Sample medicines
INSERT INTO medicines (name, description, price, stock)
VALUES (
    'Paracetamol 500mg',
    'Pain relief and fever reducer',
    3.50,
    500
  ),
  (
    'Amoxicillin 250mg',
    'Antibiotic (requires prescription)',
    12.90,
    200
  ),
  (
    'Cetirizine 10mg',
    'Antihistamine for allergies',
    4.75,
    350
  ),
  (
    'Omeprazole 20mg',
    'Acid reflux treatment',
    9.20,
    300
  ) ON CONFLICT DO NOTHING;