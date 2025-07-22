import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen,
  Users,
  Briefcase,
  Star,
  ChevronRight,
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  Brain,
  Lightbulb,
  Rocket
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface SkillAssessment {
  id: string;
  name: string;
  category: string;
  level: number; // 1-10
  progress: number; // 0-100
  lastAssessed: Date;
  recommendations: string[];
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  averageSalary: number;
  growthRate: number;
  educationLevel: string;
  experience: string;
  companies: string[];
  relatedJobs: string[];
}

interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'video' | 'certification';
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  price: number;
  url: string;
  skills: string[];
}

interface CareerGoal {
  id: string;
  title: string;
  targetRole: string;
  timeline: string;
  skillGaps: string[];
  progress: number;
  milestones: Milestone[];
  createdAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
  description: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  weight: number;
}

const SKILL_CATEGORIES = [
  'Technical Skills',
  'Soft Skills',
  'Leadership',
  'Communication',
  'Problem Solving',
  'Creativity',
  'Data Analysis',
  'Project Management'
];

const CAREER_FIELDS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Engineering',
  'Design',
  'Business',
  'Science',
  'Arts'
];

export default function CareerGuidance() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPath | null>(null);
  const [skillFilter, setSkillFilter] = useState('All');
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalRole, setNewGoalRole] = useState("");
  const [newGoalTimeline, setNewGoalTimeline] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['/api/user-skills'],
  });

  const { data: careerPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ['/api/career-paths'],
  });

  const { data: learningResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/learning-resources'],
  });

  const { data: careerGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/career-goals'],
  });

  const { data: assessmentQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/skill-assessment-questions'],
    enabled: assessmentMode,
  });

  const { data: jobRecommendations, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/job-recommendations'],
  });

  const { data: skillProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/skill-progress'],
  });

  const completeAssessmentMutation = useMutation({
    mutationFn: async (answers: Record<string, string>) => {
      const response = await fetch('/api/skill-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('Failed to complete assessment');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-skills'] });
      setAssessmentMode(false);
      setCurrentQuestion(0);
      setAssessmentAnswers({});
      toast({
        title: "Assessment completed!",
        description: "Your skill profile has been updated",
      });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await fetch('/api/career-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-goals'] });
      setNewGoalTitle("");
      setNewGoalRole("");
      setNewGoalTimeline("");
      toast({
        title: "Goal created!",
        description: "Your career goal has been added",
      });
    },
  });

  const handleAssessmentAnswer = (answer: string) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [assessmentQuestions[currentQuestion].id]: answer,
    }));

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete assessment
      completeAssessmentMutation.mutate(assessmentAnswers);
    }
  };

  const handleCreateGoal = () => {
    if (newGoalTitle.trim() && newGoalRole.trim()) {
      createGoalMutation.mutate({
        title: newGoalTitle,
        targetRole: newGoalRole,
        timeline: newGoalTimeline,
        skillGaps: [], // Will be calculated based on target role
        milestones: [],
      });
    }
  };

  const filteredSkills = userSkills?.filter((skill: SkillAssessment) => 
    skillFilter === 'All' || skill.category === skillFilter
  );

  const getSkillColor = (level: number) => {
    if (level >= 8) return 'bg-green-500';
    if (level >= 6) return 'bg-yellow-500';
    if (level >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const skillRadarData = SKILL_CATEGORIES.map(category => ({
    category: category.replace(' Skills', ''),
    level: userSkills?.filter((s: SkillAssessment) => s.category === category)
      .reduce((avg, skill) => avg + skill.level, 0) / 
      (userSkills?.filter((s: SkillAssessment) => s.category === category).length || 1) || 0
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Guidance</h1>
            <p className="text-gray-600">Discover your path to professional success</p>
          </div>
          <Button
            onClick={() => setAssessmentMode(true)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Take Skill Assessment
          </Button>
        </div>

        {/* Assessment Modal */}
        {assessmentMode && assessmentQuestions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Skill Assessment</CardTitle>
                  <span className="text-sm text-gray-500">
                    {currentQuestion + 1} of {assessmentQuestions.length}
                  </span>
                </div>
                <Progress value={((currentQuestion + 1) / assessmentQuestions.length) * 100} />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {assessmentQuestions[currentQuestion]?.question}
                  </h3>
                  <RadioGroup onValueChange={handleAssessmentAnswer}>
                    {assessmentQuestions[currentQuestion]?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setAssessmentMode(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="careers">Career Paths</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{userSkills?.length || 0}</p>
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
                      <p className="text-2xl font-bold">{careerGoals?.length || 0}</p>
                      <p className="text-sm text-gray-600">Active Goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(userSkills?.reduce((avg, skill) => avg + skill.level, 0) / (userSkills?.length || 1)) || 0}
                      </p>
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
                      <p className="text-2xl font-bold">{jobRecommendations?.length || 0}</p>
                      <p className="text-sm text-gray-600">Job Matches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar
                        name="Skill Level"
                        dataKey="level"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={skillProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="averageLevel" stroke="#6366F1" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Job Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobRecommendations?.slice(0, 5).map((job: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {job.match}% match
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-6">
            <div className="flex items-center gap-4">
              <span className="font-medium">Filter by category:</span>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="All">All Categories</option>
                {SKILL_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills?.map((skill: SkillAssessment) => (
                <Card key={skill.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{skill.name}</h3>
                      <Badge variant="secondary">{skill.category}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Level</span>
                        <span className="font-medium">{skill.level}/10</span>
                      </div>
                      <Progress value={skill.level * 10} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}
                    </div>
                    
                    {skill.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {skill.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careerPaths?.map((path: CareerPath) => (
                    <Card key={path.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{path.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4" />
                            <span>${path.averageSalary.toLocaleString()}/year avg</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4" />
                            <span>{path.growthRate}% growth rate</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4" />
                            <span>{path.educationLevel}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Key Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {path.requiredSkills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {path.requiredSkills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{path.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => setSelectedCareerPath(path)}
                          size="sm"
                          className="w-full"
                        >
                          Explore Path
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  )) || []}
                </div>
              </div>

              {/* Career Path Details */}
              <div>
                {selectedCareerPath ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCareerPath.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {selectedCareerPath.description}
                      </p>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Required Skills</h4>
                        <div className="space-y-1">
                          {selectedCareerPath.requiredSkills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Top Companies</h4>
                        <div className="space-y-1">
                          {selectedCareerPath.companies.map((company, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {company}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Related Roles</h4>
                        <div className="space-y-1">
                          {selectedCareerPath.relatedJobs.map((job, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {job}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        <Rocket className="h-4 w-4 mr-2" />
                        Start Learning Path
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-600 mb-2">
                        Select a Career Path
                      </h3>
                      <p className="text-sm text-gray-500">
                        Choose a career path to see detailed information and learning recommendations
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningResources?.map((resource: LearningResource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{resource.title}</h3>
                        <p className="text-sm text-gray-600">{resource.provider}</p>
                      </div>
                      <Badge className={
                        resource.type === 'certification' ? 'bg-yellow-100 text-yellow-800' :
                        resource.type === 'course' ? 'bg-blue-100 text-blue-800' :
                        resource.type === 'book' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }>
                        {resource.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {resource.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {resource.rating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant={
                          resource.difficulty === 'beginner' ? 'outline' :
                          resource.difficulty === 'intermediate' ? 'secondary' :
                          'default'
                        }>
                          {resource.difficulty}
                        </Badge>
                        <span className="font-semibold">
                          {resource.price === 0 ? 'Free' : `$${resource.price}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Resource
                    </Button>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            {/* Create Goal */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Career Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Goal title..."
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Target role..."
                    value={newGoalRole}
                    onChange={(e) => setNewGoalRole(e.target.value)}
                  />
                  <select
                    value={newGoalTimeline}
                    onChange={(e) => setNewGoalTimeline(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select timeline...</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateGoal}
                  disabled={!newGoalTitle.trim() || !newGoalRole.trim()}
                  className="mt-4"
                >
                  Create Goal
                </Button>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerGoals?.map((goal: CareerGoal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.targetRole}</p>
                      </div>
                      <Badge variant="outline">{goal.timeline}</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                    
                    {goal.skillGaps.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Skill gaps to address:</p>
                        <div className="flex flex-wrap gap-1">
                          {goal.skillGaps.map((skill, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {goal.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-3 w-3 ${
                            milestone.completed ? 'text-green-600' : 'text-gray-300'
                          }`} />
                          <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full mt-3">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
