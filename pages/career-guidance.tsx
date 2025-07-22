import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Award, Target, Briefcase, Star, Brain } from "lucide-react";

export default function CareerGuidance() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const mockSkills = [
    { name: "JavaScript", level: 8, progress: 85 },
    { name: "React", level: 7, progress: 70 },
    { name: "Python", level: 6, progress: 60 },
    { name: "Communication", level: 9, progress: 90 },
  ];

  const mockCareerPaths = [
    { title: "Frontend Developer", match: 92, salary: "$75,000", growth: "22%" },
    { title: "Full Stack Developer", match: 88, salary: "$85,000", growth: "25%" },
    { title: "Data Scientist", match: 75, salary: "$95,000", growth: "31%" },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Guidance</h1>
            <p className="text-gray-600">Discover your path to professional success</p>
          </div>
          <Button className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Take Assessment
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="careers">Career Paths</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-600">Skills Assessed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-600">Career Matches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">7.5</p>
                      <p className="text-sm text-gray-600">Avg Skill Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-gray-600">Job Matches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Career Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCareerPaths.map((path, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{path.title}</h4>
                          <p className="text-sm text-gray-600">{path.salary} • {path.growth} growth</p>
                        </div>
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          {path.match}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSkills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm">{skill.level}/10</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Skill Assessment</h3>
              <p className="text-sm text-gray-500">Take our comprehensive skill assessment to get personalized recommendations</p>
            </div>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Career Exploration</h3>
              <p className="text-sm text-gray-500">Discover career paths that match your skills and interests</p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <div className="text-center py-16">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Career Goals</h3>
              <p className="text-sm text-gray-500">Set and track your professional development goals</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
