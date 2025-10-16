# Timezone Fix Summary

## Problem Identified

Sunday was appearing as the first day of the week instead of Monday due to a **timezone conversion bug** when converting Date objects to date strings.

## Root Cause

### The Bug
```javascript
// Monday October 20, 2025 at midnight CEST (UTC+2)
const monday = new Date(2025, 9, 20, 0, 0, 0);

// ❌ WRONG: toISOString() converts to UTC first
const dateStr = monday.toISOString().split('T')[0];
// Result: "2025-10-19" (because midnight CEST = 22:00 UTC previous day)

// When parsed back:
const parsed = new Date(dateStr); 
// Results in Sunday, October 19 instead of Monday, October 20!
```

### Why It Happened
1. `toISOString()` always converts to UTC before formatting
2. Local midnight (00:00 CEST/UTC+2) becomes 22:00 UTC the previous day
3. Splitting `"2025-10-19T22:00:00.000Z"` gives `"2025-10-19"` (wrong day!)
4. This caused a systematic 1-day shift for all week days

## The Solution

### 1. Created `formatDateString()` Helper
```typescript
// ✅ CORRECT: Use local date components
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

**Benefits:**
- Extracts components using local time methods
- No timezone conversion
- Always returns the correct date

### 2. Fixed Date Parsing in Components
```typescript
// ❌ WRONG: Implicit UTC parsing with timezone shift
const date = new Date(dateStr);

// ✅ CORRECT: Parse as local date
const [year, month, day] = dateStr.split("-").map(Number);
const date = new Date(year, month - 1, day);
```

### 3. Enhanced `getWeekDates()` Function
```typescript
// Set time to noon to avoid midnight timezone edge cases
date.setHours(12, 0, 0, 0);
```

## Files Modified

1. **`src/lib/utils.ts`**
   - Added `formatDateString()` helper function
   - Updated `getWeekDates()` to set time to noon
   - Fixed `formatGermanDate()` to use locale formatting

2. **`src/components/WeeklyAgenda.tsx`**
   - Replaced all `toISOString().split('T')[0]` with `formatDateString()`
   - Imported and used new helper function
   - Fixed "today" comparison logic

3. **`src/components/DroppableDay.tsx`**
   - Updated `formatGermanDate()` to parse dates correctly
   - Fixed `isToday()` to parse dates correctly
   - Fixed `isWeekend()` to parse dates correctly
   - Used `toLocaleDateString('de-DE')` for German weekday names

## Verification

### Test Case
```javascript
const dates = getWeekDates(2025, 42);
// Week 42, 2025:
// 1. Montag - 2025-10-20
// 2. Dienstag - 2025-10-21
// 3. Mittwoch - 2025-10-22
// 4. Donnerstag - 2025-10-23
// 5. Freitag - 2025-10-24
// 6. Samstag - 2025-10-25
// 7. Sonntag - 2025-10-26
```

✅ **Result:** Week correctly starts with Monday and ends with Sunday!

## Impact

### Before Fix
- ❌ Sunday appeared first
- ❌ All days were shifted by one
- ❌ "Today" highlighting on wrong day
- ❌ Tasks stored/loaded with wrong dates

### After Fix
- ✅ Monday through Sunday in correct order
- ✅ Follows ISO 8601 standard
- ✅ Matches German/European conventions
- ✅ All date operations timezone-safe
- ✅ No more date shifting bugs

## Best Practices Learned

### ✅ DO
- Use local date components: `getFullYear()`, `getMonth()`, `getDate()`
- Parse date strings explicitly: `new Date(year, month-1, day)`
- Use locale-aware formatting: `toLocaleDateString('de-DE')`
- Set times to noon for date-only operations: `setHours(12, 0, 0, 0)`

### ❌ DON'T
- Use `toISOString()` for date-only strings
- Parse ISO strings with `new Date(dateStr)` when timezone matters
- Rely on implicit timezone conversions
- Use custom weekday arrays (not locale-aware)

## Key Takeaway

**Always use local date components when working with date-only values to avoid timezone conversion bugs!**

The fix ensures that Monday is always the first day of the week, matching:
- ISO 8601 international standard
- German/European week conventions
- User expectations for a German-language calendar application