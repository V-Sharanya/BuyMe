const express = require('express'); 
const cors = require('cors'); 
const session = require('express-session');
const userRoutes = require('./routes/userRoutes'); 
const itemRoutes = require('./routes/itemRoutes'); 
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const queryRoutes = require('./routes/queryRoutes');
const authRoutes = require('./routes/authRoutes');
const { createQueryTable } = require('./models/queryModel');

const app = express();

require('dotenv').config(); 
const path = require('path');

// Initialize database tables
Promise.all([
    createQueryTable()
]).catch(err => {
    console.error('Error creating tables:', err);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Configure CORS to allow credentials
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Add session check middleware
app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes); 
app.use('/items', itemRoutes);
app.use('/pi/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/queries', queryRoutes);

app.listen(5000, () => { 
    console.log('Server running on http://localhost:5000'); 
}); 
