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
import type { Task } from "@/lib/storage";

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

  React.useEffect(() => {
    if (task) {
      setStartTime(task.startTime);
      setEndTime(task.endTime);
      setDescription(task.description);
    } else {
      setStartTime("");
      setEndTime("");
      setDescription("");
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
      onOpenChange(false);
    }
  };

  const formatTimeForInput = (time: string) => {
    if (!time) return "";
    // Convert from display format (e.g., "14:00") to input format
    return time;
  };

  const parseTimeInput = (time: string) => {
    if (!time) return "";
    // Convert from input format to display format
    return time;
  };

  return (
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
  );
}
