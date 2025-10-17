import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DaySelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekDates: Date[];
  onSelectDay: (dateStr: string) => void;
  formatDateString: (date: Date) => string;
}

export function DaySelectorSheet({
  open,
  onOpenChange,
  weekDates,
  onSelectDay,
  formatDateString,
}: DaySelectorSheetProps) {
  const handleDaySelect = (date: Date) => {
    const dateStr = formatDateString(date);
    onSelectDay(dateStr);
    onOpenChange(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isWeekend = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tag auswählen
          </SheetTitle>
          <SheetDescription>
            Wählen Sie einen Tag für die neue Aktivität
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 gap-2 mt-6 pb-2">
          {weekDates.map((date) => {
            const today = isToday(date);
            const weekend = isWeekend(date);
            const dayName = date.toLocaleDateString("de-DE", {
              weekday: "long",
            });
            const dayDate = date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <Button
                key={date.toISOString()}
                variant={today ? "default" : "outline"}
                className={`h-16 justify-start px-4 ${
                  today
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : weekend
                      ? "border-gray-200 hover:border-gray-300"
                      : "hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => handleDaySelect(date)}
              >
                <div className="flex items-center gap-4 w-full">
                  <div
                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                      today
                        ? "bg-white/20 text-white"
                        : weekend
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">
                      {date.getDate()}
                    </span>
                    <span className="text-xs leading-none mt-0.5">
                      {date.toLocaleDateString("de-DE", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-semibold">{dayName}</span>
                    <span
                      className={`text-sm ${today ? "text-white/80" : "text-gray-500"}`}
                    >
                      {dayDate}
                    </span>
                  </div>
                  {today && (
                    <div className="ml-auto">
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                        Heute
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
