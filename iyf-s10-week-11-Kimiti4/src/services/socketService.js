/**
 * 🔹 Socket.IO Service
 * Realtime alert broadcasting system
 *
 * R5 [P0-7]: handshake authentication + room scoping. Every socket must
 * present a valid access token in `handshake.auth.token`; unauthenticated
 * handshakes are rejected. Room joins are scoped: `user:<ownId>` only for
 * self, `org:<id>` only for members, `global` open (alerts are public data,
 * same as GET /api/alerts). The middleware is exported as
 * `authorizeSocket` for direct unit testing.
 */

const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const JWT_ISSUER = 'jamiilink';
const JWT_AUDIENCE = 'jamiilink-api';

let io = null;

/**
 * Socket.IO handshake middleware. Validates the access token and attaches
 * the DB-loaded user to the socket. Rejects otherwise.
 */
async function authorizeSocket(socket, next) {
  try {
    const token = socket.handshake && socket.handshake.auth && socket.handshake.auth.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required'));
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      });
    } catch {
      return next(new Error('Invalid token'));
    }
    // DB-loaded identity (same authority model as HTTP protect()).
    // Note: these repository modules export singleton instances.
    const UserRepository = require('../database/repositories/UserRepository');
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return next(new Error('User no longer exists'));
    }
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
}

/**
 * Room policy: `global` is open (public alert data); `user:<id>` requires
 * id === own id; `org:<id>` requires an active membership. Anything else
 * is denied.
 */
async function canJoinRoom(user, roomId) {
  if (typeof roomId !== 'string' || roomId.length === 0 || roomId.length > 128) return false;
  if (roomId === 'global') return true;
  if (roomId.startsWith('user:')) {
    return roomId.slice('user:'.length) === String(user.id);
  }
  if (roomId.startsWith('org:')) {
    const orgId = roomId.slice('org:'.length);
    try {
      const OrganizationRepository = require('../database/repositories/OrganizationRepository');
      const members = await OrganizationRepository.getMembers(orgId, { status: 'active' });
      const list = (members && members.members) || members || [];
      return list.some((m) => String(m.user_id || m.id) === String(user.id));
    } catch {
      return false;
    }
  }
  // loc: rooms carry no membership semantics; alerts there are public.
  if (roomId.startsWith('loc:')) return true;
  return false;
}

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

  io.use(authorizeSocket);

  // Connection handler (only reached after authorizeSocket passes)
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join organization/room (scoped by canJoinRoom)
    socket.on('join-room', async (roomId) => {
      try {
        if (await canJoinRoom(socket.data.user, roomId)) {
          socket.join(roomId);
          console.log(`Client ${socket.id} joined room: ${roomId}`);
        } else {
          socket.emit('room-denied', { room: roomId });
        }
      } catch {
        socket.emit('room-denied', { room: roomId });
      }
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
  authorizeSocket,
  canJoinRoom,
  getIO,
  AlertEvents,
  emitAlertCreated,
  emitAlertUpdated,
  emitAlertDeleted,
  emitAlertConfirmed,
  emitAlertVerified
};
