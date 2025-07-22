import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  MessageCircle,
  Send,
  Plus,
  Settings,
  Monitor,
  MonitorOff,
  Hand,
  Crown,
  Volume2,
  VolumeX,
  MoreVertical,
  Share,
  FileText,
  Clock,
  UserPlus,
  LogOut,
  Maximize,
  Minimize
} from "lucide-react";

interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  participants: Participant[];
  maxParticipants: number;
  isPrivate: boolean;
  host: string;
  createdAt: Date;
  description?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}

// Mock data
const mockRooms: StudyRoom[] = [
  {
    id: '1',
    name: 'Calculus Study Group',
    subject: 'Mathematics',
    participants: [
      { id: '1', name: 'Alex Chen', avatar: '🇨🇳', isHost: true, isMuted: false, isVideoOn: true, isScreenSharing: false, handRaised: false, joinedAt: new Date() },
      { id: '2', name: 'Maria Garcia', avatar: '🇪🇸', isHost: false, isMuted: false, isVideoOn: true, isScreenSharing: false, handRaised: false, joinedAt: new Date() },
    ],
    maxParticipants: 8,
    isPrivate: false,
    host: '1',
    createdAt: new Date(),
    description: 'Working on derivatives and integrals'
  },
  {
    id: '2',
    name: 'Physics Lab Discussion',
    subject: 'Physics',
    participants: [
      { id: '3', name: 'John Smith', avatar: '🇺🇸', isHost: true, isMuted: false, isVideoOn: true, isScreenSharing: true, handRaised: false, joinedAt: new Date() },
    ],
    maxParticipants: 6,
    isPrivate: false,
    host: '3',
    createdAt: new Date(),
    description: 'Discussing quantum mechanics experiments'
  }
];

