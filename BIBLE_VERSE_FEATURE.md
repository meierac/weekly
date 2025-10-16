# Bible Verse Feature

This document describes the new Bible verse feature added to the Weekly Agenda application.

## Overview

The Bible verse feature adds an inspirational Bible verse to your weekly agenda that appears at the bottom of each week's schedule. The feature includes:

- Display of a curated Bible verse in German
- Toggle functionality to show/hide the verse
- Refresh button to get a new verse
- Automatic weekly rotation (every 7 days)
- Integration with preview and export functionality

## Features

### 1. Display Component

The Bible verse appears in a styled card at the bottom of your weekly agenda with:
- Book icon and "Bibelvers der Woche" header
- Formatted verse text in quotes
- Scripture reference
- Blue gradient background design

### 2. Toggle On/Off

You can easily enable or disable the Bible verse feature:
- When disabled: Shows a compact card with an "Aktivieren" button
- When enabled: Shows the full verse with controls
- Setting is saved in localStorage and persists between sessions

### 3. Refresh Functionality

- Manual refresh button (↻) to get a new verse immediately
- Automatic refresh every 7 days
- Ensures you don't get the same verse twice in a row when manually refreshing

### 4. Curated Verse Collection

The feature includes 30 carefully selected German Bible verses covering themes of:
- Hope and encouragement
- Strength and courage
- Peace and comfort
- Faith and trust
- Love and grace

### 5. Export Integration

The Bible verse is automatically included in:
- **Preview**: Shows in the export preview dialog
- **Export**: Included in the exported image/PDF
- **Conditional**: Only appears if the feature is enabled

## Usage

### Enabling the Feature

1. Scroll to the bottom of your weekly agenda
2. You'll see a card titled "Bibelvers der Woche"
3. Click the "Aktivieren" button to enable the feature

### Getting a New Verse

1. Click the refresh button (↻) in the top-right corner of the verse card
2. The verse will change immediately with a brief loading animation
3. Or wait 7 days for automatic rotation

### Disabling the Feature

1. Click the X button in the top-right corner of the verse card
2. The feature will be disabled and hidden
3. Your preference is saved automatically

## Technical Implementation

### Components

- **BibleVerse.tsx**: Main display component with toggle and refresh functionality
- **bible-verse.ts**: Library managing verse data, storage, and rotation logic

### Storage

- Settings stored in localStorage with key `bible-verse-settings`
- Tracks enabled state, current verse index, and last change date
- Automatic cleanup and validation of stored data

### Verse Management

- 30 predefined verses with German text and references
- Random selection with duplicate prevention
- Automatic weekly rotation based on timestamps

### Export Integration

- Bible verse data extracted from DOM during export
- Conditionally included based on enabled state
- Styled consistently with export theme colors

## Customization

The feature is designed to be easily extensible:

### Adding More Verses

Edit `src/lib/bible-verse.ts` and add entries to the `BIBLE_VERSES` array:

```typescript
{
  text: "Your verse text in German",
  reference: "Book Chapter,Verse"
}
```

### Styling

Modify the component styles in `src/components/BibleVerse.tsx`:
- Background colors and gradients
- Font sizes and spacing
- Icon and button styling

### Rotation Frequency

Change the automatic rotation period in `bible-verse.ts`:
```typescript
// Currently set to 7 days
if (daysDiff >= 7) {
  return refreshBibleVerse();
}
```

## Browser Support

- Modern browsers with localStorage support
- Progressive enhancement - degrades gracefully
- Responsive design for mobile and desktop

## Privacy

- All data stored locally in browser localStorage
- No external API calls or data transmission
- Verses are embedded in the application bundle