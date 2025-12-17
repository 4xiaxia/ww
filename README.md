<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EYrWfgpGnG1nJJ25LjP4JzXY1tntt2it

## 胜算云专线配置 (Shengsuanyun Dedicated Line Configuration)

本应用**默认使用胜算云API代理**以确保国内访问稳定性。  
This app **uses Shengsuanyun API proxy by default** to ensure stable access in Mainland China.

### 专线优势 (Advantages)

✅ **国内访问稳定** - Stable access from Mainland China  
✅ **低延迟响应** - Low latency, high-speed responses  
✅ **无需额外配置** - No additional configuration required  
✅ **自动负载均衡** - Automatic load balancing support

## Run Locally

**Prerequisites:**  Node.js

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key (Required):**
   
   Create a `.env.local` file from the example:
   ```bash
   cp .env.example .env.local
   ```
   
   Set your Gemini API key in `.env.local`:
   ```bash
   API_KEY=your_api_key_here
   ```
   
   - Get your API key from: https://aistudio.google.com/app/apikey
   - **Important:** Never commit your `.env.local` file to git
   - You can specify multiple keys separated by commas for load balancing

3. **Verify Shengsuanyun Configuration (Recommended):**
   
   The app is pre-configured to use Shengsuanyun. Verify in `.env.local`:
   ```bash
   API_BASE_URL=https://router.shengsuanyun.com/api
   ```
   
   This line ensures you're using the dedicated line for optimal performance in Mainland China.

4. **Run the app:**
   ```bash
   npm run dev
   ```

### Verify Connection

After starting the app, verify successful connection to Shengsuanyun:

1. **Check Browser Console** for these log messages:
   ```
   ✅ [Config] Using Shengsuanyun dedicated line (胜算云专线)
   📡 [Config] API Base URL: https://router.shengsuanyun.com/api
   🔍 [API Test] Testing connection to: https://router.shengsuanyun.com/api
   ✅ [API Test] Successfully connected to Shengsuanyun API
   ✅ [CNService] Connected to Shengsuanyun (胜算云专线)
   ```

2. **Check UI Status** - Look for the status indicator in the top-right corner:
   - ✅ **"胜算云专线已连接"** - Successfully connected
   - ⚠️ **"连接异常"** - Connection error (check your API key and network)
   - 🔄 **"检测中..."** - Testing connection (wait a moment)

### Troubleshooting

**Connection Failed?**
- Verify your `API_KEY` is correct in `.env.local`
- Check that `API_BASE_URL=https://router.shengsuanyun.com/api` is set
- Ensure you have internet connectivity
- Review browser console for detailed error messages

**Want to use a different endpoint?**
- Modify `API_BASE_URL` in `.env.local` to your preferred endpoint
- The app will automatically detect and use your custom configuration

### Security Note

🔒 **API keys must NEVER be committed to the repository.** Always use environment variables or `.env.local` files for sensitive configuration. The `.gitignore` file is configured to prevent accidental commits of these files.
