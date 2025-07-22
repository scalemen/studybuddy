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
import Chatbot from "@/pages/chatbot";
import DigitalWhiteboard from "@/pages/digital-whiteboard";
import StudyGroups from "@/pages/study-groups";
import VideoCall from "@/pages/video-call";
import QuizArena from "@/pages/quiz-arena";
import StudyTimer from "@/pages/study-timer";
import ProgressTracker from "@/pages/progress-tracker";
import StudyResources from "@/pages/study-resources";
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
      <Route path="/notes" component={() => <ProtectedRoute component={Notes} />} />
      <Route path="/notes/:id" component={() => <ProtectedRoute component={NoteDetail} />} />
      <Route path="/flashcards" component={() => <ProtectedRoute component={Flashcards} />} />
      <Route path="/flashcards/:id" component={() => <ProtectedRoute component={FlashcardDetail} />} />
      <Route path="/homework-helper" component={() => <ProtectedRoute component={HomeworkHelper} />} />
      <Route path="/topic-search" component={() => <ProtectedRoute component={TopicSearch} />} />
      <Route path="/mini-games" component={() => <ProtectedRoute component={MiniGames} />} />
      <Route path="/mini-games/:gameId" component={() => <ProtectedRoute component={MiniGames} />} />
      <Route path="/study-planner" component={() => <ProtectedRoute component={StudyPlannerPage} />} />
      <Route path="/chatbot" component={() => <ProtectedRoute component={Chatbot} />} />
      <Route path="/whiteboard" component={() => <ProtectedRoute component={DigitalWhiteboard} />} />
      <Route path="/study-groups" component={() => <ProtectedRoute component={StudyGroups} />} />
      <Route path="/video-call" component={() => <ProtectedRoute component={VideoCall} />} />
      <Route path="/quiz-arena" component={() => <ProtectedRoute component={QuizArena} />} />
      <Route path="/study-timer" component={() => <ProtectedRoute component={StudyTimer} />} />
      <Route path="/progress" component={() => <ProtectedRoute component={ProgressTracker} />} />
      <Route path="/resources" component={() => <ProtectedRoute component={StudyResources} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
