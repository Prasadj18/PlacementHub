import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import applicationRoutes from './routes/applications';
import eventRoutes from './routes/events';
import dashboardRoutes from './routes/dashboard';
import notificationRoutes from './routes/notifications';
import experienceRoutes from './routes/experiences';
import profileRoutes from './routes/profile';
import activityLogRoutes from './routes/activityLog';
import pushRoutes from './routes/push';

const app = express();

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications/push', pushRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activity', activityLogRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 PlacementHub API running on http://localhost:${env.PORT}`);
  console.log(`📧 College email domain: @${env.COLLEGE_EMAIL_DOMAIN}`);
});

export default app;
