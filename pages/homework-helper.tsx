import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Image as ImageIcon, FileText, Check, Loader2 } from "lucide-react";
import { uploadHomework } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function HomeworkHelper() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: homeworks, isLoading } = useQuery({
    queryKey: ['/api/homeworks'],
  });
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !title) {
        throw new Error("Please provide a title and upload an image");
      }
      
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      
      return uploadHomework(formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/homeworks'] });
      setFile(null);
      setTitle("");
      setPreviewUrl(null);
      toast({
        title: "Homework uploaded",
        description: "Your homework has been analyzed successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while processing your homework.",
        variant: "destructive"
      });
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Homework Helper</h1>
          <p className="mt-1 text-sm text-gray-600">Get step-by-step solutions to your homework problems</p>
        </div>
      </div>
      
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Homework</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Assignment</CardTitle>
                <CardDescription>
                  Take a photo of your homework problem and get a detailed solution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Assignment Title
                    </label>
                    <Input 
                      id="title"
                      placeholder="e.g., Math Problem Set 3, Question 2"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-1">
                      Problem Image
                    </label>
                    
                    {previewUrl ? (
                      <div className="relative rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={previewUrl} 
                          alt="Homework preview" 
                          className="w-full h-auto max-h-72 object-contain bg-gray-50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-12 text-center">
                        <Camera className="h-10 w-10 text-gray-400 mb-4" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            Drag and drop your image, or
                          </p>
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-800"
                          >
                            browse your files
                            <input
                              id="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!file || !title || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload and Analyze
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Take a photo of your homework</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Capture a clear image of the problem you need help with
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Upload it to our system</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Add a title and upload your image for analysis
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Get a step-by-step solution</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Our AI will analyze your problem and provide a detailed explanation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Learn and understand</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Use the solution to understand how to solve similar problems in the future
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-32 bg-gray-200"></div>
                </Card>
              ))}
            </div>
          ) : homeworks && homeworks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {homeworks.map((homework: any) => (
                <Card key={homework.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 lg:w-1/4 p-4 flex items-center justify-center border-r border-gray-200">
                      {homework.imageUrl ? (
                        <div className="relative h-40 w-full">
                          <img 
                            src={homework.imageUrl} 
                            alt={homework.title}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-40 w-full flex items-center justify-center rounded-md">
                          <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 lg:w-3/4 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{homework.title}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(homework.createdAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Problem:</h4>
                          <p className="text-sm text-gray-700 mt-1">{homework.problem}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Solution:</h4>
                          <div className="bg-gray-50 p-3 rounded-md text-sm mt-1">
                            {homework.solution ? (
                              <div className="whitespace-pre-line text-gray-700">{homework.solution}</div>
                            ) : (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 text-primary-600 animate-spin mr-2" />
                                <span>Generating solution...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No homework submissions yet</h3>
                <p className="text-gray-500 max-w-md mt-2 mb-6">
                  Upload your first homework problem to get help with a step-by-step solution.
                </p>
                <Button onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new Event('click'))}>
                  Upload Homework
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
