# Preview-Export Alignment Documentation

## Overview

The ExportPreview component has been completely aligned with the final export layout to ensure pixel-perfect accuracy between what users see in the preview and what gets exported.

## Key Alignment Changes

### 1. Layout Structure
- **Width**: Fixed to 375px (iPhone width) to match export
- **Height**: Min 667px, max 800px to match export constraints
- **Padding**: 6px 8px to exactly match export padding
- **Font Family**: 'Manrope', Georgia, 'Times New Roman', serif as base

### 2. Header Section
**Before**: Simple preview header with "Vorschau:" label
**After**: Exact replica of export header
- **Title**: "Wochenprogramm" in Lavishly Yours font, 48px
- **Week Info**: "Kalenderwoche {week}" in Manrope, 12px
- **Spacing**: 20px margin below title, 12px below header
- **Text Shadow**: 0 2px 4px rgba(0,0,0,0.5) for title
- **Colors**: Dynamic based on background using same color scheme logic

### 3. Days Display
**Before**: Only Monday-Friday workdays
**After**: All 7 days (Monday through Sunday) like export

**Day Container Styling**:
- Background: rgba(255, 255, 255, 0.71) - exact match
- Border radius: 12px
- Box shadow: 0px 0px 0px 1px rgba(0,0,0,0.1)
- Margin bottom: 4px between days

**Day Header**:
- Padding: 2px 12px 6px 12px
- Font: Manrope, 12px, weight 700
- Gap: 4px between day name and date
- Color: Dynamic primary color

### 4. Tasks Layout
**Grid System**:
- Display: grid
- Grid template columns: 70px 1fr (exact match)
- Gap: 0px
- Line height: 1.1

**Time Formatting**:
- Exact same logic as export: "hh:mm-hh:mm" or "All-Day"
- Font: Geologica, 9px, weight 500
- Padding: 7px left, 2px top
- Width: 75px

**Task Description**:
- Font: Manrope, 10px, weight 400
- Padding: 1px 3px
- Line height: 1.3
- Word wrap: break-word

**Empty Days**:
- Text: "Frei" (same as export)
- Font: Manrope, 9px, weight 500, italic
- Opacity: 0.6
- Centered alignment

### 5. Bible Verse Section
**Styling**:
- Margin top: 10px
- Background: rgba(255, 255, 255, 0) - transparent like export
- Padding: 8px 12px
- No header text (removed "📖 Bibelvers der Woche")

**Verse Text**:
- Font: Manrope, 9px, italic
- Text align: center
- Line height: 1.3
- Margin: 0 0 3px 0

**Reference**:
- Font: Manrope, 8px, weight 500
- Text align: center
- Display: block

### 6. Color Scheme Matching
**Unified Color Logic**: Exact same function as export with all color schemes:
- Beige backgrounds: Warm brown tones
- Blue backgrounds: Cool blue tones  
- Green backgrounds: Nature green tones
- Sunset backgrounds: Warm orange/red tones
- Purple backgrounds: Purple tones
- Light backgrounds: High contrast grays

**High Contrast**: All color schemes optimized for maximum readability

### 7. Font Loading
**Google Fonts Integration**:
- Lavishly Yours: For main title
- Manrope: For body text and headers
- Geologica: For time display
- Automatic loading with duplicate prevention

### 8. Background Handling
**Exact Match Logic**:
- CSS gradients: Applied directly as background
- Solid colors: Applied as backgroundColor
- Image URLs: Applied as backgroundImage with cover/center
- Same detection logic as export function

## Technical Implementation

### Before vs After Comparison

**Before (Preview-only styling)**:
```css
.preview-container {
  max-height: 96vh;
  padding: 12px;
  /* Generic mobile styling */
}
```

**After (Export-matched styling)**:
```css
.preview-container {
  width: 375px;
  min-height: 667px;
  max-height: 800px;
  padding: 6px 8px;
  font-family: 'Manrope', Georgia, 'Times New Roman', serif;
  /* Exact export replica */
}
```

### Key Functions Aligned

1. **getColorScheme()**: Identical to extractBackgroundColors() in export
2. **getDayName()**: Includes all 7 days, same mapping
3. **Time formatting**: Exact same logic for "All-Day" vs time ranges
4. **Font loading**: Same Google Fonts as export

## Benefits

✅ **Pixel-perfect preview**: What you see is exactly what you get
✅ **No surprises**: Preview accurately represents final export
✅ **Consistent fonts**: Same typography in preview and export
✅ **All days included**: Full week view like export (Mo-Su)
✅ **Proper Bible verse**: Exact formatting and positioning
✅ **Color accuracy**: Same high-contrast color schemes
✅ **Layout fidelity**: Grid, spacing, and sizing match exactly

## Testing Checklist

- [ ] Preview shows all 7 days (Mo-Su)
- [ ] Title uses Lavishly Yours font
- [ ] Time format matches export (e.g., "09:00-17:00" or "All-Day")
- [ ] Bible verse appears centered without header icon
- [ ] Background colors/gradients render identically
- [ ] Empty days show "Frei" text
- [ ] Text colors have proper contrast
- [ ] 375px width maintained
- [ ] Font weights and sizes match export

## Files Modified

- `src/components/ExportPreview.tsx`: Complete rewrite for alignment
- Fonts automatically loaded via Google Fonts API
- Color scheme logic unified with export system

The preview now serves as a true 1:1 representation of the final exported layout.