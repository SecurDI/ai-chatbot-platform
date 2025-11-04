/**
 * Create database functions and triggers separately
 * These have complex $$ delimiters that need special handling
 */

const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function createFunctions() {
  console.log("🔧 Creating database functions and triggers...\n");

  try {
    // Function 1: Update timestamp trigger function
    console.log("1️⃣ Creating update_updated_at_column function...");
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log("✅ Created update_updated_at_column\n");

    // Trigger for chat_sessions
    console.log("2️⃣ Creating chat_sessions update trigger...");
    await sql`
      CREATE TRIGGER update_chat_sessions_updated_at
        BEFORE UPDATE ON chat_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log("✅ Created update_chat_sessions_updated_at trigger\n");

    // Function 2: Expire old approval requests
    console.log("3️⃣ Creating expire_old_approval_requests function...");
    await sql`
      CREATE OR REPLACE FUNCTION expire_old_approval_requests()
      RETURNS INTEGER AS $$
      DECLARE
        affected_rows INTEGER;
      BEGIN
        UPDATE approval_requests
        SET status = 'expired'
        WHERE status = 'pending'
          AND expires_at < NOW();

        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RETURN affected_rows;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log("✅ Created expire_old_approval_requests\n");

    // Function 3: Get user activity summary
    console.log("4️⃣ Creating get_user_activity_summary function...");
    await sql`
      CREATE OR REPLACE FUNCTION get_user_activity_summary(
        p_user_id UUID,
        p_days INTEGER DEFAULT 7
      )
      RETURNS TABLE (
        total_actions BIGINT,
        successful_actions BIGINT,
        failed_actions BIGINT,
        denied_actions BIGINT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          COUNT(*) as total_actions,
          COUNT(*) FILTER (WHERE status = 'success') as successful_actions,
          COUNT(*) FILTER (WHERE status = 'error') as failed_actions,
          COUNT(*) FILTER (WHERE status = 'denied') as denied_actions
        FROM activity_logs
        WHERE user_id = p_user_id
          AND timestamp > NOW() - INTERVAL '1 day' * p_days;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log("✅ Created get_user_activity_summary\n");

    // Create views
    console.log("5️⃣ Creating v_pending_approvals view...");
    await sql`
      CREATE OR REPLACE VIEW v_pending_approvals AS
      SELECT
        ar.id,
        ar.command_text,
        ar.justification,
        ar.requested_at,
        ar.expires_at,
        u.display_name as requester_name,
        u.email as requester_email,
        EXTRACT(EPOCH FROM (ar.expires_at - NOW())) / 3600 as hours_until_expiry
      FROM approval_requests ar
      JOIN users u ON ar.requester_id = u.id
      WHERE ar.status = 'pending'
        AND ar.expires_at > NOW()
      ORDER BY ar.requested_at ASC
    `;
    console.log("✅ Created v_pending_approvals view\n");

    console.log("6️⃣ Creating v_recent_activity view...");
    await sql`
      CREATE OR REPLACE VIEW v_recent_activity AS
      SELECT
        al.id,
        al.action_type,
        al.status,
        al.timestamp,
        u.display_name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `;
    console.log("✅ Created v_recent_activity view\n");

    console.log("🎉 All functions, triggers, and views created successfully!");
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log("⏭️  Some objects already exist, which is fine.");
      process.exit(0);
    }
    console.error("\n❌ Failed to create functions:", error);
    process.exit(1);
  }
}

createFunctions();
