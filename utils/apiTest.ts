import { CONFIG, getNextApiKey } from '../config';

/**
 * Test Shengsuanyun API Connection
 * Tests connectivity to the configured API endpoint
 * @returns Promise<boolean> - true if connection successful, false otherwise
 */
export async function testShengsuanConnection(): Promise<boolean> {
  try {
    const apiKey = getNextApiKey();
    
    if (!apiKey) {
      console.error('❌ [API Test] No API key available');
      return false;
    }

    console.log('🔍 [API Test] Testing connection to:', CONFIG.API_BASE_URL);
    
    const testUrl = `${CONFIG.API_BASE_URL}/v1/models`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      console.log('✅ [API Test] Successfully connected to Shengsuanyun API');
      console.log('✅ [API Test] Endpoint:', CONFIG.API_BASE_URL);
      console.log('✅ [API Test] Status:', response.status);
      return true;
    } else {
      console.warn('⚠️ [API Test] API responded with non-OK status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ [API Test] Shengsuanyun connection failed:', error);
    return false;
  }
}

/**
 * Log current API configuration
 * Displays the API configuration being used
 */
export function logApiConfiguration(): void {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 [Shengsuanyun Config] API Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 API Base URL:', CONFIG.API_BASE_URL);
  console.log('🇨🇳 CN Proxy URL:', CONFIG.CN_API_BASE_URL);
  console.log('🔑 API Key:', getNextApiKey() ? '✓ Configured' : '✗ Missing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
