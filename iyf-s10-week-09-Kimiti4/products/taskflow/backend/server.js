require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const orgRoutes = require('./src/routes/orgs');
const projectRoutes = require('./src/routes/projects');
const taskRoutes = require('./src/routes/tasks');
const labelRoutes = require('./src/routes/labels');
const activityRoutes = require('./src/routes/activity');
const searchRoutes = require('./src/routes/search');
const dashboardRoutes = require('./src/routes/dashboard');
const healthRoutes = require('./src/routes/health');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/tf/health', healthRoutes);
app.use('/api/tf/auth', authRoutes);
app.use('/api/tf/orgs', orgRoutes);
app.use('/api/tf/projects', projectRoutes);
app.use('/api/tf', taskRoutes);
app.use('/api/tf/labels', labelRoutes);
app.use('/api/tf', activityRoutes);
app.use('/api/tf/search', searchRoutes);
app.use('/api/tf/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
}

module.exports = app;
