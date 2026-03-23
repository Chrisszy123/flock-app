import bcrypt from 'bcryptjs';

// Salt rounds for bcrypt - 12 provides good security/performance balance
const SALT_ROUNDS = 12;

/**
 * Hashes a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored hashed password
 * @returns True if passwords match
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
