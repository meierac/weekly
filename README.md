# Weekly Planner 📅

A beautiful, responsive weekly planner PWA (Progressive Web App) built with React, TypeScript, and Vite. Organize your week with an intuitive interface, export to iCal, and access it anywhere - even offline!

## ✨ Features

- 📱 **Progressive Web App** - Install on any device, works offline
- 🎨 **Beautiful UI** - Clean, modern interface with multiple themes
- 📤 **Export to iCal** - Sync with your calendar apps
- 🖼️ **Export as Image** - Share your weekly schedule
- 📝 **Bible Verse Integration** - Daily inspirational verses
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- ⚡ **Fast & Lightweight** - Built with Vite for optimal performance

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/weekly.git
cd weekly

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📱 PWA Setup

This app is configured as a Progressive Web App. To complete the PWA setup:

1. **Generate Icons**: Open `generate-icons.html` in your browser to create placeholder icons
2. **Add Icons**: Place the generated icons in the `public` folder
3. **Customize**: Edit `vite.config.ts` to update app name, colors, and description

For detailed instructions, see [PWA_SETUP.md](./PWA_SETUP.md)

## 🌐 Deploy to GitHub Pages

### 1. Configure Repository

Update `vite.config.ts` with your repository name:

```typescript
base: "/your-repo-name/",  // Change this to your actual GitHub repo name
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository **Settings → Pages**
2. Under "Build and deployment", select **Source: GitHub Actions**
3. Push your code to the `main` branch

### 3. Deploy

The app will automatically deploy when you push to `main`. The GitHub Actions workflow will:
- Install dependencies
- Build the app
- Deploy to GitHub Pages

Your app will be available at: `https://yourusername.github.io/your-repo-name/`

### Manual Deployment

You can also trigger deployment manually:
1. Go to the **Actions** tab in your GitHub repository
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **dnd-kit** - Drag and drop
- **html2canvas** - Image export
- **iCal.js** - Calendar export
- **Vite PWA** - Progressive Web App support

## 📂 Project Structure

```
weekly/
├── public/          # Static assets and PWA icons
├── src/
│   ├── components/  # React components
│   ├── lib/         # Utilities and helpers
│   └── App.tsx      # Main app component
├── .github/
│   └── workflows/   # GitHub Actions deployment
├── vite.config.ts   # Vite configuration
└── PWA_SETUP.md     # PWA setup guide
```

## 🔧 Development

```bash
# Run development server
pnpm dev

# Type checking
pnpm run build  # TypeScript compilation happens during build

# Linting
pnpm lint
```

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🌟 PWA Features

- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen on mobile and desktop
- **Auto-updates** - Service worker automatically updates the app
- **Fast Loading** - Optimized caching strategies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Resources

- [PWA Setup Guide](./PWA_SETUP.md)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Currently, two official Vite plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
