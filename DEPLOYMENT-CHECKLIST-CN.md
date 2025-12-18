# 东里村智能导览 CN版 - 部署检查清单

## 🔍 部署前检查

### 1. 环境检查 ✓

```bash
# 检查 Node.js 版本（需要 18+）
node --version
# 预期输出: v18.x.x 或更高

# 检查 npm 版本（需要 9+）
npm --version
# 预期输出: 9.x.x 或更高

# 检查 Git 版本
git --version
# 预期输出: git version 2.x.x
```

### 2. 代码获取 ✓

```bash
# 克隆仓库
git clone https://github.com/4xiaxia/ww.git
cd ww

# 切换到 CN 版本分支
git checkout copilot/create-cn-version

# 验证分支
git branch
# 预期输出: * copilot/create-cn-version

# 验证文件存在
ls -la src-cn/
# 应该看到: App.tsx, config.ts, main.tsx, components/, services/, utils/
```

### 3. 依赖安装 ✓

```bash
# 清理旧依赖（如果有）
rm -rf node_modules package-lock.json

# 安装依赖
npm install

# 验证安装成功
npm list --depth=0
# 应该看到所有依赖包，无错误
```

**常见问题：**
- ❌ 如果遇到 `ERESOLVE` 错误：
  ```bash
  npm install --legacy-peer-deps
  ```
- ❌ 如果遇到权限问题：
  ```bash
  sudo chown -R $(whoami) ~/.npm
  npm cache clean --force
  npm install
  ```

### 4. 环境变量配置 ✓

```bash
# 创建 .env.local 文件
cat > .env.local << EOF
VITE_API_KEY=你的_Gemini_API_密钥
EOF

# 验证文件内容
cat .env.local
# 应该看到: VITE_API_KEY=AIza...

# 验证密钥格式（不应该有引号或空格）
grep -E '^VITE_API_KEY=[A-Za-z0-9_-]+$' .env.local
# 应该有输出，表示格式正确
```

**API 密钥要求：**
- ✅ 必须是有效的 Gemini API 密钥
- ✅ 格式：`VITE_API_KEY=AIza...`（无引号，无空格）
- ✅ 可以配置多个密钥（逗号分隔）：`VITE_API_KEY=key1,key2,key3`

### 5. 构建测试 ✓

```bash
# 清理旧构建产物
rm -rf dist-cn

# 执行构建
npm run build:cn

# 验证构建成功
echo $?
# 预期输出: 0（表示成功）

# 检查构建产物
ls -lh dist-cn/
# 应该看到:
# - index-cn.html (约 1.36 KB)
# - assets/main-[hash].js (约 470 KB)

# 验证 HTML 文件
grep -q 'main-.*\.js' dist-cn/index-cn.html
echo $?
# 预期输出: 0（表示 JS 引用正确）
```

**构建失败排查：**
- ❌ `vite: not found` → 重新运行 `npm install`
- ❌ `API_KEY is required` → 检查 `.env.local` 文件
- ❌ TypeScript 错误 → 检查 `src-cn/` 目录是否完整

---

## 🚀 部署验证

### 方案 1: 本地预览（推荐先测试）

```bash
# 启动预览服务器
npx vite preview --outDir dist-cn --port 4173

# 在浏览器访问
# http://localhost:4173
```

**本地预览检查清单：**
- [ ] 页面能正常加载（无空白页）
- [ ] 控制台无报错
- [ ] 能看到"东里村"标题
- [ ] 四个分类卡片显示正常
- [ ] 点击"东里名人"能进入分类页
- [ ] 录音按钮显示正常
- [ ] 键盘图标可点击

### 方案 2: Nginx 部署

#### 部署步骤

