import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Phone,
  PhoneOff,
  Users,
  User,
  Settings,
  Search,
  Plus
} from "lucide-react";
import Webcam from "react-webcam";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'group';
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export default function LiveChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat-rooms'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat-messages', currentRoom?.id],
    enabled: !!currentRoom?.id,
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('message', (message: ChatMessage) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      if (message.senderId !== 'current-user-id') {
        toast({
          title: `New message from ${message.senderName}`,
          description: message.content,
        });
      }
    });

    newSocket.on('call-request', (data: any) => {
      // Handle incoming call
      if (window.confirm(`${data.callerName} is calling you. Accept?`)) {
        acceptCall(data);
      }
    });

    newSocket.on('call-accepted', (data: any) => {
      // Start video call
      startVideoCall(false, data.callerId);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ roomId, content }: { roomId: string; content: string }) => {
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, content }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      socket?.emit('message', data);
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async ({ name, type, participants }: { name: string; type: 'individual' | 'group'; participants: string[] }) => {
      const response = await fetch('/api/chat-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, participants }),
      });
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-rooms'] });
      setCurrentRoom(data);
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim() || !currentRoom) return;
    
    await sendMessageMutation.mutateAsync({
      roomId: currentRoom.id,
      content: message,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVideoCall = async (initiator: boolean, targetUserId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      const newPeer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
      });

      newPeer.on('signal', (data) => {
        socket?.emit('call-signal', {
          signal: data,
          targetUserId,
          roomId: currentRoom?.id,
        });
      });

      newPeer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      newPeer.on('error', (err) => {
        console.error('Peer error:', err);
        toast({
          title: "Connection Error",
          description: "Failed to establish video connection",
          variant: "destructive",
        });
      });

      setPeer(newPeer);
      setIsVideoCall(true);

      if (initiator) {
        socket?.emit('call-request', {
          targetUserId,
          roomId: currentRoom?.id,
          callerName: 'Current User', // Replace with actual user name
        });
      }
    } catch (error) {
      toast({
        title: "Media Error",
        description: "Failed to access camera/microphone",
        variant: "destructive",
      });
    }
  };

  const acceptCall = (callData: any) => {
    startVideoCall(false, callData.callerId);
    socket?.emit('call-accepted', {
      callerId: callData.callerId,
      roomId: currentRoom?.id,
    });
  };

  const endCall = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    setIsVideoCall(false);
    setRemoteStream(null);
    socket?.emit('call-ended', {
      roomId: currentRoom?.id,
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (peer && peer.streams && peer.streams[0]) {
      peer.streams[0].getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (peer && peer.streams && peer.streams[0]) {
      peer.streams[0].getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const filteredRooms = rooms?.filter((room: ChatRoom) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {/* Rooms and Users Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat & Video
                </CardTitle>
                <Button size="sm" className="h-8 px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="chats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chats" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="p-4 space-y-2">
                      {roomsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                        </div>
                      ) : filteredRooms?.length > 0 ? (
                        filteredRooms.map((room: ChatRoom) => (
                          <div
                            key={room.id}
                            onClick={() => setCurrentRoom(room)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              currentRoom?.id === room.id
                                ? 'bg-primary-100 border border-primary-200'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center">
                                  {room.type === 'group' ? (
                                    <Users className="h-4 w-4" />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm truncate">
                                    {room.name}
                                  </div>
                                  {room.lastMessage && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {room.lastMessage.content}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {room.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {room.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No chats yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="users" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="p-4 space-y-2">
                      {usersLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                        </div>
                      ) : users?.length > 0 ? (
                        users.map((user: User) => (
                          <div
                            key={user.id}
                            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                                {user.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-gray-500">
                                  {user.isOnline ? 'Online' : 'Offline'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No users found
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            {currentRoom ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                        {currentRoom.type === 'group' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{currentRoom.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {currentRoom.participants.length} participant{currentRoom.participants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => startVideoCall(true)}
                        size="sm"
                        variant="outline"
                        disabled={isVideoCall}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => startVideoCall(true)}
                        size="sm"
                        variant="outline"
                        disabled={isVideoCall}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Video Call Area */}
                  {isVideoCall && (
                    <div className="border-b bg-gray-900 p-4">
                      <div className="flex gap-4 h-60">
                        {/* Remote Video */}
                        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
                          {remoteStream ? (
                            <video
                              ref={remoteVideoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <User className="h-16 w-16" />
                            </div>
                          )}
                        </div>
                        
                        {/* Local Video */}
                        <div className="w-48 bg-black rounded-lg overflow-hidden">
                          {isVideoEnabled ? (
                            <Webcam
                              ref={webcamRef}
                              mirrored
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <VideoOff className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Call Controls */}
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          onClick={toggleAudio}
                          size="sm"
                          variant={isAudioEnabled ? "outline" : "destructive"}
                        >
                          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={toggleVideo}
                          size="sm"
                          variant={isVideoEnabled ? "outline" : "destructive"}
                        >
                          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={endCall}
                          size="sm"
                          variant="destructive"
                        >
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                      </div>
                    ) : messages?.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg: ChatMessage) => (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              msg.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {msg.senderId !== 'current-user-id' && (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                msg.senderId === 'current-user-id'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {msg.senderId !== 'current-user-id' && (
                                <div className="text-xs font-medium mb-1">
                                  {msg.senderName}
                                </div>
                              )}
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  msg.senderId === 'current-user-id' ? 'text-primary-200' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(new Date(msg.timestamp))}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={sendMessageMutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        size="sm"
                        className="px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Select a chat to start messaging
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
