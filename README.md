<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 东里村村官智能体 - AI Village Assistant

This is an AI-powered village assistant application built with React, TypeScript, and Vite, featuring voice interaction capabilities powered by Google's Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1EYrWfgpGnG1nJJ25LjP4JzXY1tntt2it

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/4xiaxia/ww.git
   cd ww
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Set your Gemini API key and repository name:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add:
   # - GEMINI_API_KEY: Your Gemini API key
   # - REPO_NAME: Your repository name (e.g., 'ww' for GitHub Pages)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📦 Building for Production

Build the application for production deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🌐 Automated Deployment

This project uses GitHub Actions for automated deployment to GitHub Pages.

### Setup GitHub Pages Deployment

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Configure Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `API_KEY`: Your Gemini API key (optional)
     - `API_BASE_URL`: Custom API base URL (optional)

3. **Trigger Deployment**
   - Push to the `main` branch to trigger automatic deployment
   - Or manually trigger deployment from the Actions tab

### Deployment Workflow

The deployment workflow automatically:
- ✅ Installs dependencies
- ✅ Builds the production bundle
- ✅ Optimizes assets (minification, code splitting)
- ✅ Deploys to GitHub Pages
- ✅ Removes console logs in production

### Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in repository settings

## 🛠️ Project Structure

```
ww/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── components/                 # React components
├── services/                   # API services
├── utils/                      # Utility functions
├── App.tsx                     # Main application component
├── config.ts                   # Configuration file
├── vite.config.ts             # Vite configuration
├── package.json               # Dependencies and scripts
└── .env.example               # Environment variables template
```

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `API_BASE_URL`: (Optional) Custom API endpoint
- `API_KEY`: (Optional) Alternative API key configuration

### Build Optimization

The production build includes:
- Tree shaking and dead code elimination
- Code splitting for better caching
- Minification with Terser
- Automatic console.log removal
- Source map generation (development only)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
