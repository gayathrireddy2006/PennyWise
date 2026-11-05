const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 1. Middleware
app.use(express.json()); // Allows us to read JSON data from the frontend
app.use(cors());         // Fixes the Network Error (allows frontend to connect)

// 2. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pennywise')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// ==========================================
// 3. DATABASE MODELS (Schemas)
// ==========================================

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Expense = mongoose.model('Expense', ExpenseSchema);

// ==========================================
// 4. MIDDLEWARE (Protect Routes)
// ==========================================
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Token comes as "Bearer eyJhbG..."
    const decoded = jwt.verify(token.split(' ')[1], 'mysecretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ==========================================
// 5. API ROUTES
// ==========================================

// --- AUTH ROUTES ---

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password (encrypt it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create Token
    const token = jwt.sign({ id: user._id }, 'mysecretkey', { expiresIn: '1d' });

    // Send token and user info back to frontend
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- EXPENSE ROUTES ---

// Get all expenses for the logged-in user
app.get('/api/expenses', auth, async (req, res) => {
  try {
    // Find expenses where userId matches the logged-in user
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new expense
app.post('/api/expenses', auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    
    const newExpense = new Expense({
      userId: req.user.id,
      title,
      amount,
      category
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. START SERVER
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});