export default function VirtualStudyRooms() {
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket && currentRoom) {
      socket.emit('join_study_room', currentRoom.id);
      
      // Listen for study room events
      socket.on('user_joined_study_room', (userData) => {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          senderId: 'system',
          senderName: 'System',
          content: `${userData.displayName || userData.username} joined the room`,
          timestamp: new Date(),
          type: 'system'
        }]);
      });

      socket.on('user_left_study_room', (userData) => {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          senderId: 'system',
          senderName: 'System',
          content: `${userData.displayName || userData.username} left the room`,
          timestamp: new Date(),
          type: 'system'
        }]);
      });

      socket.on('screen_share_update', (data) => {
        toast({
          title: data.isSharing ? "Screen sharing started" : "Screen sharing stopped",
          description: data.isSharing ? "A participant is now sharing their screen" : "Screen sharing has ended",
        });
      });

      return () => {
        socket.off('user_joined_study_room');
        socket.off('user_left_study_room');
        socket.off('screen_share_update');
      };
    }
  }, [socket, currentRoom]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const joinRoom = (room: StudyRoom) => {
    setCurrentRoom(room);
    setChatMessages([
      {
        id: '1',
        senderId: 'system',
        senderName: 'System',
        content: `Welcome to ${room.name}! You can start collaborating now.`,
        timestamp: new Date(),
        type: 'system'
      }
    ]);
    
    toast({
      title: "Joined study room",
      description: `You're now in ${room.name}`,
    });
  };

  const leaveRoom = () => {
    if (currentRoom && socket) {
      socket.emit('leave_study_room', currentRoom.id);
    }
    setCurrentRoom(null);
    setChatMessages([]);
    toast({
      title: "Left study room",
      description: "You have left the study room",
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: isVideoOn ? "Video turned off" : "Video turned on",
      description: isVideoOn ? "Your camera is now off" : "Your camera is now on",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Your microphone is now on" : "Your microphone is now off",
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (socket && currentRoom) {
      socket.emit('study_room_screen_share', {
        roomId: currentRoom.id,
        isSharing: !isScreenSharing
      });
    }
    
    toast({
      title: isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      description: isScreenSharing ? "You stopped sharing your screen" : "You're now sharing your screen",
    });
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    toast({
      title: handRaised ? "Hand lowered" : "Hand raised",
      description: handRaised ? "You lowered your hand" : "You raised your hand",
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'me',
      senderName: user?.displayName || user?.username || 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const createRoom = () => {
    if (!newRoomName.trim() || !newRoomSubject.trim()) return;

    const newRoom: StudyRoom = {
      id: Date.now().toString(),
      name: newRoomName,
      subject: newRoomSubject,
      participants: [],
      maxParticipants: 8,
      isPrivate: false,
      host: user?.id || 'me',
      createdAt: new Date(),
      description: `New study room for ${newRoomSubject}`
    };

    // In a real app, this would be sent to the server
    toast({
      title: "Study room created",
      description: `${newRoomName} has been created successfully`,
    });

    setNewRoomName("");
    setNewRoomSubject("");
    setShowCreateRoom(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentRoom) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Virtual Study Rooms</h1>
              <p className="text-gray-600">Join or create study rooms to collaborate with peers worldwide</p>
            </div>
            <Button onClick={() => setShowCreateRoom(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>

          {/* Create Room Modal */}
          {showCreateRoom && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Create Study Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <Input
                  placeholder="Subject..."
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={createRoom} className="flex-1">Create</Button>
                  <Button variant="outline" onClick={() => setShowCreateRoom(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant="secondary">{room.subject}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{room.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.participants.length}/{room.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(room.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {room.participants.slice(0, 3).map((participant) => (
                          <div
                            key={participant.id}
                            className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm"
                          >
                            {participant.avatar}
                          </div>
                        ))}
                        {room.participants.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs">
                            +{room.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => joinRoom(room)}
                      disabled={room.participants.length >= room.maxParticipants}
                    >
                      {room.participants.length >= room.maxParticipants ? 'Room Full' : 'Join Room'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-4">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Room Header */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentRoom.name}</h3>
                    <p className="text-sm text-gray-600">{currentRoom.subject} • {currentRoom.participants.length} participants</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                  <Button size="sm" variant="outline" onClick={leaveRoom}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Grid */}
          <Card className="flex-1 mb-4">
            <CardContent className="p-4 h-full">
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* Main Video */}
                <div className="col-span-2 bg-gray-900 rounded-lg relative overflow-hidden">
                  {isScreenSharing ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Monitor className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-lg">Screen Sharing Active</p>
                        <p className="text-sm opacity-75">Your screen is being shared</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-10 w-10" />
                        </div>
                        <p className="text-lg">You</p>
                        <p className="text-sm opacity-75">Camera {isVideoOn ? 'On' : 'Off'}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isMuted ? "destructive" : "secondary"}
                      onClick={toggleMute}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isVideoOn ? "secondary" : "destructive"}
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isScreenSharing ? "default" : "secondary"}
                      onClick={toggleScreenShare}
                    >
                      {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={handRaised ? "default" : "secondary"}
                      onClick={toggleHandRaise}
                    >
                      <Hand className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Participant Videos */}
                {currentRoom.participants.slice(0, 4).map((participant) => (
                  <div key={participant.id} className="bg-gray-800 rounded-lg relative overflow-hidden aspect-video">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg">{participant.avatar}</span>
                        </div>
                        <p className="text-sm">{participant.name}</p>
                        {participant.isHost && <Crown className="h-3 w-3 text-yellow-400 mx-auto mt-1" />}
                      </div>
                    </div>
                    
                    {/* Participant Status */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {participant.isMuted && (
                        <div className="bg-red-500 rounded-full p-1">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {!participant.isVideoOn && (
                        <div className="bg-red-500 rounded-full p-1">
                          <VideoOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {participant.handRaised && (
                        <div className="bg-yellow-500 rounded-full p-1">
                          <Hand className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          {/* Participants Panel */}
          {showParticipants && (
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({currentRoom.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentRoom.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 mx-3 rounded hover:bg-gray-50">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {participant.avatar}
                        </div>
                        {participant.isHost && (
                          <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.name}</p>
                        <div className="flex items-center gap-1">
                          {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                          {!participant.isVideoOn && <VideoOff className="h-3 w-3 text-red-500" />}
                          {participant.handRaised && <Hand className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Panel */}
          {showChat && (
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`${message.type === 'system' ? 'text-center' : ''}`}
                      >
                        {message.type === 'system' ? (
                          <p className="text-xs text-gray-500 italic">{message.content}</p>
                        ) : (
                          <div className={`flex gap-2 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs flex-shrink-0">
                              👤
                            </div>
                            <div className={`flex-1 max-w-xs ${message.senderId === user?.id ? 'text-right' : ''}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">{message.senderName}</span>
                                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                              </div>
                              <div className={`p-2 rounded-lg text-sm ${
                                message.senderId === user?.id 
                                  ? 'bg-primary-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                {message.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
