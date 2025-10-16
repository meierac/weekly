# 🚀 Deployment Checklist

Complete these steps to deploy your Weekly Planner as a PWA on GitHub Pages.

## ✅ Pre-Deployment Checklist

### 1. Generate PWA Icons
- [ ] Open `generate-icons.html` in your browser
- [ ] Customize the icon text and colors
- [ ] Click "Generate Icons" and then "Download All"
- [ ] Move downloaded files to `public/` folder:
  - `pwa-192x192.png`
  - `pwa-512x512.png`
  - `apple-touch-icon.png`
- [ ] (Optional) Create `favicon.ico` and `mask-icon.svg`

### 2. Configure Repository Settings
- [ ] Update `base` in `vite.config.ts`:
  ```typescript
  base: "/your-actual-repo-name/",
  ```
- [ ] Update app name in `vite.config.ts` manifest section (optional)
- [ ] Update theme colors to match your branding (optional)

### 3. Test Locally
- [ ] Run `pnpm install` to ensure all dependencies are installed
- [ ] Run `pnpm build` to build for production
- [ ] Run `pnpm preview` to test the production build
- [ ] Open DevTools > Application tab
- [ ] Verify manifest is loaded correctly
- [ ] Check that service worker registers successfully
- [ ] Test offline functionality (Network tab > Offline)

### 4. Push to GitHub
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Add PWA support and GitHub Pages deployment"
  git push origin main
  ```

### 5. Configure GitHub Pages
- [ ] Go to your repository on GitHub
- [ ] Navigate to **Settings** → **Pages**
- [ ] Under "Build and deployment":
  - Source: Select **GitHub Actions**
- [ ] Wait for the Actions workflow to complete

### 6. Verify Deployment
- [ ] Go to **Actions** tab and check workflow status
- [ ] Once complete, visit: `https://yourusername.github.io/your-repo-name/`
- [ ] Test the deployed app
- [ ] Verify PWA install prompt appears
- [ ] Test on mobile device

## 🔍 Post-Deployment Verification

### PWA Features
- [ ] Install app on desktop (Chrome: install icon in address bar)
- [ ] Install app on mobile ("Add to Home Screen")
- [ ] Test offline mode (disable network, reload app)
- [ ] Verify auto-update works (make a change, deploy, app updates)

### Functionality
- [ ] All features work correctly
- [ ] Images and assets load properly
- [ ] Calendar export works
- [ ] Image export works
- [ ] Responsive design on all devices

### Performance
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] PWA score should be 90+
- [ ] Performance score should be 90+
- [ ] Fix any issues reported

## 🐛 Troubleshooting

### Icons Not Showing
1. Ensure files exist in `public/` folder with exact names
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)
4. Unregister service worker in DevTools

### 404 Error on GitHub Pages
1. Verify GitHub Pages source is set to "GitHub Actions"
2. Check Actions workflow completed successfully (green checkmark)
3. Ensure `base` in `vite.config.ts` matches repo name exactly
4. Wait a few minutes after deployment
5. Clear DNS cache

### Base URL Problems
1. `base` must include leading and trailing slashes: `/repo-name/`
2. Must match your GitHub repository name exactly
3. If repo is named "weekly", use `base: "/weekly/"`
4. For custom domain, use `base: "/"`

### Service Worker Not Updating
1. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. DevTools > Application > Service Workers > Unregister
3. DevTools > Application > Storage > Clear site data
4. Close all tabs with the app open
5. Wait up to 24 hours for automatic update

### Workflow Fails
1. Check Actions tab for error details
2. Verify `pnpm-lock.yaml` is committed
3. Ensure `package.json` scripts are correct
4. Check Node.js version in workflow (should be 20+)
5. Re-run the workflow

## 📋 Manual Deployment (Alternative)

If GitHub Actions doesn't work, you can deploy manually:

```bash
# Build the app
pnpm build

# Install GitHub Pages deploy tool
pnpm add -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Deploy
pnpm run deploy
```

Then set GitHub Pages source to `gh-pages` branch.

## 🎨 Customization Tips

### Update App Name
Edit `vite.config.ts`:
```typescript
manifest: {
  name: "Your App Name",
  short_name: "Short",
}
```

### Change Theme Color
Edit `vite.config.ts`:
```typescript
manifest: {
  theme_color: "#your-color",
  background_color: "#your-color",
}
```

Also update in `index.html`:
```html
<meta name="theme-color" content="#your-color" />
```

### Professional Icons
1. Design 512x512 icon in Figma/Photoshop
2. Use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
3. Replace placeholder icons in `public/` folder

## 🔗 Quick Links

- [Repository Settings](https://github.com/yourusername/your-repo/settings)
- [GitHub Pages](https://github.com/yourusername/your-repo/settings/pages)
- [Actions Workflow](https://github.com/yourusername/your-repo/actions)
- [Live Site](https://yourusername.github.io/your-repo-name/)

## ✨ Success!

Once all checkboxes are complete, your PWA is live! 🎉

Share your app:
- Direct link: `https://yourusername.github.io/your-repo-name/`
- Users can install it on any device
- Works offline after first visit
- Auto-updates when you deploy changes

---

**Next Steps:**
1. Share with users
2. Collect feedback
3. Monitor with analytics (optional)
4. Keep improving!