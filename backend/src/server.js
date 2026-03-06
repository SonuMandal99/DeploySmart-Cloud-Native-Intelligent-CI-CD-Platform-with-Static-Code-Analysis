require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const compilerRoutes = require('./routes/compilerRoutes');
const analyzeRoute = require('./routes/analyzeRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const reportRoutes = require('./routes/reportRoutes');
const githubRoutes = require('./routes/githubRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', analyzeRoute);
app.use('/api', dashboardRoute);
app.use('/api/compiler', compilerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/github', githubRoutes);

// Error handler
app.use(errorHandler);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io globally available
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
