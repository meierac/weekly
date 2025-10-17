import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Download, Upload, Image as ImageIcon, Eye } from "lucide-react";
import {
  BACKGROUND_IMAGES,
  exportWeeklyAgenda,
  loadImageAsBase64,
  validateImageFile,
  type ExportOptions,
} from "@/lib/export";
import { ExportPreview } from "@/components/ExportPreview";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendaElement: HTMLElement | null;
  weekInfo: { year: number; week: number };
}

export function ExportDialog({
  open,
  onOpenChange,
  agendaElement,
  weekInfo,
}: ExportDialogProps) {
  const [format, setFormat] = React.useState<"png" | "jpeg">("png");
  const [quality, setQuality] = React.useState(90);
  const [filename, setFilename] = React.useState(
    `Wochenplaner-${weekInfo.year}-KW${weekInfo.week}`,
  );
  const [selectedBackground, setSelectedBackground] =
    React.useState<string>("");
  const [customBackground, setCustomBackground] = React.useState<string>("");
  const [backgroundColor, setBackgroundColor] = React.useState("#ffffff");
  const [scale, setScale] = React.useState(2);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(true);

  const handleFileUpload = async (
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
      setCustomBackground(base64);
      setSelectedBackground("custom");
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Fehler beim Laden des Bildes");
    }
  };

  const getBackgroundForExport = (): string | undefined => {
    if (selectedBackground === "custom" && customBackground) {
      return customBackground;
    }
    if (selectedBackground && selectedBackground !== "none") {
      const bg = BACKGROUND_IMAGES.find((img) => img.id === selectedBackground);
      return bg?.url;
    }
    return undefined;
  };

  const handleExport = async () => {
    if (!agendaElement) return;

    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        quality: format === "jpeg" ? quality / 100 : undefined,
        filename,
        scale,
        backgroundImage: getBackgroundForExport(),
        backgroundColor:
          selectedBackground === "none" ? backgroundColor : undefined,
      };

      await exportWeeklyAgenda(agendaElement, options);
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Fehler beim Exportieren. Bitte versuchen Sie es erneut.");
    } finally {
      setIsExporting(false);
    }
  };

  React.useEffect(() => {
    setFilename(`Wochenplaner-${weekInfo.year}-KW${weekInfo.week}`);
  }, [weekInfo]);

  // Extract week data for preview
  const extractPreviewData = () => {
    if (!agendaElement)
      return {
        year: weekInfo.year,
        week: weekInfo.week,
        days: [],
        bibleVerse: null,
      };

    const dayElements = agendaElement.querySelectorAll("[data-day-container]");
    const days: Array<{
      date: string;
      dayName: string;
      tasks: Array<{ time: string; description: string }>;
    }> = [];

    dayElements.forEach((dayElement) => {
      const dayName = dayElement.getAttribute("data-day-name") || "";
      const dateStr = dayElement.getAttribute("data-date") || "";

      // Format date for display (DD.MM)
      const date = new Date(dateStr);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;

      const tasks: Array<{ time: string; description: string }> = [];
      const taskElements = dayElement.querySelectorAll("[data-task-container]");

      taskElements.forEach((taskElement) => {
        const startTime = taskElement.getAttribute("data-start-time") || "";
        const endTime = taskElement.getAttribute("data-end-time") || "";
        const description = taskElement.getAttribute("data-description") || "";

        if (startTime && endTime && description) {
          const timeFormatted = `${startTime}- ${endTime}Uhr`;
          tasks.push({
            time: timeFormatted,
            description: description,
          });
        }
      });

      // Convert full day names to abbreviations
      const dayNameMap: Record<string, string> = {
        Sonntag: "So",
        Montag: "Mo",
        Dienstag: "Di",
        Mittwoch: "Mi",
        Donnerstag: "Do",
        Freitag: "Fr",
        Samstag: "Sa",
      };

      // Include all days, even if they have no tasks
      days.push({
        date: formattedDate,
        dayName: dayNameMap[dayName] || dayName.slice(0, 2),
        tasks,
      });
    });

    // Extract Bible verse data
    let bibleVerse = null;
    const bibleVerseElement = agendaElement.querySelector(
      "[data-bible-verse-container]",
    );
    if (bibleVerseElement) {
      const isEnabled =
        bibleVerseElement.getAttribute("data-bible-verse-enabled") === "true";
      if (isEnabled) {
        const verseTextElement =
          bibleVerseElement.querySelector("[data-verse-text]");
        const verseRefElement = bibleVerseElement.querySelector(
          "[data-verse-reference]",
        );
        if (verseTextElement && verseRefElement) {
          const text = verseTextElement.textContent?.replace(/"/g, "") || "";
          const reference =
            verseRefElement.textContent?.replace("— ", "") || "";
          if (text && reference) {
            bibleVerse = { text, reference };
          }
        }
      }
    }

    return { year: weekInfo.year, week: weekInfo.week, days, bibleVerse };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Wochenplaner exportieren
          </DialogTitle>
          <DialogDescription>
            Exportieren Sie Ihren Wochenplaner als strukturiertes Bild im
            eleganten Weekly-Design für mobile Geräte optimiert.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select
              value={format}
              onValueChange={(value: "png" | "jpeg") => setFormat(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (verlustfrei)</SelectItem>
                <SelectItem value="jpeg">JPEG (kleiner)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality for JPEG */}
          {format === "jpeg" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quality" className="text-right">
                Qualität
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  id="quality"
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-12">{quality}%</span>
              </div>
            </div>
          )}

          {/* Filename */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right">
              Dateiname
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Resolution */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scale" className="text-right">
              Auflösung
            </Label>
            <Select
              value={scale.toString()}
              onValueChange={(value) => setScale(parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Standard (1x)</SelectItem>
                <SelectItem value="2">Hoch (2x) - Empfohlen</SelectItem>
                <SelectItem value="3">Sehr hoch (3x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hintergrund</Label>

            {/* Background Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBackground("none")}
                className={`p-3 border-2 rounded-lg transition-all ${
                  selectedBackground === "none"
                    ? "border-primary"
                    : "border-muted"
                }`}
              >
                <div className="w-full h-12 bg-white border rounded mb-2"></div>
                <span className="text-xs">Einfarbig</span>
              </button>

              {BACKGROUND_IMAGES.slice(0, 5).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    selectedBackground === bg.id
                      ? "border-primary"
                      : "border-muted"
                  }`}
                >
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{
                      background: bg.preview,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  ></div>
                  <span className="text-xs">{bg.name}</span>
                </button>
              ))}

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className={`w-full p-3 border-2 rounded-lg transition-all ${
                    selectedBackground === "custom"
                      ? "border-primary"
                      : "border-muted border-dashed"
                  }`}
                >
                  {customBackground ? (
                    <>
                      <div
                        className="w-full h-12 rounded mb-2 bg-cover bg-center"
                        style={{ backgroundImage: `url(${customBackground})` }}
                      ></div>
                      <span className="text-xs">Eigenes Bild</span>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-12 border-2 border-dashed rounded mb-2 flex items-center justify-center">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-xs">Hochladen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Color picker for solid background */}
            {selectedBackground === "none" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="bgcolor" className="text-sm">
                  Farbe:
                </Label>
                <input
                  id="bgcolor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-8 border rounded cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  {backgroundColor}
                </span>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Vorschau</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
              </Button>
            </div>

            {showPreview && (
              <ExportPreview
                weekData={extractPreviewData()}
                backgroundImage={getBackgroundForExport()}
              />
            )}

            {!showPreview && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4 inline mr-1" />
                  Das exportierte Bild zeigt "Wochenprogramm" mit Kalenderwoche,
                  Montag bis Freitag mit Aktivitäten, durchscheinenden
                  Hintergründen und passenden Schriftfarben (375px breit).
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            onClick={handleExport}
            disabled={!agendaElement || isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Exportiere...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
