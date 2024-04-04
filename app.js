const express = require('express');
const connectDB = require('./src/api/config/db');
const authRoutes = require('./src/api/routes/authRoutes');
const errorHandler = require('./src/api/middlewares/errorHandler');

connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));