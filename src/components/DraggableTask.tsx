import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  GripVertical,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import type { Task } from "@/lib/storage";
import { loadICalSources } from "@/lib/ical";

interface DraggableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function DraggableTask({ task, onEdit, onDelete }: DraggableTaskProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: "task",
        task,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    };

    if (startTime === endTime) {
      return `All-Day`;
    }

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Get source info if this is an imported task
  const getSourceInfo = () => {
    if (task.isImported && task.sourceId) {
      const sources = loadICalSources();
      const source = sources.find(
        (s: { id: string; name?: string; color?: string }) =>
          s.id === task.sourceId,
      );
      return source;
    }
    return undefined;
  };

  const sourceInfo = getSourceInfo();

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-container
      data-task-id={task.id}
      data-start-time={task.startTime}
      data-end-time={task.endTime}
      data-description={task.description}
      data-is-imported={task.isImported}
      className={`
        group relative bg-white rounded-lg md:rounded-md border transition-all duration-200
        ${
          task.isImported
            ? "border-blue-200 hover:border-blue-300"
            : "border-gray-200 hover:border-gray-300"
        }
        ${isDragging ? "shadow-lg rotate-1 scale-105" : "shadow-sm"}
        cursor-grab active:cursor-grabbing
      `}
    >
      {/* Colored accent bar for imported tasks */}
      {task.isImported && sourceInfo?.color && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-md"
          style={{ backgroundColor: sourceInfo.color }}
        />
      )}

      {/* Drag handle - hidden on mobile */}
      <div
        {...listeners}
        {...attributes}
        className={`
          hidden md:block absolute left-2 top-1/2 transform -translate-y-1/2
          opacity-0 group-hover:opacity-40 transition-opacity duration-200
          ${task.isImported ? "left-2.5" : "left-2"}
        `}
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* Main content */}
      <div
        className={`p-3 md:p-3 ${task.isImported ? "pl-4 md:pl-5" : "pl-3 md:pl-7"} pr-3 md:pr-14`}
      >
        {/* Time and iCal indicator */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-500" />
              <span
                className="text-xs md:text-xs font-semibold text-gray-900"
                data-task-time
              >
                {formatTimeRange(task.startTime, task.endTime)}
              </span>
            </div>
            {task.isImported && (
              <div title="iCal Import">
                <Calendar className="h-4 w-4 md:h-3.5 md:w-3.5 text-blue-600" />
              </div>
            )}
          </div>

          {/* Mobile action buttons - always visible */}
          <div className="flex md:hidden items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
              title="Aktivität bearbeiten"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmOpen(true);
              }}
              className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
              title={
                task.isImported ? "Aus Ansicht entfernen" : "Aktivität löschen"
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Task description */}
        <div className="mb-1.5">
          <h4
            className="text-sm md:text-sm font-medium text-gray-900 leading-snug"
            data-task-description
          >
            {task.description}
          </h4>
          {task.location && (
            <div className="flex items-center space-x-1 text-xs text-gray-600 mt-0.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{task.location}</span>
            </div>
          )}
        </div>

        {/* Template indicator */}
        {task.templateId && !task.isImported && (
          <div className="flex items-center space-x-1 text-[10px] text-purple-600">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Vorlage</span>
          </div>
        )}
      </div>

      {/* Action buttons - Desktop only (hover to show) */}
      <div className="hidden md:block absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <div className="flex items-center space-x-0.5 bg-white rounded-md shadow-sm border border-gray-200 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Aktivität bearbeiten"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-3.5 bg-gray-200" />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmOpen(true);
            }}
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            title={
              task.isImported ? "Aus Ansicht entfernen" : "Aktivität löschen"
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Dragging indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-md border-2 border-blue-400 border-dashed" />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => onDelete(task.id)}
        title={task.isImported ? "Aus Ansicht entfernen" : "Aktivität löschen"}
        description={
          task.isImported
            ? "Diese importierte Aktivität wird aus der lokalen Ansicht entfernt, aber beim nächsten Sync möglicherweise wieder hinzugefügt. Möchten Sie fortfahren?"
            : "Sind Sie sicher, dass Sie diese Aktivität löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        }
        confirmText={task.isImported ? "Entfernen" : "Löschen"}
        cancelText="Abbrechen"
        variant={task.isImported ? "warning" : "danger"}
      />
    </div>
  );
}
