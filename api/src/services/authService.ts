import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { UserCreationAttributes, UserLoginAttributes, UserResponseAttributes } from '../types';
import { Op } from 'sequelize';

const SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: UserCreationAttributes): Promise<UserResponseAttributes> {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new Error('User with this username or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    // Return user without password
    return user.toJSON() as UserResponseAttributes;
  }

  /**
   * Login user with username/email and password
   */
  static async login(credentials: UserLoginAttributes): Promise<UserResponseAttributes> {
    const { username, password } = credentials;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Return user without password
    return user.toJSON() as UserResponseAttributes;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserResponseAttributes | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    return user.toJSON() as UserResponseAttributes;
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await user.update({ passwordHash: newPasswordHash });
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<Pick<UserCreationAttributes, 'username' | 'email'>>): Promise<UserResponseAttributes> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if username/email is already taken by another user
    if (updates.username || updates.email) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            ...(updates.username ? [{ username: updates.username }] : []),
            ...(updates.email ? [{ email: updates.email }] : []),
          ],
          id: { [Op.ne]: userId },
        },
      });

      if (existingUser) {
        throw new Error('Username or email already taken');
      }
    }

    // Update user
    await user.update(updates);

    return user.toJSON() as UserResponseAttributes;
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Password is incorrect');
    }

    // Delete user (cascade will handle related records)
    await user.destroy();
  }
}