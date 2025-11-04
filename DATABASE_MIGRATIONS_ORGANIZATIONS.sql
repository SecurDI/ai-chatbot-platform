-- =============================================
-- Organizations & Entra ID Multi-Tenant Configuration
-- PostgreSQL Schema Addition
-- =============================================
-- Version: 1.1.0
-- Created: 2025-01-XX
-- Description: Adds multi-tenant support with per-organization
--              Entra ID credentials management
-- =============================================

-- =============================================
-- TABLE: organizations
-- Purpose: Store organization/tenant information
-- Each organization has its own Entra ID configuration
-- =============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL, -- Email domain for auto-assignment
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for organizations table
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- =============================================
-- TABLE: entra_configs
-- Purpose: Store encrypted Entra ID credentials per organization
-- Security: client_secret is encrypted using pgcrypto
-- =============================================
CREATE TABLE IF NOT EXISTS entra_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id VARCHAR(255) NOT NULL,
  client_secret_encrypted TEXT NOT NULL, -- Encrypted using pgcrypto
  tenant_id VARCHAR(255) NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_tested_at TIMESTAMP,
  is_valid BOOLEAN DEFAULT false -- Set to true after successful test
);

-- Indexes for entra_configs table
CREATE INDEX idx_entra_configs_organization ON entra_configs(organization_id);

-- =============================================
-- Alter users table to add organization reference
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- =============================================
-- TRIGGERS: Automatic timestamp updates
-- =============================================

-- Trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for entra_configs updated_at
CREATE TRIGGER update_entra_configs_updated_at
  BEFORE UPDATE ON entra_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS: Entra ID configuration management
-- =============================================

/**
 * Function to encrypt client secret
 * Uses pgcrypto extension with AES encryption
 */
CREATE OR REPLACE FUNCTION encrypt_client_secret(
  p_client_secret TEXT,
  p_encryption_key TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    encrypt(
      p_client_secret::bytea,
      p_encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql;

/**
 * Function to decrypt client secret
 * Uses pgcrypto extension with AES decryption
 */
CREATE OR REPLACE FUNCTION decrypt_client_secret(
  p_encrypted_secret TEXT,
  p_encryption_key TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(p_encrypted_secret, 'base64'),
      p_encryption_key::bytea,
      'aes'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql;

/**
 * Function to get organization by email domain
 */
CREATE OR REPLACE FUNCTION get_organization_by_email(
  p_email TEXT
)
RETURNS UUID AS $$
DECLARE
  v_domain TEXT;
  v_org_id UUID;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);

  -- Find organization by domain
  SELECT id INTO v_org_id
  FROM organizations
  WHERE domain = v_domain AND is_active = true;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS: Organization & Config Management
-- =============================================

/**
 * View: Organizations with config status
 * Shows which organizations have valid Entra ID configurations
 */
CREATE OR REPLACE VIEW v_organizations_with_config AS
SELECT
  o.id,
  o.name,
  o.domain,
  o.is_active,
  o.created_at,
  CASE
    WHEN ec.id IS NOT NULL THEN true
    ELSE false
  END as has_config,
  ec.is_valid as config_is_valid,
  ec.last_tested_at,
  (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as user_count
FROM organizations o
LEFT JOIN entra_configs ec ON o.id = ec.organization_id
ORDER BY o.created_at DESC;

-- =============================================
-- INITIAL DATA SEEDING (Example)
-- =============================================

-- Example: Create default organization for existing users
-- Uncomment and modify as needed
/*
INSERT INTO organizations (name, domain, is_active)
VALUES ('Default Organization', 'example.com', true)
ON CONFLICT (domain) DO NOTHING;
*/

-- =============================================
-- MIGRATION VERIFICATION QUERIES
-- =============================================

-- Check new tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('organizations', 'entra_configs')
-- ORDER BY table_name;

-- Check users table has organization_id column
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'organization_id';

-- =============================================
-- ROLLBACK SCRIPT (if needed)
-- =============================================

-- To rollback this migration:
-- DROP VIEW IF EXISTS v_organizations_with_config;
-- DROP FUNCTION IF EXISTS get_organization_by_email(TEXT);
-- DROP FUNCTION IF EXISTS decrypt_client_secret(TEXT, TEXT);
-- DROP FUNCTION IF EXISTS encrypt_client_secret(TEXT, TEXT);
-- ALTER TABLE users DROP COLUMN IF EXISTS organization_id;
-- DROP TABLE IF EXISTS entra_configs;
-- DROP TABLE IF EXISTS organizations;

-- =============================================
-- END OF ORGANIZATIONS MIGRATION
-- =============================================
