import ICAL from "ical.js";
import type { Task } from "./storage";

export interface ICalSource {
  id: string;
  url: string;
  name: string;
  addedAt: string;
  lastSynced?: string;
  color?: string;
}

export interface ICalTask extends Omit<Task, "id"> {
  sourceId: string; // Reference to the iCal source
  originalEventId: string; // UID from the iCal event
  location?: string;
  isImported: true;
}

const ICAL_SOURCES_KEY = "ical-sources";
const ICAL_TASKS_KEY = "ical-tasks";

// ICalSource Management
export function loadICalSources(): ICalSource[] {
  try {
    const data = localStorage.getItem(ICAL_SOURCES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading iCal sources:", error);
    return [];
  }
}

export function saveICalSources(sources: ICalSource[]): void {
  try {
    localStorage.setItem(ICAL_SOURCES_KEY, JSON.stringify(sources));
  } catch (error) {
    console.error("Error saving iCal sources:", error);
  }
}

export function addICalSource(url: string, name: string): ICalSource {
  const sources = loadICalSources();
  const newSource: ICalSource = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    url,
    name,
    addedAt: new Date().toISOString(),
    color: generateRandomColor(),
  };

  sources.push(newSource);
  saveICalSources(sources);
  return newSource;
}

export function deleteICalSource(sourceId: string): void {
  const sources = loadICalSources();
  const filteredSources = sources.filter((s) => s.id !== sourceId);
  saveICalSources(filteredSources);

  // Also delete all tasks from this source
  const tasks = loadICalTasks();
  const filteredTasks = tasks.filter((t) => t.sourceId !== sourceId);
  saveICalTasks(filteredTasks);
}

export function updateICalSourceSyncTime(sourceId: string): void {
  const sources = loadICalSources();
  const source = sources.find((s) => s.id === sourceId);
  if (source) {
    source.lastSynced = new Date().toISOString();
    saveICalSources(sources);
  }
}

// ICalTask Management
export function loadICalTasks(): ICalTask[] {
  try {
    const data = localStorage.getItem(ICAL_TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading iCal tasks:", error);
    return [];
  }
}

export function saveICalTasks(tasks: ICalTask[]): void {
  try {
    localStorage.setItem(ICAL_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving iCal tasks:", error);
  }
}

export function deleteICalTask(taskId: string): void {
  const tasks = loadICalTasks();
  // Extract sourceId and originalEventId from the task ID format: ical-{sourceId}-{originalEventId}
  const parts = taskId.split("-");
  if (parts.length < 3 || parts[0] !== "ical") return;

  const sourceId = parts[1];
  const originalEventId = parts.slice(2).join("-");

  const filteredTasks = tasks.filter(
    (t) => !(t.sourceId === sourceId && t.originalEventId === originalEventId),
  );
  saveICalTasks(filteredTasks);
}

export function getICalTasksForDate(date: string): ICalTask[] {
  const tasks = loadICalTasks();
  return tasks.filter((task) => task.date === date);
}

export function getICalTasksForSource(sourceId: string): ICalTask[] {
  const tasks = loadICalTasks();
  return tasks.filter((task) => task.sourceId === sourceId);
}

// Parse iCal data and extract events
export async function fetchAndParseICal(
  url: string,
  sourceId: string,
): Promise<ICalTask[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.statusText}`);
    }

    const icalData = await response.text();
    return parseICalData(icalData, sourceId);
  } catch (error) {
    console.error("Error fetching iCal:", error);
    throw error;
  }
}

export function parseICalData(icalData: string, sourceId: string): ICalTask[] {
  const tasks: ICalTask[] = [];

  try {
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    vevents.forEach((vevent) => {
      try {
        const event = new ICAL.Event(vevent);

        // Get event details
        const uid = event.uid || "";
        const summary = event.summary || "Untitled Event";
        const location = event.location || undefined;
        const startDate = event.startDate;
        const endDate = event.endDate;

        if (!startDate || !endDate) return;

        // Convert to local date/time
        const startJSDate = startDate.toJSDate();
        const endJSDate = endDate.toJSDate();

        // Format date as YYYY-MM-DD
        const date = startJSDate.toISOString().split("T")[0];

        // Format times as HH:MM
        const startTime = formatTime(startJSDate);
        const endTime = formatTime(endJSDate);

        // Create description with location if available
        let description = summary;
        if (location) {
          description = `${summary} @ ${location}`;
        }

        tasks.push({
          sourceId,
          originalEventId: uid,
          startTime,
          endTime,
          description,
          date,
          location,
          isImported: true,
        });
      } catch (eventError) {
        console.error("Error parsing event:", eventError);
      }
    });

    return tasks;
  } catch (error) {
    console.error("Error parsing iCal data:", error);
    throw error;
  }
}

// Sync iCal source (fetch and update tasks)
export async function syncICalSource(sourceId: string): Promise<number> {
  const sources = loadICalSources();
  const source = sources.find((s) => s.id === sourceId);

  if (!source) {
    throw new Error("iCal source not found");
  }

  try {
    // Fetch and parse new data
    const newTasks = await fetchAndParseICal(source.url, sourceId);

    // Remove old tasks from this source
    const allTasks = loadICalTasks();
    const otherTasks = allTasks.filter((t) => t.sourceId !== sourceId);

    // Save new tasks
    const updatedTasks = [...otherTasks, ...newTasks];
    saveICalTasks(updatedTasks);

    // Update sync time
    updateICalSourceSyncTime(sourceId);

    return newTasks.length;
  } catch (error) {
    console.error("Error syncing iCal source:", error);
    throw error;
  }
}

// Sync all iCal sources at once
export async function syncAllICalSources(): Promise<{
  totalSources: number;
  successCount: number;
  failedSources: string[];
  totalTasks: number;
}> {
  const sources = loadICalSources();
  const results = {
    totalSources: sources.length,
    successCount: 0,
    failedSources: [] as string[],
    totalTasks: 0,
  };

  for (const source of sources) {
    try {
      const taskCount = await syncICalSource(source.id);
      results.successCount++;
      results.totalTasks += taskCount;
    } catch (error) {
      console.error(`Failed to sync ${source.name}:`, error);
      results.failedSources.push(source.name);
    }
  }

  return results;
}

// Helper function to format time
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Helper function to generate random color for source
function generateRandomColor(): string {
  const colors = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get all imported tasks with their source info
export function getImportedTasksWithSource(): Array<
  ICalTask & { sourceName: string; sourceColor?: string }
> {
  const tasks = loadICalTasks();
  const sources = loadICalSources();

  return tasks.map((task) => {
    const source = sources.find((s) => s.id === task.sourceId);
    return {
      ...task,
      sourceName: source?.name || "Unknown Source",
      sourceColor: source?.color,
    };
  });
}

// Check if a task is imported from iCal
export function isImportedTask(task: Task | ICalTask): task is ICalTask {
  return "isImported" in task && task.isImported === true;
}
