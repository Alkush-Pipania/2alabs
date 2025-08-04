"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSession } from "@/store/thunk/sessionthunk";
import { fetchDocuments } from "@/store/thunk/documentsthunk";
import { fetchTemplates } from "@/store/thunk/templatethunk";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { FileText, Clock, Target, Info, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Session name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().optional(),
  documentIds: z.array(z.string()).optional(),
  templateId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateSessionDialogProps {
  children: React.ReactNode;
}

export default function CreateSessionDialog({ children }: CreateSessionDialogProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  
  // Get data from Redux store
  const documents = useAppSelector((state) => state.documents.documents);
  const templates = useAppSelector((state) => state.templates.templates);
  const documentLoading = useAppSelector((state) => state.documents.loading);
  const templateLoading = useAppSelector((state) => state.templates.loading);
  const sessionLoading = useAppSelector((state) => state.AppSessions.loading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      documentIds: [],
    }
  });

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const watchedTemplate = watch("templateId");

  // Fetch documents and templates when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchDocuments());
      dispatch(fetchTemplates());
    }
  }, [open, dispatch]);

  const onSubmit = async (data: FormValues) => {
    // Close the dialog optimistically
    setOpen(false);

    const payload = {
      ...data,
      documentIds: selectedDocuments,
    };

    toast.promise(
      dispatch(createSession(payload)).unwrap(),
      {
        loading: "Creating session...",
        success: "Session created successfully!",
        error: "Failed to create session.",
      }
    );

    // Reset form state
    reset();
    setSelectedDocuments([]);
  };

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectedTemplate = templates.find(t => t.id === watchedTemplate);
  const filteredDocuments = documents.filter(doc => doc.isEmbedded);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-6xl max-h-[95vh] data-[state=open]:animate-none data-[state=closed]:animate-none">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-2xl font-semibold flex items-center gap-2">
            Create New Session
          </AlertDialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Set up a new session with documents and templates for your meeting or analysis
          </p>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Session Name *
                  </label>
                  <Input 
                    placeholder="e.g., Q4 Planning Meeting, Project Review" 
                    {...register("name")}
                    className="h-11"
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Meeting Template
                  </label>
                  <select 
                    {...register("templateId")}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a template (optional)</option>
                    {templateLoading ? (
                      <option disabled>Loading templates...</option>
                    ) : templates.length === 0 ? (
                      <option disabled>No templates available</option>
                    ) : (
                      templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.purpose}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Description
                </label>
                <Textarea 
                  rows={3} 
                  {...register("description")} 
                  placeholder="Brief description of what this session is about, its goals, or any important context..."
                  className="resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <Card className="">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Selected Template Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Purpose
                        </h4>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.purpose}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration
                        </h4>
                        <Badge variant="outline">{selectedTemplate.duration}</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Goal</h4>
                      <p className="text-sm text-muted-foreground  p-3 rounded-md border">
                        {selectedTemplate.goal}
                      </p>
                    </div>
                    {selectedTemplate.additionalInfo && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Additional Information</h4>
                        <p className="text-sm text-muted-foreground  p-3 rounded-md border">
                          {selectedTemplate.additionalInfo}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Document Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Select Documents
                    <Badge variant="secondary" className="ml-2">
                      {selectedDocuments.length} selected
                    </Badge>
                  </label>
                  
                </div>
                
                {documentLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 1 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-40 w-full rounded-md" />
                    ))}
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground text-center">
                        {documentLoading ? 'Loading your documents...' : 'No embedded documents available.'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload and embed documents first to use them in sessions.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((document) => (
                      <Card 
                        key={document.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border-2",
                          selectedDocuments.includes(document.id)
                            ? "border-purple-300 bg-black shadow-sm"
                            : "border-gray-500 hover:border-purple-200"
                        )}
                      >
                        <CardContent 
                         className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedDocuments.includes(document.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentToggle(document.id);
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <h4 className="font-medium text-sm truncate">
                                  {document.fileName || document.title || 'Untitled Document'}
                                </h4>
                              </div>
                              {document.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {document.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  {document.mimeType || 'Unknown type'}
                                </Badge>
                                {document.fileSize && (
                                  <span>
                                    {(Number(document.fileSize) / 1024 / 1024).toFixed(1)} MB
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 bg-green-100 text-green-700"
                                >
                                  ✓ Embedded
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <AlertDialogFooter className="pt-6 border-t  -mx-6 -mb-6 px-6 py-4">
            <AlertDialogCancel type="button" className="mr-3">
              Cancel
            </AlertDialogCancel>
            <Button 
              type="submit" 
              disabled={isSubmitting || sessionLoading}
              className="min-w-[140px] cursor-pointer"
            >
              {isSubmitting || sessionLoading ? (
                <>
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Session
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}