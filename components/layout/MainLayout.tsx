import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  MessageCircle, 
  Users, 
  Brain, 
  PenTool,
  Video,
  Trophy,
  Briefcase,
  Search,
  Target,
  Menu,
  X,
  LogOut
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BookOpen },
  { name: "Notes", href: "/notes", icon: PenTool },
  { name: "Drawing Notes", href: "/drawing-notes", icon: PenTool },
  { name: "Flashcards", href: "/flashcards", icon: BookOpen },
  { name: "AI Chatbot", href: "/chatbot", icon: MessageCircle },
  { name: "Live Chat", href: "/live-chat", icon: Video },
  { name: "Group Quiz", href: "/group-quiz", icon: Trophy },
  { name: "Study Rooms", href: "/virtual-study-rooms", icon: Users },
  { name: "Collaboration", href: "/collaborative-workspace", icon: Users },
  { name: "Homework Help", href: "/homework-helper", icon: Brain },
  { name: "Topic Search", href: "/topic-search", icon: Search },
  { name: "Study Planner", href: "/study-planner", icon: Target },
  { name: "Career Guidance", href: "/career-guidance", icon: Briefcase },
  { name: "Research Assistant", href: "/research-assistant", icon: Search },
  { name: "Adaptive Learning", href: "/adaptive-learning", icon: Brain },
  { name: "Mini Games", href: "/mini-games", icon: Trophy },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StudyBuddy</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        location === item.href
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">
                  {user?.displayName || user?.username || 'User'}
                </p>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="p-0 h-auto">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StudyBuddy</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        location === item.href
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div>
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || user?.username || 'User'}
                </p>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="p-0 h-auto">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
