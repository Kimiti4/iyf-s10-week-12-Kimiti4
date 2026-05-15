/**
 * 🔹 Socket.IO Client Service
 * Realtime alert updates for frontend
 */

import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.IO connection
 * @param {string} backendUrl - Backend URL (e.g., http://localhost:3000)
 */
export function initializeSocket(backendUrl) {
  if (socket) {
    console.warn('Socket already initialized');
    return socket;
  }

  const url = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket() first.');
  }
  return socket;
}

/**
 * Join a room to receive specific alerts
 * @param {string} roomId - Room ID (e.g., organization ID, location)
 */
export function joinRoom(roomId) {
  const sock = getSocket();
  sock.emit('join-room', roomId);
  console.log(`Joined room: ${roomId}`);
}

/**
 * Leave a room
 * @param {string} roomId - Room ID to leave
 */
export function leaveRoom(roomId) {
  const sock = getSocket();
  sock.emit('leave-room', roomId);
  console.log(`Left room: ${roomId}`);
}

/**
 * Listen for new alerts
 * @param {Function} callback - Function to call when new alert arrives
 */
export function onNewAlert(callback) {
  const sock = getSocket();
  sock.on('new-alert', callback);
  
  // Return cleanup function
  return () => {
    sock.off('new-alert', callback);
  };
}

/**
 * Listen for alert updates
 * @param {Function} callback - Function to call when alert is updated
 */
export function onAlertUpdate(callback) {
  const sock = getSocket();
  sock.on('alert-updated', callback);
  
  return () => {
    sock.off('alert-updated', callback);
  };
}

/**
 * Listen for alert deletions
 * @param {Function} callback - Function to call when alert is deleted
 */
export function onAlertDelete(callback) {
  const sock = getSocket();
  sock.on('alert-deleted', callback);
  
  return () => {
    sock.off('alert-deleted', callback);
  };
}

/**
 * Listen for verification level changes
 * @param {Function} callback - Function to call when verification changes
 */
export function onVerificationChange(callback) {
  const sock = getSocket();
  sock.on('verification-changed', callback);
  
  return () => {
    sock.off('verification-changed', callback);
  };
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
}

/**
 * Check if socket is connected
 */
export function isConnected() {
  return socket && socket.connected;
}
