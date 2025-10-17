import { getWeekNumber } from "@/lib/utils";

interface MobileWeekSelectorProps {
  year: number;
  week: number;
  onWeekChange: (year: number, week: number) => void;
}

export function MobileWeekSelector({
  year,
  week,
  onWeekChange,
}: MobileWeekSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const getWeeksInYear = (year: number) => {
    const dec31 = new Date(year, 11, 31);
    const weekNum = getWeekNumber(dec31);
    return weekNum === 1 ? 52 : weekNum;
  };

  const maxWeeks = getWeeksInYear(year);
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newMaxWeeks = getWeeksInYear(newYear);
    const newWeek = week > newMaxWeeks ? newMaxWeeks : week;
    onWeekChange(newYear, newWeek);
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onWeekChange(year, parseInt(e.target.value));
  };

  return (
    <div className="flex items-center justify-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Year Selector */}
      <div className="flex flex-col items-center gap-0.5">
        <select
          value={year}
          onChange={handleYearChange}
          className="appearance-none bg-transparent border-none text-base font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-center"
          aria-label="Jahr auswählen"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          Jahr
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-7 bg-gray-300 dark:bg-gray-600" />

      {/* Week Selector */}
      <div className="flex flex-col items-center gap-0.5">
        <select
          value={week}
          onChange={handleWeekChange}
          className="appearance-none bg-transparent border-none text-base font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-center"
          aria-label="Kalenderwoche auswählen"
        >
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          KW
        </span>
      </div>
    </div>
  );
}
