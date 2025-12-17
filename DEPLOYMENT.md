# 部署文档 / Deployment Guide

## 概述 / Overview

本项目使用 GitHub Actions 实现自动化部署到 GitHub Pages。每次推送到 `main` 分支时，都会自动触发构建和部署流程。

This project uses GitHub Actions for automated deployment to GitHub Pages. Every push to the `main` branch automatically triggers the build and deployment process.

## 🚀 首次部署设置 / Initial Deployment Setup

### 1. 启用 GitHub Pages / Enable GitHub Pages

1. 进入仓库设置 / Go to repository Settings
2. 点击左侧的 "Pages" / Click "Pages" in the left sidebar
3. 在 "Source" 下选择 "GitHub Actions" / Under "Source", select "GitHub Actions"
4. 保存更改 / Save changes

### 2. 配置环境变量 (可选) / Configure Environment Variables (Optional)

如果你的应用需要 API 密钥或其他敏感信息：

If your application requires API keys or other sensitive information:

1. 进入仓库 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下密钥 / Add the following secrets:
   - `API_KEY`: 你的 Gemini API 密钥 / Your Gemini API key
   - `API_BASE_URL`: (可选) 自定义 API 端点 / (Optional) Custom API endpoint

### 3. 触发部署 / Trigger Deployment

**自动部署 / Automatic Deployment:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**手动部署 / Manual Deployment:**
1. 进入仓库的 "Actions" 标签页 / Go to the "Actions" tab in your repository
2. 选择 "Deploy to GitHub Pages" 工作流 / Select the "Deploy to GitHub Pages" workflow
3. 点击 "Run workflow" 按钮 / Click the "Run workflow" button
4. 选择分支并运行 / Select the branch and run

## 📋 部署流程 / Deployment Process

自动化部署流程包括以下步骤：

The automated deployment process includes the following steps:

1. **代码检出** / Checkout code
2. **安装 Node.js 20** / Install Node.js 20
3. **安装依赖** / Install dependencies (`npm ci`)
4. **构建生产版本** / Build production bundle
   - 代码分割 / Code splitting
   - 压缩和优化 / Minification and optimization
   - 移除 console.log / Remove console.log statements
5. **上传构建产物** / Upload build artifacts
6. **部署到 GitHub Pages** / Deploy to GitHub Pages

## 🔍 查看部署状态 / Check Deployment Status

### 在 GitHub Actions 中查看 / View in GitHub Actions

1. 进入仓库的 "Actions" 标签页
2. 查看最近的工作流运行
3. 点击任意运行查看详细日志

### 访问已部署的应用 / Access Deployed Application

部署成功后，应用将在以下地址可用：

After successful deployment, the application will be available at:

```
https://<your-username>.github.io/<repository-name>/
```

例如 / For example:
```
https://4xiaxia.github.io/ww/
```

## 🛠️ 自定义部署配置 / Customize Deployment Configuration

### 修改基础路径 / Modify Base Path

如果你想在子路径部署，可以在 `.env.local` 中设置：

To deploy to a subpath, set in `.env.local`:

```bash
REPO_NAME=your-repo-name
```

### 修改部署分支 / Change Deployment Branch

编辑 `.github/workflows/deploy.yml` 中的触发条件：

Edit the trigger condition in `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main  # 改为你想要的分支 / Change to your desired branch
```

## 🔧 故障排除 / Troubleshooting

### 部署失败 / Deployment Failed

1. **检查日志** / Check logs
   - 进入 Actions 标签页查看详细错误信息
   - Go to Actions tab to view detailed error messages

2. **常见问题** / Common Issues:
   - ❌ 依赖安装失败 / Dependency installation failed
     - 解决方案：确保 `package.json` 正确 / Solution: Ensure `package.json` is correct
   - ❌ 构建失败 / Build failed
     - 解决方案：本地运行 `npm run build` 检查错误 / Solution: Run `npm run build` locally to check errors
   - ❌ Pages 权限问题 / Pages permission issues
     - 解决方案：检查仓库设置中的 Pages 配置 / Solution: Check Pages configuration in repository settings

### 构建成功但应用不工作 / Build Succeeds but App Doesn't Work

1. **检查基础路径** / Check base path
   - 确保 `vite.config.ts` 中的 `base` 配置正确
   - Ensure the `base` config in `vite.config.ts` is correct

2. **检查环境变量** / Check environment variables
   - 确保所有必需的环境变量都已在 GitHub Secrets 中配置
   - Ensure all required environment variables are configured in GitHub Secrets

3. **检查控制台错误** / Check console errors
   - 在浏览器开发者工具中查看错误信息
   - View error messages in browser developer tools

## 📊 性能优化 / Performance Optimization

构建配置已包含以下优化：

The build configuration includes the following optimizations:

- ✅ **代码分割** / Code splitting: 将 vendor 和 genai 库分离
- ✅ **Tree Shaking**: 移除未使用的代码 / Remove unused code
- ✅ **压缩** / Minification: Terser 压缩 JavaScript
- ✅ **生产环境清理** / Production cleanup: 移除 console.log
- ✅ **缓存优化** / Cache optimization: 使用 npm ci 和缓存

## 🌐 自定义域名 / Custom Domain

### 设置自定义域名 / Set Up Custom Domain

1. **添加 CNAME 文件** / Add CNAME file
   ```bash
   echo "your-domain.com" > public/CNAME
   ```

2. **配置 DNS** / Configure DNS
   - 添加 CNAME 记录指向 `<username>.github.io`
   - Add CNAME record pointing to `<username>.github.io`
   - 或添加 A 记录指向 GitHub Pages IP / Or add A records to GitHub Pages IPs

3. **在 GitHub 设置中启用自定义域名** / Enable custom domain in GitHub settings
   - 进入 Settings → Pages
   - 输入你的域名并保存
   - Enter your domain and save

## 📝 维护建议 / Maintenance Tips

1. **定期更新依赖** / Regularly update dependencies
   ```bash
   npm update
   npm audit fix
   ```

2. **监控构建时间** / Monitor build times
   - 检查 Actions 标签页中的构建时长
   - Check build duration in Actions tab

3. **备份配置** / Backup configuration
   - 保持 `.env.example` 文件更新
   - Keep `.env.example` file up to date

## 📞 获取帮助 / Get Help

如果遇到问题，请：

If you encounter issues:

1. 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
2. 查看 [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
3. 在仓库中提交 Issue
4. 检查 Actions 日志获取详细错误信息
