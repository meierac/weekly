import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getWeekNumber } from "@/lib/utils";

interface WeekSelectorProps {
  year: number;
  week: number;
  onWeekChange: (year: number, week: number) => void;
}

export function WeekSelector({ year, week, onWeekChange }: WeekSelectorProps) {
  const currentYear = new Date().getFullYear();
  const currentWeek = getWeekNumber(new Date());
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const getWeeksInYear = (year: number) => {
    const dec31 = new Date(year, 11, 31);
    const weekNum = getWeekNumber(dec31);
    return weekNum === 1 ? 52 : weekNum;
  };

  const maxWeeks = getWeeksInYear(year);
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  const handlePreviousWeek = () => {
    if (week > 1) {
      onWeekChange(year, week - 1);
    } else {
      const prevYear = year - 1;
      const prevYearWeeks = getWeeksInYear(prevYear);
      onWeekChange(prevYear, prevYearWeeks);
    }
  };

  const handleNextWeek = () => {
    if (week < maxWeeks) {
      onWeekChange(year, week + 1);
    } else {
      onWeekChange(year + 1, 1);
    }
  };

  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear);
    const newMaxWeeks = getWeeksInYear(yearNum);
    const newWeek = week > newMaxWeeks ? newMaxWeeks : week;
    onWeekChange(yearNum, newWeek);
  };

  const handleWeekChange = (newWeek: string) => {
    onWeekChange(year, parseInt(newWeek));
  };

  const goToCurrentWeek = () => {
    onWeekChange(currentYear, currentWeek);
  };

  const isCurrentWeek = year === currentYear && week === currentWeek;

  // Format date range for current week
  const getWeekDateRange = () => {
    // ISO 8601: Week 1 is the week with the first Thursday of the year
    // Start with January 4th (always in week 1)
    const jan4 = new Date(year, 0, 4);

    // Find the Monday of week 1
    const dayOfWeek = jan4.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() + daysToMonday);

    // Calculate the Monday of the target week
    const monday = new Date(week1Monday);
    monday.setDate(week1Monday.getDate() + (week - 1) * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      });
    };

    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      {/* Navigation buttons */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousWeek}
          className="h-9 w-9 md:h-8 md:w-8 p-0 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          title="Vorherige Woche"
        >
          <ChevronLeft className="h-5 w-5 md:h-4 md:w-4 text-gray-600" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextWeek}
          className="h-9 w-9 md:h-8 md:w-8 p-0 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          title="Nächste Woche"
        >
          <ChevronRight className="h-5 w-5 md:h-4 md:w-4 text-gray-600" />
        </Button>
      </div>

      {/* Week display and selectors */}
      <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-1.5 bg-gray-50/80 rounded-lg border border-gray-200/60">
        <Calendar className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-500" />

        <div className="flex items-center gap-1 md:gap-1.5">
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[70px] h-8 md:h-7 text-sm border-0 bg-transparent hover:bg-white/80 focus:ring-1 focus:ring-blue-500/50 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs font-medium text-gray-500 px-0.5">KW</span>

          <Select value={week.toString()} onValueChange={handleWeekChange}>
            <SelectTrigger className="w-[60px] h-8 md:h-7 text-sm border-0 bg-transparent hover:bg-white/80 focus:ring-1 focus:ring-blue-500/50 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {weeks.map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-gray-600 border-l border-gray-300 pl-2 hidden lg:block">
          {getWeekDateRange()}
        </div>
      </div>

      {/* Current week button */}
      {!isCurrentWeek && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentWeek}
          className="h-8 md:h-7 px-3 md:px-2.5 text-xs font-medium border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all hidden sm:flex"
        >
          Heute
        </Button>
      )}

      {/* Current week indicator */}
      {isCurrentWeek && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 md:px-2 py-1.5 md:py-1 rounded-lg hidden sm:flex">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="font-medium">Heute</span>
        </div>
      )}
    </div>
  );
}
