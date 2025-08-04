"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAppDispatch } from "@/store/hooks";
import { createTemplate } from "@/store/thunk/templatethunk";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const schema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  goal: z.string().min(200, "Goal must be at least 200 characters"),
  additionalInfo: z.string().optional(),
  duration: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTemplateDialog({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(createTemplate(data)).unwrap();
      reset();
      setOpen(false); // Close dialog on success
    } catch (error) {
      // Handle error if needed
      console.error('Failed to create template:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] data-[state=open]:animate-none data-[state=closed]:animate-none">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle className="text-xl font-semibold">Create New Template</AlertDialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Design a custom template with detailed goals and requirements
          </p>
        </AlertDialogHeader>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[65vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Purpose *</label>
              <Input 
                placeholder="e.g., Meeting Notes, Project Planning" 
                {...register("purpose")}
                className="h-11"
              />
              {errors.purpose && (
                <p className="text-destructive text-xs mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  {errors.purpose.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Duration</label>
              <Input 
                placeholder="e.g., 30 minutes, 1 hour" 
                {...register("duration")}
                className="h-11"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Goal * <span className="text-xs text-muted-foreground font-normal">(minimum 200 characters)</span>
            </label>
            <Textarea 
              rows={8} 
              {...register("goal")} 
              placeholder="Describe the detailed goal and objectives for this template. Be specific about what you want to achieve, the context, and any particular requirements or constraints. This should be comprehensive and detailed to guide the AI effectively."
              className="resize-none text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              {errors.goal && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  {errors.goal.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                Character count: {(document.querySelector('textarea[name="goal"]') as HTMLTextAreaElement)?.value?.length || 0}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Additional Information</label>
            <Textarea 
              rows={4} 
              {...register("additionalInfo")} 
              placeholder="Any additional context, preferences, or specific instructions that would help customize this template further."
              className="resize-none text-sm"
            />
          </div>
          
          <AlertDialogFooter className="pt-6 border-t">
            <AlertDialogCancel type="button" className="mr-3">
              Cancel
            </AlertDialogCancel>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
