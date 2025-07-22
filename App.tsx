import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Notes from "@/pages/notes";
import NoteDetail from "@/pages/note-detail";
import Flashcards from "@/pages/flashcards";
import FlashcardDetail from "@/pages/flashcard-detail";
import HomeworkHelper from "@/pages/homework-helper";
import TopicSearch from "@/pages/topic-search";
import MiniGames from "@/pages/mini-games";
import StudyPlannerPage from "@/pages/study-planner";
import LiveChat from "@/pages/live-chat";
import DrawingNotes from "@/pages/drawing-notes";
import Chatbot from "@/pages/chatbot";
import CollaborativeWorkspace from "@/pages/collaborative-workspace";
import VirtualStudyRooms from "@/pages/virtual-study-rooms";
import GroupQuiz from "@/pages/group-quiz";
import ResearchAssistant from "@/pages/research-assistant";
import CareerGuidance from "@/pages/career-guidance";
import AdaptiveLearning from "@/pages/adaptive-learning";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Component />;
}

function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      {/* Note-taking features */}
      <Route path="/notes" component={() => <ProtectedRoute component={Notes} />} />
      <Route path="/notes/:id" component={() => <ProtectedRoute component={NoteDetail} />} />
      <Route path="/drawing-notes" component={() => <ProtectedRoute component={DrawingNotes} />} />
      
      {/* Study tools */}
      <Route path="/flashcards" component={() => <ProtectedRoute component={Flashcards} />} />
      <Route path="/flashcards/:id" component={() => <ProtectedRoute component={FlashcardDetail} />} />
      <Route path="/homework-helper" component={() => <ProtectedRoute component={HomeworkHelper} />} />
      <Route path="/topic-search" component={() => <ProtectedRoute component={TopicSearch} />} />
      <Route path="/study-planner" component={() => <ProtectedRoute component={StudyPlannerPage} />} />
      <Route path="/research-assistant" component={() => <ProtectedRoute component={ResearchAssistant} />} />
      <Route path="/adaptive-learning" component={() => <ProtectedRoute component={AdaptiveLearning} />} />
      <Route path="/career-guidance" component={() => <ProtectedRoute component={CareerGuidance} />} />
      
      {/* Social and collaboration features */}
      <Route path="/chat" component={() => <ProtectedRoute component={LiveChat} />} />
      <Route path="/chatbot" component={() => <ProtectedRoute component={Chatbot} />} />
      <Route path="/collaborative-workspace" component={() => <ProtectedRoute component={CollaborativeWorkspace} />} />
      <Route path="/virtual-study-rooms" component={() => <ProtectedRoute component={VirtualStudyRooms} />} />
      <Route path="/group-quiz" component={() => <ProtectedRoute component={GroupQuiz} />} />
      
      {/* Games and entertainment */}
      <Route path="/mini-games" component={() => <ProtectedRoute component={MiniGames} />} />
      <Route path="/mini-games/:gameId" component={() => <ProtectedRoute component={MiniGames} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
