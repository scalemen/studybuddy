import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  PenTool, 
  Eraser, 
  Palette, 
  Download, 
  Save, 
  Undo, 
  Redo,
  Circle,
  Square,
  Triangle,
  Type,
  Folder
} from "lucide-react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

const COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB"
];

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20];

export default function DrawingNotes() {
  const [canvasRef, setCanvasRef] = useState<ReactSketchCanvasRef | null>(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [eraseMode, setEraseMode] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drawings, isLoading } = useQuery({
    queryKey: ['/api/drawings'],
  });

  const saveDrawingMutation = useMutation({
    mutationFn: async (drawingData: any) => {
      const response = await fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawingData),
      });
      if (!response.ok) throw new Error('Failed to save drawing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drawings'] });
      toast({
        title: "Drawing saved",
        description: "Your drawing has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save drawing",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!canvasRef || !noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your drawing",
        variant: "destructive",
      });
      return;
    }

    try {
      const paths = await canvasRef.exportPaths();
      const image = await canvasRef.exportImage("png");
      
      await saveDrawingMutation.mutateAsync({
        title: noteTitle,
        paths: paths,
        image: image,
        strokeColor,
        strokeWidth,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export drawing",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!canvasRef) return;
    
    try {
      const image = await canvasRef.exportImage("png");
      const link = document.createElement('a');
      link.download = `${noteTitle || 'drawing'}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download drawing",
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    canvasRef?.undo();
  };

  const handleRedo = () => {
    canvasRef?.redo();
  };

  const handleClear = () => {
    canvasRef?.clearCanvas();
  };

  const loadDrawing = async (drawing: any) => {
    if (!canvasRef) return;
    
    try {
      await canvasRef.loadPaths(drawing.paths);
      setNoteTitle(drawing.title);
      setStrokeColor(drawing.strokeColor || "#000000");
      setStrokeWidth(drawing.strokeWidth || 4);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load drawing",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {/* Drawings Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Folder className="h-5 w-5" />
                My Drawings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Drawing title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={!noteTitle.trim()}
                    size="sm"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Drawing
                  </Button>
                </div>
                
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Recent Drawings</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin h-4 w-4 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                      </div>
                    ) : drawings?.length > 0 ? (
                      drawings.map((drawing: any) => (
                        <div
                          key={drawing.id}
                          onClick={() => loadDrawing(drawing)}
                          className="p-2 rounded cursor-pointer hover:bg-gray-100 text-sm"
                        >
                          <div className="font-medium truncate">{drawing.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(drawing.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No drawings yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Drawing Area */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <PenTool className="h-6 w-6 text-primary-600" />
                  Drawing Canvas
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={handleUndo} size="sm" variant="outline">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleRedo} size="sm" variant="outline">
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleClear} size="sm" variant="outline">
                    Clear
                  </Button>
                  <Button onClick={handleDownload} size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Toolbar */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  {/* Tools */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setCurrentTool('pen');
                        setEraseMode(false);
                      }}
                      size="sm"
                      variant={currentTool === 'pen' ? 'default' : 'outline'}
                    >
                      <PenTool className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentTool('eraser');
                        setEraseMode(true);
                      }}
                      size="sm"
                      variant={currentTool === 'eraser' ? 'default' : 'outline'}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Brush Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Size:</span>
                    <div className="flex gap-1">
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

                  {/* Colors */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Color:</span>
                    <div className="flex gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setStrokeColor(color)}
                          className={`w-6 h-6 rounded border-2 ${
                            strokeColor === color ? 'border-gray-600' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4">
                <div className="w-full h-full border rounded-lg overflow-hidden bg-white">
                  <ReactSketchCanvas
                    ref={(ref) => setCanvasRef(ref)}
                    strokeWidth={strokeWidth}
                    strokeColor={eraseMode ? 'transparent' : strokeColor}
                    canvasColor="white"
                    style={{
                      border: 'none',
                      width: '100%',
                      height: '100%',
                    }}
                    withTimestamp={true}
                    allowOnlyPointerType="all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
