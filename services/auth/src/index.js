require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email service setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN','CUSTOMER']).optional()
});

const googleAuthSchema = z.object({
  credential: z.string(),
  role: z.enum(['ADMIN','CUSTOMER']).optional()
});

// Helper function to send welcome email
async function sendWelcomeEmail(email, name) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Online Medicine Delivery!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Online Medicine Delivery! 🏥</h2>
          <p>Dear ${name || 'Customer'},</p>
          <p>Thank you for joining our online medicine delivery platform. We're excited to help you with your healthcare needs.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What you can do:</h3>
            <ul style="color: #374151;">
              <li>Browse our extensive medicine catalog</li>
              <li>Place orders for prescription and over-the-counter medicines</li>
              <li>Track your delivery in real-time</li>
              <li>Manage your prescriptions and orders</li>
            </ul>
          </div>
          
          <p>Visit our platform: <a href="https://34.128.184.43.nip.io" style="color: #2563eb;">Online Medicine Delivery</a></p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
          
          <p>Best regards,<br>Online Medicine Delivery Team</p>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

app.get('/health', async (req,res)=>{
  try { await pool.query('SELECT 1'); res.json({ok:true, service:'auth'}); }
  catch(e){ res.status(500).json({ok:false, error:e.message}); }
});

// Regular registration
app.post('/register', async (req,res)=>{
  try {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);
    const role = data.role || 'CUSTOMER';
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email=$1', [data.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({error: 'User already exists'});
    }
    
    const r = await pool.query(
      'INSERT INTO users(email, password_hash, role, name, auth_provider) VALUES ($1,$2,$3,$4,$5) RETURNING id,email,role,name',
      [data.email, hash, role, data.name || data.email.split('@')[0], 'local']
    );
    
    const user = r.rows[0];
    const token = generateToken(user);
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch(e){
    res.status(400).json({error: e.message});
  }
});

// Google Sign-In: support both /auth/google and /google because the gateway rewrites '/api/auth' and '/auth'
app.post(['/auth/google','/google'], async (req, res) => {
  try {
    const data = googleAuthSchema.parse(req.body);
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: data.credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    if (!email) {
      return res.status(400).json({error: 'Email not provided by Google'});
    }
    
    // Check if user exists
    let user;
    const existingUser = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    
    if (existingUser.rows.length > 0) {
      // User exists, update Google info if needed
      user = existingUser.rows[0];
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id=$1, auth_provider=$2, name=$3, profile_picture=$4 WHERE id=$5',
          [googleId, 'google', name, picture, user.id]
        );
        user.name = name;
        user.profile_picture = picture;
      }
    } else {
      // Create new user
      const role = data.role || 'CUSTOMER';
      const result = await pool.query(
        'INSERT INTO users(email, role, name, google_id, auth_provider, profile_picture) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,email,role,name,profile_picture',
        [email, role, name, googleId, 'google', picture]
      );
      user = result.rows[0];
      
      // Send welcome email for new users
      await sendWelcomeEmail(email, name);
    }
    
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profilePicture: user.profile_picture,
        authProvider: 'google'
      }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({error: 'Invalid Google credential'});
  }
});

// Regular login
app.post('/login', async (req,res)=>{
  const {email, password} = req.body;
  if(!email || !password) return res.status(400).json({error:'email/password required'});
  
  const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const u = r.rows[0];
  if(!u) return res.status(401).json({error:'invalid credentials'});
  
  // Check if user signed up with Google
  if (u.auth_provider === 'google' && !u.password_hash) {
    return res.status(400).json({error: 'Please sign in with Google'});
  }
  
  const ok = await bcrypt.compare(password, u.password_hash);
  if(!ok) return res.status(401).json({error:'invalid credentials'});
  
  const token = generateToken(u);
  res.json({ 
    token,
    user: {
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      profilePicture: u.profile_picture
    }
  });
});

// Send email notification
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, type } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({error: 'Missing required fields: to, subject, html'});
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };
    
    await emailTransporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({error: 'Failed to send email'});
  }
});

// Send order confirmation email
app.post('/send-order-confirmation', async (req, res) => {
  try {
    const { email, orderDetails, customerName } = req.body;
    
    const { orderId, items, total, deliveryAddress } = orderDetails;
    
    const itemsList = items.map(item => 
      `<li>${item.name} - Qty: ${item.quantity} - Rs. ${item.price}</li>`
    ).join('');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmation - #${orderId}</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Your medicines are being prepared for delivery.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Order Details:</h3>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Items:</strong></p>
          <ul>${itemsList}</ul>
          <p><strong>Total:</strong> Rs. ${total}</p>
          <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        </div>
        
        <p>You can track your order status on our platform.</p>
        
        <p>Best regards,<br>Online Medicine Delivery Team</p>
      </div>
    `;
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation - #${orderId}`,
      html
    });
    
    res.json({ success: true, message: 'Order confirmation email sent' });
  } catch (error) {
    console.error('Order email error:', error);
    res.status(500).json({error: 'Failed to send order confirmation email'});
  }
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
