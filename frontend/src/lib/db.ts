// This file simulates a simple in-memory database for users.
// In a real application, replace this with actual database interactions (e.g., Prisma, TypeORM, etc.)
import { hash } from 'bcrypt';

export interface User {
  id: string;
  username: string;
  password?: string; // Password hash should not be exposed regularly
  role: 'admin' | 'warehouse';
}

// Mock user database - shared between registration and authentication
export const mockUserDatabase: User[] = [];

/**
 * Finds a user by their username.
 * @param username - The username to search for.
 * @returns The user object if found, otherwise undefined.
 */
export async function findUserByUsername(username: string): Promise<User | undefined> {
  return mockUserDatabase.find(user => user.username === username);
}

/**
 * Adds a new user to the mock database.
 * @param userData - The user data (username, password, role).
 * @returns The newly created user object (without password).
 */
export async function addUser(userData: Pick<User, 'username' | 'password' | 'role'>): Promise<Omit<User, 'password'>> {
  const { username, password, role } = userData;
  
  if (!password) {
    throw new Error('Password is required to add a user.');
  }

  const hashedPassword = await hash(password, 10);
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique ID
    username,
    password: hashedPassword,
    role,
  };
  mockUserDatabase.push(newUser);
  console.log('User added to mock DB:', { id: newUser.id, username: newUser.username, role: newUser.role });
  
  // Return user data without the password hash
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}