# Logo and Custom Title Bar Implementation

## Overview

This document describes the implementation of the app logo/icon and custom window title bar for the Weekly Planner application.

## Changes Made

### 1. App Logo Integration

The app now uses the custom logo/icon (defined in the PWA manifest) throughout the application instead of generic placeholder icons.

#### Updated Components:

- **Desktop Toolbar** (`WeeklyAgenda.tsx`): Replaced the generic Calendar icon with the actual app logo (`/weekly/favicon.svg`)
- **About Dialog** (`AboutDialog.tsx`): Updated to display the app logo instead of a Calendar icon

#### Logo Files:

- **SVG**: `/public/favicon.svg` - Scalable vector format (200x200)
- **PNG 192x192**: `/public/web-app-manifest-192x192.png` - PWA icon
- **PNG 512x512**: `/public/web-app-manifest-512x512.png` - PWA icon and maskable icon

### 2. Custom Window Title Bar for Windows PWA

A custom title bar has been implemented for when the app runs as a standalone PWA on Windows.

#### Features:

- **App Logo**: Displays the app icon in the title bar
- **App Name**: Shows "Wochenplaner" as the window title
- **Window Controls**: 
  - Minimize button (currently limited in PWA)
  - Maximize/Restore button (uses fullscreen API)
  - Close button (closes the window)

#### Component: `CustomTitleBar.tsx`

```tsx
- Auto-detects if running as standalone PWA
- Only renders when in PWA mode
- Fixed positioning at the top of the window
- Draggable area for window movement (WebKit app region)
- Non-draggable window control buttons
```

#### Styling:

- Height: 48px (12 in Tailwind units)
- Background: White with bottom border
- Z-index: 50 (appears above all content)

### 3. PWA Manifest Updates

Updated `vite.config.ts` to include:

```typescript
display_override: ["window-controls-overlay", "standalone"]
```

This enables the Window Controls Overlay API, allowing custom title bars on supported platforms (Windows 11+).

### 4. CSS Adjustments

Added to `index.css`:

```css
@media (display-mode: standalone) {
    body {
        padding-top: 48px; /* Height of custom title bar */
    }
}
```

This ensures content doesn't hide behind the custom title bar when running as PWA.

## Platform Behavior

### Desktop (Browser)
- No custom title bar shown
- Standard browser chrome visible
- App logo visible in desktop toolbar

### Windows PWA (Standalone)
- Custom title bar with app logo and controls
- Native-like window management
- Frameless window appearance
- Body content adjusted for title bar height

### Mobile
- No title bar (not applicable)
- Standard mobile navigation
- App logo not prominently displayed (mobile uses bottom nav)

## Technical Details

### Detection

The app detects standalone PWA mode using:

```typescript
window.matchMedia("(display-mode: standalone)").matches ||
(window.navigator as any).standalone === true
```

### Window Controls

- **Minimize**: Currently limited - web apps can't truly minimize
- **Maximize**: Uses Fullscreen API (`requestFullscreen()`)
- **Close**: Uses `window.close()` (works in PWA)

### Draggable Region

Uses CSS properties for window dragging:
- `WebkitAppRegion: "drag"` - Makes title bar draggable
- `WebkitAppRegion: "no-drag"` - Excludes controls from drag area

## Future Enhancements

### Potential Improvements:

1. **Window State Persistence**: Save and restore window size/position
2. **Snap Layouts**: Integrate with Windows 11 snap layouts
3. **Theme Sync**: Match Windows theme (light/dark mode)
4. **Acrylic/Mica Effect**: Windows 11 translucent title bar
5. **Menu Integration**: Add app menu to title bar

### Browser Support:

- **Full Support**: Edge, Chrome on Windows 11+
- **Partial Support**: Chrome on Windows 10 (no overlay)
- **No Support**: Firefox, Safari (falls back gracefully)

## Testing

### To Test Custom Title Bar:

1. Build the app: `pnpm run build`
2. Deploy to hosting or use local server
3. Install as PWA on Windows
4. Launch from Start Menu/Desktop
5. Verify custom title bar appears
6. Test window controls (minimize, maximize, close)

### Fallback Behavior:

If running in browser or unsupported platform, the custom title bar won't render and the app functions normally with browser chrome.

## Assets

All logo assets are stored in `/public/`:

- `favicon.svg` - Main logo (SVG)
- `favicon.ico` - Browser favicon
- `favicon-96x96.png` - 96x96 PNG favicon
- `apple-touch-icon.png` - iOS home screen icon
- `web-app-manifest-192x192.png` - PWA icon (192x192)
- `web-app-manifest-512x512.png` - PWA icon (512x512)

## References

- [Window Controls Overlay API](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API)
- [PWA Display Modes](https://developer.mozilla.org/en-US/docs/Web/Manifest/display)
- [CSS Regions for Dragging](https://developer.chrome.com/docs/web-platform/window-controls-overlay/)