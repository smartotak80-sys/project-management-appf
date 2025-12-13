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
console.log("🦈 BARRACUDA FAMILY SYSTEM - RESTARTING...");
console.log("------------------------------------------------");

// Підключення до БД
if (!MONGO_URI) {
    console.error("❌ ПОМИЛКА: Відсутній MONGODB_URI у файлі .env");
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
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'member' }, 
    regDate: { type: Date, default: Date.now }
}));

const Member = mongoose.model('Member', new mongoose.Schema({
    name: String, role: String, owner: String, server: String,
    links: { discord: String, youtube: String },
    createdAt: { type: Date, default: Date.now }
}));

const Redux = mongoose.model('Redux', new mongoose.Schema({ 
    title: String, url: String, author: String, 
    createdAt: { type: Date, default: Date.now } 
}));

const News = mongoose.model('News', new mongoose.Schema({ title: String, date: String, summary: String }));
const Gallery = mongoose.model('Gallery', new mongoose.Schema({ url: String }));
const Video = mongoose.model('Video', new mongoose.Schema({ title: String, url: String }));

const Application = mongoose.model('Application', new mongoose.Schema({
    rlName: String, age: String, onlineTime: String, prevFamilies: String, history: String, note: String,
    status: { type: String, default: 'pending' }, submittedBy: String, adminComment: String, createdAt: { type: Date, default: Date.now }
}));

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
    author: String, title: String, status: { type: String, default: 'open' },
    messages: [{ sender: String, text: String, isStaff: Boolean, date: { type: Date, default: Date.now } }]
}));

// --- API МАРШРУТИ ---

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if(await User.findOne({ username })) return res.status(400).json({ success: false, message: 'Логін зайнятий' });
        await new User({ username, email, password }).save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if(username === (process.env.ADMIN_LOGIN || 'admin') && password === (process.env.ADMIN_PASS || 'admin')) {
         return res.json({ success: true, user: { username: 'ADMIN 🦈', role: 'admin' } });
    }
    const user = await User.findOne({ username, password });
    if (user) res.json({ success: true, user: { username: user.username, role: user.role } });
    else res.status(401).json({ success: false, message: 'Невірний пароль' });
});

// CRUD API
const createCrud = (path, Model) => {
    app.get(path, async (req, res) => { const d = await Model.find().sort({ _id: -1 }); res.json(d.map(x=>({...x._doc, id: x._id}))); });
    app.post(path, async (req, res) => { try { await new Model(req.body).save(); res.json({ success: true }); } catch(e){ res.status(500).json({success:false}); } });
    app.delete(`${path}/:id`, async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ success: true }); });
};

createCrud('/api/members', Member);
createCrud('/api/redux', Redux);
createCrud('/api/news', News);
createCrud('/api/gallery', Gallery);
createCrud('/api/videos', Video);
createCrud('/api/applications', Application);

// Special routes
app.put('/api/members/:id', async (req, res) => { await Member.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); });
app.get('/api/users', async (req, res) => { const u = await User.find(); res.json(u); });
app.put('/api/users/:u/role', async (req, res) => { await User.findOneAndUpdate({username:req.params.u}, {role:req.body.role}); res.json({success:true}); });
app.delete('/api/users/:u', async (req, res) => { await User.findOneAndDelete({username:req.params.u}); res.json({success:true}); });

// Tickets
app.get('/api/tickets', async (req, res) => { const t = await Ticket.find().sort({_id:-1}); res.json(t.map(x=>({...x._doc, id:x._id}))); });
app.post('/api/tickets', async (req, res) => { await new Ticket(req.body).save(); res.json({success:true}); });
app.put('/api/tickets/:id', async (req, res) => { 
    const { message, status } = req.body;
    const upd = {}; if(status) upd.status=status; if(message) upd.$push={messages:message};
    await Ticket.findByIdAndUpdate(req.params.id, upd); res.json({success:true}); 
});
app.put('/api/applications/:id', async (req, res) => { await Application.findByIdAndUpdate(req.params.id, req.body); res.json({success:true}); });

app.get("*", (req, res) => { 
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, '0.0.0.0', () => { console.log(`🚀 ONLINE: PORT ${PORT}`); });
