import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, BookOpen, Edit, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TaskTemplateDialog } from "@/components/TaskTemplateDialog";
import type { TaskTemplate } from "@/lib/storage";
import {
  loadTaskTemplates,
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/lib/storage";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "about" | "templates";
}

export function SettingsDialog({
  open,
  onOpenChange,
  initialTab = "about",
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"about" | "templates">(
    initialTab,
  );
  const [templates, setTemplates] = React.useState<TaskTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<
    TaskTemplate | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      loadTemplatesData();
    }
  }, [open, initialTab]);

  const loadTemplatesData = () => {
    const loadedTemplates = loadTaskTemplates();
    setTemplates(loadedTemplates);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(undefined);
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTaskTemplate(templateToDelete);
      loadTemplatesData();
      setTemplateToDelete(null);
    }
  };

  const handleSaveTemplate = (template: {
    name: string;
    description: string;
    defaultDuration: number;
    category?: string;
    color?: string;
  }) => {
    if (editingTemplate) {
      updateTaskTemplate(editingTemplate.id, template);
    } else {
      addTaskTemplate(template);
    }
    loadTemplatesData();
    setTemplateDialogOpen(false);
    setEditingTemplate(undefined);
  };

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Einstellungen</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={activeTab === "about" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("about")}
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              Info
            </Button>
            <Button
              variant={activeTab === "templates" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("templates")}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Vorlagen
            </Button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "about" && (
              <div className="space-y-6 py-4">
                {/* About Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    Weekly Planner
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ein moderner Wochenplaner mit Apple-Style Design.
                    Organisieren Sie Ihre Aktivitäten, erstellen Sie Vorlagen
                    und importieren Sie Ihre Kalender – alles an einem Ort.
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-700">Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Wöchentliche Aktivitätenverwaltung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Wiederverwendbare Aktivitäten-Vorlagen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>iCal-Integration (Google Calendar, Outlook)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Export als PDF und Bild</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Teilen-Funktionen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Responsive Design für Mobil & Desktop</span>
                    </li>
                  </ul>
                </div>

                {/* Version Info */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Version 1.0.0 • Made with ❤️
                  </p>
                </div>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Verwalten Sie Ihre Aktivitäten-Vorlagen
                  </p>
                  <Button onClick={handleAddTemplate} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Neue Vorlage
                  </Button>
                </div>

                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <h4 className="font-medium mb-2">
                      Keine Vorlagen vorhanden
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Erstellen Sie wiederverwendbare Aktivitäten-Vorlagen
                    </p>
                    <Button onClick={handleAddTemplate} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Erste Vorlage erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedTemplates).map(
                      ([category, categoryTemplates]) => (
                        <div key={category}>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {categoryTemplates.map((template) => (
                              <div
                                key={template.id}
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-sm">
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
                                    <p className="text-xs text-gray-600 mb-2">
                                      {template.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span>
                                        Dauer: {template.defaultDuration} Min.
                                      </span>
                                      <span>
                                        Verwendet: {template.usageCount}×
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleEditTemplate(template)
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteTemplate(template.id)
                                      }
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <TaskTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
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
