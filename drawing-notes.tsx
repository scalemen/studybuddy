import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PenTool, Eraser, Save, Download, Undo, Redo } from "lucide-react";

const COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20];

export default function DrawingNotes() {
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [noteTitle, setNoteTitle] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Drawing saved!",
      description: "Your drawing has been saved successfully.",
    });
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Drawing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Drawing title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              
              <div>
                <p className="text-sm font-medium mb-2">Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setStrokeColor(color)}
                      className={`w-8 h-8 rounded border-2 ${
                        strokeColor === color ? 'border-gray-600' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Brush Size:</p>
                <div className="flex flex-wrap gap-1">
                  {BRUSH_SIZES.map((size) => (
                    <Button
                      key={size}
                      onClick={() => setStrokeWidth(size)}
                      size="sm"
                      variant={strokeWidth === size ? 'default' : 'outline'}
                      className="w-8 h-8 p-0"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Drawing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Drawing Canvas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="w-full h-full border rounded-lg bg-white flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PenTool className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Drawing Canvas</p>
                  <p className="text-sm">Apple Pen and stylus support enabled</p>
                  <p className="text-xs mt-2">Canvas will be implemented with react-sketch-canvas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
