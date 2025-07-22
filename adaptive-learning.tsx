import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Lightbulb,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  Eye,
  Award
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  modules: LearningModule[];
  prerequisites: string[];
  objectives: string[];
  completionRate: number;
  enrolledStudents: number;
  rating: number;
  tags: string[];
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'exercise' | 'project';
  duration: number; // in minutes
  isCompleted: boolean;
  isLocked: boolean;
  resources: LearningResource[];
  assessments: Assessment[];
  adaptiveContent: AdaptiveContent[];
}

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'audio' | 'interactive' | 'document';
  url: string;
  duration: number;
  difficulty: number; // 1-10
  engagement: number; // 1-10
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'coding' | 'essay' | 'project';
  questions: Question[];
  timeLimit?: number;
  attempts: number;
  maxAttempts: number;
  score?: number;
  feedback?: string;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'coding';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  topics: string[];
}

interface AdaptiveContent {
  id: string;
  content: string;
  difficulty: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  prerequisiteScore: number;
  personalizedRecommendation: boolean;
}

interface StudentProfile {
  id: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  strengths: string[];
  weaknesses: string[];
  preferredPace: 'slow' | 'normal' | 'fast';
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  goalType: 'certification' | 'skill-building' | 'career-change' | 'academic';
  availableHoursPerWeek: number;
  currentLevel: Record<string, number>; // subject -> level (1-10)
}

interface LearningAnalytics {
  timeSpent: number;
  modulesCompleted: number;
  averageScore: number;
  streakDays: number;
  weakTopics: string[];
  strongTopics: string[];
  learningVelocity: number;
  engagementScore: number;
  retentionRate: number;
}

