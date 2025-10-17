import React from "react";
import { DraggableTaskTemplate } from "@/components/DraggableTaskTemplate";
import { TaskTemplateDialog } from "@/components/TaskTemplateDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import {
  loadTaskTemplates,
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  type TaskTemplate,
} from "@/lib/storage";

interface TaskTemplatesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function TaskTemplatesSidebar({
  isOpen,
  onToggle,
}: TaskTemplatesSidebarProps) {
  const [templates, setTemplates] = React.useState<TaskTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<
    TaskTemplate | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(
    null,
  );

  const loadTemplates = React.useCallback(() => {
    const loadedTemplates = loadTaskTemplates();
    // Sort by usage count and then by creation date
    loadedTemplates.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setTemplates(loadedTemplates);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  const handleAddTemplate = () => {
    setEditingTemplate(undefined);
    setDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTaskTemplate(templateToDelete);
      loadTemplates();
      setTemplateToDelete(null);
    }
  };

  const handleSaveTemplate = (templateData: {
    name: string;
    description: string;
    defaultDuration: number;
    category?: string;
    color?: string;
  }) => {
    if (editingTemplate) {
      updateTaskTemplate(editingTemplate.id, templateData);
    } else {
      addTaskTemplate(templateData);
    }
    loadTemplates();
  };

  const groupedTemplates = React.useMemo(() => {
    const groups: Record<string, TaskTemplate[]> = {};
    templates.forEach((template) => {
      const category = template.category || "Sonstiges";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });
    return groups;
  }, [templates]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l shadow-lg z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-semibold">Aktivitäten-Vorlagen</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddTemplate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Neue Vorlage
            </Button>
            <Button onClick={onToggle} variant="outline" size="sm">
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="font-medium mb-2">Keine Vorlagen vorhanden</h4>
              <p className="text-sm mb-4">
                Erstellen Sie wiederverwendbare Aktivitäten-Vorlagen
              </p>
              <Button onClick={handleAddTemplate} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Erste Vorlage erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tipp:</strong> Ziehen Sie Vorlagen einfach auf
                  einen Wochentag, um schnell Aktivitäten zu erstellen!
                </p>
              </div>

              {/* Template Groups */}
              {Object.entries(groupedTemplates).map(
                ([category, categoryTemplates]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                      {category} ({categoryTemplates.length})
                    </h4>
                    <div className="space-y-2">
                      {categoryTemplates.map((template) => (
                        <DraggableTaskTemplate
                          key={template.id}
                          template={template}
                          onEdit={handleEditTemplate}
                          onDelete={handleDeleteTemplate}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )}

              {/* Statistics */}
              <div className="border-t pt-4 mt-6">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Gesamt: {templates.length} Vorlagen</div>
                  <div>
                    Meist verwendet:{" "}
                    {templates.length > 0
                      ? templates.reduce((prev, curr) =>
                          curr.usageCount > prev.usageCount ? curr : prev,
                        ).name
                      : "Keine"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Dialog */}
      <TaskTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTemplate}
        template={editingTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteTemplate}
        title="Vorlage löschen"
        description="Sind Sie sicher, dass Sie diese Vorlage löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="danger"
      />
    </>
  );
}
