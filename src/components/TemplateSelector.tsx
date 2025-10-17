import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import type { TaskTemplate } from "@/lib/storage";
import { loadTaskTemplates } from "@/lib/storage";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = React.useState<TaskTemplate[]>([]);

  React.useEffect(() => {
    if (open) {
      const loadedTemplates = loadTaskTemplates();
      setTemplates(loadedTemplates);
    }
  }, [open]);

  const groupedTemplates = React.useMemo(() => {
    const groups: Record<string, TaskTemplate[]> = {};
    templates.forEach((template) => {
      const category = template.category || "Andere";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });
    return groups;
  }, [templates]);

  const handleSelectTemplate = (template: TaskTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Vorlage auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage, um die Aktivität schnell zu erstellen.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[50vh] pr-2">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm text-gray-600 mb-2">
                Keine Vorlagen vorhanden
              </p>
              <p className="text-xs text-gray-500">
                Erstellen Sie Vorlagen in den Einstellungen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTemplates).map(
                ([category, categoryTemplates]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
                                  {template.name}
                                </h5>
                                {template.color && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: template.color,
                                    }}
                                  />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>⏱ {template.defaultDuration} Min.</span>
                                <span>🔄 {template.usageCount}× verwendet</span>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Abbrechen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