export default function AdaptiveLearning() {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [studyTimer, setStudyTimer] = useState(0);
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ['/api/learning-paths'],
  });

  const { data: enrolledPaths, isLoading: enrolledLoading } = useQuery({
    queryKey: ['/api/enrolled-paths'],
  });

  const { data: studentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/student-profile'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/learning-analytics'],
  });

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ['/api/adaptive-recommendations'],
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/learning-progress'],
  });

  // Study timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudyActive) {
      interval = setInterval(() => {
        setStudyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudyActive]);

  const enrollPathMutation = useMutation({
    mutationFn: async (pathId: string) => {
      const response = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to enroll');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrolled-paths'] });
      toast({
        title: "Enrolled successfully!",
        description: "You can now start learning",
      });
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async ({ pathId, moduleId }: { pathId: string; moduleId: string }) => {
      const response = await fetch(`/api/learning-paths/${pathId}/modules/${moduleId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to complete module');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrolled-paths'] });
      toast({
        title: "Module completed!",
        description: "Great progress! Keep it up!",
      });
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async ({ assessmentId, answers }: { assessmentId: string; answers: Record<string, string> }) => {
      const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('Failed to submit assessment');
      return response.json();
    },
    onSuccess: (data) => {
      setActiveAssessment(null);
      setCurrentQuestion(0);
      setUserAnswers({});
      queryClient.invalidateQueries({ queryKey: ['/api/learning-analytics'] });
      toast({
        title: "Assessment submitted!",
        description: `Score: ${data.score}% - ${data.feedback}`,
      });
    },
  });

  const handleStartModule = (module: LearningModule) => {
    setCurrentModule(module);
    setIsStudyActive(true);
    setStudyTimer(0);
  };

  const handleCompleteModule = () => {
    if (selectedPath && currentModule) {
      completeModuleMutation.mutate({
        pathId: selectedPath.id,
        moduleId: currentModule.id,
      });
      setCurrentModule(null);
      setIsStudyActive(false);
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestion(0);
    setUserAnswers({});
  };

  const handleAnswerQuestion = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [activeAssessment!.questions[currentQuestion].id]: answer,
    }));

    if (currentQuestion < activeAssessment!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit assessment
      submitAssessmentMutation.mutate({
        assessmentId: activeAssessment!.id,
        answers: userAnswers,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'audio': return Headphones;
      case 'interactive': return Zap;
      case 'document': return BookOpen;
      default: return FileText;
    }
  };

  const filteredPaths = learningPaths?.filter((path: LearningPath) => {
    if (filterSubject !== 'All' && path.subject !== filterSubject) return false;
    if (filterDifficulty !== 'All' && path.difficulty !== filterDifficulty) return false;
    return true;
  });

  const learningStyleData = studentProfile ? [
    { style: 'Visual', score: studentProfile.learningStyle === 'visual' ? 10 : 5 },
    { style: 'Auditory', score: studentProfile.learningStyle === 'auditory' ? 10 : 5 },
    { style: 'Kinesthetic', score: studentProfile.learningStyle === 'kinesthetic' ? 10 : 5 },
    { style: 'Reading', score: studentProfile.learningStyle === 'reading' ? 10 : 5 },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Assessment Modal */}
        {activeAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{activeAssessment.title}</CardTitle>
                  <Badge variant="outline">
                    {currentQuestion + 1} / {activeAssessment.questions.length}
                  </Badge>
                </div>
                <Progress value={((currentQuestion + 1) / activeAssessment.questions.length) * 100} />
              </CardHeader>
              <CardContent className="space-y-6">
                {activeAssessment.questions[currentQuestion] && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {activeAssessment.questions[currentQuestion].question}
                    </h3>
                    
                    {activeAssessment.questions[currentQuestion].type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {activeAssessment.questions[currentQuestion].options?.map((option, index) => (
                          <Button
                            key={index}
                            onClick={() => handleAnswerQuestion(option)}
                            variant="outline"
                            className="w-full text-left justify-start p-4 h-auto"
                          >
                            <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {activeAssessment.questions[currentQuestion].type === 'true-false' && (
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleAnswerQuestion('true')}
                          variant="outline"
                          className="flex-1"
                        >
                          True
                        </Button>
                        <Button
                          onClick={() => handleAnswerQuestion('false')}
                          variant="outline"
                          className="flex-1"
                        >
                          False
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adaptive Learning</h1>
            <p className="text-gray-600">Personalized learning paths powered by AI</p>
          </div>
          <div className="flex items-center gap-4">
            {isStudyActive && (
              <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-mono text-green-800">{formatTime(studyTimer)}</span>
                <Button
                  onClick={() => setIsStudyActive(!isStudyActive)}
                  size="sm"
                  variant="outline"
                >
                  {isStudyActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{enrolledPaths?.length || 0}</p>
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
                      <p className="text-2xl font-bold">{analytics?.modulesCompleted || 0}</p>
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
                      <p className="text-2xl font-bold">{Math.round(analytics?.timeSpent / 60) || 0}h</p>
                      <p className="text-sm text-gray-600">Study Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{analytics?.streakDays || 0}</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="progress" stroke="#6366F1" strokeWidth={2} />
                      <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Learning Style Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Style Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={learningStyleData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="style" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar
                        name="Learning Style"
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledPaths?.slice(0, 3).map((path: LearningPath) => (
                    <Card key={path.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{path.title}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(path.completionRate)}%</span>
                          </div>
                          <Progress value={path.completionRate} />
                        </div>
                        <Button
                          onClick={() => setSelectedPath(path)}
                          className="w-full"
                          size="sm"
                        >
                          Continue
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6 mt-6">
            {selectedPath ? (
              /* Path Details */
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setSelectedPath(null)}
                    variant="outline"
                    size="sm"
                  >
                    ← Back to Paths
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedPath.title}</h2>
                    <p className="text-gray-600">{selectedPath.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold">{selectedPath.estimatedHours}h</p>
                      <p className="text-sm text-gray-600">Estimated Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="font-semibold">{selectedPath.modules.length}</p>
                      <p className="text-sm text-gray-600">Modules</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="font-semibold">{selectedPath.enrolledStudents}</p>
                      <p className="text-sm text-gray-600">Students</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                      <p className="font-semibold">{selectedPath.rating}/5</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Modules */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPath.modules.map((module, index) => (
                        <div
                          key={module.id}
                          className={`border rounded-lg p-4 ${
                            module.isLocked ? 'bg-gray-50' : 'bg-white hover:shadow-md'
                          } transition-shadow`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  module.isCompleted ? 'bg-green-500 text-white' :
                                  module.isLocked ? 'bg-gray-300 text-gray-500' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {module.isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : module.isLocked ? (
                                    <AlertCircle className="h-4 w-4" />
                                  ) : (
                                    <span className="font-bold">{index + 1}</span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{module.title}</h3>
                                  <p className="text-sm text-gray-600">{module.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {module.duration} min
                                </span>
                                <Badge variant="outline">{module.type}</Badge>
                                <span>{module.resources.length} resources</span>
                              </div>

                              {/* Resources */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {module.resources.map((resource) => {
                                  const ResourceIcon = getResourceIcon(resource.type);
                                  return (
                                    <div
                                      key={resource.id}
                                      className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                                    >
                                      <ResourceIcon className="h-3 w-3" />
                                      {resource.title}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!module.isLocked && !module.isCompleted && (
                                <Button
                                  onClick={() => handleStartModule(module)}
                                  size="sm"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              )}
                              {module.assessments.length > 0 && !module.isLocked && (
                                <Button
                                  onClick={() => handleStartAssessment(module.assessments[0])}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  Quiz
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Path List */
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <span className="font-medium">Filters:</span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="border rounded px-3 py-1"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Programming">Programming</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="border rounded px-3 py-1"
                  >
                    <option value="All">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Path Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPaths?.map((path: LearningPath) => (
                    <Card key={path.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{path.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(path.difficulty)}>
                              {path.difficulty}
                            </Badge>
                            <Badge variant="outline">{path.subject}</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {path.estimatedHours}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {path.modules.length} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {path.rating}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {path.enrolledStudents} students
                            </span>
                            <span>{Math.round(path.completionRate)}% avg completion</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setSelectedPath(path)}
                            className="flex-1"
                            size="sm"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => enrollPathMutation.mutate(path.id)}
                            variant="outline"
                            size="sm"
                          >
                            Enroll
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) || []}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Enrolled Paths Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Learning Paths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrolledPaths?.map((path: LearningPath) => (
                        <div key={path.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{path.title}</h3>
                            <Badge className={getDifficultyColor(path.difficulty)}>
                              {path.difficulty}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(path.completionRate)}%</span>
                            </div>
                            <Progress value={path.completionRate} />
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{path.modules.filter(m => m.isCompleted).length}/{path.modules.length} modules</span>
                              <span>Est. {Math.round(path.estimatedHours * (1 - path.completionRate / 100))}h remaining</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedPath(path)}
                            size="sm"
                            className="mt-3"
                          >
                            Continue Learning
                          </Button>
                        </div>
                      )) || []}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Study Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {analytics?.averageScore || 0}%
                        </p>
                        <p className="text-sm text-gray-600">Average Score</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Engagement</span>
                          <span>{analytics?.engagementScore || 0}%</span>
                        </div>
                        <Progress value={analytics?.engagementScore || 0} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Retention</span>
                          <span>{analytics?.retentionRate || 0}%</span>
                        </div>
                        <Progress value={analytics?.retentionRate || 0} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                        <Award className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium text-sm">First Module</p>
                          <p className="text-xs text-gray-600">Completed your first learning module</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                        <Trophy className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">Week Streak</p>
                          <p className="text-xs text-gray-600">7 days of continuous learning</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations?.map((rec: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">{rec.title}</h3>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rec.type}</Badge>
                      <Button size="sm">
                        Explore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">
                      {analytics?.learningVelocity || 0}
                    </p>
                    <p className="text-gray-600">modules per week</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weak vs Strong Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-red-600">Areas to Improve</h4>
                      <div className="space-y-1">
                        {analytics?.weakTopics?.map((topic, index) => (
                          <Badge key={index} variant="destructive" className="mr-1">
                            {topic}
                          </Badge>
                        )) || []}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-green-600">Strong Areas</h4>
                      <div className="space-y-1">
                        {analytics?.strongTopics?.map((topic, index) => (
                          <Badge key={index} variant="default" className="mr-1">
                            {topic}
                          </Badge>
                        )) || []}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
