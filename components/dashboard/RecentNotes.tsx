import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Mock data for now
const recentNotes = [
  {
    id: "1",
    title: "Physics - Newton's Laws",
    preview: "Notes on the three fundamental laws of motion...",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: "text"
  },
  {
    id: "2", 
    title: "Math - Calculus Derivatives",
    preview: "Power rule, product rule, chain rule...",
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    type: "text"
  },
  {
    id: "3",
    title: "Biology Diagram",
    preview: "Cell structure drawing with labels",
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    type: "drawing"
  }
];

export function RecentNotes() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Notes</CardTitle>
        <Link href="/notes">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-md">
                  <StickyNote className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {note.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {note.preview}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          <Link href="/notes/new">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-dashed border-gray-200">
              <div className="p-2 bg-gray-100 rounded-md">
                <Plus className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">Create new note</span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}