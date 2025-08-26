import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DefaultAzureCredential } from '@azure/identity';

// Routes
import authRoutes from './routes/auth';
import raceRoutes from './routes/races';
import userRoutes from './routes/users';
import vehicleRoutes from './routes/vehicles';
import groupRoutes from './routes/groups';

// Services
import { CosmosDBService } from './services/cosmosdb';
import { SignalRService } from './services/SignalRService';
import { StorageService } from './services/storage';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Azure services
const credential = new DefaultAzureCredential();

// Application Insights for monitoring
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  // For now, skip Application Insights setup - can be added later
  console.log('Application Insights connection string found');
}

// Initialize services
export const cosmosService = new CosmosDBService(credential);
export const signalrService = new SignalRService(process.env.SIGNALR_CONNECTION_STRING || '');
export const storageService = new StorageService(credential);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/groups', groupRoutes);

// Socket.IO for real-time race updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join race room
  socket.on('join-race', (raceId: string) => {
    socket.join(`race-${raceId}`);
    console.log(`Client ${socket.id} joined race ${raceId}`);
  });

  // Leave race room
  socket.on('leave-race', (raceId: string) => {
    socket.leave(`race-${raceId}`);
    console.log(`Client ${socket.id} left race ${raceId}`);
  });

  // Handle race position updates
  socket.on('race-position-update', (data) => {
    // Broadcast to all clients in the race room
    socket.to(`race-${data.raceId}`).emit('position-update', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in routes
export { io };

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(` DASH Racing API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
