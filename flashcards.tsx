import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Album, Plus, Layers, Sparkles, Loader2 } from "lucide-react";
import { createFlashcardDeck, generateFlashcards } from "@/lib/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Flashcards() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCardCount, setAiCardCount] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: decks, isLoading } = useQuery({
    queryKey: ['/api/flashcard-decks'],
  });
  
  const createDeckMutation = useMutation({
    mutationFn: () => createFlashcardDeck({ 
      title: newDeckTitle,
      description: newDeckDescription 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
      setIsCreateDialogOpen(false);
      setNewDeckTitle("");
      setNewDeckDescription("");
      toast({
        title: "Deck created",
        description: "Your flashcard deck has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create deck",
        description: error.message || "An error occurred while creating your flashcard deck.",
        variant: "destructive"
      });
    }
  });
  
  const generateFlashcardsMutation = useMutation({
    mutationFn: () => generateFlashcards(aiTopic, aiCardCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks'] });
      setIsGenerateDialogOpen(false);
      setAiTopic("");
      toast({
        title: "Flashcards generated",
        description: `Successfully created flashcards for "${aiTopic}"`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "An error occurred while generating flashcards.",
        variant: "destructive"
      });
    }
  });
  
  const handleCreateDeck = () => {
    if (!newDeckTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your flashcard deck.",
        variant: "destructive"
      });
      return;
    }
    createDeckMutation.mutate();
  };
  
  const handleGenerateFlashcards = () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your flashcards.",
        variant: "destructive"
      });
      return;
    }
    generateFlashcardsMutation.mutate();
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Flashcards</h1>
          <p className="mt-1 text-sm text-gray-600">Create and study with flashcards</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button onClick={() => setIsGenerateDialogOpen(true)} variant="outline" className="bg-purple-50">
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" /> AI Generate
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Deck
          </Button>
        </div>
      </div>
      
      {/* Flashcard decks grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mt-2"></div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : decks && decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck: any) => (
            <Link key={deck.id} href={`/flashcards/${deck.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-teal-100 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-teal-600" />
                    </div>
                    <CardTitle className="text-lg">{deck.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {deck.description || "No description provided"}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 text-xs text-gray-500">
                  Created on {new Date(deck.createdAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            </Link>
          ))}
          
          {/* Add deck card */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 flex flex-col items-center justify-center py-6 h-full"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Plus className="h-7 w-7 text-gray-500" />
            </div>
            <p className="font-medium text-gray-900">Create New Deck</p>
            <p className="text-sm text-gray-500 mt-1">Add flashcards to study</p>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Album className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcard decks yet</h3>
          <p className="text-gray-500 max-w-md mb-6">
            Create your first flashcard deck to start studying effectively.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Deck
          </Button>
        </div>
      )}
      
      {/* Create deck dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new flashcard deck</DialogTitle>
            <DialogDescription>
              Add a title and description for your flashcard deck.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Deck title"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                placeholder="What is this deck about?"
                rows={4}
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDeck}
              disabled={createDeckMutation.isPending}
            >
              {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Generate dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Flashcards with AI</DialogTitle>
            <DialogDescription>
              Enter a topic, and we'll use AI to create flashcards for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="ai-topic" className="text-sm font-medium">
                Topic
              </label>
              <div className="relative">
                <Input
                  id="ai-topic"
                  placeholder="e.g., Photosynthesis, American History, Python Programming"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="pr-10"
                />
                <Sparkles className="absolute right-3 top-2.5 h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="card-count" className="text-sm font-medium">
                Number of flashcards
              </label>
              <div className="flex items-center">
                <Input
                  id="card-count"
                  type="number"
                  min="1"
                  max="20"
                  value={aiCardCount}
                  onChange={(e) => setAiCardCount(parseInt(e.target.value) || 5)}
                  className="w-20"
                />
                <div className="ml-3 text-sm text-gray-500">
                  (1-20 cards)
                </div>
              </div>
            </div>
            <div className="mt-4 bg-purple-50 p-3 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    Our AI will create flashcards with questions on the front and answers on the back,
                    tailored to your selected topic. The generated flashcards will be saved as a new deck.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateFlashcards}
              disabled={generateFlashcardsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateFlashcardsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
