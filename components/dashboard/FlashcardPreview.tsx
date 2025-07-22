import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Album, Play, Plus } from "lucide-react";

const recentDecks = [
  { id: "1", name: "Spanish Vocabulary", cardCount: 25, progress: 80 },
  { id: "2", name: "Chemistry Elements", cardCount: 118, progress: 45 },
  { id: "3", name: "History Dates", cardCount: 30, progress: 90 }
];

export function FlashcardPreview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Album className="h-5 w-5 text-teal-600" />
          Flashcards
        </CardTitle>
        <Link href="/flashcards">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentDecks.map((deck) => (
            <Link key={deck.id} href={`/flashcards/${deck.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{deck.name}</h4>
                  <p className="text-xs text-gray-600">{deck.cardCount} cards</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-teal-600 h-1.5 rounded-full"
                      style={{ width: `${deck.progress}%` }}
                    ></div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
          
          <Link href="/flashcards/new">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-dashed border-gray-200">
              <div className="p-2 bg-gray-100 rounded-md">
                <Plus className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">Create new deck</span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}