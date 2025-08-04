"use client";

import { Template } from "@/store/thunk/templatethunk";
import { Card, CardContent } from "@/components/ui/card";
import EditTemplateDialog from "./EditTemplateDialog";

interface Props {
  template: Template;
}

export default function TemplateCard({ template }: Props) {
  return (
    <div className="flex flex-col items-center space-y-3 w-full max-w-[180px]">
      <EditTemplateDialog template={template}>
        <Card className="cursor-pointer bg-gradient-to-br from-background to-muted/30 group w-full aspect-[3/4] overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-4 h-full overflow-hidden relative ">
            <div className="absolute top-0 left-4 right-4 bottom-4">
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed overflow-hidden text-ellipsis">
                {template.goal}
              </p>
            </div>
          </CardContent>
        </Card>
      </EditTemplateDialog>
      
      <div className="text-center w-full px-2">
        <p className="text-sm font-medium text-foreground truncate">
          {template.purpose}
        </p>
        {template.duration && (
          <p className="text-xs text-muted-foreground mt-1">
            {template.duration}
          </p>
        )}
      </div>
    </div>
  );
}
