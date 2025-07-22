import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BrainCircuit, 
  Calculator, 
  Globe, 
  ArrowLeft,
  Trophy
} from "lucide-react";
import BrainTeaser from "@/components/games/BrainTeaser";
import MathChallenge from "@/components/games/MathChallenge";
import GeographyQuiz from "@/components/games/GeographyQuiz";

const games = [
  {
    id: "brain-teaser",
    title: "Brain Teaser",
    description: "Logic puzzles to sharpen your mind",
    icon: BrainCircuit,
    bgColorClass: "bg-green-100",
    iconColorClass: "text-green-600",
    component: BrainTeaser
  },
  {
    id: "math-challenge",
    title: "Math Challenge",
    description: "Test your calculation speed",
    icon: Calculator,
    bgColorClass: "bg-purple-100",
    iconColorClass: "text-purple-600",
    component: MathChallenge
  },
  {
    id: "geography-quiz",
    title: "Geography Quiz",
    description: "Explore the world's countries",
    icon: Globe,
    bgColorClass: "bg-blue-100",
    iconColorClass: "text-blue-600",
    component: GeographyQuiz
  }
];

export default function MiniGames() {
  const [match, params] = useRoute("/mini-games/:gameId");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showGames, setShowGames] = useState(true);
  
  useEffect(() => {
    if (match && params?.gameId) {
      const game = games.find(g => g.id === params.gameId);
      if (game) {
        setSelectedGame(game);
        setShowGames(false);
      } else {
        setSelectedGame(null);
        setShowGames(true);
      }
    } else {
      setSelectedGame(null);
      setShowGames(true);
    }
  }, [match, params]);
  
  // Render a specific game
  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <MainLayout>
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => setShowGames(true)} asChild>
            <Link href="/mini-games">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Games
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${selectedGame.bgColorClass} flex items-center justify-center`}>
              <selectedGame.icon className={`h-5 w-5 ${selectedGame.iconColorClass}`} />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900">{selectedGame.title}</h1>
          </div>
        </div>
        
        <GameComponent />
      </MainLayout>
    );
  }
  
  // Main games list view
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Educational Games</h1>
          <p className="mt-1 text-sm text-gray-600">Have fun while learning with these interactive games</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const GameIcon = game.icon;
          return (
            <Link key={game.id} href={`/mini-games/${game.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${game.bgColorClass} flex items-center justify-center`}>
                      <GameIcon className={`h-6 w-6 ${game.iconColorClass}`} />
                    </div>
                    <CardTitle>{game.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{game.description}</p>
                  <Button variant="outline" className="w-full">Play Now</Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Benefits of Educational Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Improves Memory</h3>
              <p className="text-sm text-gray-600">Games exercise your brain and help improve retention of information</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Enhances Problem-Solving</h3>
              <p className="text-sm text-gray-600">Interactive challenges develop critical thinking and logical reasoning</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Makes Learning Fun</h3>
              <p className="text-sm text-gray-600">Engage with educational content in an enjoyable, stress-free environment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
