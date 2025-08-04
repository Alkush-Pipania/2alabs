"use client";

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
import { useAppDispatch } from "@/store/hooks";
import { deleteDocument } from "@/store/thunk/documentsthunk";
import { toast } from "sonner";

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName?: string;
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
}: DeleteDocumentDialogProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    const promise = dispatch(deleteDocument(documentId));

    toast.promise(promise, {
      loading: "Deleting document...",
      success: () => {
        onOpenChange(false);
        return `Document "${documentName || "Untitled"}" deleted successfully.`;
      },
      error: (err) => {
        onOpenChange(false);
        return `Failed to delete document: ${err}`;
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            document "{documentName || "Untitled"}" and remove all associated data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive cursor-pointer text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
