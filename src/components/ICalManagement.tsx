import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Calendar,
  Trash2,
  RefreshCw,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  loadICalSources,
  addICalSource,
  deleteICalSource,
  syncICalSource,
  getICalTasksForSource,
  type ICalSource,
} from "@/lib/ical";

interface ICalManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksUpdated: () => void;
}

export function ICalManagement({
  open,
  onOpenChange,
  onTasksUpdated,
}: ICalManagementProps) {
  const [sources, setSources] = React.useState<ICalSource[]>([]);
  const [newUrl, setNewUrl] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [sourceToDelete, setSourceToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  React.useEffect(() => {
    if (open) {
      loadSources();
    }
  }, [open]);

  const loadSources = () => {
    const loadedSources = loadICalSources();
    setSources(loadedSources);
  };

  const handleAddSource = async () => {
    if (!newUrl.trim() || !newName.trim()) {
      setError("Bitte geben Sie sowohl URL als auch Namen ein");
      return;
    }

    setIsAdding(true);
    setError("");
    setSuccess("");

    try {
      // Add the source
      const source = addICalSource(newUrl.trim(), newName.trim());

      // Immediately sync to validate and import tasks
      await syncICalSource(source.id);

      setSuccess(
        `iCal-Quelle "${newName}" erfolgreich hinzugefügt und synchronisiert!`,
      );
      setNewUrl("");
      setNewName("");
      loadSources();
      onTasksUpdated();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        `Fehler beim Hinzufügen der iCal-Quelle: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
      // If sync failed, we should remove the source
      const currentSources = loadICalSources();
      const failedSource = currentSources.find(
        (s) => s.name === newName.trim(),
      );
      if (failedSource) {
        deleteICalSource(failedSource.id);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSource = (sourceId: string, sourceName: string) => {
    setSourceToDelete({ id: sourceId, name: sourceName });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSource = () => {
    if (sourceToDelete) {
      deleteICalSource(sourceToDelete.id);
      loadSources();
      onTasksUpdated();
      setSuccess("iCal-Quelle erfolgreich gelöscht!");
      setTimeout(() => setSuccess(""), 3000);
      setSourceToDelete(null);
    }
  };

  const handleSyncSource = async (sourceId: string, sourceName: string) => {
    setSyncingId(sourceId);
    setError("");
    setSuccess("");

    try {
      const taskCount = await syncICalSource(sourceId);
      setSuccess(
        `"${sourceName}" erfolgreich synchronisiert! ${taskCount} Aufgaben importiert.`,
      );
      loadSources();
      onTasksUpdated();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        `Fehler beim Synchronisieren: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setSyncingId(null);
    }
  };

  const getTaskCount = (sourceId: string): number => {
    return getICalTasksForSource(sourceId).length;
  };

  const formatDate = (dateStr: string): string => {
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
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              iCal-Kalender verwalten
            </DialogTitle>
            <DialogDescription>
              Importieren Sie Aufgaben aus iCal-Links (z.B. Google Calendar,
              Outlook)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
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
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isAdding}
                  />
                </div>
                <div>
                  <Label htmlFor="ical-url">iCal URL</Label>
                  <Input
                    id="ical-url"
                    placeholder="https://calendar.google.com/calendar/ical/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    disabled={isAdding}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Die URL muss öffentlich zugänglich sein
                  </p>
                </div>
                <Button
                  onClick={handleAddSource}
                  disabled={isAdding || !newUrl.trim() || !newName.trim()}
                  className="w-full"
                >
                  {isAdding ? (
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Existing sources */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                Ihre iCal-Quellen ({sources.length})
              </h3>

              {sources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Noch keine iCal-Quellen vorhanden</p>
                  <p className="text-xs mt-1">
                    Fügen Sie oben eine neue Quelle hinzu
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((source) => (
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
                              Aufgaben:{" "}
                              <strong>{getTaskCount(source.id)}</strong>
                            </span>
                            {source.lastSynced && (
                              <span>
                                Zuletzt sync:{" "}
                                <strong>{formatDate(source.lastSynced)}</strong>
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
                            handleSyncSource(source.id, source.name)
                          }
                          disabled={syncingId === source.id}
                          className="flex-1"
                        >
                          {syncingId === source.id ? (
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
                            handleDeleteSource(source.id, source.name)
                          }
                          disabled={syncingId === source.id}
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
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tipps:</h4>
              <ul className="space-y-1 text-blue-800 text-xs">
                <li>
                  • <strong>Google Calendar:</strong> Einstellungen → Kalender →
                  Kalender integrieren → Geheime Adresse im iCal-Format
                </li>
                <li>
                  • <strong>Synchronisieren:</strong> Lädt alle Änderungen neu
                  und setzt lokale Bearbeitungen zurück
                </li>
                <li>
                  • <strong>Importierte Aufgaben:</strong> Können bearbeitet
                  werden, aber Sync setzt Änderungen zurück
                </li>
                <li>
                  • Die URL muss öffentlich zugänglich sein (keine
                  Authentifizierung erforderlich)
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Source Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteSource}
        title="iCal-Quelle löschen"
        description={
          sourceToDelete
            ? `Möchten Sie die iCal-Quelle "${sourceToDelete.name}" wirklich löschen? Alle importierten Aufgaben aus dieser Quelle werden ebenfalls gelöscht.`
            : ""
        }
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="danger"
      />
    </>
  );
}
