import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekDates(year: number, week: number): Date[] {
  // ISO 8601: Week 1 is the week with the first Thursday of the year
  // The year parameter here is the ISO week-year, which may differ from
  // the calendar year at year boundaries.

  // Start with January 4th of the ISO week-year (always in week 1)
  const jan4 = new Date(year, 0, 4);

  // Find the Monday of week 1 for this ISO week-year
  const dayOfWeek = jan4.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() + daysToMonday);

  // Calculate the Monday of the target week
  const targetMonday = new Date(week1Monday);
  targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);

  // Generate all 7 days of the week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(targetMonday);
    date.setDate(targetMonday.getDate() + i);
    // Ensure we're at noon to avoid any timezone edge cases
    date.setHours(12, 0, 0, 0);
    weekDates.push(date);
  }

  return weekDates;
}

export function formatGermanDate(date: Date): string {
  const weekday = date.toLocaleDateString("de-DE", { weekday: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${weekday}, ${day}.${month}`;
}

export function formatDateString(date: Date): string {
  // Format date as YYYY-MM-DD using local date components
  // This avoids timezone conversion issues
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeek(): { year: number; week: number } {
  const now = new Date();
  const weekNum = getWeekNumber(now);

  // Get the ISO week-year (the year to which the week belongs)
  // This is needed for correct week calculation at year boundaries
  const d = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const isoWeekYear = d.getUTCFullYear();

  return {
    year: isoWeekYear,
    week: weekNum,
  };
}
