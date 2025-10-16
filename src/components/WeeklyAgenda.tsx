import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { WeekSelector } from "@/components/WeekSelector";
import { TaskDialog } from "@/components/TaskDialog";
import { DroppableDay } from "@/components/DroppableDay";
import { TaskTemplatesSidebar } from "@/components/TaskTemplatesSidebar";
import { ICalManagement } from "@/components/ICalManagement";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AboutDialog } from "@/components/AboutDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DaySelectorSheet } from "@/components/DaySelectorSheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportDialog } from "@/components/ExportDialog";
import { ExportPreview } from "@/components/ExportPreview";
import { DraggableTaskTemplate } from "@/components/DraggableTaskTemplate";
import { BibleVerse } from "@/components/BibleVerse";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Download,
  Eye,
  Calendar,
  RefreshCw,
  Plus,
  MoreVertical,
  Info,
  Share2,
} from "lucide-react";
import { getCurrentWeek, getWeekDates, formatDateString } from "@/lib/utils";
import type { Task, TaskTemplate } from "@/lib/storage";
import {
  addTask,
  updateTask,
  deleteTask,
  getTasksForDate,
  createTaskFromTemplate,
} from "@/lib/storage";
import { syncAllICalSources, loadICalSources } from "@/lib/ical";
import { shareWeeklyAgenda } from "@/lib/share";

