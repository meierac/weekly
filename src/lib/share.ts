import {
  createExportCanvas,
  type ExportOptions,
  BACKGROUND_IMAGES,
} from "./export";
import { loadExportSettings } from "./export-settings";

export interface ShareOptions {
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
  backgroundImage?: string;
  backgroundColor?: string;
}

/**
 * Share weekly agenda to WhatsApp
 */
export async function shareToWhatsApp(
  element: HTMLElement,
  weekInfo: { year: number; week: number },
  options: ShareOptions = {},
): Promise<void> {
  const text = `Mein Wochenplaner KW ${weekInfo.week} ${weekInfo.year}`;
  const encodedText = encodeURIComponent(text);

  // Try to share image if supported
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await generateImageBlob(element, options);
      const file = new File([blob], `wochenplan-kw${weekInfo.week}.png`, {
        type: "image/png",
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: text,
          text: text,
          files: [file],
        });
        return;
      }
    } catch (error) {
      console.log("Native share with image failed, falling back to URL", error);
    }
  }

  // Fallback: Open WhatsApp Web with text only
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank");
}

/**
 * Share weekly agenda to Telegram
 */
export async function shareToTelegram(
  element: HTMLElement,
  weekInfo: { year: number; week: number },
  options: ShareOptions = {},
): Promise<void> {
  const text = `Mein Wochenplaner KW ${weekInfo.week} ${weekInfo.year}`;
  const encodedText = encodeURIComponent(text);

  // Try to share image if supported
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await generateImageBlob(element, options);
      const file = new File([blob], `wochenplan-kw${weekInfo.week}.png`, {
        type: "image/png",
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: text,
          text: text,
          files: [file],
        });
        return;
      }
    } catch (error) {
      console.log("Native share with image failed, falling back to URL", error);
    }
  }

  // Fallback: Open Telegram Web with text only
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`;
  window.open(telegramUrl, "_blank");
}

/**
 * Generic share using Web Share API
 */
export async function shareWeeklyAgenda(
  element: HTMLElement,
  weekInfo: { year: number; week: number },
  options: ShareOptions = {},
): Promise<void> {
  const text = `Mein Wochenplaner KW ${weekInfo.week} ${weekInfo.year}`;

  if (!navigator.share) {
    throw new Error("Web Share API wird nicht unterstützt");
  }

  // Load saved settings and merge with provided options
  const savedSettings = loadExportSettings();

  // Get background image URL
  let backgroundImage = options.backgroundImage;
  if (!backgroundImage && savedSettings.backgroundType === "image") {
    if (savedSettings.selectedBackground === "custom") {
      backgroundImage = savedSettings.customBackground;
    } else if (savedSettings.selectedBackground) {
      const bg = BACKGROUND_IMAGES.find(
        (img) => img.id === savedSettings.selectedBackground,
      );
      backgroundImage = bg?.url;
    }
  }

  const mergedOptions: ShareOptions = {
    format: options.format || savedSettings.format,
    quality: options.quality || savedSettings.quality,
    scale: options.scale || savedSettings.scale,
    backgroundImage: backgroundImage,
    backgroundColor:
      options.backgroundColor ||
      (savedSettings.backgroundType === "color"
        ? savedSettings.backgroundColor
        : undefined),
  };

  try {
    const blob = await generateImageBlob(element, mergedOptions);
    const file = new File([blob], `wochenplan-kw${weekInfo.week}.png`, {
      type: "image/png",
    });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: text,
        text: text,
        files: [file],
      });
    } else {
      // Fallback: share text only
      await navigator.share({
        title: text,
        text: text,
      });
    }
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      throw error;
    }
    // User cancelled the share, ignore
  }
}

/**
 * Download image (fallback for desktop browsers)
 */
export async function downloadWeeklyImage(
  element: HTMLElement,
  weekInfo: { year: number; week: number },
  options: ShareOptions = {},
): Promise<void> {
  const blob = await generateImageBlob(element, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wochenplan-${weekInfo.year}-kw${weekInfo.week}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper function to generate image blob from element
 */
async function generateImageBlob(
  element: HTMLElement,
  options: ShareOptions = {},
): Promise<Blob> {
  // Load saved settings if no options provided
  const savedSettings = loadExportSettings();

  // Get background image URL
  let backgroundImage = options.backgroundImage;
  if (!backgroundImage && savedSettings.backgroundType === "image") {
    if (savedSettings.selectedBackground === "custom") {
      backgroundImage = savedSettings.customBackground;
    } else if (savedSettings.selectedBackground) {
      const bg = BACKGROUND_IMAGES.find(
        (img) => img.id === savedSettings.selectedBackground,
      );
      backgroundImage = bg?.url;
    }
  }

  const exportOptions: ExportOptions = {
    format: options.format || savedSettings.format,
    quality: options.quality
      ? options.quality / 100
      : savedSettings.quality / 100,
    filename: "temp", // Not used for blob generation
    scale: options.scale || savedSettings.scale,
    backgroundImage: backgroundImage,
    backgroundColor:
      options.backgroundColor ||
      (savedSettings.backgroundType === "color"
        ? savedSettings.backgroundColor
        : undefined),
  };

  const canvas = await createExportCanvas(element, exportOptions);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      `image/${exportOptions.format}`,
      exportOptions.quality,
    );
  });
}

/**
 * Check if Web Share API is supported
 */
export function isShareSupported(): boolean {
  return !!navigator.share;
}

/**
 * Check if sharing files is supported
 */
export function isFileShareSupported(): boolean {
  if (!navigator.canShare) return false;

  try {
    const testFile = new File(["test"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
