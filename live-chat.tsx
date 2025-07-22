import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, MessageCircle } from "lucide-react";

export default function LiveChat() {
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const startVideoCall = () => {
    setIsVideoCall(true);
    toast({
      title: "Video call started",
      description: "WebRTC connection established",
    });
  };

  const endCall = () => {
    setIsVideoCall(false);
    toast({
      title: "Call ended",
      description: "Video call has been terminated",
    });
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      U{i}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">User {i}</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Available
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat & Video Calls
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={startVideoCall}
                    size="sm"
                    variant="outline"
                    disabled={isVideoCall}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={startVideoCall}
                    size="sm"
                    variant="outline"
                    disabled={isVideoCall}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {isVideoCall && (
                <div className="border-b bg-gray-900 p-4 mb-4 rounded">
                  <div className="flex gap-4 h-60">
                    <div className="flex-1 bg-black rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="h-16 w-16 mx-auto mb-2" />
                        <p>Remote Video</p>
                      </div>
                    </div>
                    <div className="w-48 bg-black rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <VideoOff className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Your Video</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      size="sm"
                      variant={isAudioEnabled ? "outline" : "destructive"}
                    >
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      size="sm"
                      variant={isVideoEnabled ? "outline" : "destructive"}
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button onClick={endCall} size="sm" variant="destructive">
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 p-4 bg-gray-50 rounded mb-4">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Real-time Chat</p>
                  <p className="text-sm">WebRTC video calling and Socket.io messaging</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
