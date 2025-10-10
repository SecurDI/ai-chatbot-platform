/**
 * User database operations
 * Handles CRUD operations for the users table
 */

import { sql } from "@vercel/postgres";
import { User, UserRole } from "@/types/database";
import { logger } from "@/lib/utils/logger";

/**
 * Create a new user or update if exists (based on entra_id)
 *
 * @param entraId - User's EntraID
 * @param email - User's email
 * @param displayName - User's display name
 * @param role - User's role (default: end-user)
 * @returns Created or updated user
 */
export async function createOrUpdateUser(
  entraId: string,
  email: string,
  displayName: string,
  role: UserRole = "end-user"
): Promise<User> {
  try {
    const result = await sql<User>`
      INSERT INTO users (entra_id, email, display_name, role, last_login)
      VALUES (${entraId}, ${email}, ${displayName}, ${role}, NOW())
      ON CONFLICT (entra_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        last_login = NOW()
      RETURNING *
    `;

    const user = result.rows[0];
    logger.info("User created/updated", { userId: user.id, entraId, email });

    return user;
  } catch (error) {
    logger.error("Failed to create/update user", { error, entraId, email });
    throw new Error("Failed to create or update user");
  }
}

/**
 * Get user by ID
 *
 * @param userId - User's database ID
 * @returns User or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users
      WHERE id = ${userId} AND is_active = true
    `;

    return result.rows[0] || null;
  } catch (error) {
    logger.error("Failed to get user by ID", { error, userId });
    return null;
  }
}

/**
 * Get user by EntraID
 *
 * @param entraId - User's EntraID
 * @returns User or null if not found
 */
export async function getUserByEntraId(entraId: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users
      WHERE entra_id = ${entraId} AND is_active = true
    `;

    return result.rows[0] || null;
  } catch (error) {
    logger.error("Failed to get user by EntraID", { error, entraId });
    return null;
  }
}

/**
 * Get user by email
 *
 * @param email - User's email
 * @returns User or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users
      WHERE email = ${email} AND is_active = true
    `;

    return result.rows[0] || null;
  } catch (error) {
    logger.error("Failed to get user by email", { error, email });
    return null;
  }
}

/**
 * List all users with pagination (admin only)
 *
 * @param page - Page number (1-indexed)
 * @param limit - Number of users per page
 * @returns Array of users and total count
 */
export async function listUsers(
  page: number = 1,
  limit: number = 50
): Promise<{ users: User[]; total: number }> {
  try {
    const offset = (page - 1) * limit;

    const [usersResult, countResult] = await Promise.all([
      sql<User>`
        SELECT * FROM users
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql<{ count: number }>`
        SELECT COUNT(*)::int as count FROM users WHERE is_active = true
      `,
    ]);

    return {
      users: usersResult.rows,
      total: countResult.rows[0]?.count || 0,
    };
  } catch (error) {
    logger.error("Failed to list users", { error, page, limit });
    throw new Error("Failed to list users");
  }
}

/**
 * Update user role (admin only)
 *
 * @param userId - User's database ID
 * @param role - New role
 * @returns Updated user
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<User> {
  try {
    const result = await sql<User>`
      UPDATE users
      SET role = ${role}
      WHERE id = ${userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = result.rows[0];
    logger.info("User role updated", { userId, role });

    return user;
  } catch (error) {
    logger.error("Failed to update user role", { error, userId, role });
    throw new Error("Failed to update user role");
  }
}

/**
 * Deactivate a user (soft delete)
 *
 * @param userId - User's database ID
 * @returns Deactivated user
 */
export async function deactivateUser(userId: string): Promise<User> {
  try {
    const result = await sql<User>`
      UPDATE users
      SET is_active = false
      WHERE id = ${userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = result.rows[0];
    logger.info("User deactivated", { userId });

    return user;
  } catch (error) {
    logger.error("Failed to deactivate user", { error, userId });
    throw new Error("Failed to deactivate user");
  }
}

/**
 * Reactivate a user
 *
 * @param userId - User's database ID
 * @returns Reactivated user
 */
export async function reactivateUser(userId: string): Promise<User> {
  try {
    const result = await sql<User>`
      UPDATE users
      SET is_active = true
      WHERE id = ${userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = result.rows[0];
    logger.info("User reactivated", { userId });

    return user;
  } catch (error) {
    logger.error("Failed to reactivate user", { error, userId });
    throw new Error("Failed to reactivate user");
  }
}

/**
 * Update user's last login timestamp
 *
 * @param userId - User's database ID
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET last_login = NOW()
      WHERE id = ${userId}
    `;

    logger.debug("Last login updated", { userId });
  } catch (error) {
    logger.error("Failed to update last login", { error, userId });
  }
}

/**
 * Get users by role
 *
 * @param role - User role to filter by
 * @returns Array of users with the specified role
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const result = await sql<User>`
      SELECT * FROM users
      WHERE role = ${role} AND is_active = true
      ORDER BY created_at DESC
    `;

    return result.rows;
  } catch (error) {
    logger.error("Failed to get users by role", { error, role });
    throw new Error("Failed to get users by role");
  }
}
