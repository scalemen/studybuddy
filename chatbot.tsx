import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, User, Loader2, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/chat-sessions'],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string }) => {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSession(data.session);
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions'] });
      setMessage("");
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const createNewSession = () => {
    setCurrentSession({
      id: `temp-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: message,
      type: 'user',
      timestamp: new Date(),
    };

    if (!currentSession) {
      createNewSession();
    }

    const updatedSession = {
      ...currentSession!,
      messages: [...(currentSession?.messages || []), userMessage],
    };
    setCurrentSession(updatedSession);

    await sendMessageMutation.mutateAsync({
      message: message,
      sessionId: currentSession?.id !== `temp-${Date.now()}` ? currentSession?.id : undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat History
                </CardTitle>
                <Button onClick={createNewSession} size="sm" className="h-8 px-3">
                  New Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="p-4 space-y-2">
                  {sessionsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                  ) : sessions?.length > 0 ? (
                    sessions.map((session: ChatSession) => (
                      <div
                        key={session.id}
                        onClick={() => setCurrentSession(session)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentSession?.id === session.id
                            ? 'bg-primary-100 border border-primary-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(new Date(session.createdAt))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No chat sessions yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary-600" />
                StudyBuddy AI Assistant
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ask me anything about your studies, homework, or professional questions!
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                {currentSession?.messages?.length > 0 ? (
                  <div className="space-y-4">
                    {currentSession.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.type === 'bot' && (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary-600" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.type === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              msg.type === 'user' ? 'text-primary-200' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        
                        {msg.type === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Ask me about homework help, study tips, explanations of topics, 
                      career advice, or any educational questions you have!
                    </p>
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                    className="px-4"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
