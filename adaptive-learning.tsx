import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, BookOpen, CheckCircle, Clock, Star } from "lucide-react";

export default function AdaptiveLearning() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const mockPaths = [
    {
      title: "JavaScript Fundamentals",
      progress: 65,
      difficulty: "beginner",
      modules: 12,
      completedModules: 8,
      estimatedTime: "4 hours remaining"
    },
    {
      title: "React Development",
      progress: 30,
      difficulty: "intermediate",
      modules: 15,
      completedModules: 4,
      estimatedTime: "8 hours remaining"
    }
  ];

  const mockRecommendations = [
    { title: "Practice JavaScript Arrays", type: "exercise", difficulty: "easy" },
    { title: "Build a Todo App", type: "project", difficulty: "medium" },
    { title: "Learn ES6 Features", type: "lesson", difficulty: "medium" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adaptive Learning</h1>
            <p className="text-gray-600">Personalized learning paths powered by AI</p>
          </div>
          <Button className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Take Assessment
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-gray-600">Active Paths</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-600">Modules Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">24h</p>
                      <p className="text-sm text-gray-600">Study Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">7</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPaths.map((path, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{path.title}</h3>
                          <Badge variant="outline">{path.difficulty}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{path.progress}%</span>
                          </div>
                          <Progress value={path.progress} />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{path.completedModules}/{path.modules} modules</span>
                            <span>{path.estimatedTime}</span>
                          </div>
                        </div>
                        <Button size="sm" className="mt-3">
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-gray-500">{rec.type} • {rec.difficulty}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Learning Paths</h3>
              <p className="text-sm text-gray-500">Discover personalized learning paths tailored to your goals</p>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-500">Monitor your learning progress and achievements</p>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">AI-Powered Recommendations</h3>
              <p className="text-sm text-gray-500">Get personalized learning suggestions based on your progress</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
