-- =============================================
-- AI Chatbot Platform - Database Migrations
-- PostgreSQL Schema for Vercel Postgres
-- =============================================
-- Version: 1.0.0
-- Created: 2025-10-01
-- Description: Complete database schema for AI chatbot platform
--              with user management, chat sessions, approval workflows,
--              and activity logging.
-- =============================================

-- Enable UUID extension (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLE: users
-- Purpose: Store user information from EntraID authentication
-- Indexes: email, entra_id for fast lookups
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entra_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(512) NOT NULL, -- Increased length from 255 to 512
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'end-user')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_entra_id ON users(entra_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =============================================
-- TABLE: approval_requests
-- Purpose: Manage approval workflow for commands requiring admin approval
-- Business Rules:
--   - Auto-expires after 24 hours
--   - Status: pending, approved, rejected, expired
-- =============================================
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  justification TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  approver_id UUID REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexes for approval_requests table
CREATE INDEX idx_approval_requests_requester ON approval_requests(requester_id);
CREATE INDEX idx_approval_requests_approver ON approval_requests(approver_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_expires ON approval_requests(expires_at);

-- =============================================
-- TABLE: activity_logs
-- Purpose: Comprehensive audit trail of all system activities
-- Retention: Consider archival strategy for old logs
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID,
  action_type VARCHAR(100) NOT NULL,
  resource_service VARCHAR(50),
  command_executed TEXT,
  command_response TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'denied')),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration_ms INTEGER
);

-- Indexes for activity_logs table (optimized for analytics queries)
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_session ON activity_logs(session_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_status ON activity_logs(status);

-- =============================================
-- TABLE: chat_sessions
-- Purpose: Manage user chat sessions for AI interactions
-- Future: Will store conversation context for AI model
-- =============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for chat_sessions table
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_sessions_updated ON chat_sessions(updated_at DESC);

-- =============================================
-- TABLE: chat_messages
-- Purpose: Store individual chat messages with full history
-- Types: user (from user), assistant (from AI), system (automated)
-- Future: metadata JSONB will store AI model parameters, tokens, etc.
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for chat_messages table
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp ASC);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- =============================================
-- TRIGGERS: Automatic timestamp updates
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_sessions updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS: Utility functions for business logic
-- =============================================

-- Function to automatically expire pending approval requests
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
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
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
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Note: Actual users will be created via EntraID authentication
-- This section is reserved for any initial configuration data

-- Example: Create a system user for automated processes (optional)
-- INSERT INTO users (id, entra_id, email, display_name, role, is_active)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'system',
--   'system@internal',
--   'System',
--   'admin',
--   true
-- ) ON CONFLICT (entra_id) DO NOTHING;

-- =============================================
-- VIEWS: Convenient data access patterns
-- =============================================

-- View: Pending approvals with requester details
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
ORDER BY ar.requested_at ASC;

-- View: Recent activity feed
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
LIMIT 100;

-- =============================================
-- PERMISSIONS (adjust based on your database user setup)
-- =============================================

-- Grant permissions to application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =============================================
-- MIGRATION VERIFICATION QUERIES
-- =============================================

-- Run these queries to verify successful migration:

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Verify constraints
-- SELECT conname, contype, conrelid::regclass
-- FROM pg_constraint
-- WHERE connamespace = 'public'::regnamespace;

-- =============================================
-- MAINTENANCE RECOMMENDATIONS
-- =============================================

-- 1. Schedule periodic execution of expire_old_approval_requests()
--    (Every 1 hour recommended)
--
-- 2. Archive old activity_logs periodically
--    (Recommended: Move logs older than 90 days to cold storage)
--
-- 3. Vacuum and analyze tables regularly for performance
--    VACUUM ANALYZE activity_logs;
--    VACUUM ANALYZE chat_messages;
--
-- 4. Monitor table sizes:
--    SELECT
--      schemaname, tablename,
--      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
--    FROM pg_tables
--    WHERE schemaname = 'public'
--    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================
-- END OF MIGRATIONS
-- =============================================
