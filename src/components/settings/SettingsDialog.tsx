import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TaskTemplateDialog } from "@/components/TaskTemplateDialog";
import type { TaskTemplate } from "@/lib/storage";
import {
  loadTaskTemplates,
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/lib/storage";
import {
  loadExportSettings,
  saveExportSettings,
  type ExportSettings,
} from "@/lib/export-settings";
import {
  BACKGROUND_IMAGES,
  loadImageAsBase64,
  validateImageFile,
} from "@/lib/export";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "about" | "templates" | "export";
}

export function SettingsDialog({
  open,
  onOpenChange,
  initialTab = "about",
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<
    "about" | "templates" | "export"
  >(initialTab);
  const [templates, setTemplates] = React.useState<TaskTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<
    TaskTemplate | undefined
  >();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(
    null,
  );
  const [exportSettings, setExportSettings] =
    React.useState<ExportSettings>(loadExportSettings());

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      loadTemplatesData();
      setExportSettings(loadExportSettings());
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

  const handleExportSettingChange = (key: keyof ExportSettings, value: any) => {
    const newSettings = { ...exportSettings, [key]: value };
    setExportSettings(newSettings);
    saveExportSettings(newSettings);
  };

  const handleCustomBackgroundUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      alert("Ungültiges Dateiformat oder Datei zu groß (max. 5MB)");
      return;
    }

    try {
      const base64 = await loadImageAsBase64(file);
      handleExportSettingChange("customBackground", base64);
      handleExportSettingChange("selectedBackground", "custom");
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Fehler beim Laden des Bildes");
    }
  };

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
            <Button
              variant={activeTab === "export" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("export")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
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

            {activeTab === "export" && (
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">
                  Diese Einstellungen werden beim Export und Teilen verwendet.
                </p>

                {/* Format */}
                <div className="space-y-2">
                  <Label>Dateiformat</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value: "png" | "jpeg") =>
                      handleExportSettingChange("format", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (verlustfrei)</SelectItem>
                      <SelectItem value="jpeg">JPEG (komprimiert)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality (only for JPEG) */}
                {exportSettings.format === "jpeg" && (
                  <div className="space-y-2">
                    <Label>Qualität: {exportSettings.quality}%</Label>
                    <Input
                      type="range"
                      min="50"
                      max="100"
                      value={exportSettings.quality}
                      onChange={(e) =>
                        handleExportSettingChange(
                          "quality",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                )}

                {/* Scale */}
                <div className="space-y-2">
                  <Label>Auflösung (Skalierung)</Label>
                  <Select
                    value={exportSettings.scale.toString()}
                    onValueChange={(value) =>
                      handleExportSettingChange("scale", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x (Standard)</SelectItem>
                      <SelectItem value="2">2x (Empfohlen)</SelectItem>
                      <SelectItem value="3">3x (Hoch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Type */}
                <div className="space-y-2">
                  <Label>Hintergrund</Label>
                  <Select
                    value={exportSettings.backgroundType}
                    onValueChange={(value: "image" | "color" | "none") =>
                      handleExportSettingChange("backgroundType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Transparent</SelectItem>
                      <SelectItem value="color">Einfarbig</SelectItem>
                      <SelectItem value="image">Bild/Verlauf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Color */}
                {exportSettings.backgroundType === "color" && (
                  <div className="space-y-2">
                    <Label>Hintergrundfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={exportSettings.backgroundColor}
                        onChange={(e) =>
                          handleExportSettingChange(
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={exportSettings.backgroundColor}
                        onChange={(e) =>
                          handleExportSettingChange(
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                        className="flex-1"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}

                {/* Background Image */}
                {exportSettings.backgroundType === "image" && (
                  <div className="space-y-3">
                    <Label>Hintergrundbild</Label>

                    {/* Predefined backgrounds */}
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUND_IMAGES.slice(0, 6).map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() =>
                            handleExportSettingChange(
                              "selectedBackground",
                              bg.id,
                            )
                          }
                          className={`h-16 rounded-lg border-2 transition-all ${
                            exportSettings.selectedBackground === bg.id
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{
                            background: bg.preview,
                          }}
                          title={bg.name}
                        />
                      ))}
                    </div>

                    {/* Custom upload */}
                    <div>
                      <Label
                        htmlFor="custom-bg-upload"
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            Eigenes Bild hochladen
                          </span>
                        </div>
                      </Label>
                      <Input
                        id="custom-bg-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleCustomBackgroundUpload}
                        className="hidden"
                      />
                      {exportSettings.selectedBackground === "custom" &&
                        exportSettings.customBackground && (
                          <div className="mt-2 text-xs text-gray-600">
                            ✓ Eigenes Bild geladen
                          </div>
                        )}
                    </div>
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
