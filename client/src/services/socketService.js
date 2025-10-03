import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
      if (userId) {
        this.socket.emit('user:join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Message events
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  emitTypingStart(data) {
    if (this.socket) {
      this.socket.emit('typing:start', data);
    }
  }

  emitTypingStop(data) {
    if (this.socket) {
      this.socket.emit('typing:stop', data);
    }
  }

  onTypingStart(callback) {
    if (this.socket) {
      this.socket.on('typing:start', callback);
    }
  }

  onTypingStop(callback) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
  }

  // User status events
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  }

  // Notification events
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  emitNotification(data) {
    if (this.socket) {
      this.socket.emit('notification:send', data);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
