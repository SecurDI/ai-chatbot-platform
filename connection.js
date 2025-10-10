"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kv = void 0;
exports.testKVConnection = testKVConnection;
const redis_1 = require("@upstash/redis");
/**
 * Initialize Redis client using Upstash KV
 * Uses REST API for serverless compatibility
 */
exports.kv = new redis_1.Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});
/**
 * Test the Vercel KV (Redis) connection
 *
 * @returns Promise resolving to true if connection is successful
 * @throws Error if connection fails
 */
async function testKVConnection() {
    try {
        const testKey = "test:connection";
        const testValue = { timestamp: new Date().toISOString() };
        // Set a test value
        await exports.kv.set(testKey, testValue, { ex: 10 }); // Expires in 10 seconds
        // Get the test value
        const retrieved = await exports.kv.get(testKey);
        console.log("✅ KV connection successful:", retrieved);
        // Clean up
        await exports.kv.del(testKey);
        return true;
    }
    catch (error) {
        console.error("❌ KV connection failed:", error);
        throw error;
    }
}
