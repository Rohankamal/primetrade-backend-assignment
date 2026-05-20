const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 🗄️ DATA STRUCT SCHEMAS (MongoDB Models)
// ==========================================
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" }
});
const Task = mongoose.model('Task', TaskSchema);

// ==========================================
// 🔐 IDENTITY SECURE ARCHITECTURE
// ==========================================

// 1. REGISTER INSTANCE CONFIGURATION
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Registration aborted: Assigned network identity already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "Operator profile successfully configured within system matrix. Proceed to authentication." });
    } catch (err) {
        res.status(500).json({ message: "Internal Database Exception: " + err.message });
    }
});

// 2. LOGIN SESSION DISPATCH
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Authentication rejected: Identity not verified within current cluster index." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Authentication rejected: Cryptographic passphrase mismatch." });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, 'MY_SECRET_KEY', { expiresIn: '1h' });
        
        res.status(200).json({ 
            token, 
            user: { name: user.name, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ message: "Internal Gateway Exception: " + err.message });
    }
});

// ==========================================
// 📝 CORE PROTOCOL STREAM LAYER (CRUD)
// ==========================================

// 1. CREATE DATA STRUCT LOG
router.post('/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ message: "Validation Exception: Structural header parameter required." });

        const newTask = new Task({ title, description });
        await newTask.save();

        const allTasks = await Task.find();
        res.status(201).json({ message: "Transaction completed: Payload entry securely appended.", tasks: allTasks });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. READ ALL STREAM SEGMENTS
router.get('/tasks', async (req, res) => {
    try {
        const allTasks = await Task.find();
        res.status(200).json({ tasks: allTasks });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. DELETE/PURGE DATA ROUTINE
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Segment execution dropped: Target unique identifier missing from cache node." });
        }

        const allTasks = await Task.find();
        res.status(200).json({ message: "Memory space reclaimed: Segment purged successfully.", tasks: allTasks });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;