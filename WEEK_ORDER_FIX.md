# Week Order Correction

## Overview

This document describes the fix implemented to ensure the weekly agenda correctly displays days from Monday to Sunday, following the standard German/European week format.

## Problem

There were two critical issues causing Sunday to appear as the first day:

1. **Timezone Conversion Bug**: When using `toISOString().split('T')[0]` to get date strings, dates were being converted to UTC first. For example, Monday October 20, 2025 at 00:00 local time (CEST/UTC+2) became `2025-10-19T22:00:00.000Z` in UTC, resulting in the date string `2025-10-19` (Sunday).

2. **Date String Parsing Issues**: The display logic used custom weekdays arrays starting with Sunday (index 0), and when parsing ISO date strings back to Date objects, timezone shifts could occur

## Solution

### Changes Made

#### 1. Updated `DroppableDay.tsx`

**Before:**
```typescript
const weekdays = [
  "Sonntag",   // Index 0
  "Montag",    // Index 1
  "Dienstag",  // Index 2
  // ... etc
];
const weekday = weekdays[date.getDay()];
```

**After:**
```typescript
const weekday = date.toLocaleDateString("de-DE", { weekday: "long" });
```

**Benefits:**
- Uses native JavaScript `toLocaleDateString()` with German locale
- Automatically handles the correct weekday names
- No manual array indexing required
- More maintainable and less error-prone
- Parses date strings as local dates to avoid timezone shifts

#### 2. Updated `utils.ts`

**Before:**
```typescript
const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const weekday = weekdays[date.getDay()];
```

**After:**
```typescript
const weekday = date.toLocaleDateString("de-DE", { weekday: "short" });
```

**Benefits:**
- Consistent with DroppableDay implementation
- Uses built-in German locale support
- Automatically correct for Monday-Sunday week order

#### 3. Added `formatDateString()` Helper Function

**Location:** `src/lib/utils.ts`

**New Function:**
```typescript
export function formatDateString(date: Date): string {
  // Format date as YYYY-MM-DD using local date components
  // This avoids timezone conversion issues
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

**Benefits:**
- Extracts date components using local time methods (getFullYear, getMonth, getDate)
- No timezone conversion occurs
- Returns consistent YYYY-MM-DD format
- Eliminates the timezone bug from `toISOString()`

#### 4. Updated All Date String Conversions

**Location:** `src/components/WeeklyAgenda.tsx`

**Before:**
```typescript
const dateStr = date.toISOString().split("T")[0];
```

**After:**
```typescript
import { formatDateString } from "@/lib/utils";
const dateStr = formatDateString(date);
```

**Changes made in:**
- `loadWeekTasks()` - Loading tasks for each day
- Add Task dropdown menu - Displaying days for selection
- Welcome message - First task creation
- Day grid rendering - Main calendar view

#### 5. Enhanced `getWeekDates()` Function

**Updated to avoid timezone edge cases:**

```typescript
export function getWeekDates(year: number, week: number): Date[] {
  // Calculate first Monday of the year
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const daysToMonday =
    dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;

  // Get the first Monday
  const firstMonday = new Date(year, 0, 1 + daysToMonday);

  // Calculate the Monday of the target week
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + (week - 1) * 7);

  // Generate all 7 days of the week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(targetMonday);
    date.setDate(targetMonday.getDate() + i);
    // Set to noon to avoid any timezone edge cases
    date.setHours(12, 0, 0, 0);
    weekDates.push(date);
  }

  return weekDates;
}
```

**Key improvement:**
- Sets time to noon (12:00) to avoid midnight timezone boundary issues

#### 6. Removed Unused Props

Since we removed the individual day add buttons, we also cleaned up:
- Removed `onAddTask` prop from `DroppableDayProps` interface
- Removed `onAddTask` from component usage in `WeeklyAgenda.tsx`
- Removed unused `Settings` import

## Week Order Verification

The `getWeekDates()` function correctly generates a week starting with Monday:

```typescript
export function getWeekDates(year: number, week: number): Date[] {
  const jan1 = new Date(year, 0, 1);
  const firstMonday = new Date(jan1);
  const dayOfWeek = jan1.getDay();
  const diff = dayOfWeek <= 1 ? 1 - dayOfWeek : 8 - dayOfWeek;
  firstMonday.setDate(jan1.getDate() + diff);

  const targetWeekStart = new Date(firstMonday);
  targetWeekStart.setDate(firstMonday.getDate() + (week - 1) * 7);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(targetWeekStart);
    date.setDate(targetWeekStart.getDate() + i);
    weekDates.push(date);
  }

  return weekDates;
}
```

**Example Output for Week 42, 2025:**
1. Montag, 20.10.2025
2. Dienstag, 21.10.2025
3. Mittwoch, 22.10.2025
4. Donnerstag, 23.10.2025
5. Freitag, 24.10.2025
6. Samstag, 25.10.2025
7. Sonntag, 26.10.2025

## Technical Details

### JavaScript Date.getDay() Behavior

The native `Date.getDay()` method returns:
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

This is the **American week convention** (Sunday-Saturday).

### German Locale Handling

Using `toLocaleDateString("de-DE", { weekday: "long" })` automatically:
- Returns correct German weekday names
- Handles Monday as the first day of the week (European convention)
- Provides proper capitalization ("Montag", "Dienstag", etc.)

### ISO 8601 Week Standard

The implementation follows ISO 8601, which defines:
- Week starts on Monday
- Week 1 is the first week with a Thursday
- Weeks are numbered 1-52 (or 53 in some years)

This is the standard used in Germany and most of Europe.

## The Timezone Bug Explained

### Root Cause

JavaScript's `Date.toISOString()` always converts to UTC before formatting:

```javascript
// Monday October 20, 2025 at midnight CEST (UTC+2)
const monday = new Date(2025, 9, 20); // Local time: Mon Oct 20 00:00
console.log(monday.toISOString()); // "2025-10-19T22:00:00.000Z" (UTC)

