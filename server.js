require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

console.log("------------------------------------------------");
console.log("🦈 BARRACUDA FAMILY SYSTEM - ULTIMATE EDITION");
console.log("------------------------------------------------");

if (!MONGO_URI) {
    console.error("❌ ПОМИЛКА: Немає посилання на базу даних (MONGODB_URI)!");
} else {
    mongoose.set('strictQuery', false);
    mongoose.connect(MONGO_URI)
        .then(() => console.log("✅ БАЗА ДАНИХ ПІДКЛЮЧЕНА!"))
        .catch(err => console.error("❌ ПОМИЛКА БД:", err.message));
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname)); 

// --- СХЕМИ ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'member' }, 
    regDate: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const MemberSchema = new mongoose.Schema({
    name: String, role: String, owner: String, 
    links: { discord: String, youtube: String, tg: String },
    createdAt: { type: Date, default: Date.now }
});
const Member = mongoose.model('Member', MemberSchema);

const NewsSchema = new mongoose.Schema({ title: String, date: String, summary: String, createdAt: { type: Date, default: Date.now } });
const News = mongoose.model('News', NewsSchema);

const GallerySchema = new mongoose.Schema({ url: String, createdAt: { type: Date, default: Date.now } });
const Gallery = mongoose.model('Gallery', GallerySchema);

// НОВА СХЕМА МАГАЗИНУ
const ShopItemSchema = new mongoose.Schema({
    title: String,
    price: String,
    image: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
});
const ShopItem = mongoose.model('ShopItem', ShopItemSchema);

const ApplicationSchema = new mongoose.Schema({
    rlName: String, age: String, onlineTime: String, prevFamilies: String, history: String, note: String,
    status: { type: String, default: 'pending' }, 
    submittedBy: String, adminComment: String,
    createdAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', ApplicationSchema);

const TicketSchema = new mongoose.Schema({
    author: String, title: String,
    messages: [{ sender: String, text: String, date: { type: Date, default: Date.now }, isStaff: Boolean }],
    status: { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// --- API ---

// AUTH
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ success: false, message: 'Логін або Email зайняті' });
        await new User({ username, email, password, role: 'member' }).save();
        res.json({ success: true, message: 'ОК' });
    } catch (err) { res.status(500).json({ success: false, message: 'Помилка сервера' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const adminLogin = process.env.ADMIN_LOGIN || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if(username === adminLogin && password === adminPass) {
         return res.json({ success: true, user: { username: 'ADMIN 🦈', role: 'admin' } });
    }
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, user: { username: user.username, role: user.role } });
        else res.status(401).json({ success: false, message: 'Невірні дані' });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/users/:username/role', async (req, res) => {
    try { await User.findOneAndUpdate({ username: req.params.username }, { role: req.body.role }); res.json({ success: true }); } 
    catch(e) { res.status(500).json({ success: false }); }
});

// MEMBERS & NEWS & GALLERY & SHOP
app.post('/api/members', async (req, res) => { try { await new Member(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/members', async (req, res) => { const m = await Member.find().sort({ createdAt: -1 }); res.json(m.map(x => ({ ...x._doc, id: x._id }))); });
app.put('/api/members/:id', async (req, res) => { await Member.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); });
app.delete('/api/members/:id', async (req, res) => { await Member.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/news', async (req, res) => { const n = await News.find().sort({ createdAt: -1 }); res.json(n.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/news', async (req, res) => { await new News(req.body).save(); res.json({ success: true }); });
app.delete('/api/news/:id', async (req, res) => { await News.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/gallery', async (req, res) => { const g = await Gallery.find().sort({ createdAt: -1 }); res.json(g.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/gallery', async (req, res) => { await new Gallery(req.body).save(); res.json({ success: true }); });
app.delete('/api/gallery/:id', async (req, res) => { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// API SHOP
app.get('/api/shop', async (req, res) => { const s = await ShopItem.find().sort({ createdAt: -1 }); res.json(s.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/shop', async (req, res) => { await new ShopItem(req.body).save(); res.json({ success: true }); });
app.delete('/api/shop/:id', async (req, res) => { await ShopItem.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// USERS API
app.get('/api/users', async (req, res) => { 
    try {
        const usersFromDb = await User.find().sort({ regDate: -1 });
        const systemAdmin = {
            _id: 'system_admin_id',
            username: process.env.ADMIN_LOGIN || 'admin',
            email: 'SYSTEM',
            password: '***',
            role: 'admin',
            regDate: new Date()
        };
        res.json([systemAdmin, ...usersFromDb]); 
    } catch(e) { res.status(500).json([]); }
});

app.delete('/api/users/:username', async (req, res) => { try { await User.findOneAndDelete({ username: req.params.username }); await Member.deleteMany({ owner: req.params.username }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); } });

// APPS & TICKETS
app.post('/api/applications', async (req, res) => { try { await new Application(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/applications', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.get('/api/applications/my', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.put('/api/applications/:id', async (req, res) => { try { const { status, adminComment } = req.body; await Application.findByIdAndUpdate(req.params.id, { status, adminComment }); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.delete('/api/applications/:id', async (req, res) => { try { await Application.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

app.post('/api/tickets', async (req, res) => { try { await new Ticket(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/tickets', async (req, res) => { const tickets = await Ticket.find().sort({ createdAt: -1 }); res.json(tickets.map(t => ({ ...t._doc, id: t._id }))); });
app.put('/api/tickets/:id', async (req, res) => { try { const { message, status } = req.body; const update = {}; if (status) update.status = status; if (message) update.$push = { messages: message }; await Ticket.findByIdAndUpdate(req.params.id, update); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

app.get("*", (req, res) => { 
    const p1 = path.join(__dirname, "public", "index.html");
    const p2 = path.join(__dirname, "index.html");
    res.sendFile(p1, (err) => { if(err) res.sendFile(p2); });
});

app.listen(PORT, '0.0.0.0', () => { console.log(`\n🚀 СЕРВЕР ЗАПУЩЕНО НА ПОРТУ ${PORT}!`); });
