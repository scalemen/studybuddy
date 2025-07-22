import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Youtube } from "lucide-react";

const popularTopics = [
  "Photosynthesis",
  "Quadratic Equations", 
  "World War II",
  "Programming Basics"
];

export function SearchTopics() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-600" />
          Topic Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search any topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Link href={`/topic-search?q=${encodeURIComponent(searchQuery)}`}>
              <Button size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Popular Topics:</p>
            <div className="flex flex-wrap gap-1">
              {popularTopics.map((topic) => (
                <Link key={topic} href={`/topic-search?q=${encodeURIComponent(topic)}`}>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    {topic}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <BookOpen className="h-3 w-3" />
            <span>AI explanations</span>
            <Youtube className="h-3 w-3 ml-2" />
            <span>Video suggestions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}