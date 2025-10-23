import { Redis } from "@upstash/redis";
import { logger } from "../utils/logger";

/**
 * Initialize Redis client using Upstash KV
 * Uses REST API for serverless compatibility
 */
function createKVClient(): Redis {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  if (!url || !token) {
    logger.error("❌ KV configuration missing", { 
      hasUrl: !!url, 
      hasToken: !!token 
    });
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be configured");
  }
  
  logger.info("🔗 Initializing KV client", { url: url.substring(0, 20) + "..." });
  return new Redis({ url, token });
}

export const kv = createKVClient();

/**
 * Test the Vercel KV (Redis) connection
 *
 * @returns Promise resolving to true if connection is successful
 * @throws Error if connection fails
 */
export async function testKVConnection(): Promise<boolean> {
  try {
    const testKey = "test:connection";
    const testValue = { timestamp: new Date().toISOString() };

    // Set a test value
    await kv.set(testKey, testValue, { ex: 10 }); // Expires in 10 seconds

    // Get the test value
    const retrieved = await kv.get(testKey);

    console.log("✅ KV connection successful:", retrieved);

    // Clean up
    await kv.del(testKey);

    return true;
  } catch (error) {
    console.error("❌ KV connection failed:", error);
    throw error;
  }
}
