import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/database/connection";
import { testKVConnection } from "@/lib/kv/connection";

/**
 * Test endpoint to verify database and KV connections
 * GET /api/test
 *
 * @returns JSON response with connection test results
 */
export async function GET() {
  const results = {
    database: false,
    kv: false,
    errors: [] as string[],
  };

  // Test Postgres
  try {
    results.database = await testDatabaseConnection();
  } catch (error) {
    results.errors.push(`Database: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // Test KV
  try {
    results.kv = await testKVConnection();
  } catch (error) {
    results.errors.push(`KV: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  const allSuccess = results.database && results.kv;

  return NextResponse.json(
    {
      success: allSuccess,
      ...results,
      message: allSuccess
        ? "All connections successful!"
        : "Some connections failed",
    },
    { status: allSuccess ? 200 : 500 }
  );
}
