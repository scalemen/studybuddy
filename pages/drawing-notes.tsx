import { useState, useRef, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  PenTool, 
  Eraser, 
  Save, 
  Download, 
  Undo, 
  Redo,
  Palette,
  Settings,
  Layers,
  Type,
  Image,
  Share2,
  FolderPlus,
  Folder,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Triangle,
  Minus
} from "lucide-react";

const COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB",
  "#A52A2A", "#808080", "#FFFFFF"
];

const BRUSH_SIZES = [1, 2, 4, 6, 8, 12, 16, 20, 24, 32];

const BRUSH_TYPES = [
  { id: 'pen', name: 'Pen', icon: PenTool },
  { id: 'brush', name: 'Brush', icon: PenTool },
  { id: 'marker', name: 'Marker', icon: PenTool },
  { id: 'pencil', name: 'Pencil', icon: PenTool },
];

const SHAPE_TOOLS = [
  { id: 'line', name: 'Line', icon: Minus },
  { id: 'rectangle', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
];

interface DrawingLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
}

interface DrawingNote {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  folderId?: string;
  thumbnail?: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

const mockFolders: Folder[] = [
  { id: '1', name: 'Math Notes', color: 'bg-blue-500', noteCount: 12 },
  { id: '2', name: 'Science Diagrams', color: 'bg-green-500', noteCount: 8 },
  { id: '3', name: 'Art Sketches', color: 'bg-purple-500', noteCount: 15 },
];

const mockNotes: DrawingNote[] = [
  { id: '1', title: 'Calculus Derivatives', createdAt: new Date(), updatedAt: new Date(), folderId: '1' },
  { id: '2', title: 'Cell Structure', createdAt: new Date(), updatedAt: new Date(), folderId: '2' },
  { id: '3', title: 'Portrait Study', createdAt: new Date(), updatedAt: new Date(), folderId: '3' },
];

export default function DrawingNotes() {
  const [currentTool, setCurrentTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [brushType, setBrushType] = useState('pen');
  const [noteTitle, setNoteTitle] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSettings, setShowBrushSettings] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [layers, setLayers] = useState<DrawingLayer[]>([
    { id: '1', name: 'Background', visible: true, opacity: 1, locked: false },
    { id: '2', name: 'Sketch', visible: true, opacity: 1, locked: false },
    { id: '3', name: 'Details', visible: true, opacity: 1, locked: false },
  ]);
  const [activeLayer, setActiveLayer] = useState('2');
  const [pressure, setPressure] = useState(1);
  const [isErasing, setIsErasing] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle pressure sensitivity for Apple Pen
    const pointerEvent = e.nativeEvent as any;
    const currentPressure = pointerEvent.pressure || 1;
    setPressure(currentPressure);

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
    }

    // Adjust stroke width based on pressure and brush type
    let adjustedWidth = strokeWidth;
    if (brushType === 'brush' || brushType === 'pencil') {
      adjustedWidth = strokeWidth * currentPressure;
    }
    
    ctx.lineWidth = adjustedWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [strokeColor, strokeWidth, brushType, isErasing]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle pressure sensitivity
    const pointerEvent = e.nativeEvent as any;
    const currentPressure = pointerEvent.pressure || 1;
    
    let adjustedWidth = strokeWidth;
    if (brushType === 'brush' || brushType === 'pencil') {
      adjustedWidth = strokeWidth * currentPressure;
    }
    
    ctx.lineWidth = adjustedWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, strokeWidth, brushType]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${noteTitle || 'drawing'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    toast({
      title: "Drawing saved!",
      description: "Your drawing has been saved successfully.",
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    toast({
      title: "Canvas cleared",
      description: "The drawing canvas has been cleared.",
    });
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const createFolder = () => {
    toast({
      title: "Folder created",
      description: "New folder has been created successfully.",
    });
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-4">
        {/* Left Sidebar - Tools and Folders */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Drawing Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Drawing Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Drawing title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              
              {/* Brush Types */}
              <div>
                <p className="text-sm font-medium mb-2">Brush Type:</p>
                <div className="grid grid-cols-2 gap-2">
                  {BRUSH_TYPES.map((brush) => (
                    <Button
                      key={brush.id}
                      size="sm"
                      variant={brushType === brush.id ? "default" : "outline"}
                      onClick={() => setBrushType(brush.id)}
                      className="h-8"
                    >
                      <brush.icon className="h-3 w-3 mr-1" />
                      {brush.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tool Selection */}
              <div>
                <p className="text-sm font-medium mb-2">Tools:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!isErasing ? "default" : "outline"}
                    onClick={() => setIsErasing(false)}
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isErasing ? "default" : "outline"}
                    onClick={() => setIsErasing(true)}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowShapes(!showShapes)}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Shape Tools */}
              {showShapes && (
                <div>
                  <p className="text-sm font-medium mb-2">Shapes:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPE_TOOLS.map((shape) => (
                      <Button
                        key={shape.id}
                        size="sm"
                        variant="outline"
                        className="h-8"
                      >
                        <shape.icon className="h-3 w-3 mr-1" />
                        {shape.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Colors */}
              <div>
                <p className="text-sm font-medium mb-2">Colors:</p>
                <div className="grid grid-cols-6 gap-2">
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Custom Color
                </Button>
              </div>
              
              {/* Brush Size */}
              <div>
                <p className="text-sm font-medium mb-2">Brush Size: {strokeWidth}px</p>
                <div className="grid grid-cols-5 gap-1">
                  {BRUSH_SIZES.map((size) => (
                    <Button
                      key={size}
                      size="sm"
                      variant={strokeWidth === size ? "default" : "outline"}
                      onClick={() => setStrokeWidth(size)}
                      className="h-8 text-xs"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Pressure Sensitivity Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Apple Pen Detected</span>
                </div>
                <p className="text-xs text-gray-600">Pressure: {(pressure * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Tilt and pressure sensitivity enabled</p>
              </div>
            </CardContent>
          </Card>

          {/* Folders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Folders
                </span>
                <Button size="sm" variant="ghost" onClick={createFolder}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {mockFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`flex items-center gap-3 p-3 mx-3 rounded cursor-pointer ${
                      selectedFolder === folder.id ? 'bg-primary-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded ${folder.color} flex items-center justify-center`}>
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{folder.name}</p>
                      <p className="text-xs text-gray-600">{folder.noteCount} notes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Drawing Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Redo className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-gray-300 mx-2"></div>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">{zoom}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(400, zoom + 25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Move className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowLayersPanel(!showLayersPanel)}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleClear}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <Card className="flex-1">
            <CardContent className="p-4 h-full">
              <div className="relative h-full bg-gray-50 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-crosshair"
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Layers and Recent Notes */}
        {showLayersPanel && (
          <div className="w-64 flex-shrink-0 space-y-4">
            {/* Layers Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`flex items-center gap-2 p-3 mx-3 rounded cursor-pointer ${
                        activeLayer === layer.id ? 'bg-primary-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveLayer(layer.id)}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayer(layer.id);
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="text-sm flex-1">{layer.name}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {mockNotes.map((note) => (
                    <div key={note.id} className="flex items-center gap-3 p-2 mx-3 rounded hover:bg-gray-50 cursor-pointer">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <PenTool className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-gray-500">
                          {note.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
