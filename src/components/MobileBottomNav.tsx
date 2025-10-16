import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Eye,
  Share2,
  BookOpen,
  Calendar,
  RefreshCw,
  Info,
  Download,
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
  onTemplates: () => void;
  onIcal: () => void;
  onSyncAll: () => void;
  onAbout: () => void;
  onExport: () => void;
  isSyncing?: boolean;
}

export function MobileBottomNav({
  year,
  week,
  onWeekChange,
  onAddTask,
  onPreview,
  onShare,
  onNativeShare,
  onTemplates,
  onIcal,
  onSyncAll,
  onAbout,
  onExport,
  isSyncing = false,
}: MobileBottomNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;

    // Prevent background scrolling when swiping up on the toolbar
    if (diff > 10) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If swiped up more than 50px, open the menu
    if (diff > 50 && !menuOpen) {
      setMenuOpen(true);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Prevent passive event listener warning and ensure touch events are cancelable
  React.useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const preventScroll = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startY = touch.clientY;

      const handleMove = (moveEvent: TouchEvent) => {
        const moveY = moveEvent.touches[0].clientY;
        const diff = startY - moveY;

        // Prevent scroll if swiping up
        if (diff > 0) {
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

  return (
    <>
      {/* Floating Bottom Navigation Bar - iOS 18 Style */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none px-2"
        style={{
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          ref={toolbarRef}
          className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl pointer-events-auto touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        >
          <div className="px-2 py-2">
            {/* Swipe Indicator */}
            <div className="flex justify-center mb-1.5">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Single Row Layout - Share | Week Selector | Add */}
            <div className="flex items-center">
              {/* Left: Share Button (centered in its space) */}
              <div className="flex-1 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onNativeShare}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
                  title="Teilen"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
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

              {/* Right: Add Button (centered in its space) */}
              <div className="flex-1 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddTask}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
                  title="Aufgabe hinzufügen"
                >
                  <Plus className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[75vh] pb-safe">
          <SheetHeader>
            <SheetTitle>Aktionen</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {/* Add Task */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onAddTask();
                setMenuOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Aufgabe</span>
            </Button>

            {/* Preview */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onPreview();
                setMenuOpen(false);
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs">Vorschau</span>
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onShare();
                setMenuOpen(false);
              }}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Teilen</span>
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onExport();
                setMenuOpen(false);
              }}
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">Export</span>
            </Button>

            {/* Templates */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onTemplates();
                setMenuOpen(false);
              }}
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Vorlagen</span>
            </Button>

            {/* iCal */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onIcal();
                setMenuOpen(false);
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
                setMenuOpen(false);
              }}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="text-xs">Sync</span>
            </Button>

            {/* About */}
            <Button
              variant="outline"
              className="h-16 flex-col gap-1.5"
              onClick={() => {
                onAbout();
                setMenuOpen(false);
              }}
            >
              <Info className="h-4 w-4" />
              <span className="text-xs">Info</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
