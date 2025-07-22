import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Clock, 
  BookOpen, 
  Volume2, 
  VolumeX,
  Coffee,
  Brain,
  Lightbulb,
  Target,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Settings,
  Mic,
  MicOff,
  Eye,
  EyeOff
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface StudyRoom {
  id: string;
  name: string;
  description: string;
  subject: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  isPrivate: boolean;
  password?: string;
  studyMethod: 'pomodoro' | 'deep-work' | 'group-study' | 'silent';
  ambientSound: string;
  createdBy: string;
  createdAt: Date;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'studying' | 'break' | 'away';
  studyTime: number; // in minutes
  breakTime: number; // in minutes
  joinedAt: Date;
  isHost: boolean;
  isMuted: boolean;
  cameraEnabled: boolean;
}

interface PomodoroSession {
  isActive: boolean;
  isBreak: boolean;
  timeRemaining: number; // in seconds
  cycle: number;
  totalCycles: number;
}

interface StudyStats {
  totalStudyTime: number;
  sessionsCompleted: number;
  streakDays: number;
  focusScore: number;
}

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'None', icon: VolumeX },
  { id: 'rain', name: 'Rain', icon: Volume2 },
  { id: 'coffee-shop', name: 'Coffee Shop', icon: Coffee },
  { id: 'forest', name: 'Forest', icon: Volume2 },
  { id: 'ocean', name: 'Ocean Waves', icon: Volume2 },
  { id: 'white-noise', name: 'White Noise', icon: Volume2 },
];

const STUDY_SUBJECTS = [
  'Mathematics', 'Science', 'Literature', 'History', 'Programming',
  'Languages', 'Art', 'Music', 'Business', 'Medicine', 'Engineering', 'Other'
];

