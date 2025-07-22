import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  StickyNote, 
  Album, 
  Camera, 
  Gamepad2,
  CalendarDays,
  Plus,
  MessageCircle,
  PenTool,
  Video,
  Users,
  Brain,
  Search,
  Briefcase,
  Target,
  Trophy,
  Lightbulb,
  BookOpen
} from "lucide-react";

const QuickAccessCard = ({ 
  href, 
  icon: Icon, 
  title, 
  bgColorClass, 
  iconColorClass,
  description 
}: {
  href: string;
  icon: any;
  title: string;
  bgColorClass: string;
  iconColorClass: string;
  description?: string;
}) => (
  <Link href={href}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4 text-center">
        <div className={`h-12 w-12 rounded-lg ${bgColorClass} flex items-center justify-center mx-auto mb-3`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </CardContent>
    </Card>
  </Link>
);

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
          <Link href="/notes">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Note
            </Button>
          </Link>
          <Link href="/chatbot">
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" /> AI Helper
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Featured Tools */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Enhanced Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickAccessCard 
            href="/chatbot" 
            icon={MessageCircle} 
            title="AI Chatbot" 
            bgColorClass="bg-blue-100"
            iconColorClass="text-blue-600"
            description="Get instant help"
          />
          <QuickAccessCard 
            href="/drawing-notes" 
            icon={PenTool} 
            title="Drawing Notes" 
            bgColorClass="bg-purple-100"
            iconColorClass="text-purple-600"
            description="Sketch & annotate"
          />
          <QuickAccessCard 
            href="/live-chat" 
            icon={Video} 
            title="Live Chat" 
            bgColorClass="bg-green-100"
            iconColorClass="text-green-600"
            description="Video calls & chat"
          />
          <QuickAccessCard 
            href="/group-quiz" 
            icon={Trophy} 
            title="Group Quiz" 
            bgColorClass="bg-yellow-100"
            iconColorClass="text-yellow-600"
            description="Interactive quizzes"
          />
          <QuickAccessCard 
            href="/virtual-study-rooms" 
            icon={Users} 
            title="Study Rooms" 
            bgColorClass="bg-indigo-100"
            iconColorClass="text-indigo-600"
            description="Focus together"
          />
          <QuickAccessCard 
            href="/career-guidance" 
            icon={Briefcase} 
            title="Career Guide" 
            bgColorClass="bg-pink-100"
            iconColorClass="text-pink-600"
            description="Plan your future"
          />
        </div>
      </section>

      {/* Core Tools */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Study Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard 
            href="/notes" 
            icon={StickyNote} 
            title="Smart Notes" 
            bgColorClass="bg-primary-100"
            iconColorClass="text-primary-600"
            description="Google Docs style"
          />
          <QuickAccessCard 
            href="/flashcards" 
            icon={Album} 
            title="Flashcards" 
            bgColorClass="bg-teal-100"
            iconColorClass="text-teal-600"
            description="Spaced repetition"
          />
          <QuickAccessCard 
            href="/homework-helper" 
            icon={Camera} 
            title="Homework Help" 
            bgColorClass="bg-amber-100"
            iconColorClass="text-amber-600"
            description="Photo to solution"
          />
          <QuickAccessCard 
            href="/topic-search" 
            icon={Search} 
            title="Topic Explorer" 
            bgColorClass="bg-orange-100"
            iconColorClass="text-orange-600"
            description="Learn & quiz"
          />
        </div>
      </section>

      {/* Advanced Features */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🧠 Advanced Learning</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard 
            href="/adaptive-learning" 
            icon={Brain} 
            title="Adaptive Learning" 
            bgColorClass="bg-violet-100"
            iconColorClass="text-violet-600"
            description="AI-powered paths"
          />
          <QuickAccessCard 
            href="/research-assistant" 
            icon={Search} 
            title="Research Assistant" 
            bgColorClass="bg-cyan-100"
            iconColorClass="text-cyan-600"
            description="Academic research"
          />
          <QuickAccessCard 
            href="/collaborative-workspace" 
            icon={Users} 
            title="Collaboration" 
            bgColorClass="bg-rose-100"
            iconColorClass="text-rose-600"
            description="Work together"
          />
          <QuickAccessCard 
            href="/study-planner" 
            icon={Target} 
            title="Study Planner" 
            bgColorClass="bg-emerald-100"
            iconColorClass="text-emerald-600"
            description="Smart scheduling"
          />
        </div>
      </section>

      {/* Fun & Games */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🎮 Fun & Engagement</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <QuickAccessCard 
            href="/mini-games" 
            icon={Gamepad2} 
            title="Educational Games" 
            bgColorClass="bg-lime-100"
            iconColorClass="text-lime-600"
            description="Learn while playing"
          />
          <Link href="/group-quiz">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Interactive Learning</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Join live quizzes, compete with friends, and make learning social!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Active Tools</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Live</p>
              <p className="text-sm text-gray-600">Collaboration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">AI</p>
              <p className="text-sm text-gray-600">Powered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Fun</p>
              <p className="text-sm text-gray-600">& Engaging</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
