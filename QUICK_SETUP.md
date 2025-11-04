# Quick Setup Guide for Entra ID Multi-Tenant

Follow these steps to get the Entra ID settings feature working:

## Step 1: Add Encryption Key

Add this to your `.env.local` file:

```bash
# Generate a secure 64-character encryption key
ENCRYPTION_KEY=your-secure-64-character-encryption-key-here-replace-this

# To generate a random key, run this command:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Run Database Migration

You need to add the organizations tables to your database. Run this SQL in your Postgres database:

```sql
-- Run the contents of DATABASE_MIGRATIONS_ORGANIZATIONS.sql
```

Or if you have psql installed:

```bash
psql $POSTGRES_URL < DATABASE_MIGRATIONS_ORGANIZATIONS.sql
```

## Step 3: Create an Organization

Run this SQL to create your first organization:

```sql
-- Create organization (replace with your domain)
INSERT INTO organizations (name, domain, is_active)
VALUES ('My Organization', 'yourdomain.com', true)
RETURNING id;

-- Note the returned ID for next step
```

## Step 4: Assign Your User to the Organization

Run this SQL (replace the email and organization_id):

```sql
-- Update your user to be part of the organization
UPDATE users
SET organization_id = 'your-organization-id-from-step-3'
WHERE email = 'your-email@yourdomain.com';

-- Verify it worked
SELECT id, email, display_name, role, organization_id
FROM users
WHERE email = 'your-email@yourdomain.com';
```

## Step 5: Restart Dev Server

Restart your Next.js dev server for the changes to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 6: Test the Feature

1. **Log out and log back in** (so your session includes the organization_id)
2. Navigate to: `http://localhost:3000/admin/entra-settings`
3. You should now see the configuration page without errors!

---

## Quick SQL Script (All-in-One)

Here's a complete SQL script you can run:

```sql
-- 1. Create your organization
INSERT INTO organizations (name, domain, is_active)
VALUES ('My Company', 'example.com', true) -- CHANGE THIS
ON CONFLICT (domain) DO NOTHING
RETURNING id;

-- 2. Get the organization ID
SELECT id FROM organizations WHERE domain = 'example.com'; -- CHANGE THIS

-- 3. Assign all users with that domain to the organization
UPDATE users
SET organization_id = (
  SELECT id FROM organizations WHERE domain = 'example.com' -- CHANGE THIS
)
WHERE email LIKE '%@example.com'; -- CHANGE THIS

-- 4. Verify it worked
SELECT
  u.id,
  u.email,
  u.display_name,
  u.role,
  o.name as organization_name,
  o.domain as organization_domain
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.email LIKE '%@example.com'; -- CHANGE THIS
```

---

## Troubleshooting

### Still getting 403 error?

1. **Check if the column exists**:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'users' AND column_name = 'organization_id';
   ```

2. **Check if user has organization**:
   ```sql
   SELECT id, email, organization_id FROM users WHERE email = 'your-email@domain.com';
   ```

3. **Log out and log back in** - Your session needs to be recreated with the new organization_id

### Database migration failed?

Make sure you have the required PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Need to reset everything?

```sql
-- Remove Entra ID configurations
DELETE FROM entra_configs;

-- Remove organizations (this will cascade delete configs)
DELETE FROM organizations;

-- Reset user organization assignments
UPDATE users SET organization_id = NULL;
```

---

## Next Steps

Once setup is complete:

1. ✅ Go to `/admin/entra-settings`
2. ✅ Enter your Azure AD credentials
3. ✅ Click "Test Connection"
4. ✅ Verify it works

Regular users can visit `/settings/account` to see their account info!

---

For detailed information, see `ENTRA_ID_SETUP_GUIDE.md`
