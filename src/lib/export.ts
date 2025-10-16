import html2canvas from "html2canvas";
import { isBibleVerseEnabled } from "./bible-verse";

export interface ExportOptions {
  format: "png" | "jpeg";
  quality?: number; // 0-1 for jpeg
  backgroundImage?: string; // URL or base64
  backgroundColor?: string;
  scale?: number; // Resolution multiplier
  filename?: string;
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  category: "nature" | "abstract" | "minimal" | "custom";
  preview: string;
}

// Predefined background images
export const BACKGROUND_IMAGES: BackgroundImage[] = [
  {
    id: "gradient-blue",
    name: "Blauer Verlauf",
    url: "linear-gradient(to bottom, #4f46e5, #7c3aed)",
    category: "abstract",
    preview: "linear-gradient(to bottom, #4f46e5, #7c3aed)",
  },
  {
    id: "gradient-green",
    name: "Grüner Verlauf",
    url: "linear-gradient(to bottom, #10b981, #059669)",
    category: "abstract",
    preview: "linear-gradient(to bottom, #10b981, #059669)",
  },
  {
    id: "gradient-sunset",
    name: "Sonnenuntergang",
    url: "linear-gradient(to bottom, #f59e0b, #ef4444)",
    category: "abstract",
    preview: "linear-gradient(to bottom, #f59e0b, #ef4444)",
  },
  {
    id: "gradient-purple",
    name: "Lila Verlauf",
    url: "linear-gradient(to bottom, #8b5cf6, #a855f7)",
    category: "abstract",
    preview: "linear-gradient(to bottom, #8b5cf6, #a855f7)",
  },
  {
    id: "gradient-ocean",
    name: "Ozean Verlauf",
    url: "linear-gradient(to bottom, #0ea5e9, #0284c7)",
    category: "abstract",
    preview: "linear-gradient(to bottom, #0ea5e9, #0284c7)",
  },
  {
    id: "minimal-white",
    name: "Minimales Weiß",
    url: "#ffffff",
    category: "minimal",
    preview: "#ffffff",
  },
  {
    id: "minimal-light-gray",
    name: "Helles Grau",
    url: "#f8fafc",
    category: "minimal",
    preview: "#f8fafc",
  },
  {
    id: "elegant-beige",
    name: "Elegantes Beige",
    url: "linear-gradient(to bottom, #f7f3f0, #e8ddd4)",
    category: "minimal",
    preview: "linear-gradient(to bottom, #f7f3f0, #e8ddd4)",
  },
  {
    id: "soft-cream",
    name: "Weiches Creme",
    url: "#faf9f7",
    category: "minimal",
    preview: "#faf9f7",
  },
];

