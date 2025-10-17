import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Share2,
  Calendar,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react";
import { MobileWeekSelector } from "@/components/MobileWeekSelector";

interface MobileBottomNavProps {
  year: number;
  week: number;
  onWeekChange: (year: number, week: number) => void;
  onAddTask: () => void;
  onPreview: () => void;
  onShare: () => void;
  onNativeShare: () => void;
  onSettings: () => void;
  onIcal: () => void;
  onSyncAll: () => void;
  onExport: () => void;
  isSyncing?: boolean;
}

export function MobileBottomNav({
  year,
  week,
  onWeekChange,
  onAddTask,
  onPreview,
  onNativeShare,
  onSettings,
  onIcal,
  onSyncAll,
  onExport,
  isSyncing = false,
}: MobileBottomNavProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const collapsedHeight = 72; // Approximate height of collapsed toolbar
  const expandedHeight = 450; // Approximate height when fully expanded (fits all buttons)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);

    const diff = startY - touchY; // Positive when swiping up

    // Prevent background scrolling when swiping
    if (Math.abs(diff) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Update drag offset for smooth animation
    if (isExpanded) {
      // When expanded, allow dragging down
      if (diff < 0) {
        setDragOffset(Math.max(diff, -(expandedHeight - collapsedHeight)));
      }
    } else {
      // When collapsed, allow dragging up
      if (diff > 0) {
        setDragOffset(Math.min(diff, expandedHeight - collapsedHeight));
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diff = startY - currentY;

    // Determine if we should toggle expanded state based on drag distance
    if (Math.abs(diff) > 50) {
      if (diff > 0 && !isExpanded) {
        // Swiped up while collapsed - expand
        setIsExpanded(true);
      } else if (diff < 0 && isExpanded) {
        // Swiped down while expanded - collapse
        setIsExpanded(false);
      }
    }

    // Reset drag offset
    setDragOffset(0);
  };

  // Prevent passive event listener warning
  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const preventScroll = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startY = touch.clientY;

      const handleMove = (moveEvent: TouchEvent) => {
        const moveY = moveEvent.touches[0].clientY;
        const diff = Math.abs(startY - moveY);

        // Prevent scroll if dragging vertically
        if (diff > 10) {
          moveEvent.preventDefault();
        }
      };

      toolbar.addEventListener("touchmove", handleMove, { passive: false });

      const cleanup = () => {
        toolbar.removeEventListener("touchmove", handleMove);
      };

      toolbar.addEventListener("touchend", cleanup, { once: true });
      toolbar.addEventListener("touchcancel", cleanup, { once: true });
    };

    toolbar.addEventListener("touchstart", preventScroll, { passive: true });

    return () => {
      toolbar.removeEventListener("touchstart", preventScroll);
    };
  }, []);

  // Calculate the dynamic height based on expanded state and drag offset
  const getToolbarHeight = () => {
    if (isDragging) {
      if (isExpanded) {
        return expandedHeight + dragOffset;
      } else {
        return collapsedHeight + dragOffset;
      }
    }
    return isExpanded ? expandedHeight : collapsedHeight;
  };

  return (
    <>
      {/* Expandable Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none px-2"
        style={{
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          ref={toolbarRef}
          className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl pointer-events-auto touch-none overflow-hidden transition-all"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "none",
            height: `${getToolbarHeight()}px`,
            transition: isDragging ? "none" : "height 0.3s ease-out",
          }}
        >
          <div className="px-2 py-2 h-full flex flex-col">
            {/* Drag Handle */}
            {/*<div className="flex justify-center mb-1.5 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>*/}

            {/* Main Toolbar Content - Single Row Layout */}
            <div className="flex items-center mb-3">
              {/* Left: Share Button */}
              <div className="flex-1 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onNativeShare}
                  className="h-auto px-2 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 flex-col gap-0.5"
                  title="Teilen"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                  <span className="text-[10px] text-gray-600">Teilen</span>
                </Button>
              </div>

              {/* Center: Week Selector */}
              <div className="flex justify-center px-2">
                <MobileWeekSelector
                  year={year}
                  week={week}
                  onWeekChange={onWeekChange}
                />
              </div>

              {/* Right: Add Button */}
              <div className="flex-1 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddTask}
                  className="h-auto px-2 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 flex-col gap-0.5"
                  title="Aktivität hinzufügen"
                >
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] text-blue-600">Aktivität</span>
                </Button>
              </div>
            </div>

            {/* Expanded Menu Content */}
            <div
              className="flex-1 px-2"
              style={{
                opacity: isExpanded ? 1 : 0,
                transition: isDragging ? "none" : "opacity 0.2s ease-out",
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              <div className="mb-3">
                <div className="w-full h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pb-2">
                {/* Preview */}
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1.5"
                  onClick={() => {
                    onPreview();
                    setIsExpanded(false);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">Vorschau</span>
                </Button>

                {/* Export */}
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1.5"
                  onClick={() => {
                    onExport();
                    setIsExpanded(false);
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs">Export</span>
                </Button>

                {/* Settings */}
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1.5"
                  onClick={() => {
                    onSettings();
                    setIsExpanded(false);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Einstellungen</span>
                </Button>

                {/* iCal */}
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1.5"
                  onClick={() => {
                    onIcal();
                    setIsExpanded(false);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">iCal</span>
                </Button>

                {/* Sync All */}
                <Button
                  variant="outline"
                  className="h-16 flex-col gap-1.5"
                  onClick={() => {
                    onSyncAll();
                    setIsExpanded(false);
                  }}
                  disabled={isSyncing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  <span className="text-xs">Sync</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
