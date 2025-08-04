"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTemplates } from "@/store/thunk/templatethunk";
import { Template } from "@/store/thunk/templatethunk";
import { PlusIcon } from "lucide-react";
import TemplateCard from "./TemplateCard";
import CreateTemplateDialog from "./CreateTemplateDialog";
import { Card, CardContent } from "@/components/ui/card";

export default function TemplatesGrid() {
  const dispatch = useAppDispatch();
  const { templates, loading } = useAppSelector((s) => s.templates);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  return (
    <section className="w-full px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Personalize</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 justify-items-center">
        {/* Create New Template */}
        <div className="flex flex-col items-center space-y-3 w-full max-w-[180px]">
          <CreateTemplateDialog>
            <Card className="cursor-pointer group w-full bg-gradient-to-br from-background to-muted/20 aspect-[3/4] overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
              <CardContent className="h-full flex flex-col items-center justify-center p-4 ">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <PlusIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Create New
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      Template
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CreateTemplateDialog>
          
          <div className="text-center w-full px-2">
            <p className="text-sm font-medium text-foreground">
              New Template
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create custom
            </p>
          </div>
        </div>

        {/* Simple loading indicator */}
        {loading && (
          
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading templates...</span>
            </div>
          
        )}
        
        {/* Existing templates */}
        {!loading && templates.map((tpl: Template) => (
          <TemplateCard key={tpl.id} template={tpl} />
        ))}
      </div>
    </section>
  );
}