export function downloadImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: "png" | "jpeg",
  quality?: number,
): void {
  const link = document.createElement("a");
  link.download = filename;

  if (format === "jpeg") {
    link.href = canvas.toDataURL("image/jpeg", quality || 0.9);
  } else {
    link.href = canvas.toDataURL("image/png");
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function createExportCanvas(
  element: HTMLElement,
  options: ExportOptions,
): Promise<HTMLCanvasElement> {
  const { backgroundImage, backgroundColor = "#ffffff", scale = 2 } = options;

  // Create structured layout for export
  const exportElement = createStructuredWeeklyLayout(element, backgroundImage);

  // Apply mobile-friendly styles
  exportElement.style.position = "absolute";
  exportElement.style.left = "-9999px";
  exportElement.style.top = "0";
  exportElement.style.width = "375px"; // iPhone width
  exportElement.style.maxWidth = "375px";
  exportElement.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  exportElement.style.fontSize = "13px";
  exportElement.style.lineHeight = "1.3";
  exportElement.style.padding = "20px";
  exportElement.style.boxSizing = "border-box";

  // Apply background
  if (backgroundImage) {
    if (
      backgroundImage.startsWith("linear-gradient") ||
      backgroundImage.startsWith("radial-gradient")
    ) {
      exportElement.style.background = backgroundImage;
    } else if (backgroundImage.startsWith("#")) {
      exportElement.style.backgroundColor = backgroundImage;
    } else {
      exportElement.style.backgroundImage = `url(${backgroundImage})`;
      exportElement.style.backgroundSize = "cover";
      exportElement.style.backgroundPosition = "center";
      exportElement.style.backgroundRepeat = "no-repeat";
    }
  } else if (backgroundColor) {
    exportElement.style.backgroundColor = backgroundColor;
  }

  document.body.appendChild(exportElement);

  try {
    const canvas = await html2canvas(exportElement, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor:
        backgroundImage && !backgroundImage.startsWith("#")
          ? null
          : backgroundColor,
      width: 375,
      height: exportElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 375,
      windowHeight: 812, // iPhone height
      ignoreElements: (element) => {
        return element.classList?.contains("export-ignore") || false;
      },
      onclone: (clonedDoc) => {
        // Ensure CSS gradients are properly applied in the cloned document
        const clonedElement = clonedDoc.querySelector(
          '[style*="linear-gradient"], [style*="radial-gradient"]',
        );
        if (clonedElement && backgroundImage) {
          if (
            backgroundImage.startsWith("linear-gradient") ||
            backgroundImage.startsWith("radial-gradient")
          ) {
            (clonedElement as HTMLElement).style.background = backgroundImage;
          }
        }
      },
    });

    return canvas;
  } finally {
    document.body.removeChild(exportElement);
  }
}

export async function exportWeeklyAgenda(
  element: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const {
    format = "png",
    quality = 0.9,
    filename = `Wochenplaner-${new Date().toISOString().split("T")[0]}`,
  } = options;

  try {
    const canvas = await createExportCanvas(element, options);
    const finalFilename = `${filename}.${format}`;
    downloadImage(canvas, finalFilename, format, quality);
  } catch (error) {
    console.error("Error exporting agenda:", error);
    throw new Error("Fehler beim Exportieren der Agenda");
  }
}

export function createStructuredWeeklyLayout(
  element: HTMLElement,
  backgroundImage?: string,
): HTMLElement {
  // Extract week information and tasks from the original element
  const weekData = extractWeekData(element);

  // Extract matching colors from background if possible
  const colorScheme = extractBackgroundColors(backgroundImage);

  // Load Lavishly Yours, Lora and Source Code Pro fonts from Google Fonts with optimized weights
  const lavishlyYoursFontLink = document.createElement("link");
  lavishlyYoursFontLink.href =
    "https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap";
  lavishlyYoursFontLink.rel = "stylesheet";
  lavishlyYoursFontLink.setAttribute("preload", "");
  document.head.appendChild(lavishlyYoursFontLink);

  const loraFontLink = document.createElement("link");
  loraFontLink.href =
    "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap";
  loraFontLink.rel = "stylesheet";
  loraFontLink.setAttribute("preload", "");
  document.head.appendChild(loraFontLink);

  const googleSansLink = document.createElement("link");
  googleSansLink.href =
    "https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600&display=swap";
  googleSansLink.rel = "stylesheet";
  googleSansLink.setAttribute("preload", "");
  document.head.appendChild(googleSansLink);

  const container = document.createElement("div");
  container.style.cssText = `
    width: 375px;
    font-family: 'Manrope', Georgia, 'Times New Roman', serif;
    background: transparent;
    padding: 6px 8px;
    box-sizing: border-box;
    min-height: 667px;
    max-height: 800px;
    position: relative;
    overflow: hidden;
  `;

  // Ultra-compact Header with Background
  const header = document.createElement("div");
  header.style.cssText = `
    text-align: center;
    margin-bottom: 12px;
  `;

  // Header without background - direct container
  const headerContainer = document.createElement("div");
  headerContainer.style.cssText = `
    padding: 6px 10px;
    margin-bottom: 2px;
  `;

  const title = document.createElement("h1");
  title.textContent = "Wochenprogramm";
  title.style.cssText = `
    font-size: 48px;
    font-weight: 400;
    font-family: 'Lavishly Yours', cursive;
    color: ${colorScheme.primary};
    margin: 0 0 20px 0;
    line-height: 1.0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    letter-spacing: 0.5px;
  `;

  const weekInfo = document.createElement("div");
  weekInfo.textContent = `Kalenderwoche ${weekData.week}`;
  weekInfo.style.cssText = `
    font-size: 12px;
    font-weight: 500;
    font-family: 'Manrope', Georgia, serif;
    color: ${colorScheme.secondary};
    margin: 0;
    opacity: 0.8;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    letter-spacing: 0.3px;
  `;

  headerContainer.appendChild(title);
  headerContainer.appendChild(weekInfo);
  header.appendChild(headerContainer);
  container.appendChild(header);

  // Include all 7 days of the week (Monday through Sunday)
  const allWeekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const allDays = allWeekdays.map((dayName) => {
    const existingDay = weekData.days.find((d) => d.dayName === dayName);
    return existingDay || { dayName, date: "", tasks: [] };
  });

  // Ultra-compact Days Grid
  allDays.forEach((day, index) => {
    const dayContainer = document.createElement("div");
    dayContainer.style.cssText = `
      margin-bottom: ${index === allDays.length - 1 ? "0" : "4px"};
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.71);
      box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.1);
      border-radius: 12px;
    `;

    // Day header with more transparent background and blur
    const dayHeader = document.createElement("div");
    dayHeader.style.cssText = `
      padding: 2px 12px 6px 12px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: none;
      position: relative;
      overflow: hidden;
      gap: 4px;
    `;

    const dateText = document.createElement("div");
    dateText.textContent = day.date || getDayName(day.dayName);
    dateText.style.cssText = `
      font-size: 12px;
      font-weight: 700;
      font-family: 'Manrope', Georgia, serif;
      color: ${colorScheme.primary};
    `;

    const dayNameText = document.createElement("div");
    dayNameText.textContent = getDayName(day.dayName);
    dayNameText.style.cssText = `
      font-size: 12px;
      font-weight: 700;
      font-family: 'Manrope', Georgia, serif;
      color: ${colorScheme.primary};
      letter-spacing: 0.4px;
    `;

    dayHeader.appendChild(dayNameText);
    dayHeader.appendChild(dateText);
    dayContainer.appendChild(dayHeader);

    // Tasks container with more transparent background and blur
    const tasksContainer = document.createElement("div");
    tasksContainer.style.cssText = `
      border-top: none;
      min-height: 20px;
      position: relative;
    `;

    if (day.tasks.length > 0) {
      tasksContainer.style.padding = "4px 6px";

      day.tasks.forEach((task, taskIndex) => {
        const taskElement = document.createElement("div");
        taskElement.style.cssText = `
          margin-bottom: ${taskIndex === day.tasks.length - 1 ? "12px" : "2px"};
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 0px;
          align-items: start;
          justify-content: center;
          line-height: 1.1;
        `;

        const timeElement = document.createElement("div");

        // Format time: hh:mm-hh:mm or "All-Day" if start equals end
        let timeText = task.time.replace("Uhr", "").trim();

        // Handle various time formats (space dash space, just dash, etc.)
        const timeParts = timeText.split(/\s*-\s*/);
        if (timeParts.length === 2) {
          const startTime = timeParts[0].trim();
          const endTime = timeParts[1].trim();
          if (startTime === endTime) {
            timeText = "All-Day";
          } else {
            timeText = `${startTime}-${endTime}`;
          }
        } else if (timeParts.length === 1 && timeParts[0].trim()) {
          // Single time or malformed, treat as all-day
          timeText = "All-Day";
        }

        timeElement.textContent = timeText;
        timeElement.style.cssText = `
          font-weight: 500;
          color: ${colorScheme.text};
          font-size: 9px;
          text-align: left;
          justify-content: center;
          padding-left: 7px;
          padding-top: 2px;
          width: 75px;
          font-family: 'Geologica', -apple-system, BlinkMacSystemFont, sans-serif;
        `;

        const descriptionElement = document.createElement("div");
        descriptionElement.textContent = task.description;
        descriptionElement.style.cssText = `
          color: ${colorScheme.text};
          font-weight: 400;
          font-size: 10px;
          font-family: 'Manrope', Georgia, serif;
          padding: 1px 3px;
          word-wrap: break-word;
          line-height: 1.3;
        `;

        taskElement.appendChild(timeElement);
        taskElement.appendChild(descriptionElement);
        tasksContainer.appendChild(taskElement);
      });
    } else {
      // Empty day with subtle indicator
      tasksContainer.style.padding = "6px";
      tasksContainer.style.textAlign = "center";

      const emptyText = document.createElement("div");
      emptyText.textContent = "Frei";
      emptyText.style.cssText = `
        color: ${colorScheme.secondary};
        font-size: 9px;
        font-weight: 500;
        font-family: 'Manrope', Georgia, serif;
        font-style: italic;
        opacity: 0.6;
        padding: 2px 6px;
        display: inline-block;
      `;

      tasksContainer.appendChild(emptyText);
    }

    dayContainer.appendChild(tasksContainer);
    container.appendChild(dayContainer);
  });

  // Add Bible Verse if present and enabled
  if (weekData.bibleVerse && isBibleVerseEnabled()) {
    const bibleVerseContainer = document.createElement("div");
    bibleVerseContainer.style.cssText = `
      margin-top: 10px;
      background: rgba(255, 255, 255, 0);
      padding: 8px 12px;
    `;

    const bibleVerseHeader = document.createElement("div");
    bibleVerseHeader.textContent = "";
    bibleVerseHeader.style.cssText = `
      font-size: 10px;
      font-weight: 600;
      color: ${colorScheme.primary};
      margin-bottom: 4px;
      font-family: 'Manrope', Georgia, serif;
    `;

    const verseText = document.createElement("blockquote");
    verseText.textContent = `"${weekData.bibleVerse.text}"`;
    verseText.style.cssText = `
      font-size: 9px;
      color: ${colorScheme.text};
      font-style: italic;
      margin: 0 0 3px 0;
      line-height: 1.3;
      text-align: center;
      font-family: 'Manrope', Georgia, serif;
    `;

    const verseReference = document.createElement("cite");
    verseReference.textContent = `— ${weekData.bibleVerse.reference}`;
    verseReference.style.cssText = `
      font-size: 8px;
      color: ${colorScheme.secondary};
      font-weight: 500;
      text-align: center;
      display: block;
      font-family: 'Manrope', Georgia, serif;
    `;

    bibleVerseContainer.appendChild(bibleVerseHeader);
    bibleVerseContainer.appendChild(verseText);
    bibleVerseContainer.appendChild(verseReference);
    container.appendChild(bibleVerseContainer);
  }

  return container;
}

function getDayName(shortName: string): string {
  const dayNames: Record<string, string> = {
    Mo: "Montag",
    Di: "Dienstag",
    Mi: "Mittwoch",
    Do: "Donnerstag",
    Fr: "Freitag",
    Sa: "Samstag",
    So: "Sonntag",
  };
  return dayNames[shortName] || shortName;
}

function extractBackgroundColors(backgroundImage?: string): {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
} {
  // High contrast default color scheme for maximum readability
  let colors = {
    primary: "#1a1a1a",
    secondary: "#4a4a4a",
    accent: "#2563eb",
    text: "#2d2d2d",
  };

  if (!backgroundImage) return colors;

  // Enhanced color schemes with high contrast for readability
  if (
    backgroundImage.includes("f7f3f0") ||
    backgroundImage.includes("beige") ||
    backgroundImage.includes("elegant-beige")
  ) {
    // Beige background - high contrast warm tones
    colors = {
      primary: "#5d2e0a",
      secondary: "#8b4513",
      accent: "#b8860b",
      text: "#3d1a00",
    };
  } else if (
    backgroundImage.includes("blue") ||
    backgroundImage.includes("4f46e5") ||
    backgroundImage.includes("gradient-blue") ||
    backgroundImage.includes("ocean")
  ) {
    // Blue background - high contrast cool tones
    colors = {
      primary: "#0f172a",
      secondary: "#1e293b",
      accent: "#1d4ed8",
      text: "#0c1426",
    };
  } else if (
    backgroundImage.includes("green") ||
    backgroundImage.includes("10b981") ||
    backgroundImage.includes("gradient-green")
  ) {
    // Green background - high contrast nature tones
    colors = {
      primary: "#052e16",
      secondary: "#064e3b",
      accent: "#047857",
      text: "#022c0e",
    };
  } else if (
    backgroundImage.includes("sunset") ||
    backgroundImage.includes("f59e0b") ||
    backgroundImage.includes("gradient-sunset")
  ) {
    // Sunset background - high contrast warm tones
    colors = {
      primary: "#7c2d12",
      secondary: "#92400e",
      accent: "#ea580c",
      text: "#5c1a08",
    };
  } else if (
    backgroundImage.includes("purple") ||
    backgroundImage.includes("8b5cf6") ||
    backgroundImage.includes("gradient-purple")
  ) {
    // Purple background - high contrast purple tones
    colors = {
      primary: "#3730a3",
      secondary: "#4c1d95",
      accent: "#7c3aed",
      text: "#312e81",
    };
  } else if (
    backgroundImage.includes("f8f9fa") ||
    backgroundImage.includes("ffffff") ||
    backgroundImage.includes("faf9f7") ||
    backgroundImage.includes("minimal") ||
    backgroundImage.includes("cream")
  ) {
    // Light backgrounds - maximum contrast grays
    colors = {
      primary: "#111827",
      secondary: "#374151",
      accent: "#4f46e5",
      text: "#0f0f0f",
    };
  }

  return colors;
}

function extractWeekData(element: HTMLElement): {
  week: number;
  days: Array<{
    date: string;
    dayName: string;
    tasks: Array<{ time: string; description: string }>;
  }>;
  bibleVerse?: { text: string; reference: string } | null;
} {
  const weekMatch = element.textContent?.match(/KW\s*(\d+)/);
  const week = weekMatch ? parseInt(weekMatch[1]) : new Date().getWeek();

  const dayElements = element.querySelectorAll("[data-day-container]");
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

    // Include all days, even if they have no tasks
    days.push({
      date: formattedDate,
      dayName: dayNameMap[dayName] || dayName.slice(0, 2),
      tasks,
    });
  });

  // Extract Bible verse data
  let bibleVerse = null;
  const bibleVerseElement = element.querySelector(
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
        const reference = verseRefElement.textContent?.replace("— ", "") || "";
        if (text && reference) {
          bibleVerse = { text, reference };
        }
      }
    }
  }

  return { week, days, bibleVerse };
}

// Add week number to Date prototype if not exists
declare global {
  interface Date {
    getWeek(): number;
  }
}

if (!Date.prototype.getWeek) {
  Date.prototype.getWeek = function () {
    const d = new Date(
      Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };
}

export function createMobileOptimizedElement(
  element: HTMLElement,
): HTMLElement {
  return createStructuredWeeklyLayout(element);
}

export async function loadImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}
