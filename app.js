const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb+srv://ansh:anshpass@cluster0.xijas.mongodb.net/expenseManager?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// User Schema and Model for registration and login
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Transaction Schema and Model for expense tracking
const transactionSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    category: String,
    date: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Add userId field
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Register Route
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Compare the hashed password with the entered password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        // Send back the token as a response
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
});

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Route to fetch transactions
app.get('/transactions', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching transactions for user:', req.user.userId);  // Log the userId to ensure it is correct

        const transactions = await Transaction.find({ userId: req.user.userId });  // Filter by userId

        console.log('Fetched transactions:', transactions);  // Log fetched transactions

        const formattedTransactions = transactions.map(transaction => ({
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
        }));

        res.json(formattedTransactions);  // Return transactions
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Route to add a new transaction
app.post('/transactions', authMiddleware, async (req, res) => {
    const { description, amount, category, date } = req.body;

    try {
        const transaction = new Transaction({
            description,
            amount,
            category,
            date,
            userId: req.user.userId,  // Associate the transaction with the logged-in user
        });

        await transaction.save();
        res.status(201).json({ message: 'Transaction added successfully', transaction });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
