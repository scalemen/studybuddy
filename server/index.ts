import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { registerRoutes } from "./routes";
import { initializeAuth } from "./auth";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
    credentials: true
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize authentication
initializeAuth(app);

// Socket.io connection handling
interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}

interface ConnectedUser extends User {
  socketId: string;
  status: 'online' | 'away' | 'busy';
  currentRoom?: string;
}

const connectedUsers = new Map<string, ConnectedUser>();
const chatRooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userData: User) => {
    const connectedUser: ConnectedUser = {
      ...userData,
      socketId: socket.id,
      status: 'online'
    };
    
    connectedUsers.set(socket.id, connectedUser);
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: userData.id,
      username: userData.username,
      status: 'online'
    });

    // Send current online users
    const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      status: user.status
    }));
    
    socket.emit('online_users', onlineUsers);
  });

  // Handle joining chat rooms
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.currentRoom = roomId;
      
      if (!chatRooms.has(roomId)) {
        chatRooms.set(roomId, new Set());
      }
      chatRooms.get(roomId)!.add(socket.id);
      
      // Notify room members
      socket.to(roomId).emit('user_joined_room', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName
      });
    }
  });

  // Handle leaving chat rooms
  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.currentRoom = undefined;
      chatRooms.get(roomId)?.delete(socket.id);
      
      // Notify room members
      socket.to(roomId).emit('user_left_room', {
        userId: user.id,
        username: user.username
      });
    }
  });

  // Handle chat messages
  socket.on('send_message', (data: {
    roomId: string;
    message: string;
    type: 'text' | 'image' | 'file';
  }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.displayName || user.username,
      content: data.message,
      timestamp: new Date(),
      type: data.type
    };

    // Send to all users in the room
    io.to(data.roomId).emit('new_message', messageData);
  });

  // Handle typing indicators
  socket.on('typing_start', (roomId: string) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.to(roomId).emit('user_typing', {
        userId: user.id,
        username: user.username
      });
    }
  });

  socket.on('typing_stop', (roomId: string) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.to(roomId).emit('user_stopped_typing', {
        userId: user.id
      });
    }
  });

  // Handle video call signaling
  socket.on('call_user', (data: {
    targetUserId: string;
    offer: RTCSessionDescriptionInit;
    callType: 'video' | 'audio';
  }) => {
    const caller = connectedUsers.get(socket.id);
    const targetUser = Array.from(connectedUsers.values()).find(u => u.id === data.targetUserId);
    
    if (caller && targetUser) {
      io.to(targetUser.socketId).emit('incoming_call', {
        callerId: caller.id,
        callerName: caller.displayName || caller.username,
        offer: data.offer,
        callType: data.callType
      });
    }
  });

  socket.on('answer_call', (data: {
    callerId: string;
    answer: RTCSessionDescriptionInit;
  }) => {
    const answerer = connectedUsers.get(socket.id);
    const caller = Array.from(connectedUsers.values()).find(u => u.id === data.callerId);
    
    if (answerer && caller) {
      io.to(caller.socketId).emit('call_answered', {
        answererId: answerer.id,
        answer: data.answer
      });
    }
  });

  socket.on('ice_candidate', (data: {
    targetUserId: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const targetUser = Array.from(connectedUsers.values()).find(u => u.id === data.targetUserId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('ice_candidate', {
        candidate: data.candidate
      });
    }
  });

  socket.on('end_call', (data: { targetUserId: string }) => {
    const targetUser = Array.from(connectedUsers.values()).find(u => u.id === data.targetUserId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('call_ended');
    }
  });

  // Handle collaborative drawing
  socket.on('drawing_data', (data: {
    roomId: string;
    drawingData: any;
  }) => {
    socket.to(data.roomId).emit('drawing_update', data.drawingData);
  });

  // Handle study room events
  socket.on('join_study_room', (roomId: string) => {
    socket.join(`study_${roomId}`);
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      socket.to(`study_${roomId}`).emit('user_joined_study_room', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName
      });
    }
  });

  socket.on('study_room_screen_share', (data: {
    roomId: string;
    isSharing: boolean;
  }) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.to(`study_${data.roomId}`).emit('screen_share_update', {
        userId: user.id,
        isSharing: data.isSharing
      });
    }
  });

  // Handle quiz events
  socket.on('join_quiz', (quizId: string) => {
    socket.join(`quiz_${quizId}`);
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      socket.to(`quiz_${quizId}`).emit('user_joined_quiz', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName
      });
    }
  });

  socket.on('quiz_answer', (data: {
    quizId: string;
    questionId: string;
    answer: string;
    timeToAnswer: number;
  }) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      io.to(`quiz_${data.quizId}`).emit('quiz_answer_submitted', {
        userId: user.id,
        username: user.username,
        ...data
      });
    }
  });

  // Handle status updates
  socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.status = status;
      socket.broadcast.emit('user_status_changed', {
        userId: user.id,
        status: status
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Remove from connected users
      connectedUsers.delete(socket.id);
      
      // Remove from chat rooms
      if (user.currentRoom) {
        chatRooms.get(user.currentRoom)?.delete(socket.id);
        socket.to(user.currentRoom).emit('user_left_room', {
          userId: user.id,
          username: user.username
        });
      }
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: user.id
      });
    }
    
    console.log('User disconnected:', socket.id);
  });
});

// API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});