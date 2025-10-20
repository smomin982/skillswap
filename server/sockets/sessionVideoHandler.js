const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

// In-memory participants tracking: sessionId -> Set(userId)
const roomParticipants = new Map();

const getRoomName = (sessionId) => `session:${sessionId}`;

const sessionVideoHandler = (socket, io) => {
  // Join a session room with auth
  socket.on('session:join', async ({ sessionId, token }) => {
    try {
      if (!token) {
        socket.emit('session:error', { message: 'Not authorized, no token' });
        return;
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        socket.emit('session:error', { message: 'Not authorized, token failed' });
        return;
      }

      const userId = decoded.id;
      const session = await Session.findById(sessionId).lean();
      if (!session) {
        socket.emit('session:error', { message: 'Session not found' });
        return;
      }

      if (
        session.teacher.toString() !== userId.toString() &&
        session.learner.toString() !== userId.toString()
      ) {
        socket.emit('session:error', { message: 'Not authorized to join this session' });
        return;
      }

      // Mark socket auth for this session
      if (!socket.data) socket.data = {};
      if (!socket.data.authorizedSessions) socket.data.authorizedSessions = new Set();
      socket.data.authorizedSessions.add(sessionId.toString());
      socket.data.userId = userId.toString();

      const room = getRoomName(sessionId);
      socket.join(room);

      // Track participants
      if (!roomParticipants.has(sessionId.toString())) {
        roomParticipants.set(sessionId.toString(), new Set());
      }
      const set = roomParticipants.get(sessionId.toString());
      set.add(userId.toString());

      // Update session status to in-progress on first join
      try {
        const count = set.size;
        if (count === 1) {
          await Session.findByIdAndUpdate(sessionId, { status: 'in-progress' });
        }
      } catch (_) {}

      // Notify this client they joined
      socket.emit('session:joined', { sessionId, userId });

      // Broadcast participant joined to others
      socket.to(room).emit('session:participant-joined', { userId });

      // Broadcast updated participant list
      io.to(room).emit('session:participants', Array.from(set));
    } catch (error) {
      console.error('session:join error', error);
      socket.emit('session:error', { message: 'Failed to join session' });
    }
  });

  // Leave session room
  socket.on('session:leave', ({ sessionId }) => {
    try {
      const room = getRoomName(sessionId);
      socket.leave(room);
      const userId = socket.data?.userId;
      const set = roomParticipants.get(sessionId.toString());
      if (set && userId) {
        set.delete(userId.toString());
        if (set.size === 0) {
          roomParticipants.delete(sessionId.toString());
        }
      }
      socket.to(room).emit('session:participant-left', { userId });
      io.to(room).emit('session:participants', Array.from(set || []));
    } catch (error) {
      console.error('session:leave error', error);
    }
  });

  // In-room chat
  socket.on('session:chat', ({ sessionId, message }) => {
    if (!socket.data?.authorizedSessions?.has(sessionId.toString())) return;
    const room = getRoomName(sessionId);
    const userId = socket.data?.userId;
    io.to(room).emit('session:chat', { from: userId, message, at: Date.now() });
  });

  // WebRTC signaling
  socket.on('webrtc:offer', ({ sessionId, sdp }) => {
    if (!socket.data?.authorizedSessions?.has(sessionId.toString())) return;
    const room = getRoomName(sessionId);
    const userId = socket.data?.userId;
    socket.to(room).emit('webrtc:offer', { from: userId, sdp });
  });

  socket.on('webrtc:answer', ({ sessionId, sdp }) => {
    if (!socket.data?.authorizedSessions?.has(sessionId.toString())) return;
    const room = getRoomName(sessionId);
    const userId = socket.data?.userId;
    socket.to(room).emit('webrtc:answer', { from: userId, sdp });
  });

  socket.on('webrtc:ice-candidate', ({ sessionId, candidate }) => {
    if (!socket.data?.authorizedSessions?.has(sessionId.toString())) return;
    const room = getRoomName(sessionId);
    const userId = socket.data?.userId;
    socket.to(room).emit('webrtc:ice-candidate', { from: userId, candidate });
  });

  // Handle disconnect: remove from all rooms tracked
  socket.on('disconnect', () => {
    try {
      const authSessions = socket.data?.authorizedSessions;
      const userId = socket.data?.userId;
      if (authSessions && userId) {
        for (const sessionId of authSessions.values()) {
          const set = roomParticipants.get(sessionId.toString());
          if (set) {
            set.delete(userId.toString());
            const room = getRoomName(sessionId);
            socket.to(room).emit('session:participant-left', { userId });
            if (set.size === 0) roomParticipants.delete(sessionId.toString());
            else io.to(room).emit('session:participants', Array.from(set));
          }
        }
      }
    } catch (e) {
      // ignore
    }
  });
};

module.exports = sessionVideoHandler;
