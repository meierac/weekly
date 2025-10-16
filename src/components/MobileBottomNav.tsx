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
  ChevronUp,
} from "lucide-react";

interface MobileBottomNavProps {
  weekSelector: React.ReactNode;
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
  weekSelector,
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;

    // If swiped up more than 50px, open the menu
    if (diff > 50 && !menuOpen) {
      setMenuOpen(true);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="px-3 py-2.5">
          {/* Swipe Indicator */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Single Row Layout */}
          <div className="flex items-center gap-2">
            {/* Week Navigation Section */}
            <div className="flex-1 flex justify-center min-w-0">
              {weekSelector}
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddTask}
                className="h-10 w-10 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
                title="Aufgabe hinzufügen"
              >
                <Plus className="h-5 w-5 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onNativeShare}
                className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
                title="Teilen"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
                title="Mehr Optionen"
              >
                <ChevronUp className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Aktionen</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {/* Add Task */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onAddTask();
                setMenuOpen(false);
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Aufgabe</span>
            </Button>

            {/* Preview */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onPreview();
                setMenuOpen(false);
              }}
            >
              <Eye className="h-5 w-5" />
              <span className="text-sm">Vorschau</span>
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onShare();
                setMenuOpen(false);
              }}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Teilen</span>
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onExport();
                setMenuOpen(false);
              }}
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Export</span>
            </Button>

            {/* Templates */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onTemplates();
                setMenuOpen(false);
              }}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Vorlagen</span>
            </Button>

            {/* iCal */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onIcal();
                setMenuOpen(false);
              }}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">iCal</span>
            </Button>

            {/* Sync All */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onSyncAll();
                setMenuOpen(false);
              }}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Sync</span>
            </Button>

            {/* About */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                onAbout();
                setMenuOpen(false);
              }}
            >
              <Info className="h-5 w-5" />
              <span className="text-sm">Info</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
