import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { HomeworkHelper } from "@/components/dashboard/HomeworkHelper";
import { SearchTopics } from "@/components/dashboard/SearchTopics";
import { FlashcardPreview } from "@/components/dashboard/FlashcardPreview";
import { MiniGames } from "@/components/dashboard/MiniGames";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  StickyNote, 
  Album, 
  Camera, 
  Gamepad2,
  CalendarDays,
  Plus
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
          <p className="mt-1 text-sm text-gray-600">Let's continue your learning journey.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/notes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Note
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-1" /> Study Planner
          </Button>
        </div>
      </div>
      
      {/* Quick Access Section */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard 
            href="/notes" 
            icon={StickyNote} 
            title="Notes" 
            bgColorClass="bg-primary-100"
            iconColorClass="text-primary-600"
          />
          <QuickAccessCard 
            href="/flashcards" 
            icon={Album} 
            title="Flashcards" 
            bgColorClass="bg-teal-100"
            iconColorClass="text-teal-600"
          />
          <QuickAccessCard 
            href="/homework-helper" 
            icon={Camera} 
            title="Homework Help" 
            bgColorClass="bg-amber-100"
            iconColorClass="text-amber-600"
          />
          <QuickAccessCard 
            href="/mini-games" 
            icon={Gamepad2} 
            title="Mini Games" 
            bgColorClass="bg-green-100"
            iconColorClass="text-green-600"
          />
        </div>
      </section>
      
      {/* Main Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Recent Notes and Homework Helper) */}
        <section className="lg:col-span-2 space-y-6">
          <RecentNotes />
          <HomeworkHelper />
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
