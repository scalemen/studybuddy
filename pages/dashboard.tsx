import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { HomeworkHelper } from "@/components/dashboard/HomeworkHelper";
import { SearchTopics } from "@/components/dashboard/SearchTopics";
import { FlashcardPreview } from "@/components/dashboard/FlashcardPreview";
import { MiniGames } from "@/components/dashboard/MiniGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  StickyNote, 
  Album, 
  Camera, 
  Gamepad2,
  CalendarDays,
  Plus,
  MessageCircle,
  Video,
  Users,
  PenTool,
  Bot,
  Search,
  GraduationCap,
  Briefcase,
  Brain,
  Coffee,
  Zap,
  Globe
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
            Welcome back, {user?.displayName || user?.username?.split('@')[0] || 'Student'}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">Ready to learn something amazing today?</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/notes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Note
            </Button>
          </Link>
          <Link href="/study-planner">
            <Button variant="outline" size="sm">
              <CalendarDays className="h-4 w-4 mr-1" /> Study Planner
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Quick Access Section */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <QuickAccessCard 
            href="/notes" 
            icon={StickyNote} 
            title="Notes" 
            description="Text & Rich Editor"
            bgColorClass="bg-primary-100"
            iconColorClass="text-primary-600"
          />
          <QuickAccessCard 
            href="/drawing-notes" 
            icon={PenTool} 
            title="Drawing" 
            description="Apple Pen Support"
            bgColorClass="bg-purple-100"
            iconColorClass="text-purple-600"
          />
          <QuickAccessCard 
            href="/flashcards" 
            icon={Album} 
            title="Flashcards" 
            description="Spaced Repetition"
            bgColorClass="bg-teal-100"
            iconColorClass="text-teal-600"
          />
          <QuickAccessCard 
            href="/homework-helper" 
            icon={Camera} 
            title="Homework Help" 
            description="AI Photo Solver"
            bgColorClass="bg-amber-100"
            iconColorClass="text-amber-600"
          />
          <QuickAccessCard 
            href="/chat" 
            icon={MessageCircle} 
            title="Live Chat" 
            description="Global Friends"
            bgColorClass="bg-blue-100"
            iconColorClass="text-blue-600"
          />
          <QuickAccessCard 
            href="/mini-games" 
            icon={Gamepad2} 
            title="Mini Games" 
            description="10 Fun Games"
            bgColorClass="bg-green-100"
            iconColorClass="text-green-600"
          />
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">Advanced Study Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <QuickAccessCard 
            href="/chatbot" 
            icon={Bot} 
            title="AI Tutor" 
            description="Ask Anything"
            bgColorClass="bg-indigo-100"
            iconColorClass="text-indigo-600"
          />
          <QuickAccessCard 
            href="/virtual-study-rooms" 
            icon={Video} 
            title="Study Rooms" 
            description="Video Calls"
            bgColorClass="bg-red-100"
            iconColorClass="text-red-600"
          />
          <QuickAccessCard 
            href="/collaborative-workspace" 
            icon={Users} 
            title="Collaborate" 
            description="Team Projects"
            bgColorClass="bg-orange-100"
            iconColorClass="text-orange-600"
          />
          <QuickAccessCard 
            href="/topic-search" 
            icon={Search} 
            title="Topic Search" 
            description="AI + YouTube"
            bgColorClass="bg-pink-100"
            iconColorClass="text-pink-600"
          />
          <QuickAccessCard 
            href="/research-assistant" 
            icon={GraduationCap} 
            title="Research" 
            description="Academic Papers"
            bgColorClass="bg-cyan-100"
            iconColorClass="text-cyan-600"
          />
          <QuickAccessCard 
            href="/career-guidance" 
            icon={Briefcase} 
            title="Career Guide" 
            description="Future Planning"
            bgColorClass="bg-violet-100"
            iconColorClass="text-violet-600"
          />
        </div>
      </section>

      {/* Interactive Features */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">Interactive Learning</h2>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Adaptive Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                AI adjusts to your learning style and pace
              </p>
              <Link href="/adaptive-learning">
                <Button size="sm" className="w-full">Start Learning</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Group Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Kahoot-style multiplayer quizzes
              </p>
              <Link href="/group-quiz">
                <Button size="sm" className="w-full">Join Quiz</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-orange-600" />
                Global Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                Connect with students worldwide
              </p>
              <div className="flex gap-1">
                <Link href="/chat" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs">Chat</Button>
                </Link>
                <Link href="/virtual-study-rooms" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs">Video</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Main Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Recent Notes and Homework Helper) */}
        <section className="lg:col-span-2 space-y-6">
          <RecentNotes />
          <HomeworkHelper />
          
          {/* Study Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coffee className="h-5 w-5 text-brown-600" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-xs text-gray-600">Notes Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">25</div>
                  <div className="text-xs text-gray-600">Cards Reviewed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">2h</div>
                  <div className="text-xs text-gray-600">Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Right Column */}
        <div className="space-y-6">
          <SearchTopics />
          <FlashcardPreview />
          <MiniGames />
        </div>
      </div>
    </MainLayout>
  );
}
