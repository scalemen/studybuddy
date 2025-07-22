import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Search,
  Settings,
  Globe,
  UserPlus,
  Crown,
  Volume2,
  VolumeX,
  MoreVertical,
  Smile
} from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  country: string;
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: Friend[];
  lastMessage?: Message;
  unreadCount: number;
}

// Mock data for demonstration
const mockFriends: Friend[] = [
  { id: '1', name: 'Alex Chen', avatar: '🇨🇳', status: 'online', country: 'China' },
  { id: '2', name: 'Maria Garcia', avatar: '🇪🇸', status: 'online', country: 'Spain' },
  { id: '3', name: 'John Smith', avatar: '🇺🇸', status: 'away', country: 'USA' },
  { id: '4', name: 'Yuki Tanaka', avatar: '🇯🇵', status: 'online', country: 'Japan' },
  { id: '5', name: 'Emma Wilson', avatar: '🇬🇧', status: 'offline', country: 'UK' },
];

const mockRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'Study Group - Math',
    type: 'group',
    participants: mockFriends.slice(0, 4),
    unreadCount: 3,
    lastMessage: {
      id: '1',
      senderId: '1',
      senderName: 'Alex Chen',
      content: 'Anyone want to review calculus together?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'text'
    }
  },
  {
    id: '2',
    name: 'Alex Chen',
    type: 'direct',
    participants: [mockFriends[0]],
    unreadCount: 1,
    lastMessage: {
      id: '2',
      senderId: '1',
      senderName: 'Alex Chen',
      content: 'Hey! How was your physics exam?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'text'
    }
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    senderName: 'Alex Chen',
    content: 'Hey everyone! Ready for today\'s study session?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'text'
  },
  {
    id: '2',
    senderId: 'me',
    senderName: 'You',
    content: 'Absolutely! I brought my notes on derivatives.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: 'text'
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Maria Garcia',
    content: 'Perfect! I was struggling with the chain rule.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    type: 'text'
  }
];

export default function LiveChat() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(mockRooms[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendsList, setShowFriendsList] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    });
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    toast({
      title: "Video call started",
      description: "WebRTC connection established with participants.",
    });
  };

  const endCall = () => {
    setIsVideoCall(false);
    toast({
      title: "Call ended",
      description: "Video call has been terminated.",
    });
  };

  const addFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent successfully.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-4">
        {/* Sidebar - Chat Rooms & Friends */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search friends or rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button size="sm" onClick={addFriend}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Rooms */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat Rooms
                </span>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {mockRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`flex items-center gap-3 p-3 mx-3 rounded cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id ? 'bg-primary-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      {room.type === 'group' ? (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                          {room.participants[0]?.avatar}
                        </div>
                      )}
                      {room.type === 'direct' && (
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(room.participants[0]?.status)}`}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">{room.name}</h4>
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-gray-600 truncate">
                          {room.lastMessage.senderName}: {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Online Friends */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-green-500" />
                Online Friends ({mockFriends.filter(f => f.status === 'online').length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {mockFriends.filter(f => f.status === 'online').map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-2 mx-3 rounded hover:bg-gray-50 cursor-pointer">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {friend.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${getStatusColor(friend.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{friend.name}</p>
                      <p className="text-xs text-gray-500">{friend.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        {selectedRoom.type === 'group' ? (
                          <Users className="h-5 w-5 text-white" />
                        ) : (
                          <span className="text-lg">{selectedRoom.participants[0]?.avatar}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedRoom.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedRoom.type === 'group' 
                            ? `${selectedRoom.participants.length} members`
                            : selectedRoom.participants[0]?.status
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isVideoCall ? "destructive" : "outline"}
                        onClick={isVideoCall ? endCall : startVideoCall}
                      >
                        {isVideoCall ? <PhoneOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Call Area */}
              {isVideoCall && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="bg-gray-900 rounded-lg p-6 text-center text-white">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                          <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                              <Users className="h-8 w-8" />
                            </div>
                            <p className="text-sm">You</p>
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                          <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">{selectedRoom.participants[0]?.avatar}</span>
                            </div>
                            <p className="text-sm">{selectedRoom.participants[0]?.name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          size="sm"
                          variant={isMuted ? "destructive" : "secondary"}
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={isAudioEnabled ? "secondary" : "destructive"}
                          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        >
                          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={isVideoEnabled ? "secondary" : "destructive"}
                          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                        >
                          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={endCall}>
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Messages Area */}
              <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.senderId === 'me' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                          {message.senderId === 'me' ? '👤' : '🌍'}
                        </div>
                        <div className={`flex-1 max-w-xs ${message.senderId === 'me' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.senderName}</span>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.senderId === 'me' 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <CardContent className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" variant="ghost">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Global Chat!</h3>
                <p className="text-gray-600 mb-4">
                  Connect with students from around the world. Select a chat room or start a conversation.
                </p>
                <Button onClick={addFriend}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friends
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
