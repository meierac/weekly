import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import type { TaskTemplate } from "@/lib/storage";

interface DraggableTaskTemplateProps {
  template: TaskTemplate;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (templateId: string) => void;
}

export function DraggableTaskTemplate({
  template,
  onEdit,
  onDelete,
}: DraggableTaskTemplateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: template.id,
      data: {
        type: "template",
        template,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "z-50" : ""
      }`}
    >
      {/* Color indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: template.color }}
      />

      {/* Drag handle - now just visual indicator */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-30 group-hover:opacity-70 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="pl-6 pr-16">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-sm text-foreground leading-tight">
            {template.name}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded text-xs">
            {template.category}
          </span>
          <span>{formatDuration(template.defaultDuration)}</span>
          {template.usageCount > 0 && (
            <span className="text-xs">({template.usageCount}x verwendet)</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(template);
          }}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
