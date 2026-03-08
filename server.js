const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// 🌐 YOUR DATABASE (Linked from your screenshot)
const MONGO_URI = "mongodb+srv://Itsmrmonarch:itsmrmonarch@cluster0.lk3y9x4.mongodb.net/monarch_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ AI DATABASE CONNECTED"))
  .catch(err => console.error("❌ DB ERROR:", err));

// Database Model
const Game = mongoose.model('Game', new mongoose.Schema({
    mines: [Number],
    timestamp: { type: Date, default: Date.now }
}));

// API: Give Prediction
app.get('/api/ext/predictions', async (req, res) => {
    const history = await Game.find().sort({ timestamp: -1 }).limit(1000);
    let freq = Array(25).fill(0);
    history.forEach(g => g.mines.forEach(m => { if(m < 25) freq[m]++; }));
    let sorted = freq.map((v, i) => ({ i, v })).sort((a, b) => a.v - b.v).map(x => x.i);
    
    if (history.length < 2) sorted = [...Array(25).keys()].sort(() => Math.random() - 0.5);
    res.json([{ tile_array: sorted, games_analyzed: history.length }]);
});

// API: Learn from Game
app.post('/api/learn', async (req, res) => {
    if (req.body.mines) {
        await new Game({ mines: req.body.mines }).save();
        res.json({ success: true });
    }
});

app.listen(process.env.PORT || 10000, () => console.log("Server Active"));
