# 东里村智能导览 - CN版本

## 概述

CN版本是专为国内用户设计的简化版本，删除了所有WebSocket相关代码和复杂状态判断，专注于稳定性和易用性。

## 主要特点

### 🎯 简化设计
- **无WebSocket**: 只使用HTTP/REST API，网络稳定性更好
- **强制胜算云**: 配置文件硬编码胜算云API地址，无需选择
- **简化交互**: 长按录音，松手发送，无复杂的上滑取消等功能

### 📦 独立构建
- 独立的源码目录 `src-cn/`
- 独立的构建配置 `vite.config.cn.ts`
- 独立的入口文件 `index-cn.html`
- 独立的构建产物 `dist-cn/`

### 🔧 核心功能
1. **语音输入**: 长按按钮录音，松手自动发送
2. **文字输入**: 点击键盘图标输入文字
3. **智能对话**: 基于Gemini 2.5 Flash的AI对话
4. **景点导览**: 浏览东里村的红色之旅、自然风景、名人、产业等

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
VITE_API_KEY=your_gemini_api_key_here
```

> 📝 可以配置多个API Key（逗号分隔）实现负载均衡：
> ```
> VITE_API_KEY=key1,key2,key3
> ```

### 3. 运行开发服务器

```bash
npm run dev:cn
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build:cn
```

构建产物在 `dist-cn/` 目录

## 文件结构

```
ww/
├── src/                    # 原版（完整保留）
│   └── ... (不动)
│
├── src-cn/                 # 🆕 国内简化版
│   ├── App.tsx            # 主应用 (255行)
│   ├── config.ts          # 配置文件
│   ├── types.ts           # 类型定义
│   ├── main.tsx           # 入口
│   ├── services/
│   │   ├── cnService.ts        # 语音转文字+对话
│   │   └── textService.ts      # 纯文字对话
│   ├── components/
│   │   ├── AgentAvatar.tsx     # 头像组件
│   │   ├── VoiceButton.tsx     # 录音按钮
│   │   └── TextInput.tsx       # 文字输入
│   └── utils/
│       └── audioUtils.ts       # 音频工具
│
├── index-cn.html          # CN版入口
├── vite.config.cn.ts      # CN版构建配置
└── package.json           # 包含 dev:cn 和 build:cn 脚本
```

## 与原版的区别

### 删除的功能
- ❌ LiveService (WebSocket实时通话)
- ❌ TurnBasedService
- ❌ ServiceMode 切换
- ❌ 网络检测弹窗
- ❌ 优雅降级逻辑
- ❌ 复杂的状态管理 (isFallbackMode, isCallActive等)

### 保留的功能
- ✅ 语音录音和识别
- ✅ 文字输入
- ✅ AI对话
- ✅ 语音播放
- ✅ 聊天记录
- ✅ 东里村景点导览

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **AI能力**: Google Gemini 2.5 Flash
- **音频处理**: Web Audio API
- **样式**: Tailwind CSS

## API配置

CN版本强制使用胜算云代理：

```typescript
// src-cn/config.ts
export const CONFIG = {
  API_BASE_URL: 'https://router.shengsuanyun.com/api',
  MODELS: {
    TEXT: 'gemini-2.5-flash',
    TTS: 'gemini-2.5-flash-preview-tts',
  },
  SPEECH: {
    VOICE_NAME: 'Aoede',
  }
};
```

## 使用说明

### 语音交互
1. 长按 "🎤 按住说话" 按钮开始录音
2. 松开按钮自动发送
3. 等待AI回复和语音播放

### 文字交互
1. 点击 "键盘" 图标
2. 输入文字
3. 点击发送按钮

### 查看历史
点击右上角的历史图标查看对话记录

## 性能对比

| 指标 | 原版 | CN版 |
|------|------|------|
| App.tsx 行数 | 930 | 255 (-73%) |
| 总代码行数 | ~2000+ | 817 (-60%) |
| 构建大小 | ~470KB | ~467KB |
| 网络依赖 | WebSocket + HTTP | 仅HTTP |
| 启动时间 | ~300ms | ~170ms |

## 常见问题

### Q: 为什么要创建CN版本？
A: 简化国内用户的使用体验，删除WebSocket等可能导致网络问题的功能，专注于稳定性。

### Q: CN版本和原版可以同时使用吗？
A: 可以。它们是完全独立的，可以同时开发和部署。

### Q: 如何切换回原版？
A: 使用 `npm run dev` 或 `npm run build` 即可使用原版。

### Q: CN版本支持实时语音对话吗？
A: 不支持。CN版本使用"录音-发送-回复"的方式，类似微信语音。

## 许可证

与原版相同

## 贡献

欢迎提交Issue和PR！
