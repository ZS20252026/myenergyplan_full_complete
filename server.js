const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());
// serve frontend static files
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

// helper
function readDB(){ try{ return JSON.parse(fs.readFileSync(DB,'utf8')); }catch(e){ return {subscriptions:[],orders:[]}; } }
function writeDB(d){ fs.writeFileSync(DB, JSON.stringify(d, null,2)); }

app.get('/api/check-subscription', (req,res)=>{
  const email = req.query.email;
  const db = readDB();
  const s = (db.subscriptions||[]).find(x=>x.email===email && new Date(x.expires) > new Date());
  res.json({ active: !!s });
});

app.post('/api/create-order', (req,res)=>{
  const { email, appFile } = req.body;
  const db = readDB();
  db.orders = db.orders || [];
  const orderId = Date.now().toString();
  db.orders.push({ orderId, email, appFile, status:'created', created:new Date().toISOString() });
  writeDB(db);
  // Simulation URL -> payment page
  const simulateUrl = `/frontend/payment.html?orderId=${orderId}&email=${encodeURIComponent(email)}`;
  // TODO: Replace simulateUrl with real HPP creation when you have merchant credentials
  res.json({ checkoutUrl: simulateUrl });
});

// webhook endpoint (called by provider in production or by /frontend/payment.html in simulation)
app.post('/api/webhook', (req,res)=>{
  const { orderId, email, status } = req.body;
  const db = readDB();
  db.orders = db.orders || [];
  const order = db.orders.find(o=>o.orderId===orderId);
  if(!order) return res.status(404).json({ ok:false, error:'order not found' });
  order.status = status || 'paid';
  // activate subscription 1 month
  const expires = new Date(); expires.setMonth(expires.getMonth()+1);
  db.subscriptions = db.subscriptions || [];
  const exist = db.subscriptions.find(s=>s.email===email);
  if(exist){ exist.expires = expires.toISOString(); exist.active = true; } else db.subscriptions.push({ email, active:true, expires:expires.toISOString() });
  writeDB(db);
  res.json({ ok:true });
});

// convenience: serve root frontend index
app.get('/', (req,res)=> res.redirect('/frontend/index.html'));

app.listen(PORT, ()=> console.log(`Backend listening at http://localhost:${PORT}`));
