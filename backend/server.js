import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import rateLimit from "express-rate-limit";

import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/socket.handler.js";
import errorHandler from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"
import projectRoutes from "./src/routes/project.routes.js";
import boardRoutes from "./src/routes/board.routes.js";
import taskRoutes from "./src/routes/task.routes.js";
import commentRoutes from "./src/routes/comment.routes.js";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";

const filePath = path.resolve("./swagger.yaml");
const file = fs.readFileSync(filePath, "utf8");
const swaggerDoc = YAML.parse(file);

dotenv.config();

const app = express();
const server = http.createServer(app);

// DB
connectDB();

// Security middleware
app.use(helmet());
app.use((req, res, next) => {
  if (req.query) {
    for (let key in req.query) {
      if (key.includes('$') || key.includes('.')) {
        delete req.query[key];
      }
    }
  }
  next();
});

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

 
// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
 
// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Socket
initSocket(server);

server.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);