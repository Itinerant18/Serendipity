const express = require('express');
// Server Entry Point
const dotenv = require('dotenv');
// const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:4000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com", "https://img.freepik.com", "https://harvardindependent.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000", "http://localhost:4000"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"]
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(cors({
    origin: ["http://localhost:4000", "http://localhost:5173"],
    credentials: true
}));
app.use(compression());
app.use(express.json());

// Small cache hints for GET endpoints (actual caching handled per-route where needed)
app.use((req, res, next) => {
    if (req.method === 'GET') {
        // Conservative default; routes can override.
        res.setHeader('Cache-Control', 'public, max-age=30');
    }
    next();
});

// Make io accessible in routes via req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mongoose connection removed
console.log('Supabase Client Initialized');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));

// Profile Routes
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/profile/addresses', require('./routes/addressRoutes'));
app.use('/api/profile/payment-methods', require('./routes/paymentMethodRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use(notFound);
app.use(errorHandler);

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('NEW_CLIENT_CONNECTED:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('CLIENT_DISCONNECTED:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on all interfaces at port ${PORT}`);
});
