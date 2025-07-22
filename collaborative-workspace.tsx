import { useState, useEffect } from "react";
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
  Users, 
  FileText, 
  Plus, 
  Share, 
  MessageCircle,
  Calendar,
  CheckSquare,
  Clock,
  User,
  Edit,
  Eye,
  Download
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WorkspaceDocument {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'presentation' | 'spreadsheet';
  collaborators: User[];
  lastModified: Date;
  createdBy: string;
}

interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  labels: string[];
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  members: User[];
  documents: WorkspaceDocument[];
  tasks: WorkspaceTask[];
  createdAt: Date;
  deadline?: Date;
}

export default function CollaborativeWorkspace() {
  const [selectedProject, setSelectedProject] = useState<WorkspaceProject | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<WorkspaceDocument | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTab, setActiveTab] = useState("documents");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/collaborative-projects'],
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/collaborative-documents', selectedProject?.id],
    enabled: !!selectedProject?.id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/collaborative-tasks', selectedProject?.id],
    enabled: !!selectedProject?.id,
  });

  const saveDocumentMutation = useMutation({
    mutationFn: async ({ documentId, content }: { documentId: string; content: string }) => {
      const response = await fetch(`/api/collaborative-documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to save document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative-documents'] });
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch('/api/collaborative-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, projectId: selectedProject?.id }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative-tasks'] });
      setNewTaskTitle("");
      toast({
        title: "Task created",
        description: "New task has been added to the project.",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await fetch(`/api/collaborative-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative-tasks'] });
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
    },
  });

  const handleSaveDocument = () => {
    if (selectedDocument) {
      saveDocumentMutation.mutate({
        documentId: selectedDocument.id,
        content: documentContent,
      });
      setIsEditing(false);
    }
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate({
        title: newTaskTitle,
        description: "",
        assignedTo: [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'medium',
        status: 'todo',
        labels: [],
      });
    }
  };

  const handleTaskStatusChange = (task: WorkspaceTask, newStatus: string) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { status: newStatus },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {/* Projects Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Projects
                </CardTitle>
                <Button size="sm" className="h-8 px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="p-4 space-y-2">
                  {projectsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                    </div>
                  ) : projects?.length > 0 ? (
                    projects.map((project: WorkspaceProject) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'bg-primary-100 border border-primary-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.members.length} members
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {project.members.slice(0, 3).map((member, index) => (
                            <div
                              key={member.id}
                              className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs"
                              style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                            >
                              {member.name.charAt(0)}
                            </div>
                          ))}
                          {project.members.length > 3 && (
                            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs ml-1">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No projects yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1">
          {selectedProject ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedProject.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                  <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="documents" className="flex-1 m-0">
                    <div className="flex h-full">
                      {/* Documents List */}
                      <div className="w-80 border-r">
                        <div className="p-4 border-b">
                          <Button size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            New Document
                          </Button>
                        </div>
                        <ScrollArea className="h-[calc(100vh-350px)]">
                          <div className="p-4 space-y-2">
                            {documentsLoading ? (
                              <div className="text-center py-8">
                                <div className="animate-spin h-4 w-4 border-2 border-primary-600 rounded-full border-t-transparent mx-auto"></div>
                              </div>
                            ) : documents?.length > 0 ? (
                              documents.map((doc: WorkspaceDocument) => (
                                <div
                                  key={doc.id}
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setDocumentContent(doc.content);
                                    setIsEditing(false);
                                  }}
                                  className={`p-3 rounded cursor-pointer transition-colors ${
                                    selectedDocument?.id === doc.id
                                      ? 'bg-primary-100 border border-primary-200'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {doc.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Modified {new Date(doc.lastModified).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500 text-sm">
                                No documents yet
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Document Editor */}
                      <div className="flex-1">
                        {selectedDocument ? (
                          <div className="h-full flex flex-col">
                            <div className="border-b p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{selectedDocument.title}</h3>
                                <div className="flex items-center gap-2">
                                  {!isEditing ? (
                                    <>
                                      <Button
                                        onClick={() => setIsEditing(true)}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        onClick={handleSaveDocument}
                                        size="sm"
                                        disabled={saveDocumentMutation.isPending}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setIsEditing(false);
                                          setDocumentContent(selectedDocument.content);
                                        }}
                                        size="sm"
                                        variant="outline"
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 p-4">
                              {isEditing ? (
                                <ReactQuill
                                  value={documentContent}
                                  onChange={setDocumentContent}
                                  style={{ height: 'calc(100vh - 450px)' }}
                                  modules={{
                                    toolbar: [
                                      [{ 'header': [1, 2, 3, false] }],
                                      ['bold', 'italic', 'underline', 'strike'],
                                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                      ['blockquote', 'code-block'],
                                      ['link', 'image'],
                                      ['clean']
                                    ],
                                  }}
                                />
                              ) : (
                                <div 
                                  className="prose max-w-none"
                                  dangerouslySetInnerHTML={{ __html: documentContent }}
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-600 mb-2">
                                Select a document to edit
                              </h3>
                              <p className="text-sm text-gray-500">
                                Choose from existing documents or create a new one
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="flex-1 m-4">
                    <div className="space-y-4">
                      {/* Task Creation */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new task..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleCreateTask}
                          disabled={!newTaskTitle.trim()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>

                      {/* Tasks Board */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['todo', 'in-progress', 'review', 'completed'].map((status) => (
                          <div key={status} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-3 capitalize">
                              {status.replace('-', ' ')}
                            </h4>
                            <div className="space-y-2">
                              {tasks?.filter((task: WorkspaceTask) => task.status === status)
                                .map((task: WorkspaceTask) => (
                                <div
                                  key={task.id}
                                  className="bg-white rounded p-3 shadow-sm border"
                                >
                                  <div className="font-medium text-sm mb-2">
                                    {task.title}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {task.assignedTo.slice(0, 3).map((userId, index) => (
                                      <div
                                        key={userId}
                                        className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs"
                                      >
                                        U
                                      </div>
                                    ))}
                                  </div>
                                  <select
                                    value={task.status}
                                    onChange={(e) => handleTaskStatusChange(task, e.target.value)}
                                    className="mt-2 text-xs border rounded px-2 py-1 w-full"
                                  >
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                              )) || []}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="flex-1 m-4">
                    <div className="text-center py-16">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Project Timeline
                      </h3>
                      <p className="text-sm text-gray-500">
                        Track project milestones and deadlines
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Select a project to collaborate
                </h3>
                <p className="text-sm text-gray-500">
                  Choose from your existing projects or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
