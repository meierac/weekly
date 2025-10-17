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
  Calendar,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
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
  loadICalSources,
  addICalSource,
  deleteICalSource,
  syncICalSource,
  getICalTasksForSource,
  type ICalSource,
} from "@/lib/ical";
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
  initialTab?: "about" | "templates" | "export" | "ical";
  onTasksUpdated?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  initialTab = "about",
  onTasksUpdated,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<
    "about" | "templates" | "export" | "ical"
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

  // iCal state
  const [icalSources, setICalSources] = React.useState<ICalSource[]>([]);
  const [newICalUrl, setNewICalUrl] = React.useState("");
  const [newICalName, setNewICalName] = React.useState("");
  const [isAddingICal, setIsAddingICal] = React.useState(false);
  const [syncingICalId, setSyncingICalId] = React.useState<string | null>(null);
  const [icalError, setICalError] = React.useState<string>("");
  const [icalSuccess, setICalSuccess] = React.useState<string>("");
  const [deleteICalConfirmOpen, setDeleteICalConfirmOpen] =
    React.useState(false);
  const [icalSourceToDelete, setICalSourceToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      loadTemplatesData();
      setExportSettings(loadExportSettings());
      loadICalSourcesData();
    }
  }, [open, initialTab]);

  const loadICalSourcesData = () => {
    const loadedSources = loadICalSources();
    setICalSources(loadedSources);
  };

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

  const handleExportSettingChange = (
    key: keyof ExportSettings,
    value: ExportSettings[keyof ExportSettings],
  ) => {
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

  // iCal handlers
  const handleAddICalSource = async () => {
    if (!newICalUrl.trim() || !newICalName.trim()) {
      setICalError("Bitte geben Sie sowohl URL als auch Namen ein");
      return;
    }

    setIsAddingICal(true);
    setICalError("");
    setICalSuccess("");

    try {
      const source = addICalSource(newICalUrl.trim(), newICalName.trim());
      await syncICalSource(source.id);

      setICalSuccess(
        `iCal-Quelle "${newICalName}" erfolgreich hinzugefügt und synchronisiert!`,
      );
      setNewICalUrl("");
      setNewICalName("");
      loadICalSourcesData();
      if (onTasksUpdated) onTasksUpdated();

      setTimeout(() => setICalSuccess(""), 3000);
    } catch (err) {
      setICalError(
        `Fehler beim Hinzufügen der iCal-Quelle: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
      const currentSources = loadICalSources();
      const failedSource = currentSources.find(
        (s) => s.name === newICalName.trim(),
      );
      if (failedSource) {
        deleteICalSource(failedSource.id);
      }
    } finally {
      setIsAddingICal(false);
    }
  };

  const handleDeleteICalSource = (sourceId: string, sourceName: string) => {
    setICalSourceToDelete({ id: sourceId, name: sourceName });
    setDeleteICalConfirmOpen(true);
  };

  const confirmDeleteICalSource = () => {
    if (icalSourceToDelete) {
      deleteICalSource(icalSourceToDelete.id);
      loadICalSourcesData();
      if (onTasksUpdated) onTasksUpdated();
      setICalSuccess("iCal-Quelle erfolgreich gelöscht!");
      setTimeout(() => setICalSuccess(""), 3000);
      setICalSourceToDelete(null);
    }
  };

  const handleSyncICalSource = async (sourceId: string, sourceName: string) => {
    setSyncingICalId(sourceId);
    setICalError("");
    setICalSuccess("");

    try {
      const taskCount = await syncICalSource(sourceId);
      setICalSuccess(
        `"${sourceName}" erfolgreich synchronisiert! ${taskCount} Aktivitäten importiert.`,
      );
      loadICalSourcesData();
      if (onTasksUpdated) onTasksUpdated();

      setTimeout(() => setICalSuccess(""), 3000);
    } catch (err) {
      setICalError(
        `Fehler beim Synchronisieren: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setSyncingICalId(null);
    }
  };

  const getICalTaskCount = (sourceId: string): number => {
    return getICalTasksForSource(sourceId).length;
  };

  const formatICalDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <Button
              variant={activeTab === "ical" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ical")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              iCal
            </Button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "about" && (
              <div className="space-y-6 py-4">
                {/* About Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Weekly Planner
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Ein moderner Wochenplaner mit Apple-Style Design.
                    Organisieren Sie Ihre Aktivitäten, erstellen Sie Vorlagen
                    und importieren Sie Ihre Kalender – alles an einem Ort.
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Features
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
                      <span>Wöchentliche Aktivitätenverwaltung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
                      <span>Wiederverwendbare Aktivitäten-Vorlagen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
                      <span>iCal-Integration (Google Calendar, Outlook)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
                      <span>Export als PDF und Bild</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
                      <span>Teilen-Funktionen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                        ✓
                      </span>
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
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {categoryTemplates.map((template) => (
                              <div
                                key={template.id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-sm dark:text-gray-100">
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
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                      {template.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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

            {activeTab === "ical" && (
              <div className="space-y-6 py-4">
                {/* Add new source section */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-sm">
                    Neue iCal-Quelle hinzufügen
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ical-name">Name</Label>
                      <Input
                        id="ical-name"
                        placeholder="z.B. Mein Google Kalender"
                        value={newICalName}
                        onChange={(e) => setNewICalName(e.target.value)}
                        disabled={isAddingICal}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ical-url">iCal URL</Label>
                      <Input
                        id="ical-url"
                        placeholder="https://calendar.google.com/calendar/ical/..."
                        value={newICalUrl}
                        onChange={(e) => setNewICalUrl(e.target.value)}
                        disabled={isAddingICal}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Die URL muss öffentlich zugänglich sein
                      </p>
                    </div>
                    <Button
                      onClick={handleAddICalSource}
                      disabled={
                        isAddingICal ||
                        !newICalUrl.trim() ||
                        !newICalName.trim()
                      }
                      className="w-full"
                    >
                      {isAddingICal ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Wird hinzugefügt...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Quelle hinzufügen
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                {icalError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{icalError}</p>
                  </div>
                )}

                {icalSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{icalSuccess}</p>
                  </div>
                )}

                {/* Existing sources */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">
                    Ihre iCal-Quellen ({icalSources.length})
                  </h3>

                  {icalSources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        Noch keine iCal-Quellen vorhanden
                      </p>
                      <p className="text-xs mt-1">
                        Fügen Sie oben eine neue Quelle hinzu
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {icalSources.map((source) => (
                        <div
                          key={source.id}
                          className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: source.color }}
                                />
                                <h4 className="font-semibold text-sm truncate">
                                  {source.name}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-1">
                                {source.url}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  Aktivitäten:{" "}
                                  <strong>{getICalTaskCount(source.id)}</strong>
                                </span>
                                {source.lastSynced && (
                                  <span>
                                    Zuletzt sync:{" "}
                                    <strong>
                                      {formatICalDate(source.lastSynced)}
                                    </strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSyncICalSource(source.id, source.name)
                              }
                              disabled={syncingICalId === source.id}
                              className="flex-1"
                            >
                              {syncingICalId === source.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Synchronisieren...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Synchronisieren
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(source.url, "_blank")}
                              title="URL öffnen"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteICalSource(source.id, source.name)
                              }
                              disabled={syncingICalId === source.id}
                              title="Quelle löschen"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Help section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    💡 Tipps:
                  </h4>
                  <ul className="space-y-1 text-blue-800 text-xs">
                    <li>
                      • <strong>Google Calendar:</strong> Einstellungen →
                      Kalender → Kalender integrieren → Geheime Adresse im
                      iCal-Format
                    </li>
                    <li>
                      • <strong>Synchronisieren:</strong> Lädt alle Änderungen
                      neu und setzt lokale Bearbeitungen zurück
                    </li>
                    <li>
                      • <strong>Importierte Aktivitäten:</strong> Können
                      bearbeitet werden, aber Sync setzt Änderungen zurück
                    </li>
                    <li>
                      • Die URL muss öffentlich zugänglich sein (keine
                      Authentifizierung erforderlich)
                    </li>
                  </ul>
                </div>
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

      {/* Delete iCal Source Confirmation Dialog */}
      <ConfirmDialog
        open={deleteICalConfirmOpen}
        onOpenChange={setDeleteICalConfirmOpen}
        onConfirm={confirmDeleteICalSource}
        title="iCal-Quelle löschen"
        description={
          icalSourceToDelete
            ? `Möchten Sie die iCal-Quelle "${icalSourceToDelete.name}" wirklich löschen? Alle importierten Aktivitäten aus dieser Quelle werden ebenfalls gelöscht.`
            : ""
        }
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="danger"
      />
    </>
  );
}
