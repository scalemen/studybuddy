import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Star } from "lucide-react";

const featuredGames = [
  { id: "word-puzzle", name: "Word Puzzle", difficulty: "Easy", points: 50 },
  { id: "math-quiz", name: "Math Quiz", difficulty: "Medium", points: 100 },
  { id: "memory-game", name: "Memory Game", difficulty: "Hard", points: 150 }
];

export function MiniGames() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-green-600" />
          Mini Games
        </CardTitle>
        <Link href="/mini-games">
          <Button variant="ghost" size="sm">
            Play All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {featuredGames.map((game) => (
            <Link key={game.id} href={`/mini-games/${game.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{game.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      game.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {game.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="h-3 w-3" />
                      {game.points} pts
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Play
                </Button>
              </div>
            </Link>
          ))}
          
          <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Trophy className="h-4 w-4" />
              <span>Total Points: 1,250</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}