```bash
# 1. 安装 Nginx（如果未安装）
sudo apt update && sudo apt install nginx -y

# 2. 创建部署目录
sudo mkdir -p /var/www/dongli-cn

# 3. 复制构建产物
sudo cp -r dist-cn/* /var/www/dongli-cn/

# 4. 设置权限
sudo chown -R www-data:www-data /var/www/dongli-cn
sudo chmod -R 755 /var/www/dongli-cn

# 5. 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/dongli-cn > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;  # 修改为你的域名
    
    root /var/www/dongli-cn;
    index index-cn.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_comp_level 6;
    
    # 主路由
    location / {
        try_files $uri $uri/ /index-cn.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

# 6. 启用站点
sudo ln -sf /etc/nginx/sites-available/dongli-cn /etc/nginx/sites-enabled/

# 7. 测试配置
sudo nginx -t
# 预期输出: syntax is ok, test is successful

# 8. 重启 Nginx
sudo systemctl restart nginx

# 9. 验证服务状态
sudo systemctl status nginx
# 应该显示: active (running)
```

#### Nginx 部署验证

```bash
# 检查端口监听
sudo netstat -tlnp | grep :80
# 应该看到 nginx 进程

# 检查文件权限
ls -la /var/www/dongli-cn/
# index-cn.html 应该可读

# 测试本地访问
curl -I http://localhost
# 应该返回 200 OK

# 检查日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 方案 3: Docker 部署

#### Dockerfile 验证

```bash
# 创建 Dockerfile（如果没有）
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY
RUN npm run build:cn

FROM nginx:alpine
COPY --from=builder /app/dist-cn /usr/share/nginx/html
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 创建 nginx-docker.conf
cat > nginx-docker.conf << 'EOF'
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
EOF

# 构建镜像
docker build --build-arg VITE_API_KEY=你的API密钥 -t dongli-cn:latest .

# 验证镜像
docker images | grep dongli-cn
# 应该看到 dongli-cn latest ...

# 运行容器
docker run -d -p 8080:80 --name dongli-cn dongli-cn:latest

# 验证容器运行
docker ps | grep dongli-cn
# 应该显示容器正在运行

# 测试访问
curl -I http://localhost:8080
# 应该返回 200 OK
```

### 方案 4: Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 创建 vercel.json
cat > vercel.json << 'EOF'
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
  ]
}
EOF

# 3. 登录 Vercel
vercel login

# 4. 设置环境变量
vercel env add VITE_API_KEY production
# 输入你的 API 密钥

# 5. 部署
vercel --prod

# 6. 验证部署
# Vercel 会输出部署 URL，访问该 URL 测试
```

---

## 🔧 常见部署问题排查

### 问题 1: 页面空白（最常见）

**症状：** 访问页面只看到白屏，无内容显示

**排查步骤：**

```bash
# 1. 打开浏览器开发者工具（F12）
# 2. 查看 Console 标签，检查错误信息

# 常见错误及解决方案：

# 错误 A: "Failed to load module script"
# 原因：路径不正确
# 解决：检查 base 路径配置

# 错误 B: "Uncaught ReferenceError: process is not defined"
# 原因：环境变量未正确配置
# 解决：确保 vite.config.cn.ts 中正确定义了环境变量

# 错误 C: 404 on /assets/main-*.js
# 原因：静态文件路径错误
# 解决：检查 Nginx 配置或服务器配置
```

**快速修复：**

```bash
# 重新构建并检查
npm run build:cn
cat dist-cn/index-cn.html | grep -o 'src="[^"]*"'
# 确认 JS 文件路径正确（应该是 /assets/main-*.js）
```

### 问题 2: API 调用失败

**症状：** 提示"网络不给力哦~"或无法获取 AI 回复

**排查步骤：**

```bash
# 1. 检查 API 密钥是否有效
curl -X POST "https://router.shengsuanyun.com/api/v1/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: 你的API密钥" \
  -d '{"contents":[{"parts":[{"text":"测试"}]}]}'

# 2. 检查网络连接
ping router.shengsuanyun.com

# 3. 检查浏览器控制台 Network 标签
# 查看 API 请求的状态码和响应
```

**解决方案：**
- ✅ 验证 API 密钥有效性
- ✅ 检查 API 配额是否用尽
- ✅ 确认网络可以访问 router.shengsuanyun.com
- ✅ 检查 CORS 配置（通常代理已处理）

### 问题 3: 录音功能不工作

**症状：** 点击录音按钮无反应或提示"无法访问麦克风"

**排查步骤：**