export default function VirtualStudyRooms() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [pomodoroSession, setPomodoroSession] = useState<PomodoroSession>({
    isActive: false,
    isBreak: false,
    timeRemaining: 25 * 60, // 25 minutes
    cycle: 0,
    totalCycles: 4,
  });
  const [selectedAmbientSound, setSelectedAmbientSound] = useState('none');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");
  const [newRoomMethod, setNewRoomMethod] = useState<'pomodoro' | 'deep-work' | 'group-study' | 'silent'>('pomodoro');
  const [filterSubject, setFilterSubject] = useState('All');
  const [isMuted, setIsMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/study-rooms'],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/study-stats'],
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('room-updated', (room: StudyRoom) => {
      setCurrentRoom(room);
      queryClient.invalidateQueries({ queryKey: ['/api/study-rooms'] });
    });

    newSocket.on('pomodoro-updated', (session: PomodoroSession) => {
      setPomodoroSession(session);
    });

    newSocket.on('participant-joined', (participant: Participant) => {
      toast({
        title: "Someone joined",
        description: `${participant.name} joined the study room`,
      });
    });

    newSocket.on('participant-left', (participant: Participant) => {
      toast({
        title: "Someone left",
        description: `${participant.name} left the study room`,
      });
    });

    newSocket.on('study-encouragement', (message: string) => {
      toast({
        title: "Study Motivation",
        description: message,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Pomodoro timer
  useEffect(() => {
    if (pomodoroSession.isActive && pomodoroSession.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setPomodoroSession(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (pomodoroSession.isActive && pomodoroSession.timeRemaining === 0) {
      // Timer completed
      handlePomodoroComplete();
    }
  }, [pomodoroSession.timeRemaining, pomodoroSession.isActive]);

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const response = await fetch('/api/study-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-rooms'] });
      setCurrentRoom(data);
      setIsCreatingRoom(false);
      socket?.emit('join-room', { roomId: data.id });
      toast({
        title: "Room created!",
        description: "Your study room is ready",
      });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/study-rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to join room');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentRoom(data);
      socket?.emit('join-room', { roomId: data.id });
      toast({
        title: "Joined room!",
        description: `Welcome to ${data.name}`,
      });
    },
  });

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoomMutation.mutate({
        name: newRoomName,
        description: `Studying ${newRoomSubject}`,
        subject: newRoomSubject,
        maxParticipants: 12,
        studyMethod: newRoomMethod,
        ambientSound: selectedAmbientSound,
        isPrivate: false,
      });
    }
  };

  const handleJoinRoom = (room: StudyRoom) => {
    if (room.currentParticipants < room.maxParticipants) {
      joinRoomMutation.mutate(room.id);
    } else {
      toast({
        title: "Room full",
        description: "This study room is at capacity",
        variant: "destructive",
      });
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      socket?.emit('leave-room', { roomId: currentRoom.id });
      setCurrentRoom(null);
      setPomodoroSession({
        isActive: false,
        isBreak: false,
        timeRemaining: 25 * 60,
        cycle: 0,
        totalCycles: 4,
      });
    }
  };

  const handleStartPomodoro = () => {
    setPomodoroSession(prev => ({ ...prev, isActive: true }));
    socket?.emit('start-pomodoro', { roomId: currentRoom?.id });
  };

  const handlePausePomodoro = () => {
    setPomodoroSession(prev => ({ ...prev, isActive: false }));
    socket?.emit('pause-pomodoro', { roomId: currentRoom?.id });
  };

  const handleResetPomodoro = () => {
    setPomodoroSession({
      isActive: false,
      isBreak: false,
      timeRemaining: 25 * 60,
      cycle: 0,
      totalCycles: 4,
    });
    socket?.emit('reset-pomodoro', { roomId: currentRoom?.id });
  };

  const handlePomodoroComplete = () => {
    const isBreak = !pomodoroSession.isBreak;
    const newCycle = isBreak ? pomodoroSession.cycle : pomodoroSession.cycle + 1;
    const timeRemaining = isBreak ? 5 * 60 : 25 * 60; // 5 min break, 25 min work

    setPomodoroSession({
      isActive: false,
      isBreak,
      timeRemaining,
      cycle: newCycle,
      totalCycles: 4,
    });

    toast({
      title: isBreak ? "Time for a break!" : "Break's over!",
      description: isBreak ? "Take a 5-minute break" : "Ready for the next session?",
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredRooms = rooms?.filter((room: StudyRoom) => 
    filterSubject === 'All' || room.subject === filterSubject
  );

  const getStudyMethodIcon = (method: string) => {
    switch (method) {
      case 'pomodoro': return Clock;
      case 'deep-work': return Brain;
      case 'group-study': return Users;
      case 'silent': return Eye;
      default: return BookOpen;
    }
  };

  const getStudyMethodColor = (method: string) => {
    switch (method) {
      case 'pomodoro': return 'bg-red-100 text-red-800';
      case 'deep-work': return 'bg-purple-100 text-purple-800';
      case 'group-study': return 'bg-blue-100 text-blue-800';
      case 'silent': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {!currentRoom ? (
          /* Room Selection */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Virtual Study Rooms</h1>
                <p className="text-gray-600">Join focused study sessions with peers worldwide</p>
              </div>
              <Button
                onClick={() => setIsCreatingRoom(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Room
              </Button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{userStats?.totalStudyTime || 0}h</p>
                      <p className="text-sm text-gray-600">Study Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{userStats?.sessionsCompleted || 0}</p>
                      <p className="text-sm text-gray-600">Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{userStats?.streakDays || 0}</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{userStats?.focusScore || 0}%</p>
                      <p className="text-sm text-gray-600">Focus Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Filter by subject:</span>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="All">All Subjects</option>
                {STUDY_SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Available Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomsLoading ? (
                <div className="col-span-3 text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                </div>
              ) : filteredRooms?.length > 0 ? (
                filteredRooms.map((room: StudyRoom) => {
                  const MethodIcon = getStudyMethodIcon(room.studyMethod);
                  return (
                    <Card key={room.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          </div>
                          <MethodIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{room.subject}</Badge>
                            <Badge className={getStudyMethodColor(room.studyMethod)}>
                              {room.studyMethod.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {room.currentParticipants}/{room.maxParticipants}
                            </span>
                            <span>
                              Created {new Date(room.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleJoinRoom(room)}
                          disabled={room.currentParticipants >= room.maxParticipants}
                          className="w-full"
                          size="sm"
                        >
                          {room.currentParticipants >= room.maxParticipants ? 'Full' : 'Join Room'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No study rooms available
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Be the first to create a study room for this subject
                  </p>
                  <Button onClick={() => setIsCreatingRoom(true)}>
                    Create Room
                  </Button>
                </div>
              )}
            </div>

            {/* Create Room Modal */}
            {isCreatingRoom && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>Create Study Room</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Room name..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                    
                    <select
                      value={newRoomSubject}
                      onChange={(e) => setNewRoomSubject(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select subject...</option>
                      {STUDY_SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newRoomMethod}
                      onChange={(e) => setNewRoomMethod(e.target.value as any)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="pomodoro">Pomodoro Technique</option>
                      <option value="deep-work">Deep Work</option>
                      <option value="group-study">Group Study</option>
                      <option value="silent">Silent Study</option>
                    </select>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateRoom}
                        disabled={!newRoomName.trim() || !newRoomSubject}
                        className="flex-1"
                      >
                        Create Room
                      </Button>
                      <Button
                        onClick={() => setIsCreatingRoom(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          /* Active Study Room */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{currentRoom.name}</h1>
                <p className="text-gray-600">
                  {currentRoom.participants.length} participants studying {currentRoom.subject}
                </p>
              </div>
              <Button onClick={handleLeaveRoom} variant="outline">
                Leave Room
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timer and Controls */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {currentRoom.studyMethod === 'pomodoro' ? 'Pomodoro Timer' : 'Study Timer'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div>
                      <div className="text-6xl font-mono font-bold text-primary-600">
                        {formatTime(pomodoroSession.timeRemaining)}
                      </div>
                      <p className="text-lg text-gray-600 mt-2">
                        {pomodoroSession.isBreak ? 'Break Time' : 'Study Time'}
                      </p>
                      {currentRoom.studyMethod === 'pomodoro' && (
                        <p className="text-sm text-gray-500">
                          Cycle {pomodoroSession.cycle + 1} of {pomodoroSession.totalCycles}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={pomodoroSession.isActive ? handlePausePomodoro : handleStartPomodoro}
                        size="lg"
                      >
                        {pomodoroSession.isActive ? (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleResetPomodoro}
                        variant="outline"
                        size="lg"
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Ambient Sounds */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      Ambient Sounds
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {AMBIENT_SOUNDS.map((sound) => {
                        const SoundIcon = sound.icon;
                        return (
                          <Button
                            key={sound.id}
                            onClick={() => setSelectedAmbientSound(sound.id)}
                            variant={selectedAmbientSound === sound.id ? 'default' : 'outline'}
                            size="sm"
                            className="flex flex-col gap-1 h-auto py-3"
                          >
                            <SoundIcon className="h-4 w-4" />
                            <span className="text-xs">{sound.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participants */}
              <div>
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRoom.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3 p-2 rounded">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{participant.name}</div>
                            <div className="text-xs text-gray-500 capitalize">
                              {participant.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {participant.isMuted ? (
                              <MicOff className="h-3 w-3 text-gray-400" />
                            ) : (
                              <Mic className="h-3 w-3 text-green-600" />
                            )}
                            {participant.cameraEnabled ? (
                              <Eye className="h-3 w-3 text-blue-600" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsMuted(!isMuted)}
                          size="sm"
                          variant={isMuted ? "destructive" : "outline"}
                          className="flex-1"
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={() => setCameraEnabled(!cameraEnabled)}
                          size="sm"
                          variant={cameraEnabled ? "default" : "outline"}
                          className="flex-1"
                        >
                          {cameraEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
