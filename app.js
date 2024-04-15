const express = require('express');
const connectDB = require('./src/api/config/db');
const authRoutes = require('./src/api/routes/authRoutes');
const errorHandler = require('./src/api/middlewares/errorHandler');
const cors = require('cors');
const bodyParser = require('body-parser');

connectDB();

const app = express();
app.use(express.json());
app.use(express.static('public'))
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));
app.use(cors());
// Routes
app.use('/api', authRoutes);

// Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));