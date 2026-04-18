const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapRoutes = require('./routes/map.routes');
const rideRoutes = require('./routes/ride.routes');
const testRoutes = require('./routes/test.routes');

const app = express();
const frontendDistPath = path.join(__dirname, '../Frontend/dist');
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

connectToDb();

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api', (req, res) => {
  res.send('API working');
});

app.use('/api/test', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/rides', rideRoutes);

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapRoutes);
app.use('/rides', rideRoutes);

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api|\/users|\/captains|\/maps|\/rides|\/socket\.io).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

module.exports = app;
