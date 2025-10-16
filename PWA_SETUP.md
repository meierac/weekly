# PWA Setup Guide

## Overview

Your Weekly Planner app is now configured as a Progressive Web App (PWA) with GitHub Pages deployment support.

## PWA Icons

You need to create the following icon files in the `public` folder:

### Required Icons:
- `pwa-192x192.png` - 192x192px icon
- `pwa-512x512.png` - 512x512px icon
- `apple-touch-icon.png` - 180x180px (for iOS)
- `favicon.ico` - Standard favicon
- `mask-icon.svg` - SVG for Safari pinned tabs (optional)

### How to Generate Icons:

#### Option 1: Using an Online Tool (Easiest)
1. Go to [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) or [Favicon Generator](https://realfavicongenerator.net/)
2. Upload your logo/icon (ideally 512x512px or larger)
3. Download the generated icons
4. Place them in the `public` folder

#### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Create a base icon first (base-icon.png at 512x512)
# Then run:
magick base-icon.png -resize 192x192 public/pwa-192x192.png
magick base-icon.png -resize 512x512 public/pwa-512x512.png
magick base-icon.png -resize 180x180 public/apple-touch-icon.png
```

#### Option 3: Manual Creation
Use any image editor (Photoshop, GIMP, Figma, etc.) to create:
- A square icon with your app logo/branding
- Export at 192x192px and 512x512px
- Use padding around the icon (safe area: ~80% of canvas)
- Use a solid background color or transparent background

### Quick Start Icons (Placeholder)
For testing, you can use the Vite logo temporarily:
1. Download the Vite SVG from `public/vite.svg`
2. Convert it to PNG at required sizes
3. Replace later with your actual branding

## GitHub Pages Configuration

### 1. Update Repository Name
In `vite.config.ts`, change the `base` property to match your GitHub repository name:

```typescript
base: "/your-repo-name/",  // Change "weekly" to your actual repo name
```

### 2. Enable GitHub Pages
1. Go to your GitHub repository settings
2. Navigate to **Settings → Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Push your code to the `main` branch
5. The workflow will automatically deploy your app

### 3. Access Your App
After deployment, your app will be available at:
```
https://<your-username>.github.io/<your-repo-name>/
```

## PWA Features

### Auto-Update
The service worker is configured to automatically update when you deploy new versions.

### Offline Support
Basic offline support is enabled through Workbox. The app will cache:
- JavaScript files
- CSS files
- HTML files
- Images (PNG, SVG, ICO)
- Fonts (WOFF2)

### Install Prompt
Users can install the app on their devices:
- **Desktop**: Click the install icon in the address bar
- **Mobile**: Use "Add to Home Screen" option

## Testing PWA Locally

### 1. Build the app:
```bash
pnpm run build
```

### 2. Preview the production build:
```bash
pnpm run preview
```

### 3. Test PWA features:
1. Open Chrome DevTools (F12)
2. Go to the "Application" tab
3. Check:
   - **Manifest**: Verify all icons and settings
   - **Service Workers**: Ensure SW is registered
   - **Lighthouse**: Run PWA audit

## Customization

### Update App Name & Description
Edit `vite.config.ts` in the PWA manifest section:

```typescript
manifest: {
  name: "Your App Name",
  short_name: "Short Name",
  description: "Your app description",
  theme_color: "#your-color",
  background_color: "#your-color",
}
```

### Update Theme Colors
The theme colors should match your app's branding:
- `theme_color`: Address bar color on mobile
- `background_color`: Splash screen background

## Deployment Workflow

The GitHub Actions workflow (`deploy.yml`) will:
1. Trigger on push to `main` branch
2. Install dependencies with pnpm
3. Build the app
4. Deploy to GitHub Pages

You can also manually trigger deployment:
1. Go to **Actions** tab in GitHub
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## Troubleshooting

### Icons Not Showing
- Ensure icon files exist in `public` folder
- Check file names match exactly
- Clear browser cache and service worker

### Base URL Issues
- Verify `base` in `vite.config.ts` matches repo name
- Include leading and trailing slashes: `/repo-name/`

### Service Worker Not Updating
- Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Unregister old service worker in DevTools
- Wait for automatic update (up to 24 hours)

### GitHub Pages 404 Error
- Ensure GitHub Pages source is set to "GitHub Actions"
- Check workflow completed successfully
- Wait a few minutes after deployment

## Next Steps

1. Create and add your PWA icons to `public` folder
2. Update the `base` path in `vite.config.ts`
3. Customize manifest name and colors
4. Push to GitHub to trigger deployment
5. Enable GitHub Pages in repository settings
6. Test your deployed PWA!

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)