import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { updateNote, deleteNote } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function NoteDetail() {
  const [match, params] = useRoute("/notes/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const noteId = params?.id ? parseInt(params.id) : null;
  
  const { data: note, isLoading, error } = useQuery({
    queryKey: ['/api/notes', noteId],
    enabled: !!noteId,
  });
  
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note]);
  
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!noteId) return null;
      return updateNote(noteId, { title, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes', noteId] });
      toast({
        title: "Note updated",
        description: "Your note has been saved successfully."
      });
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update note",
        description: error.message || "An error occurred while saving your note.",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!noteId) return null;
      return deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully."
      });
      navigate("/notes");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete note",
        description: error.message || "An error occurred while deleting your note.",
        variant: "destructive"
      });
    }
  });
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    updateMutation.mutate();
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
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
  
  if (error || !note) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Note not found</h3>
          <p className="text-gray-500 max-w-md mb-6">
            The note you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <a href="/notes">Go back to notes</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <a href="/notes">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
          </a>
        </Button>
        
        <div className="flex-1"></div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={isSaving || updateMutation.isPending}
        >
          {isSaving || updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 mb-4">
        Last updated: {formatDate(note.updatedAt)}
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <Input
            className="text-2xl font-display font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-t-lg"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            className="min-h-[500px] border-0 rounded-b-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Start writing your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
