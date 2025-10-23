/**
 * Database operations for Entra ID configurations
 * Handles CRUD operations with encryption for client secrets
 */

import { sql } from "@vercel/postgres";
import { logger } from "../utils/logger";
import { encrypt, decrypt, maskSecret } from "../security/encryption";
import type { EntraConfig, EntraConfigSafe, Organization } from "../../../types/database";

/**
 * Get Entra ID configuration for an organization (with decrypted secret)
 * WARNING: Only use this server-side, never expose to client
 *
 * @param organizationId - Organization ID
 * @returns Entra config with decrypted secret, or null if not found
 */
export async function getEntraConfig(
  organizationId: string
): Promise<EntraConfig | null> {
  try {
    const result = await sql<EntraConfig>`
      SELECT *
      FROM entra_configs
      WHERE organization_id = ${organizationId}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const config = result.rows[0];

    // Decrypt the client secret
    const decryptedSecret = decrypt(config.client_secret_encrypted);

    return {
      ...config,
      client_secret_encrypted: decryptedSecret, // Return decrypted for server use
    };
  } catch (error) {
    logger.error("Failed to get Entra config", { error, organizationId });
    throw new Error("Failed to retrieve Entra ID configuration");
  }
}

/**
 * Get Entra ID configuration for an organization (safe for API responses)
 * Returns masked client secret
 *
 * @param organizationId - Organization ID
 * @returns Entra config with masked secret, or null if not found
 */
export async function getEntraConfigSafe(
  organizationId: string
): Promise<EntraConfigSafe | null> {
  try {
    const result = await sql<EntraConfig>`
      SELECT *
      FROM entra_configs
      WHERE organization_id = ${organizationId}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const config = result.rows[0];

    return {
      id: config.id,
      organization_id: config.organization_id,
      client_id: config.client_id,
      client_secret_masked: maskSecret(),
      tenant_id: config.tenant_id,
      redirect_uri: config.redirect_uri,
      created_at: config.created_at,
      updated_at: config.updated_at,
      last_tested_at: config.last_tested_at,
      is_valid: config.is_valid,
    };
  } catch (error) {
    logger.error("Failed to get safe Entra config", { error, organizationId });
    throw new Error("Failed to retrieve Entra ID configuration");
  }
}

/**
 * Create or update Entra ID configuration for an organization
 *
 * @param organizationId - Organization ID
 * @param clientId - Azure AD Client ID
 * @param clientSecret - Azure AD Client Secret (will be encrypted)
 * @param tenantId - Azure AD Tenant ID
 * @param redirectUri - OAuth redirect URI
 * @returns Created/updated config with masked secret
 */
export async function upsertEntraConfig(
  organizationId: string,
  clientId: string,
  clientSecret: string,
  tenantId: string,
  redirectUri: string
): Promise<EntraConfigSafe> {
  try {
    // Encrypt the client secret
    const encryptedSecret = encrypt(clientSecret);

    const result = await sql<EntraConfig>`
      INSERT INTO entra_configs (
        organization_id,
        client_id,
        client_secret_encrypted,
        tenant_id,
        redirect_uri,
        is_valid
      )
      VALUES (
        ${organizationId},
        ${clientId},
        ${encryptedSecret},
        ${tenantId},
        ${redirectUri},
        false
      )
      ON CONFLICT (organization_id)
      DO UPDATE SET
        client_id = EXCLUDED.client_id,
        client_secret_encrypted = EXCLUDED.client_secret_encrypted,
        tenant_id = EXCLUDED.tenant_id,
        redirect_uri = EXCLUDED.redirect_uri,
        updated_at = NOW(),
        is_valid = false
      RETURNING *
    `;

    const config = result.rows[0];

    logger.info("Entra config upserted", { organizationId, configId: config.id });

    return {
      id: config.id,
      organization_id: config.organization_id,
      client_id: config.client_id,
      client_secret_masked: maskSecret(),
      tenant_id: config.tenant_id,
      redirect_uri: config.redirect_uri,
      created_at: config.created_at,
      updated_at: config.updated_at,
      last_tested_at: config.last_tested_at,
      is_valid: config.is_valid,
    };
  } catch (error) {
    logger.error("Failed to upsert Entra config", { error, organizationId });
    throw new Error("Failed to save Entra ID configuration");
  }
}

/**
 * Update partial Entra config (without changing secret)
 *
 * @param organizationId - Organization ID
 * @param updates - Fields to update
 * @returns Updated config with masked secret
 */
