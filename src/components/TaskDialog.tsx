import * as React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TemplateSelector } from "@/components/TemplateSelector";
import { BookOpen } from "lucide-react";
import type { Task, TaskTemplate } from "@/lib/storage";
import { addTaskTemplate } from "@/lib/storage";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: {
    startTime: string;
    endTime: string;
    description: string;
    date: string;
  }) => void;
  task?: Task;
  date: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSave,
  task,
  date,
}: TaskDialogProps) {
  const [startTime, setStartTime] = React.useState(task?.startTime || "");
  const [endTime, setEndTime] = React.useState(task?.endTime || "");
  const [description, setDescription] = React.useState(task?.description || "");
  const [useAsTemplate, setUseAsTemplate] = React.useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setStartTime(task.startTime);
      setEndTime(task.endTime);
      setDescription(task.description);
      setUseAsTemplate(false);
    } else {
      setStartTime("");
      setEndTime("");
      setDescription("");
      setUseAsTemplate(false);
    }
  }, [task, open]);

  const handleSave = () => {
    if (startTime && endTime && description) {
      onSave({
        startTime,
        endTime,
        description,
        date,
      });

      // If "Use as Template" is checked, save as template
      if (useAsTemplate && !task) {
        const duration = calculateDuration(startTime, endTime);
        addTaskTemplate({
          name: description,
          description: description,
          defaultDuration: duration,
          category: "Andere",
        });
      }

      onOpenChange(false);
    }
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    setDescription(template.description);

    // Calculate end time based on template duration
    if (startTime) {
      const endTimeCalculated = calculateEndTime(
        startTime,
        template.defaultDuration,
      );
      setEndTime(endTimeCalculated);
    } else {
      // Set a default start time and calculate end time
      const defaultStart = "09:00";
      setStartTime(defaultStart);
      setEndTime(calculateEndTime(defaultStart, template.defaultDuration));
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  };

  const calculateEndTime = (start: string, durationMinutes: number): string => {
    const [hours, minutes] = start.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const formatTimeForInput = (time: string) => {
    if (!time) return "";
    return time;
  };

  const parseTimeInput = (time: string) => {
    if (!time) return "";
    return time;
  };

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-[425px]">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {task ? "Aktivität bearbeiten" : "Neue Aktivität"}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {task
                ? "Bearbeiten Sie Ihre Aktivität."
                : "Fügen Sie eine neue Aktivität hinzu."}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            {/* Template Selector Button */}
            {!task && (
              <div className="mb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTemplateSelectorOpen(true)}
                  className="w-full gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Aus Vorlage auswählen
                </Button>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Startzeit
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formatTimeForInput(startTime)}
                onChange={(e) => setStartTime(parseTimeInput(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                Endzeit
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formatTimeForInput(endTime)}
                onChange={(e) => setEndTime(parseTimeInput(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Beschreibung
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="z.B. Haus putzen"
              />
            </div>

            {/* Use as Template Checkbox */}
            {!task && (
              <div className="grid grid-cols-4 items-center gap-4 pt-2">
                <div className="col-start-2 col-span-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useAsTemplate"
                      checked={useAsTemplate}
                      onCheckedChange={(checked: boolean) =>
                        setUseAsTemplate(checked)
                      }
                    />
                    <Label
                      htmlFor="useAsTemplate"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Als Vorlage speichern
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" onClick={handleSave}>
              Speichern
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Template Selector */}
      <TemplateSelector
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}
