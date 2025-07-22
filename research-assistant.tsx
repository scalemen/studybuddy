import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Bookmark, ExternalLink, Copy, Brain } from "lucide-react";

export default function ResearchAssistant() {
  const [searchQuery, setSearchQuery] = useState("");
  const [citationStyle, setCitationStyle] = useState("apa");

  const mockResults = [
    {
      title: "The Impact of AI on Education",
      authors: ["Smith, J.", "Johnson, A."],
      year: 2023,
      source: "Journal of Educational Technology",
      url: "https://example.com/paper1",
      relevance: 95
    },
    {
      title: "Machine Learning in Classroom Settings",
      authors: ["Brown, M.", "Davis, K."],
      year: 2023,
      source: "Educational Research Quarterly",
      url: "https://example.com/paper2",
      relevance: 88
    }
  ];

  const generateCitation = (result: any) => {
    const authors = result.authors.join(', ');
    switch (citationStyle) {
      case 'apa':
        return `${authors} (${result.year}). ${result.title}. ${result.source}.`;
      case 'mla':
        return `${authors}. "${result.title}." ${result.source}, ${result.year}.`;
      default:
        return `${authors} (${result.year}). ${result.title}. ${result.source}.`;
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter your research question or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-lg"
                  />
                  <Button size="lg">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="results">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Search Results</TabsTrigger>
                <TabsTrigger value="saved">Saved Results</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm font-medium">Citation Style:</span>
                      <select
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="apa">APA Style</option>
                        <option value="mla">MLA Style</option>
                        <option value="chicago">Chicago Style</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {mockResults.map((result, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <Badge variant="outline">
                            {result.relevance}% match
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {result.authors.join(', ')} • {result.year} • {result.source}
                        </p>
                        
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <p className="text-sm font-medium mb-1">Citation ({citationStyle.toUpperCase()}):</p>
                          <p className="text-sm text-gray-700">{generateCitation(result)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline">
                            <Bookmark className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Citation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="text-center py-16">
                  <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No saved results yet</p>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Research Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Perform a search to get AI-powered analysis</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Research Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Bibliography
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Citations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
