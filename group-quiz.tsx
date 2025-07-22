import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Users, Play, Trophy, Timer, Crown } from "lucide-react";

export default function GroupQuiz() {
  const [joinCode, setJoinCode] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [isInQuiz, setIsInQuiz] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { toast } = useToast();

  const joinQuiz = () => {
    if (joinCode && participantName) {
      setIsInQuiz(true);
      toast({
        title: "Joined Quiz!",
        description: `Welcome to the quiz, ${participantName}!`,
      });
    }
  };

  const mockQuestion = {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    timeLimit: 30
  };

  const mockLeaderboard = [
    { name: "Alice", score: 850, rank: 1 },
    { name: "Bob", score: 720, rank: 2 },
    { name: "Charlie", score: 680, rank: 3 },
    { name: "You", score: 650, rank: 4 },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {!isInQuiz ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Group Quiz Arena
              </h1>
              <p className="text-gray-600">
                Join interactive quizzes or create your own - Kahoot style!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onClick={joinQuiz}
                    disabled={!joinCode.trim() || !participantName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Quiz
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg" variant="outline">
                    Create New Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Quiz in Progress</h1>
              <Badge variant="default">
                <Crown className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Question 1 of 10</CardTitle>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        <span className="font-mono text-lg">{timeRemaining}s</span>
                      </div>
                    </div>
                    <Progress value={(timeRemaining / mockQuestion.timeLimit) * 100} />
                  </CardHeader>
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-6">{mockQuestion.question}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockQuestion.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-16 text-left justify-start p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary-100 flex items-center justify-center font-bold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockLeaderboard.map((participant) => (
                        <div
                          key={participant.name}
                          className={`flex items-center gap-3 p-2 rounded ${
                            participant.name === 'You' ? 'bg-primary-50 border border-primary-200' : ''
                          }`}
                        >
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            participant.rank === 1 ? 'bg-yellow-500 text-white' :
                            participant.rank === 2 ? 'bg-gray-400 text-white' :
                            participant.rank === 3 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {participant.rank}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{participant.name}</div>
                            <div className="text-xs text-gray-500">{participant.score} points</div>
                          </div>
                        </div>
                      ))}
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