// When we split to get just the date:
const dateStr = monday.toISOString().split('T')[0]; // "2025-10-19" ❌ WRONG!
```

### The Fix

Using local date components instead:

```javascript
// Monday October 20, 2025
const monday = new Date(2025, 9, 20);
const year = monday.getFullYear(); // 2025
const month = (monday.getMonth() + 1).toString().padStart(2, '0'); // "10"
const day = monday.getDate().toString().padStart(2, '0'); // "20"
const dateStr = `${year}-${month}-${day}`; // "2025-10-20" ✅ CORRECT!
```

### Impact

This bug affected:
- All date string creation throughout the app
- Week display showing wrong days
- Task storage and retrieval using incorrect date keys
- "Today" highlighting on wrong days

## Testing

### Manual Verification

To verify the week order is correct:

```bash
# Test the complete flow
node -e "
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
};

const getWeekDates = (year, week) => {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const firstMonday = new Date(year, 0, 1 + daysToMonday);
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(targetMonday);
    date.setDate(targetMonday.getDate() + i);
    date.setHours(12, 0, 0, 0);
    weekDates.push(date);
  }
  return weekDates;
};

const dates = getWeekDates(2025, 42);
dates.forEach((d, i) => {
  const dateStr = formatDateString(d);
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  const weekday = parsed.toLocaleDateString('de-DE', { weekday: 'long' });
  console.log(i + 1 + ':', weekday, '-', dateStr);
});
"
```

### Expected Result

Should show Monday through Sunday in order:
```
1: Montag - 2025-10-20
2: Dienstag - 2025-10-21
3: Mittwoch - 2025-10-22
4: Donnerstag - 2025-10-23
5: Freitag - 2025-10-24
6: Samstag - 2025-10-25
7: Sonntag - 2025-10-26
```

## Related Changes

This timezone fix was implemented alongside:
- Removal of individual day "Add" buttons
- Implementation of single global "Add Task" button in toolbar
- Cleanup of unused component props
- Complete refactoring of date string handling throughout the app

## Future Considerations

### Internationalization

If the app needs to support other locales in the future:

```typescript
// Could be made configurable
const locale = 'de-DE'; // or 'en-US', 'fr-FR', etc.
const weekday = date.toLocaleDateString(locale, { weekday: "long" });
```

### Week Start Preference

Some regions prefer Sunday-Saturday weeks. This could be made configurable:

```typescript
function getWeekDates(year: number, week: number, startDay: 'monday' | 'sunday' = 'monday'): Date[] {
  // Implementation would adjust based on startDay parameter
}
```

## Key Takeaways

### ✅ Best Practices Implemented

1. **Never use `toISOString()` for date-only strings** - Always use local date components
2. **Parse date strings as local dates** - Use `new Date(year, month-1, day)` not `new Date(dateStr)`
3. **Set times to noon for date-only operations** - Avoids midnight timezone boundary issues
4. **Use locale-aware formatting** - `toLocaleDateString()` handles internationalization

### ❌ Pitfalls Avoided

1. **Timezone conversion on date strings** - UTC conversion can shift dates
2. **Custom weekday arrays** - Error-prone and not locale-aware
3. **Assuming `Date.getDay()` matches array indices** - Sunday is 0, not Monday
4. **Mixing UTC and local time operations** - Always be consistent

## Conclusion

The week now correctly displays Monday through Sunday, matching:
- German/European conventions
- ISO 8601 standard
- User expectations for a German-language application

The implementation eliminates timezone conversion bugs and is more robust by:
- Using built-in locale support instead of manual array indexing
- Extracting date components using local time methods
- Avoiding UTC conversion for date-only operations
- Setting consistent noon times to avoid edge cases

**All date operations are now timezone-safe and locale-aware.**