import { loadICalTasks, deleteICalTask } from "./ical";

export interface Task {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  templateId?: string; // Reference to task template if created from one
  location?: string; // Location (mainly for imported iCal events)
  isImported?: boolean; // Flag to indicate if task is imported from iCal
  sourceId?: string; // Reference to iCal source if imported
  originalEventId?: string; // UID from iCal event if imported
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultDuration: number; // in minutes
  category?: string;
  color?: string;
  createdAt: string;
  usageCount: number;
}

export interface WeeklyAgenda {
  year: number;
  week: number;
  tasks: Task[];
}

const STORAGE_KEY = "weekly-agenda-data";
const TEMPLATES_KEY = "task-templates";

export function loadAgendaData(): WeeklyAgenda[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading agenda data:", error);
    return [];
  }
}

export function saveAgendaData(agendas: WeeklyAgenda[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agendas));
  } catch (error) {
    console.error("Error saving agenda data:", error);
  }
}

export function getWeekAgenda(year: number, week: number): WeeklyAgenda {
  const agendas = loadAgendaData();
  let weekAgenda = agendas.find((a) => a.year === year && a.week === week);

  if (!weekAgenda) {
    weekAgenda = { year, week, tasks: [] };
    agendas.push(weekAgenda);
    saveAgendaData(agendas);
  }

  return weekAgenda;
}

export function addTask(
  year: number,
  week: number,
  task: Omit<Task, "id">,
): Task {
  const agendas = loadAgendaData();
  let weekAgenda = agendas.find((a) => a.year === year && a.week === week);

  if (!weekAgenda) {
    weekAgenda = { year, week, tasks: [] };
    agendas.push(weekAgenda);
  }

  const newTask: Task = {
    ...task,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };

  weekAgenda.tasks.push(newTask);
  saveAgendaData(agendas);

  return newTask;
}

export function updateTask(
  year: number,
  week: number,
  taskId: string,
  updates: Partial<Omit<Task, "id">>,
): void {
  const agendas = loadAgendaData();
  const weekAgenda = agendas.find((a) => a.year === year && a.week === week);

  if (weekAgenda) {
    const taskIndex = weekAgenda.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      weekAgenda.tasks[taskIndex] = {
        ...weekAgenda.tasks[taskIndex],
        ...updates,
      };
      saveAgendaData(agendas);
    }
  }
}

export function deleteTask(year: number, week: number, taskId: string): void {
  // Check if this is an iCal task (ID format: ical-{sourceId}-{originalEventId})
  if (taskId.startsWith("ical-")) {
    deleteICalTask(taskId);
    return;
  }

  // Handle regular tasks
  const agendas = loadAgendaData();
  const weekAgenda = agendas.find((a) => a.year === year && a.week === week);

  if (weekAgenda) {
    weekAgenda.tasks = weekAgenda.tasks.filter((t) => t.id !== taskId);
    saveAgendaData(agendas);
  }
}

export function getTasksForDate(
  year: number,
  week: number,
  date: string,
): Task[] {
  const weekAgenda = getWeekAgenda(year, week);
  const regularTasks = weekAgenda.tasks.filter((task) => task.date === date);

  // Get iCal tasks for the same date
  const icalTasks = loadICalTasks();
  const icalTasksForDate = icalTasks
    .filter((task) => task.date === date)
    .map(
      (icalTask): Task => ({
        // Create a unique ID for iCal tasks using a consistent format
        id: `ical-${icalTask.sourceId}-${icalTask.originalEventId}`,
        startTime: icalTask.startTime,
        endTime: icalTask.endTime,
        description: icalTask.description,
        date: icalTask.date,
        location: icalTask.location,
        isImported: icalTask.isImported,
        sourceId: icalTask.sourceId,
        originalEventId: icalTask.originalEventId,
      }),
    );

  // Combine regular tasks and iCal tasks, then sort by start time
  return [...regularTasks, ...icalTasksForDate].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
}

// Task Templates Management
export function loadTaskTemplates(): TaskTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading task templates:", error);
    return [];
  }
}

export function saveTaskTemplates(templates: TaskTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error saving task templates:", error);
  }
}

export function addTaskTemplate(
  template: Omit<TaskTemplate, "id" | "createdAt" | "usageCount">,
): TaskTemplate {
  const templates = loadTaskTemplates();
  const newTemplate: TaskTemplate = {
    ...template,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };

  templates.push(newTemplate);
  saveTaskTemplates(templates);
  return newTemplate;
}

export function updateTaskTemplate(
  templateId: string,
  updates: Partial<Omit<TaskTemplate, "id">>,
): void {
  const templates = loadTaskTemplates();
  const templateIndex = templates.findIndex((t) => t.id === templateId);

  if (templateIndex !== -1) {
    templates[templateIndex] = { ...templates[templateIndex], ...updates };
    saveTaskTemplates(templates);
  }
}

export function deleteTaskTemplate(templateId: string): void {
  const templates = loadTaskTemplates();
  const filteredTemplates = templates.filter((t) => t.id !== templateId);
  saveTaskTemplates(filteredTemplates);
}

export function incrementTemplateUsage(templateId: string): void {
  const templates = loadTaskTemplates();
  const template = templates.find((t) => t.id === templateId);

  if (template) {
    template.usageCount += 1;
    saveTaskTemplates(templates);
  }
}

export function createTaskFromTemplate(
  template: TaskTemplate,
  year: number,
  week: number,
  date: string,
  startTime: string,
): Task {
  // Calculate end time based on template duration
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + template.defaultDuration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

  const task = addTask(year, week, {
    startTime,
    endTime,
    description: template.description,
    date,
    templateId: template.id,
  });

  incrementTemplateUsage(template.id);
  return task;
}
