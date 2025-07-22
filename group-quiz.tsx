import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Play, 
  Plus, 
  Trophy, 
  Timer, 
  Target,
  Share,
  Copy,
  Crown,
  Zap
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdBy: string;
  isActive: boolean;
  code: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  joinedAt: Date;
}

interface QuizSession {
  id: string;
  quizId: string;
  currentQuestionIndex: number;
  isActive: boolean;
  timeRemaining: number;
  participants: Participant[];
  responses: Record<string, number>;
}

export default function GroupQuiz() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['/api/group-quizzes'],
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('quiz-started', (session: QuizSession) => {
      setCurrentSession(session);
      setShowResults(false);
      setHasAnswered(false);
      setSelectedAnswer(null);
    });

    newSocket.on('question-changed', (data: any) => {
      setCurrentSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: data.questionIndex,
        timeRemaining: data.timeLimit,
        responses: {}
      } : null);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setTimeRemaining(data.timeLimit);
    });

    newSocket.on('time-update', (time: number) => {
      setTimeRemaining(time);
    });

    newSocket.on('question-results', (data: any) => {
      setShowResults(true);
      setCurrentSession(prev => prev ? {
        ...prev,
        responses: data.responses,
        participants: data.leaderboard
      } : null);
    });

    newSocket.on('quiz-ended', (finalResults: any) => {
      setCurrentSession(null);
      setActiveQuiz(null);
      toast({
        title: "Quiz Completed!",
        description: "Thank you for participating!",
      });
    });

    newSocket.on('participant-joined', (participant: Participant) => {
      setCurrentSession(prev => prev ? {
        ...prev,
        participants: [...prev.participants, participant]
      } : null);
      toast({
        title: "New Participant",
        description: `${participant.name} joined the quiz!`,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && currentSession?.isActive) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, currentSession?.isActive]);

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const response = await fetch('/api/group-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-quizzes'] });
      toast({
        title: "Quiz Created!",
        description: `Quiz code: ${data.code}`,
      });
    },
  });

  const joinQuizMutation = useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      const response = await fetch('/api/group-quizzes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, participantName: name }),
      });
      if (!response.ok) throw new Error('Failed to join quiz');
      return response.json();
    },
    onSuccess: (data) => {
      setActiveQuiz(data.quiz);
      setCurrentSession(data.session);
      socket?.emit('join-quiz', {
        code: joinCode,
        participantName,
      });
      toast({
        title: "Joined Quiz!",
        description: `Welcome to ${data.quiz.title}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join quiz",
        variant: "destructive",
      });
    },
  });

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setIsHost(true);
    socket?.emit('start-quiz', { quizId: quiz.id });
    toast({
      title: "Quiz Started!",
      description: `Share code: ${quiz.code}`,
    });
  };

  const nextQuestion = () => {
    if (!currentSession || !activeQuiz) return;
    
    const nextIndex = currentSession.currentQuestionIndex + 1;
    if (nextIndex < activeQuiz.questions.length) {
      socket?.emit('next-question', {
        sessionId: currentSession.id,
        questionIndex: nextIndex,
      });
    } else {
      socket?.emit('end-quiz', { sessionId: currentSession.id });
    }
  };

  const submitAnswer = (answerIndex: number) => {
    if (hasAnswered || !currentSession) return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    socket?.emit('submit-answer', {
      sessionId: currentSession.id,
      questionIndex: currentSession.currentQuestionIndex,
      answerIndex,
    });
  };

  const copyQuizCode = () => {
    if (activeQuiz) {
      navigator.clipboard.writeText(activeQuiz.code);
      toast({
        title: "Code Copied!",
        description: "Quiz code copied to clipboard",
      });
    }
  };

  const currentQuestion = activeQuiz?.questions[currentSession?.currentQuestionIndex || 0];
  const isQuestionActive = currentSession?.isActive && !showResults;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {!activeQuiz ? (
          /* Lobby Screen */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Group Quiz Arena
              </h1>
              <p className="text-gray-600">
                Create interactive quizzes or join existing ones with a code
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Join Quiz */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Join Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter quiz code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono"
                  />
                  <Input
                    placeholder="Your name..."
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                  />
                  <Button
                    onClick={() => joinQuizMutation.mutate({ code: joinCode, name: participantName })}
                    disabled={!joinCode.trim() || !participantName.trim() || joinQuizMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Quiz
                  </Button>
                </CardContent>
              </Card>

              {/* Create Quiz */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Available Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle>Available Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                  </div>
                ) : quizzes?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz: Quiz) => (
                      <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{quiz.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              {quiz.questions.length} questions
                            </Badge>
                            <Button
                              onClick={() => startQuiz(quiz)}
                              size="sm"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No quizzes available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Quiz Screen */
          <div className="space-y-6">
            {/* Quiz Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{activeQuiz.title}</h1>
                    <p className="text-gray-600">
                      Question {(currentSession?.currentQuestionIndex || 0) + 1} of {activeQuiz.questions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={copyQuizCode}
                      variant="outline"
                      size="sm"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      {activeQuiz.code}
                    </Button>
                    {isHost && (
                      <Badge variant="default">
                        <Crown className="h-3 w-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Quiz Area */}
              <div className="lg:col-span-3 space-y-6">
                {currentQuestion && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {currentQuestion.question}
                        </CardTitle>
                        {isQuestionActive && (
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            <span className="font-mono text-lg">
                              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        )}
                      </div>
                      {isQuestionActive && (
                        <Progress 
                          value={(timeRemaining / currentQuestion.timeLimit) * 100} 
                          className="h-2"
                        />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                          <Button
                            key={index}
                            onClick={() => submitAnswer(index)}
                            disabled={hasAnswered || !isQuestionActive}
                            variant={
                              showResults
                                ? index === currentQuestion.correctAnswer
                                  ? "default"
                                  : selectedAnswer === index
                                  ? "destructive"
                                  : "outline"
                                : selectedAnswer === index
                                ? "default"
                                : "outline"
                            }
                            className="h-16 text-left justify-start p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                      
                      {showResults && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Results:</h4>
                          <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => {
                              const responseCount = Object.values(currentSession?.responses || {}).filter(r => r === index).length;
                              const percentage = currentSession?.participants.length 
                                ? (responseCount / currentSession.participants.length) * 100 
                                : 0;
                              
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <span className="w-4">{String.fromCharCode(65 + index)}</span>
                                  <Progress value={percentage} className="flex-1 h-2" />
                                  <span className="text-sm w-12">{responseCount}</span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {isHost && (
                            <Button
                              onClick={nextQuestion}
                              className="mt-4"
                            >
                              {currentSession?.currentQuestionIndex === (activeQuiz.questions.length - 1)
                                ? "End Quiz"
                                : "Next Question"
                              }
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentSession?.participants
                        .sort((a, b) => b.score - a.score)
                        .map((participant, index) => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-3 p-2 rounded"
                          >
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{participant.name}</div>
                              <div className="text-xs text-gray-500">
                                {participant.score} points
                              </div>
                            </div>
                            {participant.isHost && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        )) || []
                      }
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
