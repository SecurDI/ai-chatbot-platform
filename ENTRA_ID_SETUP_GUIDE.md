# Entra ID Multi-Tenant Configuration - Setup Guide

This guide explains how to set up and use the Entra ID multi-tenant authentication system.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running Migrations](#running-migrations)
5. [Admin Configuration](#admin-configuration)
6. [User Access](#user-access)
7. [Security Features](#security-features)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The platform now supports **multi-tenant Entra ID configuration** where each organization can configure their own Microsoft Entra ID (Azure AD) credentials. This allows:

- **Admins**: Full control over their organization's Entra ID settings
- **Regular Users**: Simple account management and connection status

### Architecture

- Each **organization** has its own Entra ID configuration
- Users are automatically assigned to organizations based on their email domain
- Client secrets are **encrypted** using AES-256-GCM before storage
- All admin operations require authentication and role verification

---

## Database Setup

### Step 1: Run the Organizations Migration

Execute the new migration script to add organizations and entra_configs tables:

```bash
# Connect to your Vercel Postgres database
# Run the migration file: DATABASE_MIGRATIONS_ORGANIZATIONS.sql
```

The migration creates:

- `organizations` table - Stores organization details
- `entra_configs` table - Stores encrypted Entra ID credentials
- `organization_id` column in `users` table
- Encryption/decryption functions
- Views for organization management

### Step 2: Create Your Organization

```sql
-- Example: Create an organization
INSERT INTO organizations (name, domain, is_active)
VALUES ('My Company', 'mycompany.com', true);

-- Assign users to the organization
UPDATE users
SET organization_id = (
  SELECT id FROM organizations WHERE domain = 'mycompany.com'
)
WHERE email LIKE '%@mycompany.com';
```

---

## Environment Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Encryption key for client secrets (MUST be at least 32 characters)
ENCRYPTION_KEY=your-secure-random-32-character-minimum-key-here

# Optional: Keep these for backward compatibility or default config
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
NEXTAUTH_URL=http://localhost:3000
```

### Generating a Secure Encryption Key

```bash
# Generate a secure 64-character encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **IMPORTANT**:
- Never commit `.env.local` to version control
- Use different encryption keys for development and production
- Store production encryption key securely (e.g., Vercel Environment Variables)

---

## Running Migrations

### Step 1: Apply Database Schema

```bash
# Using Vercel Postgres CLI
vercel env pull .env.local
psql $POSTGRES_URL < DATABASE_MIGRATIONS_ORGANIZATIONS.sql
```

### Step 2: Verify Tables

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('organizations', 'entra_configs')
ORDER BY table_name;

-- Check users table has organization_id
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'organization_id';
```

---

## Admin Configuration

### For Administrators

Admins can configure Entra ID settings for their organization:

1. **Navigate to Admin Settings**
   - Log in with an admin account
   - Go to sidebar → "Entra ID Settings"
   - Or visit: `/admin/entra-settings`

2. **Enter Entra ID Credentials**
   - **Client ID**: Your Azure AD Application (client) ID
   - **Client Secret**: Your Azure AD Client Secret (will be encrypted)
   - **Tenant ID**: Your Azure AD Directory (tenant) ID
   - **Redirect URI**: Must match Azure AD configuration
     - Default: `https://yourdomain.com/api/auth/callback`

3. **Save Configuration**
   - Click "Save Configuration"
   - The client secret is encrypted before storage
   - Configuration is marked as "Not Tested" until validated

4. **Test Connection**
   - Click "Test Connection"
   - The system will attempt OAuth discovery
   - If successful, configuration is marked as "Valid"
   - If failed, check the error message and verify credentials

### Azure AD Setup Requirements

Before configuring in the platform, ensure you have:

1. **Registered an Application in Azure AD**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to Azure Active Directory → App registrations
   - Click "New registration"

2. **Configured Redirect URI**
   - Add `https://yourdomain.com/api/auth/callback` to redirect URIs
   - Select "Web" platform

3. **Created a Client Secret**
   - In your app → Certificates & secrets
   - New client secret
   - Copy the secret value (you can't see it again!)

4. **Noted Your IDs**
   - Application (client) ID from Overview page
   - Directory (tenant) ID from Overview page

---

## User Access

### For Regular Users

Regular users can view their account information:

1. **Navigate to Account Settings**
   - Log in with any account
   - Go to sidebar → "Account Settings"
   - Or visit: `/settings/account`

2. **View Information**
   - Profile information (name, email, role)
   - Organization details
   - Connected account status
   - Permissions granted

3. **Disconnect Account**
   - Click "Disconnect" button
   - Confirm the action
   - You'll be logged out and need to re-authenticate

### What Users Can See

✅ **Visible to Users:**
- Their profile information
- Organization name and domain
- Connection status (Connected via Microsoft Entra ID)
- Permissions granted to the application

❌ **Hidden from Users:**
- Client ID, Client Secret, Tenant ID
- Organization-wide Entra ID configuration
- Other users' information
- Admin settings

---

## Security Features

### Client Secret Encryption

The platform uses **AES-256-GCM** authenticated encryption for client secrets:

1. **Encryption Process**:
   ```
   Client Secret → Salt Generation → Key Derivation (PBKDF2) →
   AES-256-GCM Encryption → Base64 Encoding → Database Storage
   ```

2. **Key Features**:
   - Salt: 64 bytes random (unique per encryption)
   - IV: 16 bytes random (unique per encryption)
   - Auth Tag: 16 bytes (prevents tampering)
   - Key Derivation: 100,000 iterations of PBKDF2-SHA512

3. **Storage Format**:
   ```
   [Salt (64 bytes)][IV (16 bytes)][AuthTag (16 bytes)][Encrypted Data]
   → Base64 Encoded → Stored in database
   ```

### Access Control

- **Admin Routes**: Protected by role-based middleware
- **Organization Isolation**: Admins can only manage their own organization's config
- **API Endpoints**: All require authentication tokens
- **Client Secret**: Never exposed to frontend (always masked as "••••••••")

### Best Practices

1. **Encryption Key Management**:
   - Use environment variables
   - Never hardcode in source code
   - Rotate keys periodically
   - Use different keys per environment

2. **Client Secret Handling**:
   - Only input when saving/updating
   - Immediately cleared from memory after encryption
   - Never logged or stored in plaintext
   - Always masked in API responses

3. **Testing**:
   - Always test connection after saving
   - Monitor test results for issues
   - Invalid credentials are flagged immediately

---

## Troubleshooting

### Common Issues

#### 1. "ENCRYPTION_KEY environment variable is not set"

**Solution**: Add `ENCRYPTION_KEY` to your `.env.local` file with a secure 32+ character string.

```bash
ENCRYPTION_KEY=your-secure-64-character-encryption-key-here-minimum-32-chars
```

#### 2. "User is not assigned to an organization"

**Solution**: Assign the user to an organization:

```sql
-- Find the user
SELECT id, email FROM users WHERE email = 'user@example.com';

-- Find or create organization
INSERT INTO organizations (name, domain) VALUES ('Example Org', 'example.com')
ON CONFLICT (domain) DO NOTHING;

-- Assign user
UPDATE users
SET organization_id = (SELECT id FROM organizations WHERE domain = 'example.com')
WHERE email = 'user@example.com';
```

#### 3. "Connection test failed"

**Possible Causes**:
- Incorrect Client ID or Tenant ID
- Invalid Client Secret
- Redirect URI mismatch
- Network connectivity issues

**Solution**:
- Verify all credentials in Azure Portal
- Check redirect URI matches exactly
- Ensure client secret hasn't expired
- Check application has correct API permissions in Azure AD

#### 4. "Failed to decrypt data"

**Possible Causes**:
- Encryption key changed
- Database data corrupted
- Migration not applied correctly

**Solution**:
- Verify `ENCRYPTION_KEY` matches the one used during encryption
- Re-save the configuration if key was changed
- Check database migration was successful

#### 5. "Admin access required"

**Solution**: Ensure user has admin role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## API Reference

### Admin Endpoints

#### GET `/api/admin/entra-config`
Get organization's Entra ID configuration (masked secret)

**Headers**: `Cookie: auth_session=...`

**Response**:
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "My Company",
      "domain": "mycompany.com"
    },
    "config": {
      "id": "uuid",
      "client_id": "...",
      "client_secret_masked": "••••••••",
      "tenant_id": "...",
      "redirect_uri": "https://...",
      "is_valid": true,
      "last_tested_at": "2025-01-..."
    }
  }
}
```

#### POST `/api/admin/entra-config`
Create or update Entra ID configuration

**Headers**:
- `Cookie: auth_session=...`
- `Content-Type: application/json`

**Body**:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "your-client-secret",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "redirectUri": "https://yourdomain.com/api/auth/callback"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Configuration saved successfully. Please test the connection."
}
```

#### POST `/api/admin/entra-config/test`
Test Entra ID configuration

**Headers**: `Cookie: auth_session=...`

**Response**:
```json
{
  "success": true,
  "message": "Connection test successful",
  "details": {
    "issuer": "https://login.microsoftonline.com/...",
    "tenant_id": "...",
    "authorization_endpoint": "...",
    "token_endpoint": "..."
  }
}
```

### User Endpoints

#### GET `/api/settings/account`
Get current user's account information

**Headers**: `Cookie: auth_session=...`

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "User Name",
      "role": "end-user",
      "created_at": "...",
      "last_login": "..."
    },
    "organization": {
      "name": "My Company",
      "domain": "mycompany.com"
    },
    "connection": {
      "provider": "Microsoft Entra ID",
      "status": "connected",
      "permissions": [...]
    }
  }
}
```

---

## Migration Checklist

Use this checklist when setting up the Entra ID multi-tenant system:

- [ ] Add `ENCRYPTION_KEY` to environment variables
- [ ] Run `DATABASE_MIGRATIONS_ORGANIZATIONS.sql`
- [ ] Verify tables created (`organizations`, `entra_configs`)
- [ ] Create organization(s) in database
- [ ] Assign users to organizations
- [ ] Configure Azure AD application
- [ ] Add redirect URI to Azure AD
- [ ] Create client secret in Azure AD
- [ ] Test admin login
- [ ] Configure Entra ID settings via admin UI
- [ ] Test connection
- [ ] Verify regular user can view account settings
- [ ] Test user authentication flow
- [ ] Monitor logs for errors

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations were applied successfully

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
