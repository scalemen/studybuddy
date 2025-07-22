import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createFlashcard } from "@/lib/api";

export default function FlashcardDetail() {
  const [match, params] = useRoute("/flashcards/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const deckId = params?.id ? parseInt(params.id) : null;
  
  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ['/api/flashcard-decks', deckId],
    enabled: !!deckId,
  });
  
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/flashcard-decks', deckId, 'cards'],
    enabled: !!deckId,
  });
  
  const isLoading = deckLoading || cardsLoading;
  const hasCards = !!cards && cards.length > 0;
  
  const createCardMutation = useMutation({
    mutationFn: () => createFlashcard(deckId!, { front, back }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcard-decks', deckId, 'cards'] });
      setIsCreateDialogOpen(false);
      setFront("");
      setBack("");
      toast({
        title: "Flashcard created",
        description: "Your flashcard has been added to the deck."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create flashcard",
        description: error.message || "An error occurred while creating your flashcard.",
        variant: "destructive"
      });
    }
  });
  
  const handleCreateCard = () => {
    if (!front.trim() || !back.trim()) {
      toast({
        title: "Both sides required",
        description: "Please provide content for both sides of the flashcard.",
        variant: "destructive"
      });
      return;
    }
    createCardMutation.mutate();
  };
  
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev === 0 ? (cards.length - 1) : prev - 1));
  };
  
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </MainLayout>
    );
  }
  
  if (!deck) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Flashcard deck not found</h3>
          <p className="text-gray-500 max-w-md mb-6">
            The flashcard deck you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <a href="/flashcards">Go back to flashcards</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <a href="/flashcards">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Flashcards
          </a>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{deck.title}</h1>
          {deck.description && (
            <p className="mt-1 text-gray-600">{deck.description}</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Flashcard
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="study" className="space-y-6">
        <TabsList>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="all">All Cards ({cards?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="study">
          {!hasCards ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards in this deck</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Add your first flashcard to start studying.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Flashcard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Study Mode</CardTitle>
                  <CardDescription className="text-center">
                    Click on the card to flip it and see the answer
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pb-2">
                  <div 
                    className="relative h-64 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer perspective-1000"
                    onClick={handleFlipCard}
                  >
                    <div 
                      className={`absolute inset-0 p-6 flex items-center justify-center backface-hidden transition-all duration-300 ${isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'}`}
                    >
                      <p className="text-center font-medium text-lg">{cards[currentCardIndex].front}</p>
                    </div>
                    <div 
                      className={`absolute inset-0 p-6 flex items-center justify-center backface-hidden transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'}`}
                    >
                      <p className="text-center text-gray-700">{cards[currentCardIndex].back}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-4">
                  <Button 
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={cards.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm text-gray-500">
                    {currentCardIndex + 1} of {cards.length}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleNext}
                    disabled={cards.length <= 1}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Keyboard shortcuts:</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">Space</span> Flip card
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">←</span> Previous card
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">→</span> Next card
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {!hasCards ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards in this deck</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Add your first flashcard to start studying.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Flashcard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card: any, index: number) => (
                <Card key={card.id} className="overflow-hidden">
                  <div className="bg-primary-50 px-4 py-2 border-b border-primary-100">
                    <span className="text-sm font-medium text-primary-700">Card {index + 1}</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-gray-200">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Front</h4>
                      <p className="text-gray-900">{card.front}</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Back</h4>
                      <p className="text-gray-900">{card.back}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add card button */}
              <Card 
                className="border-dashed border-2 flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Add New Flashcard</p>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create flashcard dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a new flashcard</DialogTitle>
            <DialogDescription>
              Create a flashcard with content for both the front and back sides.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front Side (Question)
              </label>
              <Textarea
                id="front"
                placeholder="Add the question or term here..."
                rows={4}
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back Side (Answer)
              </label>
              <Textarea
                id="back"
                placeholder="Add the answer or definition here..."
                rows={4}
                value={back}
                onChange={(e) => setBack(e.target.value)}
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
              onClick={handleCreateCard}
              disabled={createCardMutation.isPending}
            >
              {createCardMutation.isPending ? "Adding..." : "Add Flashcard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
