# 部署检查清单 / Deployment Checklist

## 首次部署 / Initial Deployment

### 1. GitHub Pages 设置 / GitHub Pages Setup
- [ ] 进入仓库 Settings → Pages / Go to Repository Settings → Pages
- [ ] Source 选择 "GitHub Actions" / Select "GitHub Actions" as Source
- [ ] 保存设置 / Save settings

### 2. 环境变量配置 / Environment Variables Configuration
- [ ] 进入 Settings → Secrets and variables → Actions / Go to Settings → Secrets and variables → Actions
- [ ] 添加以下 secrets (如果需要) / Add the following secrets (if needed):
  - [ ] `API_KEY` - Gemini API 密钥 / Gemini API Key
  - [ ] `API_BASE_URL` - API 基础地址 (可选) / API Base URL (optional)

### 3. 本地环境配置 / Local Environment Setup
- [ ] 复制 `.env.example` 到 `.env.local` / Copy `.env.example` to `.env.local`
- [ ] 设置 `GEMINI_API_KEY` / Set `GEMINI_API_KEY`
- [ ] 设置 `REPO_NAME=ww` (用于 GitHub Pages) / Set `REPO_NAME=ww` (for GitHub Pages)
- [ ] 运行 `npm install` / Run `npm install`
- [ ] 测试本地构建 `npm run build` / Test local build with `npm run build`

### 4. 触发首次部署 / Trigger First Deployment
- [ ] 推送到 main 分支 / Push to main branch
  ```bash
  git push origin main
  ```
- [ ] 或在 Actions 标签页手动触发 / Or manually trigger in Actions tab

### 5. 验证部署 / Verify Deployment
- [ ] 在 Actions 标签页检查工作流状态 / Check workflow status in Actions tab
- [ ] 等待构建和部署完成 (通常 2-3 分钟) / Wait for build and deploy to complete (usually 2-3 minutes)
- [ ] 访问 `https://4xiaxia.github.io/ww/` / Visit `https://4xiaxia.github.io/ww/`
- [ ] 测试应用功能 / Test application features

## 日常部署 / Regular Deployment

### 代码变更后 / After Code Changes
- [ ] 确保本地测试通过 / Ensure local tests pass
  ```bash
  npm run type-check
  npm run build
  npm run preview
  ```
- [ ] 提交并推送到 main 分支 / Commit and push to main branch
- [ ] 自动触发部署 / Deployment triggers automatically
- [ ] 在 Actions 中监控部署状态 / Monitor deployment status in Actions

### 环境变量更新 / Environment Variables Update
- [ ] 在 GitHub Secrets 中更新变量 / Update variables in GitHub Secrets
- [ ] 手动触发工作流或推送新代码 / Manually trigger workflow or push new code
- [ ] 验证新配置生效 / Verify new configuration works

## 故障排除 / Troubleshooting

### 部署失败 / Deployment Failed
1. [ ] 检查 Actions 日志中的错误信息 / Check error messages in Actions logs
2. [ ] 确认所有依赖已正确安装 / Confirm all dependencies are installed correctly
3. [ ] 本地运行 `npm run build` 复现问题 / Run `npm run build` locally to reproduce
4. [ ] 检查 TypeScript 错误 `npm run type-check` / Check TypeScript errors with `npm run type-check`

### 应用无法访问 / Application Not Accessible
1. [ ] 确认 GitHub Pages 已启用 / Confirm GitHub Pages is enabled
2. [ ] 检查 URL 是否正确 / Check if URL is correct
3. [ ] 等待 DNS 传播 (可能需要几分钟) / Wait for DNS propagation (may take a few minutes)
4. [ ] 检查浏览器控制台错误 / Check browser console for errors

### 资源路径错误 / Resource Path Errors
1. [ ] 确认 `REPO_NAME` 环境变量设置正确 / Confirm `REPO_NAME` environment variable is set correctly
2. [ ] 检查 `vite.config.ts` 中的 `base` 配置 / Check `base` config in `vite.config.ts`
3. [ ] 重新构建和部署 / Rebuild and redeploy

## 性能监控 / Performance Monitoring

### 检查项 / Check Items
- [ ] 构建时间是否合理 (<2 分钟) / Build time is reasonable (<2 minutes)
- [ ] 包大小是否在可接受范围 (<500KB) / Bundle size is acceptable (<500KB)
- [ ] 页面加载速度 / Page load speed
- [ ] 没有控制台错误 / No console errors

### 优化建议 / Optimization Tips
- [ ] 定期运行 `npm audit` 检查安全漏洞 / Regularly run `npm audit` for vulnerabilities
- [ ] 更新依赖到最新稳定版本 / Update dependencies to latest stable versions
- [ ] 监控打包大小变化 / Monitor bundle size changes
- [ ] 使用 Lighthouse 分析性能 / Use Lighthouse for performance analysis

## 安全检查 / Security Checklist
- [ ] ✅ 工作流权限已最小化 / Workflow permissions minimized
- [ ] ✅ Secrets 不在代码中暴露 / Secrets not exposed in code
- [ ] ✅ 生产环境移除 console.log / Console.log removed in production
- [ ] ✅ 依赖项无已知漏洞 / Dependencies have no known vulnerabilities
- [ ] ✅ CodeQL 安全扫描通过 / CodeQL security scan passed

## 文档链接 / Documentation Links
- [完整部署文档 / Full Deployment Guide](../DEPLOYMENT.md)
- [README](../README.md)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
