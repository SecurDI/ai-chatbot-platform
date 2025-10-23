/**
 * Test script to verify database and KV connections
 * Run with: node scripts/test-connections.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🔍 Testing database connections...\n");

  // Test Postgres connection
  try {
    console.log("1️⃣ Testing Vercel Postgres...");
    const { testDatabaseConnection } = await import("../lib/database/connection.js");
    await testDatabaseConnection();
    console.log("✅ Postgres connection successful!\n");
  } catch (error) {
    console.error("❌ Postgres connection failed:", error.message);
    process.exit(1);
  }

  // Test KV connection
  try {
    console.log("2️⃣ Testing Vercel KV (Redis)...");
    const { testKVConnection } = await import("../lib/kv/connection.js");
    await testKVConnection();
    console.log("✅ KV connection successful!\n");
  } catch (error) {
    console.error("❌ KV connection failed:", error.message);
    process.exit(1);
  }

  console.log("🎉 All connections successful!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
