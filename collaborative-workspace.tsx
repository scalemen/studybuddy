import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, CheckSquare, Calendar, Share } from "lucide-react";

export default function CollaborativeWorkspace() {
  const [selectedProject, setSelectedProject] = useState(null);

  const mockProjects = [
    { id: 1, name: "Math Study Group", members: 4, documents: 8, tasks: 12 },
    { id: 2, name: "Science Research", members: 3, documents: 15, tasks: 8 },
    { id: 3, name: "History Project", members: 5, documents: 6, tasks: 10 },
  ];

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Projects
                </CardTitle>
                <Button size="sm">New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border"
                  >
                    <h3 className="font-semibold text-sm">{project.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{project.members} members</span>
                      <span>{project.documents} docs</span>
                      <span>{project.tasks} tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Collaborative Workspace</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents" className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Shared Documents</h3>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      New Document
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Document {i}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            Last edited 2 hours ago
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((j) => (
                              <div
                                key={j}
                                className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs"
                              >
                                U{j}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Tasks</h3>
                    <Button size="sm">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: "Research Phase 1", status: "completed", assignee: "Alice" },
                      { title: "Draft Introduction", status: "in-progress", assignee: "Bob" },
                      { title: "Collect Data", status: "todo", assignee: "Charlie" },
                      { title: "Review Literature", status: "todo", assignee: "David" },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                        <CheckSquare className={`h-4 w-4 ${
                          task.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500">Assigned to {task.assignee}</p>
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Timeline</h3>
                    <Button size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                  
                  <div className="text-center py-16">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Project timeline and milestones</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
