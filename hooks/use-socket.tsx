import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: any[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string, type?: 'text' | 'image' | 'file') => void;
  startCall: (targetUserId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'audio') => void;
  answerCall: (callerId: string, answer: RTCSessionDescriptionInit) => void;
  endCall: (targetUserId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  startCall: () => {},
  answerCall: () => {},
  endCall: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        // Authenticate with the server
        newSocket.emit('authenticate', user);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_online', (userData) => {
        setOnlineUsers(prev => [...prev.filter(u => u.id !== userData.userId), userData]);
      });

      newSocket.on('user_offline', (userData) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== userData.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinRoom = (roomId: string) => {
    socket?.emit('join_room', roomId);
  };

  const leaveRoom = (roomId: string) => {
    socket?.emit('leave_room', roomId);
  };

  const sendMessage = (roomId: string, message: string, type: 'text' | 'image' | 'file' = 'text') => {
    socket?.emit('send_message', { roomId, message, type });
  };

  const startCall = (targetUserId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'audio') => {
    socket?.emit('call_user', { targetUserId, offer, callType });
  };

  const answerCall = (callerId: string, answer: RTCSessionDescriptionInit) => {
    socket?.emit('answer_call', { callerId, answer });
  };

  const endCall = (targetUserId: string) => {
    socket?.emit('end_call', { targetUserId });
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startCall,
    answerCall,
    endCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}