```bash
# 检查清单：
# 1. 浏览器是否支持 MediaRecorder API
# 2. 网站是否使用 HTTPS（或 localhost）
# 3. 用户是否授予了麦克风权限
# 4. 麦克风设备是否正常工作
```

**解决方案：**
- ✅ 使用 Chrome/Edge/Firefox 最新版本
- ✅ 部署到 HTTPS 域名（HTTP 下麦克风受限）
- ✅ 在浏览器设置中允许麦克风权限
- ✅ 测试麦克风设备是否工作

### 问题 4: 构建失败

**症状：** `npm run build:cn` 报错

**常见错误及解决：**

```bash
# 错误 1: "vite: not found"
npm install

# 错误 2: "TypeScript error in src-cn/..."
# 检查 TypeScript 文件是否有语法错误
npx tsc --noEmit -p tsconfig.json

# 错误 3: "Out of memory"
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:cn

# 错误 4: "Permission denied"
# 检查文件权限
ls -la src-cn/
chmod -R 755 src-cn/
```

### 问题 5: CDN 资源加载失败

**症状：** 样式错乱，图标不显示

**原因：** Tailwind CSS 或 Font Awesome CDN 无法访问

**解决方案：**

```bash
# 方案 A: 使用国内 CDN
# 编辑 index-cn.html，替换 CDN 链接

# Tailwind CSS 国内镜像
# 使用 unpkg.com 或 jsdelivr.net

# Font Awesome 国内镜像
# 使用 npm.elemecdn.com

# 方案 B: 本地化资源
npm install tailwindcss @fortawesome/fontawesome-free
# 修改构建配置引入本地文件
```

---

## ✅ 部署成功验证清单

完成部署后，请验证以下功能：

### 基础功能
- [ ] 页面正常加载（无空白，无报错）
- [ ] 标题显示"东里村"
- [ ] 四个分类卡片显示正常
- [ ] 历史记录按钮可点击
- [ ] 村官小萌头像显示正常

### 导航功能
- [ ] 点击"红色之旅"进入景点列表
- [ ] 点击"自然风景"进入景点列表
- [ ] 点击"东里名人"进入分类选择页
- [ ] 在分类选择页能看到三个分类
- [ ] 点击分类能进入人物列表
- [ ] 点击人物卡片能进入详情页
- [ ] 返回按钮功能正常

### 交互功能
- [ ] 点击"键盘"图标弹出文字输入框
- [ ] 文字输入框能输入文字
- [ ] 发送按钮能发送消息
- [ ] 长按录音按钮能开始录音
- [ ] 松开按钮能停止并发送录音
- [ ] 聊天记录能正常显示
- [ ] 历史记录面板能打开和关闭

### AI 功能
- [ ] 发送文字后能收到 AI 回复
- [ ] 发送语音后能收到 AI 回复
- [ ] AI 回复有语音播放
- [ ] 聊天记录正确记录对话

### 性能检查
- [ ] 页面加载时间 < 3 秒
- [ ] 首次交互延迟 < 1 秒
- [ ] 语音回复延迟 < 5 秒
- [ ] 无明显卡顿

---

## 📞 获取帮助

如果部署仍然失败，请提供以下信息：

1. **环境信息：**
   ```bash
   node --version
   npm --version
   uname -a
   ```

2. **错误日志：**
   - 构建日志：`npm run build:cn > build.log 2>&1`
   - 浏览器控制台截图
   - 服务器错误日志

3. **部署方式：**
   - 使用的部署方案（Nginx/Docker/Vercel/其他）
   - 服务器系统和版本

4. **访问信息：**
   - 部署的域名或 IP
   - 浏览器类型和版本

---

## 🎯 快速部署命令（一键复制）

```bash
# 完整部署流程（用于全新环境）
git clone https://github.com/4xiaxia/ww.git && \
cd ww && \
git checkout copilot/create-cn-version && \
npm install && \
echo "VITE_API_KEY=你的API密钥" > .env.local && \
npm run build:cn && \
echo "✅ 构建完成！产物在 dist-cn/ 目录"
```

---

**最后更新**: 2025-12-18  
**文档版本**: v1.1
