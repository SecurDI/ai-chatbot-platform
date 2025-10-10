/**
 * Database migration script
 * Runs all migrations from DATABASE_MIGRATIONS.sql
 * Run with: npm run db:migrate
 */

const fs = require('fs');
const path = require('path');
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  console.log("🚀 Starting database migrations...\n");

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'DATABASE_MIGRATIONS.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Remove all comments first
    let cleanSQL = migrationSQL
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--');
      })
      .join('\n');

    // Split by semicolons at end of line
    const statements = cleanSQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

      try {
        await sql.query(statement + ';');
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error) {
        // Some statements might fail if objects already exist - that's okay
        if (error.message.includes('already exists')) {
          skipCount++;
          console.log(`⏭️  [${i + 1}/${statements.length}] ${preview}... (already exists)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Failed:`, error.message);
          console.error(`Statement: ${preview}...`);
          throw error;
        }
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`   ✅ Executed: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   📊 Total: ${statements.length}\n`);

    // Verify tables were created
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log("📋 Tables in database:");
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
