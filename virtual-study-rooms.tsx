import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen, Volume2, Play, Pause } from "lucide-react";

export default function VirtualStudyRooms() {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const mockRooms = [
    { id: 1, name: "Math Study Session", participants: 8, subject: "Mathematics", method: "pomodoro" },
    { id: 2, name: "Science Focus Group", participants: 12, subject: "Physics", method: "deep-work" },
    { id: 3, name: "Silent Study Hall", participants: 15, subject: "Mixed", method: "silent" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Virtual Study Rooms</h1>
            <p className="text-gray-600">Join focused study sessions with peers worldwide</p>
          </div>
          <Button>Create Room</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.participants} studying
                        </span>
                        <Badge variant="outline">{room.subject}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {room.method}
                        </span>
                        <Badge variant="secondary">{room.method}</Badge>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      Join Room
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-mono font-bold text-primary-600 mb-4">
                  {formatTime(pomodoroTime)}
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setIsActive(!isActive)}
                    size="lg"
                  >
                    {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {isActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    onClick={() => setPomodoroTime(25 * 60)}
                    variant="outline"
                    size="lg"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Ambient Sounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {['Rain', 'Coffee Shop', 'Forest', 'Ocean', 'White Noise', 'Library'].map((sound) => (
                    <Button key={sound} variant="outline" size="sm" className="text-xs">
                      {sound}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
