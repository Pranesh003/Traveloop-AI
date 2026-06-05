import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../middlewares/authenticate';
import logger from '../utils/logger';

let io: SocketIOServer | null = null;

// Map of userId → Set of socketIds
const userSockets = new Map<string, Set<string>>();

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication middleware for socket connections
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      (socket as any).userId = decoded.userId;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.debug(`Socket connected: ${socket.id} (user: ${userId})`);

    // Track user sockets
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });

    // Handle trip room subscriptions
    socket.on('join:trip', (tripId: string) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on('leave:trip', (tripId: string) => {
      socket.leave(`trip:${tripId}`);
    });

    // Real-time typing indicator for AI chat
    socket.on('ai:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`user:${userId}`).emit('ai:typing', data);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

export const socketService = {
  /**
   * Get Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return io;
  },

  /**
   * Emit notification to a specific user
   */
  emitToUser(userId: string, event: string, data: unknown): void {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
  },

  /**
   * Emit notification to all users in a trip
   */
  emitToTrip(tripId: string, event: string, data: unknown): void {
    if (!io) return;
    io.to(`trip:${tripId}`).emit(event, data);
  },

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: unknown): void {
    if (!io) return;
    io.emit(event, data);
  },

  /**
   * Send real-time notification
   */
  sendNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    data?: unknown;
    createdAt: Date;
  }): void {
    this.emitToUser(userId, 'notification:new', notification);
  },

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return userSockets.has(userId) && (userSockets.get(userId)?.size ?? 0) > 0;
  },

  /**
   * Get count of online users
   */
  getOnlineCount(): number {
    return userSockets.size;
  },
};
