import { useDroppable } from "@dnd-kit/core";
import { TaskList } from "@/components/TaskList";
import { Target, Calendar } from "lucide-react";
import type { Task } from "@/lib/storage";

interface DroppableDayProps {
  dateStr: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDropTaskAtTime: (
    taskId: string,
    newDateStr: string,
    newStartTime: string,
  ) => void;
  draggedTask?: Task | null;
}

export function DroppableDay({
  dateStr,
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTaskAtTime,
  draggedTask,
}: DroppableDayProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateStr}`,
    data: {
      type: "day",
      dateStr,
    },
  });

  const formatGermanDate = (dateStr: string) => {
    // Parse date string as local date to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const months = [
      "Jan",
      "Feb",
      "Mär",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dez",
    ];

    const weekday = date.toLocaleDateString("de-DE", { weekday: "long" });
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];

    return { weekday, day: dayNum, month: monthName };
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    // Parse date string as local date to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isWeekend = (dateStr: string) => {
    // Parse date string as local date to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const dateInfo = formatGermanDate(dateStr);
  const today = isToday(dateStr);
  const weekend = isWeekend(dateStr);

  // Generate time slots for drop zones
  // Reduced set for mobile optimization
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  return (
    <div
      ref={setNodeRef}
      data-day-container
      data-date={dateStr}
      data-day-name={dateInfo.weekday}
      className={`
        bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md
        ${
          isOver
            ? draggedTask
              ? "ring-2 ring-green-500 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
              : "ring-2 ring-blue-500 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
            : today
              ? "border-blue-400 dark:border-blue-600 shadow-blue-100"
              : weekend
                ? "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                : "border-gray-200 dark:border-gray-700"
        }
      `}
    >
      {/* Day Header */}
      <div
        className={`
        px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-100 dark:border-gray-700 rounded-t-xl
        ${today ? "bg-blue-50 dark:bg-blue-900/20" : weekend ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-800"}
      `}
      >
        <div className="flex items-center space-x-2 md:space-x-2.5">
          <div
            className={`
              flex flex-col items-center justify-center w-10 h-10 md:w-9 md:h-9 rounded-lg md:rounded-md
              ${
                today
                  ? "bg-blue-600 text-white shadow-sm"
                  : weekend
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }
            `}
          >
            <span className="text-base md:text-base font-bold md:font-semibold leading-none">
              {dateInfo.day}
            </span>
            <span className="text-[10px] leading-none mt-0.5">
              {dateInfo.month}
            </span>
          </div>
          <div>
            <h3
              className={`
                text-sm md:text-sm font-semibold
                ${today ? "text-blue-900 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"}
              `}
            >
              {dateInfo.weekday}
            </h3>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-3 md:p-4">
        {tasks.length > 0 ? (
          <TaskList
            tasks={tasks}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ) : (
          <div className="text-center py-6 md:py-4">
            <Calendar
              className={`
              h-6 w-6 md:h-5 md:w-5 mx-auto mb-2 md:mb-1.5
              ${weekend ? "text-gray-300 dark:text-gray-600" : "text-gray-400 dark:text-gray-500"}
            `}
            />
            <p className="text-gray-400 dark:text-gray-500 text-xs md:text-xs">
              {weekend ? "Frei" : "Keine Aktivitäten"}
            </p>
          </div>
        )}

        {/* Drop zones for specific times when dragging tasks */}
        {isOver && draggedTask && (
          <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="border-2 border-dashed rounded-md p-3 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Neue Zeit für die Aktivität wählen:
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-1.5">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        onDropTaskAtTime(draggedTask.id, dateStr, time);
                      }}
                      className="px-2 py-2 md:px-2 md:py-1.5 text-xs md:text-xs font-medium rounded-md md:rounded transition-all active:scale-95 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 active:bg-green-100 dark:active:bg-green-900/40"
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onDropTaskAtTime(draggedTask.id, dateStr, "09:00");
                    }}
                    className="w-full px-3 py-2 text-xs font-medium rounded-md transition-all bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"
                  >
                    Auf 09:00 Uhr setzen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
