import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, History, Book, Loader2, BookOpen, BookType, 
  ListChecks, CheckCircle, XCircle, AlertCircle, ExternalLink 
} from "lucide-react";
import { searchTopic, generateTopicQuiz } from "@/lib/api";
import { formatDate, truncateText } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function TopicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: searches, isLoading } = useQuery({
    queryKey: ['/api/topic-searches'],
  });
  
  const searchMutation = useMutation({
    mutationFn: async () => {
      if (!searchQuery.trim()) {
        throw new Error("Please enter a search topic");
      }
      return searchTopic(searchQuery.trim());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/topic-searches'] });
      setCurrentTopic(searchQuery.trim());
      setSearchQuery("");
      toast({
        title: "Search complete",
        description: "Your topic summary has been generated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "An error occurred while searching for the topic.",
        variant: "destructive"
      });
    }
  });
  
  const quizMutation = useMutation({
    mutationFn: async (topic: string) => {
      if (!topic.trim()) {
        throw new Error("Please enter a topic for the quiz");
      }
      return generateTopicQuiz(topic.trim());
    },
    onSuccess: (data) => {
      if (data && data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
      } else {
        setQuizQuestions([]);
      }
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setQuizScore(0);
      setQuizCompleted(false);
      setIsQuizDialogOpen(true);
      
      toast({
        title: "Quiz generated",
        description: "Test your knowledge with this quiz!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quiz generation failed",
        description: error.message || "An error occurred while generating the quiz.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMutation.mutate();
  };
  
  const handleGenerateQuiz = (topic: string) => {
    setCurrentTopic(topic);
    quizMutation.mutate(topic);
  };
  
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    if (answer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(quizScore + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };
  
  const popularTopics = [
    "Photosynthesis",
    "Algebra",
    "World War II",
    "Mitosis",
    "Grammar Rules",
    "Periodic Table",
    "Quantum Physics",
    "French Revolution"
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Topic Search</h1>
          <p className="mt-1 text-sm text-gray-600">Search any topic and get a summarized explanation</p>
        </div>
      </div>
      
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="history">Search History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Search Any Topic</CardTitle>
                  <CardDescription>
                    Get summarized explanations about any educational topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          className="pl-10"
                          placeholder="Enter any educational topic..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={!searchQuery.trim() || searchMutation.isPending}
                      >
                        {searchMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : "Search"}
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularTopics.map((topic) => (
                          <Button
                            key={topic}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery(topic);
                            }}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </form>
                  
                  {searches && Array.isArray(searches) && searches.length > 0 && searches[0]?.summary && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">{searches[0].topic}</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-700 whitespace-pre-line">{searches[0].summary}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleGenerateQuiz(searches[0].topic)}
                            disabled={quizMutation.isPending}
                            className="mt-2"
                          >
                            {quizMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Quiz...
                              </>
                            ) : (
                              <>
                                <BookType className="mr-2 h-4 w-4" />
                                Generate Quiz
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Study Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">1</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Search specific topics</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Be specific in your search to get more focused summaries
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">2</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Save your searches</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          All your searches are saved automatically for easy reference
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">3</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Create notes from summaries</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Use these summaries as starting points for your study notes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">4</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Combine with flashcards</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Create flashcards from important points in the summary
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded"></div>
                      <div className="h-4 bg-gray-100 rounded"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searches && searches.length > 0 ? (
            <div className="space-y-4">
              {searches.map((search: any) => (
                <Card key={search.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>{search.topic}</CardTitle>
                      <span className="text-xs text-gray-500">
                        {formatDate(search.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {search.summary ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-700 whitespace-pre-line">{search.summary}</p>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateQuiz(search.topic)}
                            disabled={quizMutation.isPending}
                          >
                            {quizMutation.isPending && currentTopic === search.topic ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Quiz...
                              </>
                            ) : (
                              <>
                                <BookType className="mr-2 h-4 w-4" />
                                Generate Quiz
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 text-primary-600 animate-spin mr-2" />
                        <span>Generating summary...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No searches yet</h3>
                <p className="text-gray-500 max-w-md mt-2 mb-6">
                  Search for any educational topic to get a summarized explanation.
                </p>
                <Button onClick={() => document.querySelector('[value="search"]')?.dispatchEvent(new Event('click'))}>
                  Search Topics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quiz on {currentTopic}</DialogTitle>
            <DialogDescription>
              Test your knowledge on this topic with these quiz questions.
            </DialogDescription>
          </DialogHeader>

          {quizQuestions.length > 0 && !quizCompleted ? (
            <div className="py-4">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </span>
                <span className="text-sm font-medium">
                  Score: {quizScore}/{quizQuestions.length}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">{quizQuestions[currentQuestionIndex].question}</h3>
                
                <RadioGroup 
                  value={selectedAnswer || ""}
                  onValueChange={handleAnswerSelect}
                  disabled={showAnswer}
                  className="space-y-2"
                >
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <div key={index} className={`flex items-center space-x-2 p-2 rounded-md border ${
                      showAnswer 
                        ? option === quizQuestions[currentQuestionIndex].correctAnswer
                          ? "border-green-500 bg-green-50"
                          : selectedAnswer === option
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200" 
                        : "border-gray-200"
                    }`}>
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-grow">
                        {option}
                      </Label>
                      {showAnswer && (
                        option === quizQuestions[currentQuestionIndex].correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : selectedAnswer === option ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {showAnswer && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="text-sm font-medium mb-1">Explanation:</h4>
                    <p className="text-sm text-gray-700">{quizQuestions[currentQuestionIndex].explanation}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                {showAnswer ? (
                  <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                ) : (
                  <Button variant="outline" disabled={!selectedAnswer} onClick={() => selectedAnswer && handleAnswerSelect(selectedAnswer)}>
                    Check Answer
                  </Button>
                )}
              </div>
            </div>
          ) : quizCompleted ? (
            <div className="py-4">
              <div className="flex flex-col items-center justify-center text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                  <ListChecks className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium">Quiz Completed!</h3>
                <p className="text-gray-600 mt-1">
                  You scored {quizScore} out of {quizQuestions.length} questions correctly.
                </p>
                <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full mt-4">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${(quizScore / quizQuestions.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm mt-2">
                  {quizScore === quizQuestions.length 
                    ? "Perfect score! Excellent work!" 
                    : quizScore >= quizQuestions.length * 0.7 
                      ? "Great job! You know this topic well."
                      : quizScore >= quizQuestions.length * 0.5
                        ? "Good effort! Keep studying to improve."
                        : "Keep studying this topic to improve your understanding."}
                </p>
              </div>
              <div className="flex justify-center mt-4">
                <Button onClick={handleRestartQuiz} className="mr-2">
                  Restart Quiz
                </Button>
                <Button variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p>Loading quiz questions...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
