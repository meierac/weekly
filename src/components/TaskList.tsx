import { DraggableTask } from "@/components/DraggableTask";
import type { Task } from "@/lib/storage";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onEditTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  // Sort tasks by start time for better visual organization
  const sortedTasks = [...tasks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-2 md:space-y-3">
      {sortedTasks.map((task) => (
        <div key={task.id} className="relative">
          <DraggableTask
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </div>
      ))}
    </div>
  );
}
