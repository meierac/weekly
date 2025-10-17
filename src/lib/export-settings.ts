export interface ExportSettings {
  format: "png" | "jpeg";
  quality: number; // 1-100 for UI, converted to 0-1 for jpeg
  backgroundType: "image" | "color" | "none";
  selectedBackground: string; // ID of predefined background or "custom"
  customBackground?: string; // Base64 of custom uploaded image
  backgroundColor: string; // Hex color for solid background
  scale: number; // Resolution multiplier (1-3)
}

const EXPORT_SETTINGS_KEY = "export-settings";

const DEFAULT_SETTINGS: ExportSettings = {
  format: "png",
  quality: 90,
  backgroundType: "none",
  selectedBackground: "",
  backgroundColor: "#ffffff",
  scale: 2,
};

export function loadExportSettings(): ExportSettings {
  try {
    const data = localStorage.getItem(EXPORT_SETTINGS_KEY);
    if (data) {
      const settings = JSON.parse(data);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading export settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function saveExportSettings(settings: ExportSettings): void {
  try {
    localStorage.setItem(EXPORT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving export settings:", error);
  }
}

export function resetExportSettings(): void {
  try {
    localStorage.removeItem(EXPORT_SETTINGS_KEY);
  } catch (error) {
    console.error("Error resetting export settings:", error);
  }
}
