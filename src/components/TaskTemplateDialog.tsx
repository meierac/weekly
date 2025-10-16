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
import type { TaskTemplate } from "@/lib/storage";

interface TaskTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: {
    name: string;
    description: string;
    defaultDuration: number;
    category?: string;
    color?: string;
  }) => void;
  template?: TaskTemplate;
}

const CATEGORIES = [
  "Arbeit",
  "Privat",
  "Sport",
  "Haushalt",
  "Termine",
  "Sonstiges",
];

const COLORS = [
  { name: "Blau", value: "#3b82f6" },
  { name: "Grün", value: "#10b981" },
  { name: "Rot", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Lila", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Grau", value: "#6b7280" },
];

const DURATIONS = [
  { label: "15 Min", value: 15 },
  { label: "30 Min", value: 30 },
  { label: "45 Min", value: 45 },
  { label: "1 Std", value: 60 },
  { label: "1.5 Std", value: 90 },
  { label: "2 Std", value: 120 },
  { label: "3 Std", value: 180 },
  { label: "4 Std", value: 240 },
];

export function TaskTemplateDialog({
  open,
  onOpenChange,
  onSave,
  template,
}: TaskTemplateDialogProps) {
  const [name, setName] = React.useState(template?.name || "");
  const [description, setDescription] = React.useState(
    template?.description || "",
  );
  const [defaultDuration, setDefaultDuration] = React.useState(
    template?.defaultDuration || 60,
  );
  const [category, setCategory] = React.useState(
    template?.category || "Privat",
  );
  const [color, setColor] = React.useState(
    template?.color || COLORS[0].value,
  );

  React.useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setDefaultDuration(template.defaultDuration);
      setCategory(template.category || "Privat");
      setColor(template.color || COLORS[0].value);
    } else {
      setName("");
      setDescription("");
      setDefaultDuration(60);
      setCategory("Privat");
      setColor(COLORS[0].value);
    }
  }, [template, open]);

  const handleSave = () => {
    if (name.trim() && description.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        defaultDuration,
        category,
        color,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Vorlage bearbeiten" : "Neue Aufgaben-Vorlage"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? "Bearbeiten Sie Ihre Aufgaben-Vorlage."
              : "Erstellen Sie eine wiederverwendbare Aufgaben-Vorlage."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-name" className="text-right">
              Name
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="z.B. Morgen-Workout"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-description" className="text-right">
              Beschreibung
            </Label>
            <Input
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="z.B. 30min Krafttraining"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-duration" className="text-right">
              Dauer
            </Label>
            <Select
              value={defaultDuration.toString()}
              onValueChange={(value) => setDefaultDuration(parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-category" className="text-right">
              Kategorie
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-color" className="text-right">
              Farbe
            </Label>
            <div className="col-span-3 flex gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption.value
                      ? "border-gray-800 border-2"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