export function WeeklyAgenda() {
  const [currentWeekData, setCurrentWeekData] =
    React.useState(getCurrentWeek());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>();
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [weekTasks, setWeekTasks] = React.useState<Record<string, Task[]>>({});
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [icalManagementOpen, setIcalManagementOpen] = React.useState(false);
  const [isSyncingAll, setIsSyncingAll] = React.useState(false);
  const [draggedTemplate, setDraggedTemplate] =
    React.useState<TaskTemplate | null>(null);
  const [draggedTask, setDraggedTask] = React.useState<Task | null>(null);
  const [toolbarScrolled, setToolbarScrolled] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
  const [syncConfirmOpen, setSyncConfirmOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [daySelectorOpen, setDaySelectorOpen] = React.useState(false);

  const agendaRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const weekDates = React.useMemo(() => {
    return getWeekDates(currentWeekData.year, currentWeekData.week);
  }, [currentWeekData.year, currentWeekData.week]);

  const loadWeekTasks = React.useCallback(() => {
    const tasksMap: Record<string, Task[]> = {};
    weekDates.forEach((date) => {
      const dateStr = formatDateString(date);
      tasksMap[dateStr] = getTasksForDate(
        currentWeekData.year,
        currentWeekData.week,
        dateStr,
      );
    });
    setWeekTasks(tasksMap);
  }, [weekDates, currentWeekData.year, currentWeekData.week]);

  React.useEffect(() => {
    loadWeekTasks();
  }, [loadWeekTasks]);

  React.useEffect(() => {
    // Add scroll listener for toolbar shadow effect
    const handleScroll = () => {
      setToolbarScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWeekChange = (year: number, week: number) => {
    setCurrentWeekData({ year, week });
  };

  const handleAddTask = (date: string) => {
    setSelectedDate(date);
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleMobileAddTask = () => {
    setDaySelectorOpen(true);
  };

  const handleDaySelected = (dateStr: string) => {
    handleAddTask(dateStr);
  };

  const handleEditTask = (task: Task) => {
    setSelectedDate(task.date);
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(currentWeekData.year, currentWeekData.week, taskToDelete);
      loadWeekTasks();
      setTaskToDelete(null);
    }
  };

  const handleSaveTask = (taskData: {
    startTime: string;
    endTime: string;
    description: string;
    date: string;
  }) => {
    if (editingTask) {
      updateTask(
        currentWeekData.year,
        currentWeekData.week,
        editingTask.id,
        taskData,
      );
    } else {
      addTask(currentWeekData.year, currentWeekData.week, taskData);
    }
    loadWeekTasks();
  };

  const handleSyncAll = async () => {
    const sources = loadICalSources();
    if (sources.length === 0) {
      alert(
        "Keine iCal-Quellen vorhanden. Bitte fügen Sie zuerst eine Quelle hinzu.",
      );
      return;
    }

    setSyncConfirmOpen(true);
  };

  const confirmSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const results = await syncAllICalSources();
      loadWeekTasks();

      if (results.failedSources.length > 0) {
        alert(
          `Synchronisierung abgeschlossen!\n\n` +
            `Erfolgreich: ${results.successCount}/${results.totalSources}\n` +
            `Insgesamt ${results.totalTasks} Aufgaben importiert.\n\n` +
            `Fehler bei: ${results.failedSources.join(", ")}`,
        );
      } else {
        alert(
          `Alle ${results.totalSources} Quelle(n) erfolgreich synchronisiert!\n` +
            `${results.totalTasks} Aufgaben importiert.`,
        );
      }
    } catch (error) {
      alert(
        `Fehler beim Synchronisieren: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDropTemplate = (dateStr: string, startTime?: string) => {
    if (!draggedTemplate) return;

    const defaultStartTime = startTime || "09:00";

    createTaskFromTemplate(
      draggedTemplate,
      currentWeekData.year,
      currentWeekData.week,
      dateStr,
      defaultStartTime,
    );

    loadWeekTasks();
    setDraggedTemplate(null);
  };

  const handleDropTaskAtTime = (
    taskId: string,
    newDateStr: string,
    newStartTime: string,
  ) => {
    const task = Object.values(weekTasks)
      .flat()
      .find((t) => t.id === taskId);

    if (!task) return;

    // Calculate new end time based on original duration
    const originalStart = task.startTime.split(":").map(Number);
    const originalEnd = task.endTime.split(":").map(Number);
    const durationMinutes =
      originalEnd[0] * 60 +
      originalEnd[1] -
      (originalStart[0] * 60 + originalStart[1]);

    const newStartMinutes = newStartTime.split(":").map(Number);
    const totalNewStartMinutes = newStartMinutes[0] * 60 + newStartMinutes[1];
    const totalNewEndMinutes = totalNewStartMinutes + durationMinutes;

    const newEndHours = Math.floor(totalNewEndMinutes / 60);
    const newEndMins = totalNewEndMinutes % 60;
    const newEndTime = `${newEndHours.toString().padStart(2, "0")}:${newEndMins.toString().padStart(2, "0")}`;

    // Update the task
    updateTask(currentWeekData.year, currentWeekData.week, taskId, {
      date: newDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
    });

    loadWeekTasks();
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "template") {
      setDraggedTemplate(event.active.data.current.template);
      setDraggedTask(null);
    } else if (event.active.data.current?.type === "task") {
      setDraggedTask(event.active.data.current.task);
      setDraggedTemplate(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.data.current?.type === "day") {
      if (active.data.current?.type === "template") {
        const dateStr = over.data.current.dateStr;
        handleDropTemplate(dateStr);
      } else if (active.data.current?.type === "task") {
        const task = active.data.current.task;
        const newDateStr = over.data.current.dateStr;

        // If dropping on a different day or same day with different time
        if (task.date !== newDateStr) {
          // Move task to new day
          deleteTask(currentWeekData.year, currentWeekData.week, task.id);
          addTask(currentWeekData.year, currentWeekData.week, {
            startTime: task.startTime,
            endTime: task.endTime,
            description: task.description,
            date: newDateStr,
            templateId: task.templateId,
          });
          loadWeekTasks();
        }
      }
    }

    setDraggedTemplate(null);
    setDraggedTask(null);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleNativeShare = async () => {
    if (!agendaRef.current) return;

    try {
      await shareWeeklyAgenda(agendaRef.current, currentWeekData, {
        format: "png",
        quality: 95,
        scale: 2,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      if ((error as Error).message !== "AbortError") {
        alert("Fehler beim Teilen");
      }
    }
  };

  // Extract week data for preview
  const extractPreviewData = () => {
    if (!agendaRef.current)
      return {
        year: currentWeekData.year,
        week: currentWeekData.week,
        days: [],
        bibleVerse: null,
      };

    const dayElements = agendaRef.current.querySelectorAll(
      "[data-day-container]",
    );
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
    const bibleVerseElement = agendaRef.current.querySelector(
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

    return {
      year: currentWeekData.year,
      week: currentWeekData.week,
      days,
      bibleVerse,
    };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        {/* Desktop Navigation Bar - Apple Style */}
        <div
          className={`hidden md:block bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-40 transition-shadow duration-300 ${toolbarScrolled ? "shadow-md" : "shadow-sm"}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: App Title */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight hidden sm:block">
                  Wochenplaner
                </h1>
              </div>

              {/* Center: Week Navigation */}
              <div className="flex-1 flex justify-center px-4">
                <WeekSelector
                  year={currentWeekData.year}
                  week={currentWeekData.week}
                  onWeekChange={handleWeekChange}
                />
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Add Task Button - Quick action */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      title="Neue Aufgabe erstellen"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="ml-2 hidden xl:inline">Neu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      Aufgabe hinzufügen zu...
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {weekDates.map((date) => {
                      const dateStr = formatDateString(date);
                      const dayName = date.toLocaleDateString("de-DE", {
                        weekday: "long",
                      });
                      const dayDate = date.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                      });
                      const isToday = dateStr === formatDateString(new Date());

                      return (
                        <DropdownMenuItem
                          key={dateStr}
                          onClick={() => handleAddTask(dateStr)}
                          className="cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 mr-3 text-gray-600" />
                          <div className="flex flex-col">
                            <span
                              className={
                                isToday ? "font-semibold text-blue-600" : ""
                              }
                            >
                              {dayName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {dayDate}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Preview Button - Most used secondary action */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  className="h-9 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  title="Vorschau anzeigen"
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-2 hidden xl:inline">Vorschau</span>
                </Button>

                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShareDialogOpen(true)}
                  className="h-9 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  title="Teilen"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="ml-2 hidden xl:inline">Teilen</span>
                </Button>

                {/* More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      title="Weitere Optionen"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShareDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <Share2 className="h-4 w-4 mr-3 text-gray-600" />
                      <span>Wochenplan teilen</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSidebarOpen(true)}
                      className="cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4 mr-3 text-gray-600" />
                      <span>Vorlagen verwalten</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Kalender</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setIcalManagementOpen(true)}
                      className="cursor-pointer"
                    >
                      <Calendar className="h-4 w-4 mr-3 text-gray-600" />
                      <span>iCal-Kalender</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSyncAll}
                      disabled={isSyncingAll}
                      className="cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-3 text-gray-600 ${isSyncingAll ? "animate-spin" : ""}`}
                      />
                      <span>
                        {isSyncingAll
                          ? "Synchronisieren..."
                          : "Alle synchronisieren"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setAboutOpen(true)}
                      className="cursor-pointer"
                    >
                      <Info className="h-4 w-4 mr-3 text-gray-600" />
                      <span>Über die App</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-300" />

                {/* Primary Export Button */}
                <Button
                  size="sm"
                  onClick={handleExport}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exportieren</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          weekSelector={
            <WeekSelector
              year={currentWeekData.year}
              week={currentWeekData.week}
              onWeekChange={handleWeekChange}
            />
          }
          onAddTask={handleMobileAddTask}
          onPreview={handlePreview}
          onShare={() => setShareDialogOpen(true)}
          onNativeShare={handleNativeShare}
          onTemplates={() => setSidebarOpen(true)}
          onIcal={() => setIcalManagementOpen(true)}
          onSyncAll={handleSyncAll}
          onAbout={() => setAboutOpen(true)}
          onExport={handleExport}
          isSyncing={isSyncingAll}
        />

        {/* Day Selector Sheet for Mobile Add Task */}
        <DaySelectorSheet
          open={daySelectorOpen}
          onOpenChange={setDaySelectorOpen}
          weekDates={weekDates}
          onSelectDay={handleDaySelected}
          formatDateString={formatDateString}
        />

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="space-y-8" ref={agendaRef}>
            {/* Welcome Message */}
            {weekTasks &&
              Object.values(weekTasks).every((tasks) => tasks.length === 0) && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-10 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                    Willkommen bei Ihrem Wochenplaner!
                  </h3>
                  <p className="text-gray-600 max-w-lg mx-auto mb-8 text-base leading-relaxed">
                    Erstellen Sie Aufgaben-Vorlagen oder fügen Sie direkt
                    Aufgaben zu Ihren Tagen hinzu. Vorlagen können Sie einfach
                    per Drag & Drop auf die gewünschten Tage ziehen.
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button
                      onClick={() =>
                        handleAddTask(formatDateString(new Date()))
                      }
                      className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Erste Aufgabe hinzufügen
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSidebarOpen(true)}
                      className="h-11 px-6 rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Vorlagen erstellen
                    </Button>
                  </div>
                </div>
              )}

            {/* Days Grid - Responsive Layout */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {weekDates.map((date) => {
                const dateStr = formatDateString(date);
                const dayTasks = weekTasks[dateStr] || [];

                return (
                  <DroppableDay
                    key={dateStr}
                    dateStr={dateStr}
                    tasks={dayTasks}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onDropTemplate={handleDropTemplate}
                    onDropTaskAtTime={handleDropTaskAtTime}
                    draggedTask={draggedTask}
                  />
                );
              })}

              {/* Bible Verse as a column */}
              <BibleVerse />
            </div>
          </div>
        </div>

        {/* Task Dialog */}
        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveTask}
          task={editingTask}
          date={selectedDate}
        />

        {/* Templates Sidebar */}
        <TaskTemplatesSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* iCal Management Dialog */}
        <ICalManagement
          open={icalManagementOpen}
          onOpenChange={setIcalManagementOpen}
          onTasksUpdated={loadWeekTasks}
        />

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="w-full max-w-[500px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Export-Vorschau
              </DialogTitle>
              <DialogDescription>
                So wird Ihr exportiertes Wochenprogramm aussehen
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96">
              <ExportPreview weekData={extractPreviewData()} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          agendaElement={agendaRef.current}
          weekInfo={currentWeekData}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedTemplate && (
            <div className="transform rotate-2 opacity-90 scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 rounded-lg shadow-2xl">
                <DraggableTaskTemplate
                  template={draggedTemplate}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            </div>
          )}
          {draggedTask && (
            <div className="transform rotate-1 opacity-90 scale-105">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-0.5 rounded-lg shadow-2xl">
                <div className="bg-card border rounded-lg p-3 min-w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Aufgabe verschieben
                    </span>
                  </div>
                  <div className="text-xs font-medium text-primary mb-1">
                    {draggedTask.startTime} - {draggedTask.endTime}
                  </div>
                  <div className="text-sm text-foreground">
                    {draggedTask.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>

        {/* Delete Task Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDeleteTask}
          title="Aufgabe löschen"
          description="Sind Sie sicher, dass Sie diese Aufgabe löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
          confirmText="Löschen"
          cancelText="Abbrechen"
          variant="danger"
        />

        {/* Sync All Confirmation Dialog */}
        <ConfirmDialog
          open={syncConfirmOpen}
          onOpenChange={setSyncConfirmOpen}
          onConfirm={confirmSyncAll}
          title="Alle Quellen synchronisieren"
          description="Möchten Sie alle iCal-Quellen synchronisieren? Alle lokalen Änderungen an importierten Aufgaben werden zurückgesetzt."
          confirmText="Synchronisieren"
          cancelText="Abbrechen"
          variant="warning"
        />

        {/* About Dialog */}
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

        {/* Share Dialog */}
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          agendaElement={agendaRef.current}
          weekInfo={currentWeekData}
        />
      </div>
    </DndContext>
  );
}
