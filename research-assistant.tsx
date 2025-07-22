import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Bookmark, 
  Download,
  ExternalLink,
  Clock,
  User,
  Star,
  Lightbulb,
  Brain,
  Link,
  Copy,
  RefreshCw,
  Plus,
  Filter,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ResearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  results: ResearchResult[];
  citations: Citation[];
  summary: string;
  relatedQueries: string[];
}

interface ResearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishDate: Date;
  relevanceScore: number;
  type: 'article' | 'paper' | 'website' | 'book' | 'video';
  authors: string[];
  doi?: string;
  abstract?: string;
  keywords: string[];
}

interface Citation {
  id: string;
  type: 'apa' | 'mla' | 'chicago' | 'harvard';
  text: string;
  resultId: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  queries: ResearchQuery[];
  savedResults: ResearchResult[];
  notes: ProjectNote[];
  createdAt: Date;
  lastModified: Date;
  tags: string[];
  collaborators: string[];
}

interface ProjectNote {
  id: string;
  content: string;
  timestamp: Date;
  resultId?: string;
  tags: string[];
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  trend: number;
  volume: number;
  relatedTerms: string[];
}

export default function ResearchAssistant() {
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentResults, setCurrentResults] = useState<ResearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [activeTab, setActiveTab] = useState("search");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/research-projects'],
  });

  const { data: recentQueries, isLoading: queriesLoading } = useQuery({
    queryKey: ['/api/recent-research-queries'],
  });

  const { data: trendingTopics, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/trending-research-topics'],
  });

  const { data: savedResults, isLoading: savedLoading } = useQuery({
    queryKey: ['/api/saved-research-results', activeProject?.id],
    enabled: !!activeProject?.id,
  });

  const searchMutation = useMutation({
    mutationFn: async ({ query, projectId }: { query: string; projectId?: string }) => {
      const response = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, projectId }),
      });
      if (!response.ok) throw new Error('Failed to search');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentResults(data.results);
      queryClient.invalidateQueries({ queryKey: ['/api/recent-research-queries'] });
      toast({
        title: "Search completed!",
        description: `Found ${data.results.length} relevant results`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to perform search",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/research-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-projects'] });
      setActiveProject(data);
      setNewProjectTitle("");
      toast({
        title: "Project created!",
        description: "Your research project is ready",
      });
    },
  });

  const saveResultMutation = useMutation({
    mutationFn: async ({ resultId, projectId }: { resultId: string; projectId: string }) => {
      const response = await fetch('/api/research/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, projectId }),
      });
      if (!response.ok) throw new Error('Failed to save result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-research-results'] });
      toast({
        title: "Result saved!",
        description: "Added to your research project",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ note, projectId, resultId }: { note: string; projectId: string; resultId?: string }) => {
      const response = await fetch('/api/research/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note, projectId, resultId }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      return response.json();
    },
    onSuccess: () => {
      setNewNote("");
      queryClient.invalidateQueries({ queryKey: ['/api/research-projects'] });
      toast({
        title: "Note added!",
        description: "Your research note has been saved",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await searchMutation.mutateAsync({
        query: searchQuery,
        projectId: activeProject?.id,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      createProjectMutation.mutate({
        title: newProjectTitle,
        description: `Research project for ${newProjectTitle}`,
        tags: [],
      });
    }
  };

  const handleSaveResult = (result: ResearchResult) => {
    if (activeProject) {
      saveResultMutation.mutate({
        resultId: result.id,
        projectId: activeProject.id,
      });
    } else {
      toast({
        title: "No project selected",
        description: "Please select or create a project first",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && activeProject) {
      addNoteMutation.mutate({
        note: newNote,
        projectId: activeProject.id,
        resultId: selectedResult?.id,
      });
    }
  };

  const generateCitation = (result: ResearchResult, style: string) => {
    const authors = result.authors.join(', ');
    const year = new Date(result.publishDate).getFullYear();
    
    switch (style) {
      case 'apa':
        return `${authors} (${year}). ${result.title}. Retrieved from ${result.url}`;
      case 'mla':
        return `${authors}. "${result.title}." ${result.source}, ${year}, ${result.url}.`;
      case 'chicago':
        return `${authors}. "${result.title}." ${result.source}. Accessed ${new Date().toLocaleDateString()}. ${result.url}.`;
      case 'harvard':
        return `${authors} ${year}, '${result.title}', ${result.source}, viewed ${new Date().toLocaleDateString()}, <${result.url}>.`;
      default:
        return result.url;
    }
  };

  const copyCitation = (result: ResearchResult) => {
    const citation = generateCitation(result, citationStyle);
    navigator.clipboard.writeText(citation);
    toast({
      title: "Citation copied!",
      description: "Citation copied to clipboard",
    });
  };

  const filteredResults = currentResults.filter(result => {
    if (filterType !== 'all' && result.type !== filterType) return false;
    if (filterDate !== 'all') {
      const resultDate = new Date(result.publishDate);
      const now = new Date();
      const daysDiff = (now.getTime() - resultDate.getTime()) / (1000 * 3600 * 24);
      
      if (filterDate === 'week' && daysDiff > 7) return false;
      if (filterDate === 'month' && daysDiff > 30) return false;
      if (filterDate === 'year' && daysDiff > 365) return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'paper': return FileText;
      case 'website': return Link;
      case 'book': return FileText;
      case 'video': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'paper': return 'bg-purple-100 text-purple-800';
      case 'website': return 'bg-green-100 text-green-800';
      case 'book': return 'bg-orange-100 text-orange-800';
      case 'video': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Research Assistant</h1>
            <p className="text-gray-600">Intelligent research with AI-powered insights and citations</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const project = projects?.find((p: ResearchProject) => p.id === e.target.value);
                setActiveProject(project || null);
              }}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Project</option>
              {projects?.map((project: ResearchProject) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <Input
              placeholder="New project name..."
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="w-48"
            />
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectTitle.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Search Area */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter your research question or topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    size="lg"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {/* Quick Suggestions */}
                {recentQueries?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {recentQueries.slice(0, 5).map((query: any, index: number) => (
                        <Button
                          key={index}
                          onClick={() => setSearchQuery(query.query)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {query.query}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">Search Results</TabsTrigger>
                <TabsTrigger value="saved">Saved Results</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filters:</span>
                      </div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="article">Articles</option>
                        <option value="paper">Research Papers</option>
                        <option value="website">Websites</option>
                        <option value="book">Books</option>
                        <option value="video">Videos</option>
                      </select>
                      <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="year">Past Year</option>
                      </select>
                      <select
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value as any)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="apa">APA Style</option>
                        <option value="mla">MLA Style</option>
                        <option value="chicago">Chicago Style</option>
                        <option value="harvard">Harvard Style</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Results */}
                <div className="space-y-4">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result) => {
                      const TypeIcon = getTypeIcon(result.type);
                      return (
                        <Card key={result.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg leading-tight">
                                    {result.title}
                                  </h3>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge className={getTypeColor(result.type)}>
                                      <TypeIcon className="h-3 w-3 mr-1" />
                                      {result.type}
                                    </Badge>
                                    <Badge variant="outline">
                                      <Star className="h-3 w-3 mr-1" />
                                      {Math.round(result.relevanceScore * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                                
                                <p className="text-gray-600 mb-3">{result.snippet}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {result.authors.join(', ') || 'Unknown Author'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(result.publishDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Link className="h-3 w-3" />
                                    {result.source}
                                  </span>
                                </div>
                                
                                {result.keywords.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                      {result.keywords.slice(0, 5).map((keyword, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => window.open(result.url, '_blank')}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Open
                                  </Button>
                                  <Button
                                    onClick={() => handleSaveResult(result)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Bookmark className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={() => copyCitation(result)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Cite
                                  </Button>
                                  <Button
                                    onClick={() => setSelectedResult(result)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : currentResults.length === 0 && !isSearching ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          Start your research
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enter a research question or topic to find relevant academic sources
                        </p>
                      </CardContent>
                    </Card>
                  ) : isSearching ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Searching for relevant sources...</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-600 mb-2">No results found</h3>
                        <p className="text-sm text-gray-500">Try different keywords or adjust your filters</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                <div className="space-y-4">
                  {savedResults?.length > 0 ? (
                    savedResults.map((result: ResearchResult) => (
                      <Card key={result.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{result.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{result.snippet}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={getTypeColor(result.type)}>
                                  {result.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(result.publishDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => window.open(result.url, '_blank')}
                                size="sm"
                                variant="outline"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => copyCitation(result)}
                                size="sm"
                                variant="outline"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          No saved results
                        </h3>
                        <p className="text-sm text-gray-500">
                          Save interesting research results to access them later
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Research Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentResults.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Findings Summary</h4>
                          <p className="text-gray-600 text-sm">
                            Based on {currentResults.length} sources, the research suggests multiple perspectives 
                            on your topic with varying levels of evidence and methodological approaches.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Source Quality Analysis</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-3 rounded">
                              <p className="text-sm font-medium text-green-800">High Quality Sources</p>
                              <p className="text-2xl font-bold text-green-600">
                                {currentResults.filter(r => r.relevanceScore > 0.8).length}
                              </p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                              <p className="text-sm font-medium text-yellow-800">Medium Quality Sources</p>
                              <p className="text-2xl font-bold text-yellow-600">
                                {currentResults.filter(r => r.relevanceScore > 0.5 && r.relevanceScore <= 0.8).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Research Gaps</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              <span>Consider exploring longitudinal studies for better temporal insights</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              <span>Look for meta-analyses to get broader perspective on findings</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Perform a search to get AI-powered analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Research Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingTopics?.slice(0, 5).map((topic: TrendingTopic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSearchQuery(topic.topic)}
                        className="p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-sm">{topic.topic}</div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{topic.category}</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +{topic.trend}%
                          </span>
                        </div>
                      </div>
                    )) || []}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Research Notes */}
            {activeProject && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Research Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a research note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      size="sm"
                      className="w-full"
                    >
                      Add Note
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {activeProject.notes?.map((note) => (
                      <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                        <p>{note.content}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(note.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Result Details */}
            {selectedResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Result Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">{selectedResult.title}</h4>
                      <p className="text-xs text-gray-500">{selectedResult.source}</p>
                    </div>
                    
                    {selectedResult.abstract && (
                      <div>
                        <h5 className="font-medium text-xs mb-1">Abstract</h5>
                        <p className="text-xs text-gray-600">{selectedResult.abstract}</p>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-xs mb-1">Citation ({citationStyle.toUpperCase()})</h5>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {generateCitation(selectedResult, citationStyle)}
                      </div>
                      <Button
                        onClick={() => copyCitation(selectedResult)}
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Citation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