export async function updateEntraConfig(
  organizationId: string,
  updates: {
    clientId?: string;
    tenantId?: string;
    redirectUri?: string;
  }
): Promise<EntraConfigSafe> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.clientId !== undefined) {
      setClauses.push(`client_id = $${paramIndex++}`);
      values.push(updates.clientId);
    }
    if (updates.tenantId !== undefined) {
      setClauses.push(`tenant_id = $${paramIndex++}`);
      values.push(updates.tenantId);
    }
    if (updates.redirectUri !== undefined) {
      setClauses.push(`redirect_uri = $${paramIndex++}`);
      values.push(updates.redirectUri);
    }

    if (setClauses.length === 0) {
      throw new Error("No fields to update");
    }

    setClauses.push(`updated_at = NOW()`);
    setClauses.push(`is_valid = false`); // Invalidate until tested
    values.push(organizationId);

    const query = `
      UPDATE entra_configs
      SET ${setClauses.join(", ")}
      WHERE organization_id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Configuration not found");
    }

    const config = result.rows[0];

    logger.info("Entra config updated", { organizationId });

    return {
      id: config.id,
      organization_id: config.organization_id,
      client_id: config.client_id,
      client_secret_masked: maskSecret(),
      tenant_id: config.tenant_id,
      redirect_uri: config.redirect_uri,
      created_at: config.created_at,
      updated_at: config.updated_at,
      last_tested_at: config.last_tested_at,
      is_valid: config.is_valid,
    };
  } catch (error) {
    logger.error("Failed to update Entra config", { error, organizationId });
    throw new Error("Failed to update Entra ID configuration");
  }
}

/**
 * Mark Entra config as tested and valid/invalid
 *
 * @param organizationId - Organization ID
 * @param isValid - Whether the test was successful
 */
export async function markEntraConfigTested(
  organizationId: string,
  isValid: boolean
): Promise<void> {
  try {
    await sql`
      UPDATE entra_configs
      SET
        last_tested_at = NOW(),
        is_valid = ${isValid},
        updated_at = NOW()
      WHERE organization_id = ${organizationId}
    `;

    logger.info("Entra config marked as tested", { organizationId, isValid });
  } catch (error) {
    logger.error("Failed to mark Entra config as tested", { error, organizationId });
    throw new Error("Failed to update test status");
  }
}

/**
 * Delete Entra ID configuration for an organization
 *
 * @param organizationId - Organization ID
 */
export async function deleteEntraConfig(organizationId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM entra_configs
      WHERE organization_id = ${organizationId}
    `;

    logger.info("Entra config deleted", { organizationId });
  } catch (error) {
    logger.error("Failed to delete Entra config", { error, organizationId });
    throw new Error("Failed to delete Entra ID configuration");
  }
}

/**
 * Get organization by ID
 *
 * @param organizationId - Organization ID
 * @returns Organization or null if not found
 */
export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  try {
    const result = await sql<Organization>`
      SELECT *
      FROM organizations
      WHERE id = ${organizationId}
    `;

    return result.rows[0] || null;
  } catch (error) {
    logger.error("Failed to get organization", { error, organizationId });
    throw new Error("Failed to retrieve organization");
  }
}

/**
 * Get organization by domain
 *
 * @param domain - Email domain
 * @returns Organization or null if not found
 */
export async function getOrganizationByDomain(
  domain: string
): Promise<Organization | null> {
  try {
    const result = await sql<Organization>`
      SELECT *
      FROM organizations
      WHERE domain = ${domain} AND is_active = true
    `;

    return result.rows[0] || null;
  } catch (error) {
    logger.error("Failed to get organization by domain", { error, domain });
    throw new Error("Failed to retrieve organization");
  }
}

/**
 * Create a new organization
 *
 * @param name - Organization name
 * @param domain - Email domain
 * @returns Created organization
 */
export async function createOrganization(
  name: string,
  domain: string
): Promise<Organization> {
  try {
    const result = await sql<Organization>`
      INSERT INTO organizations (name, domain, is_active)
      VALUES (${name}, ${domain}, true)
      RETURNING *
    `;

    const organization = result.rows[0];

    logger.info("Organization created", { organizationId: organization.id, domain });

    return organization;
  } catch (error) {
    logger.error("Failed to create organization", { error, name, domain });
    throw new Error("Failed to create organization");
  }
}
