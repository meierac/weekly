import * as React from "react";
import { X, Maximize2, Minus } from "lucide-react";

interface CustomTitleBarProps {
  title?: string;
  className?: string;
}

export function CustomTitleBar({
  title = "Wochenplaner",
  className = "",
}: CustomTitleBarProps) {
  const [isMaximized, setIsMaximized] = React.useState(false);

  // Check if running as standalone PWA on Windows
  const isStandalonePWA = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  // Only show on Windows PWA
  if (!isStandalonePWA) return null;

  const handleMinimize = () => {
    // In PWA, we can't actually minimize, but we can hide the content
    // This is a limitation of web apps
    console.log("Minimize requested");
  };

  const handleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("Error attempting to enable fullscreen:", err);
      });
      setIsMaximized(true);
    } else {
      document.exitFullscreen();
      setIsMaximized(false);
    }
  };

  const handleClose = () => {
    // In PWA, we can close the window
    window.close();
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 select-none z-50 ${className}`}
      style={
        {
          WebkitAppRegion: "drag",
          appRegion: "drag",
        } as React.CSSProperties
      }
    >
      {/* Left: App Logo and Title */}
      <div className="flex items-center gap-3">
        <img
          src="/weekly/favicon.svg"
          alt="Weekly Planner"
          className="w-6 h-6"
          style={
            {
              WebkitAppRegion: "no-drag",
              appRegion: "no-drag",
            } as React.CSSProperties
          }
        />
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>

      {/* Right: Window Controls */}
      <div
        className="flex items-center"
        style={
          {
            WebkitAppRegion: "no-drag",
            appRegion: "no-drag",
          } as React.CSSProperties
        }
      >
        <button
          onClick={handleMinimize}
          className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Minimize"
          aria-label="Minimize window"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
          aria-label={isMaximized ? "Restore window" : "Maximize window"}
        >
          <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-12 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          title="Close"
          aria-label="Close window"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
