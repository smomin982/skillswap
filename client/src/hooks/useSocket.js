import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import socketService from '../services/socketService';
import { addNotification } from '../store/slices/notificationSlice';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (user && !isInitialized.current) {
      // Connect socket
      socketService.connect(user._id);

      // Set up event listeners
      socketService.onNewMessage((message) => {
        dispatch(addNotification({
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `${message.sender.name} sent you a message`,
          data: message,
          read: false,
          timestamp: new Date(),
        }));
      });

      socketService.onNewNotification((notification) => {
        dispatch(addNotification({
          ...notification,
          id: Date.now(),
          read: false,
          timestamp: new Date(),
        }));
      });

      isInitialized.current = true;
    }

    return () => {
      if (isInitialized.current) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, [user, dispatch]);

  return socketService;
};

export default useSocket;
