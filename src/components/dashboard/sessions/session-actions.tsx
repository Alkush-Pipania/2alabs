"use client";

import { useState } from "react";
import { MoreHorizontal, Share, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Simple toast replacement for now
const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    // You can implement actual toast later
  },
  error: (message: string) => {
    console.error('Error:', message);
    // You can implement actual toast later
  }
};

interface AppSession {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  documents: any[];
  template: any;
}

interface SessionActionsProps {
  session: AppSession;
}

export function SessionActions({ session }: SessionActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShare = async () => {
    try {
      // Create a shareable link
      const shareUrl = `${window.location.origin}/dashboard/sessions/${session.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Session: ${session.name}`,
          text: session.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing session:", error);
      toast.error("Failed to share session");
    }
  };

  const handleView = () => {
    // Navigate to session detail view
    window.location.href = `/dashboard/sessions/${session.id}`;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement actual delete API call
      // await deleteSession(session.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Session "${session.name}" deleted successfully`);
      setShowDeleteDialog(false);
      
      // TODO: Refresh the sessions list
      // dispatch(fetchAppSessions());
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleView}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleShare}
            className="cursor-pointer"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the session
              <strong className="font-semibold"> "{session.name}"</strong> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
