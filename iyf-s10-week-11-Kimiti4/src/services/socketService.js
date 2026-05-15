/**
 * 🔹 Socket.IO Service
 * Realtime alert broadcasting system
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - Node.js HTTP server instance
 */
function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join organization/room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left room: ${roomId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
}

/**
 * Broadcast alert events
 */
const AlertEvents = {
  CREATED: 'alert:created',
  UPDATED: 'alert:updated',
  DELETED: 'alert:deleted',
  CONFIRMED: 'alert:confirmed',
  VERIFIED: 'alert:verified',
  EXPIRED: 'alert:expired'
};

/**
 * Emit alert created event
 * @param {Object} alertData - Alert data
 * @param {String} roomId - Optional room to broadcast to
 */
function emitAlertCreated(alertData, roomId = 'global') {
  const io = getIO();
  
  // Broadcast to global room
  io.to('global').emit(AlertEvents.CREATED, {
    timestamp: new Date().toISOString(),
    data: alertData
  });

  // Also broadcast to specific organization room if applicable
  if (alertData.organization) {
    io.to(`org:${alertData.organization}`).emit(AlertEvents.CREATED, {
      timestamp: new Date().toISOString(),
      data: alertData
    });
  }

  // Broadcast to location-based room if coordinates provided
  if (alertData.location?.coordinates) {
    const locationRoom = `loc:${alertData.location.coordinates.latitude},${alertData.location.coordinates.longitude}`;
    io.to(locationRoom).emit(AlertEvents.CREATED, {
      timestamp: new Date().toISOString(),
      data: alertData
    });
  }

  console.log(`📢 Alert created event broadcasted: ${alertData._id}`);
}

/**
 * Emit alert updated event
 */
function emitAlertUpdated(alertData, roomId = 'global') {
  const io = getIO();
  io.to(roomId).emit(AlertEvents.UPDATED, {
    timestamp: new Date().toISOString(),
    data: alertData
  });
  console.log(`📢 Alert updated event broadcasted: ${alertData._id}`);
}

/**
 * Emit alert deleted event
 */
function emitAlertDeleted(alertId, roomId = 'global') {
  const io = getIO();
  io.to(roomId).emit(AlertEvents.DELETED, {
    timestamp: new Date().toISOString(),
    alertId
  });
  console.log(`📢 Alert deleted event broadcasted: ${alertId}`);
}

/**
 * Emit alert confirmed event
 */
function emitAlertConfirmed(alertData, roomId = 'global') {
  const io = getIO();
  io.to(roomId).emit(AlertEvents.CONFIRMED, {
    timestamp: new Date().toISOString(),
    data: alertData
  });
  console.log(`📢 Alert confirmed event broadcasted: ${alertData._id}`);
}

/**
 * Emit alert verified event
 */
function emitAlertVerified(alertData, roomId = 'global') {
  const io = getIO();
  io.to(roomId).emit(AlertEvents.VERIFIED, {
    timestamp: new Date().toISOString(),
    data: alertData
  });
  console.log(`📢 Alert verified event broadcasted: ${alertData._id}`);
}

module.exports = {
  initializeSocketIO,
  getIO,
  AlertEvents,
  emitAlertCreated,
  emitAlertUpdated,
  emitAlertDeleted,
  emitAlertConfirmed,
  emitAlertVerified
};
