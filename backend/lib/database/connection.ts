import { sql } from "@vercel/postgres";

/**
 * Test the Vercel Postgres database connection
 *
 * @returns Promise resolving to true if connection is successful
 * @throws Error if connection fails
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log("✅ Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

/**
 * Execute a raw SQL query using Vercel Postgres
 *
 * @param query - SQL query string
 * @param params - Query parameters (optional)
 * @returns Query result
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await sql.query(query, params);
    return result.rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Execute multiple SQL statements (for migrations)
 *
 * @param statements - Array of SQL statements
 * @returns Promise resolving when all statements complete
 */
export async function executeMigration(statements: string[]): Promise<void> {
  for (const statement of statements) {
    // Skip empty statements and comments
    const trimmed = statement.trim();
    if (!trimmed || trimmed.startsWith("--")) {
      continue;
    }

    try {
      await sql.query(trimmed);
      console.log("✅ Executed:", trimmed.substring(0, 50) + "...");
    } catch (error) {
      console.error("❌ Migration error:", error);
      console.error("Failed statement:", trimmed);
      throw error;
    }
  }
}
