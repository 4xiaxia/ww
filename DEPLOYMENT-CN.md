# 东里村智能导览 CN版 - 完整部署指南

## 📋 目录
- [环境要求](#环境要求)
- [快速部署](#快速部署)
- [详细步骤](#详细步骤)
- [生产环境部署](#生产环境部署)
- [常见问题排查](#常见问题排查)

---

## 环境要求

### 必需软件
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Git**: 用于克隆代码

### API密钥
- **Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取
- **胜算云账号**: 已配置使用 `https://router.shengsuanyun.com/api`

---

## 快速部署

### 一键启动脚本

```bash
#!/bin/bash
# 保存为 deploy-cn.sh 并执行 chmod +x deploy-cn.sh

# 1. 克隆仓库
git clone https://github.com/4xiaxia/ww.git
cd ww

# 2. 安装依赖
npm install

# 3. 配置环境变量
echo "VITE_API_KEY=你的API密钥" > .env.local

# 4. 构建生产版本
npm run build:cn

# 5. 预览（可选）
# npm run preview -- --outDir dist-cn

echo "✅ 构建完成！产物在 dist-cn/ 目录"
```

---

## 详细步骤

### 步骤 1: 获取代码

```bash
# 克隆仓库
git clone https://github.com/4xiaxia/ww.git
cd ww

# 查看分支
git branch -a

# 切换到CN版本分支（如果需要）
# git checkout copilot/create-cn-version
```

### 步骤 2: 安装依赖

```bash
# 安装所有依赖包
npm install

# 验证安装
npm list --depth=0
```

**预期输出：**
```
ww@0.0.0
├── @google/genai@1.33.0
├── @vitejs/plugin-react@5.1.2
├── react@19.2.3
├── react-dom@19.2.3
├── typescript@5.8.2
├── vite@6.2.0
└── ws@8.18.3
```

### 步骤 3: 配置环境变量

#### 方式 1: 使用 .env.local 文件（推荐）

创建 `.env.local` 文件：

```bash
# .env.local
VITE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 多个密钥负载均衡（可选）
# VITE_API_KEY=key1,key2,key3
```

#### 方式 2: 命令行环境变量

```bash
export VITE_API_KEY="你的API密钥"
npm run build:cn
```

### 步骤 4: 开发模式运行

```bash
# 启动开发服务器
npm run dev:cn
```

访问 http://localhost:5173

**开发模式特点：**
- ✅ 热重载（代码修改自动刷新）
- ✅ 详细错误信息
- ✅ Source maps 调试
- ⚠️ 性能未优化

### 步骤 5: 构建生产版本

```bash
# 构建
npm run build:cn

# 查看构建产物
ls -lh dist-cn/
```

**构建产物：**
```
dist-cn/
├── index-cn.html          (1.36 KB)
└── assets/
    └── main-[hash].js     (~470 KB)
```

### 步骤 6: 本地预览生产版本

```bash
# 预览构建后的版本
npx vite preview --outDir dist-cn --port 4173
```

访问 http://localhost:4173

---

## 生产环境部署

### 方案 1: Nginx 部署

#### 1.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 1.2 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/dongli-cn`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名
    
    root /var/www/dongli-cn;
    index index-cn.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    
    location / {
        try_files $uri $uri/ /index-cn.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理（如果需要）
    location /api/ {
        proxy_pass https://router.shengsuanyun.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 1.3 部署文件

```bash
# 上传构建产物
scp -r dist-cn/* user@server:/var/www/dongli-cn/

# 或使用 rsync
rsync -avz --delete dist-cn/ user@server:/var/www/dongli-cn/
```

#### 1.4 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/dongli-cn /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 方案 2: Vercel 部署

#### 2.1 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 创建 vercel.json

```json
{
  "buildCommand": "npm run build:cn",
  "outputDirectory": "dist-cn",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index-cn.html"
    }
  ],
  "env": {
    "VITE_API_KEY": "@vite_api_key"
  }
}
```

#### 2.3 部署

```bash
# 登录
vercel login

# 设置环境变量
vercel env add VITE_API_KEY production

# 部署
vercel --prod
```

### 方案 3: Docker 部署

#### 3.1 创建 Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 CN 版本
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY
RUN npm run build:cn

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist-cn /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3.2 创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index-cn.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    location / {
        try_files $uri $uri/ /index-cn.html;
    }
}
```

#### 3.3 构建和运行

```bash
# 构建镜像
docker build --build-arg VITE_API_KEY=你的API密钥 -t dongli-cn:latest .

# 运行容器
docker run -d -p 8080:80 --name dongli-cn dongli-cn:latest

# 查看日志
docker logs -f dongli-cn
```

### 方案 4: 静态托管服务

支持的平台：
- **Netlify**: 拖拽 `dist-cn` 文件夹即可
- **GitHub Pages**: 部署到 `gh-pages` 分支
- **Cloudflare Pages**: 连接 GitHub 仓库自动部署
- **阿里云 OSS**: 上传静态文件并配置 CDN

---

## 常见问题排查

### ❌ 问题 1: 依赖安装失败

**症状：**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案：**
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps
```

### ❌ 问题 2: 构建失败 - API_KEY 错误

**症状：**
```
❌ API_KEY is required! Please set VITE_API_KEY in your environment variables.
```

**解决方案：**
```bash
# 检查环境变量
echo $VITE_API_KEY

# 确保 .env.local 存在且格式正确
cat .env.local

# 正确格式：
# VITE_API_KEY=AIzaSy...
```

### ❌ 问题 3: 页面加载空白

**可能原因：**
1. 路径配置错误
2. 基础路径不正确
3. JavaScript 加载失败

**排查步骤：**
```bash
# 1. 检查浏览器控制台
# 打开 Chrome DevTools (F12) 查看错误

# 2. 检查网络请求
# Network 标签查看是否有 404 错误

# 3. 验证构建产物
ls -R dist-cn/

# 4. 检查 HTML 文件
cat dist-cn/index-cn.html
```

### ❌ 问题 4: 语音功能不工作

**症状：**
- 点击录音按钮无反应
- 提示"无法访问麦克风"

**解决方案：**
```
1. 检查浏览器权限
   - Chrome: 设置 → 隐私和安全 → 网站设置 → 麦克风
   - 确保网站有麦克风权限

2. 使用 HTTPS
   - HTTP 下麦克风功能受限
   - 本地开发使用 localhost 可以正常工作

3. 检查 API 密钥
   - 确保密钥有效且有配额
```

### ❌ 问题 5: API 调用失败

**症状：**
```
网络不给力哦~
```

**排查步骤：**
```bash
# 1. 测试 API 连接
curl -X POST "https://router.shengsuanyun.com/api/v1/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: 你的API密钥" \
  -d '{"contents":[{"parts":[{"text":"测试"}]}]}'

# 2. 检查网络
ping router.shengsuanyun.com

# 3. 查看浏览器控制台网络请求
# Network 标签中查看请求状态和响应
```

### ❌ 问题 6: 构建体积过大

**优化方案：**

1. **启用代码分割**（已默认开启）
2. **压缩资源**
   ```bash
   # 安装压缩工具
   npm install -D vite-plugin-compression
   ```

3. **分析构建产物**
   ```bash
   # 安装分析工具
   npm install -D rollup-plugin-visualizer
   
   # 构建并分析
   npm run build:cn
   # 查看生成的 stats.html
   ```

---

## 性能优化

### CDN 加速

在 `index-cn.html` 中已使用 CDN：
```html
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
```

### 浏览器缓存

Nginx 配置已包含缓存策略：
```nginx
location ~* \.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 压缩传输

确保服务器启用 Gzip：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_comp_level 6;
```

---

## 监控和维护

### 日志查看

**Nginx 日志：**
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

**应用日志（浏览器）：**
- 打开 Chrome DevTools
- Console 标签查看应用日志
- 前缀 `[CNService]` 和 `[TextService]` 的是服务日志

### 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖（如有）
npm install

# 3. 重新构建
npm run build:cn

# 4. 部署到服务器
rsync -avz --delete dist-cn/ user@server:/var/www/dongli-cn/

# 5. 重启服务（如需要）
sudo systemctl reload nginx
```

---

## 安全建议

### 1. API 密钥保护

```bash
# ✅ 正确：使用环境变量
VITE_API_KEY=xxx npm run build:cn

# ❌ 错误：硬编码在代码中
# const API_KEY = "AIza..." // 永远不要这样做！
```

### 2. HTTPS 部署

```bash
# 使用 Let's Encrypt 免费证书
sudo certbot --nginx -d your-domain.com
```

### 3. 安全头配置

在 Nginx 中添加：
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## 备份和恢复

### 备份构建产物

```bash
# 创建备份
tar -czf dongli-cn-backup-$(date +%Y%m%d).tar.gz dist-cn/

# 恢复备份
tar -xzf dongli-cn-backup-20250118.tar.gz
```

### 数据库备份

（当前版本无数据库，所有数据在前端）

---

## 支持和联系

- **GitHub Issues**: https://github.com/4xiaxia/ww/issues
- **文档**: README-CN.md
- **版本**: CN v1.0

---

## 总结检查清单

部署前确认：
- [ ] Node.js 18+ 已安装
- [ ] API 密钥已配置
- [ ] 依赖安装成功 (`npm install`)
- [ ] 构建成功 (`npm run build:cn`)
- [ ] 本地预览正常
- [ ] 生产环境配置完成
- [ ] HTTPS 证书配置（如需要）
- [ ] 备份策略就绪

---

**🎉 部署完成！访问你的域名即可使用东里村智能导览 CN 版！**
