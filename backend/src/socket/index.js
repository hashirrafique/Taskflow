const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authenticate every socket connection via JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace(/^Bearer /, '');
      if (!token) return next(new Error('No auth token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = { id: user._id.toString(), name: user.name };
      next();
    } catch (err) {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected ${socket.user.name} (${socket.id})`);

    // Auto-join a user-specific room for direct notifications
    socket.join(`user:${socket.user.id}`);

    // Join a workspace room (verifies membership on the server)
    socket.on('workspace:join', async (workspaceId) => {
      try {
        const ws = await Workspace.findById(workspaceId);
        if (!ws) return socket.emit('error', { message: 'Workspace not found' });
        const role = ws.getMemberRole(socket.user.id);
        if (!role) return socket.emit('error', { message: 'Not a member' });

        socket.join(`workspace:${workspaceId}`);
        socket.emit('workspace:joined', { workspaceId, role });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join workspace' });
      }
    });

    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected ${socket.user.name}`);
    });
  });

  return io;
};

// Helper used by controllers to broadcast to a workspace room
const emitToWorkspace = (workspaceId, event, payload) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
};

// Emit to a specific user (all their connected sockets)
const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

module.exports = { initSocket, emitToWorkspace, emitToUser };
