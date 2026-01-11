const express = require('express');
const dotenv = require('dotenv');
// const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

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
server.listen(PORT, console.log(`Server running on port ${PORT}`));
