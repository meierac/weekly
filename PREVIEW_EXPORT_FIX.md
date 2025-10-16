# Preview/Export Fix Documentation

## Issue Description

After the Apple HIG UI redesign, the preview and export functions were showing no elements because the data extraction functions were using outdated CSS selectors that no longer matched the new component structure.

## Root Cause

The data extraction functions in `WeeklyAgenda.tsx`, `ExportDialog.tsx`, and `export.ts` were relying on CSS class selectors that changed during the UI redesign:

### Old Selectors (Broken)
- `[class*="bg-card"]` - Day containers
- `[class*="bg-secondary"], [class*="bg-blue-50"]` - Task elements
- `[class*="text-primary"]` - Time elements
- `[class*="text-foreground"]` - Description elements
- `[class*="bg-gradient-to-r from-blue-50"]` - Bible verse container

### Why They Broke
- CSS classes were completely changed during UI redesign
- New design uses different class combinations
- Fragile selectors based on styling rather than structure

## Solution Implemented

### 1. Data Attributes Approach
Added reliable `data-*` attributes to components for export/preview identification:

```typescript
// DroppableDay.tsx
<div
  data-day-container
  data-date={dateStr}
  data-day-name={dateInfo.weekday}
  // ... other props
>

// DraggableTask.tsx
<div
  data-task-container
  data-task-id={task.id}
  data-start-time={task.startTime}
  data-end-time={task.endTime}
  data-description={task.description}
  data-is-imported={task.isImported}
  // ... other props
>

// BibleVerse.tsx
<div data-bible-verse-container>
  <blockquote data-verse-text>
  <cite data-verse-reference>
```

### 2. Updated Data Extraction Logic

Replaced fragile CSS selectors with reliable data attribute queries:

```typescript
// Before (Broken)
const dayElements = element.querySelectorAll('[class*="bg-card"]');
const taskElements = dayElement.querySelectorAll('[class*="bg-secondary"], [class*="bg-blue-50"]');

// After (Fixed)
const dayElements = element.querySelectorAll("[data-day-container]");
const taskElements = dayElement.querySelectorAll("[data-task-container]");
```

### 3. Simplified Data Access

Instead of parsing DOM text content, directly access data attributes:

```typescript
// Before (Fragile)
const timeElement = taskElement.querySelector('[class*="text-primary"]');
const timeText = timeElement.textContent || "";

// After (Reliable)
const startTime = taskElement.getAttribute("data-start-time") || "";
const endTime = taskElement.getAttribute("data-end-time") || "";
```

## Benefits of This Approach

### 1. Reliability
- **Immune to styling changes**: Data attributes persist regardless of CSS updates
- **Explicit intent**: Clear separation between presentation and data extraction
- **Future-proof**: Won't break with future UI redesigns

### 2. Performance
- **Direct access**: No DOM traversal or text parsing needed
- **Fewer queries**: Single attribute access vs complex selectors
- **Consistent results**: Same data format regardless of display formatting

### 3. Maintainability
- **Clear contracts**: Components explicitly declare what data they expose
- **Type safety**: Data attributes can be typed and validated
- **Documentation**: Self-documenting component interfaces

## Files Modified

### Components Updated
1. **`DroppableDay.tsx`**
   - Added `data-day-container`, `data-date`, `data-day-name`
   - Enables day-level data extraction

2. **`DraggableTask.tsx`**
   - Added `data-task-container` and task data attributes
   - Added `data-task-time` and `data-task-description` for specific elements
   - Enables task-level data extraction

3. **`BibleVerse.tsx`**
   - Added `data-bible-verse-container`
   - Added `data-verse-text` and `data-verse-reference`
   - Enables Bible verse data extraction

### Data Extraction Updated
1. **`WeeklyAgenda.tsx`** - `extractPreviewData()`
2. **`ExportDialog.tsx`** - `extractPreviewData()`
3. **`export.ts`** - `extractWeekData()`

### Key Changes Made
- Replaced CSS class selectors with data attribute selectors
- Simplified data access using `getAttribute()`
- Added day name mapping for abbreviations
- Include all days in export (even empty ones)
- Fixed date formatting for display

## Data Attribute Schema

### Day Container
```typescript
data-day-container          // Identifies day container
data-date="2024-01-15"     // ISO date string
data-day-name="Montag"     // Full German day name
```

### Task Container
```typescript
data-task-container                    // Identifies task container
data-task-id="unique-id"              // Task ID
data-start-time="09:00"               // 24-hour start time
data-end-time="17:00"                 // 24-hour end time
data-description="Task description"    // Task description
data-is-imported="true"               // Import status
```

### Bible Verse Container
```typescript
data-bible-verse-container    // Identifies Bible verse container
data-verse-text              // On blockquote element
data-verse-reference         // On cite element
```

## Testing Verification

### Preview Function
- ✅ Shows all days of the week
- ✅ Displays tasks with correct times and descriptions
- ✅ Includes Bible verse when enabled
- ✅ Proper formatting and layout

### Export Function
- ✅ Generates images with all content
- ✅ Maintains visual consistency with preview
- ✅ Works with all background options
- ✅ Includes Bible verse in exports

## Future Considerations

### Best Practices Established
1. **Always use data attributes** for component data that needs external access
2. **Avoid CSS class selectors** for data extraction
3. **Separate presentation from data** access patterns
4. **Document data contracts** in component interfaces

### Recommended Extensions
1. **Type definitions** for data attribute schemas
2. **Validation functions** for data attribute presence
3. **Helper utilities** for common data extraction patterns
4. **Testing utilities** to verify data attribute presence

## Conclusion

This fix transforms fragile, presentation-dependent data extraction into a robust, contract-based system. The solution is:
- **Reliable**: Won't break with UI changes
- **Performant**: Direct data access
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new data attributes

The preview and export functions now work correctly and will remain stable through future UI updates.