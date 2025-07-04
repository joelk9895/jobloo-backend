import { Injectable } from '@nestjs/common';
import { UserResponseDto } from './dto/user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock in-memory database to store users
 */
const users = new Map<string, any>();

@Injectable()
export class MockAuthService {
  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = users.get(id);
    if (!user) {
      return this.generateMockUser(id);
    }
    return UserResponseDto.fromAuth0User(user);
  }

  /**
   * Get users with pagination
   */
  async getUsers(limit = 10, offset = 0): Promise<UserResponseDto[]> {
    const allUsers = Array.from(users.values());
    const paginatedUsers = allUsers.slice(offset, offset + limit);
    
    if (paginatedUsers.length === 0) {
      // Generate some mock users if none exist
      return Array(limit).fill(0).map((_, i) => {
        const id = `auth0|user${i + offset}`;
        return this.generateMockUser(id);
      });
    }
    
    return paginatedUsers.map(user => UserResponseDto.fromAuth0User(user));
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(
    userId: string, 
    metadata: Record<string, any>,
    type: 'public' | 'private' | 'unsafe' = 'public',
  ): Promise<UserResponseDto> {
    let user = users.get(userId);
    
    if (!user) {
      user = this.generateMockUserData(userId);
      users.set(userId, user);
    }
    
    // Update the appropriate metadata field based on type
    if (type === 'public') {
      user.user_metadata = { ...user.user_metadata, ...metadata };
    } else if (type === 'private') {
      user.app_metadata = { ...user.app_metadata, ...metadata };
    } else {
      // 'unsafe' - direct properties
      Object.assign(user, metadata);
    }
    
    user.updated_at = new Date().toISOString();
    users.set(userId, user);
    
    return UserResponseDto.fromAuth0User(user);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    users.delete(userId);
  }

  /**
   * Ban/unban a user
   */
  async banUser(userId: string, shouldBan: boolean): Promise<UserResponseDto> {
    let user = users.get(userId);
    
    if (!user) {
      user = this.generateMockUserData(userId);
      users.set(userId, user);
    }
    
    // Update the blocked status
    user.blocked = shouldBan;
    user.updated_at = new Date().toISOString();
    users.set(userId, user);
    
    return UserResponseDto.fromAuth0User(user);
  }

  /**
   * Sign up a new user
   */
  async signUp(signUpDto: SignUpDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName } = signUpDto;
    
    console.log(`Mock signup attempt for ${email}`);
    
    // Check if user with this email already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('The user already exists');
    }
    
    // Password validation
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const userId = `auth0|${uuidv4()}`;
    const now = new Date().toISOString();
    
    const newUser = {
      user_id: userId,
      email,
      given_name: firstName,
      family_name: lastName,
      name: `${firstName} ${lastName}`,
      username: email.split('@')[0],
      picture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=128`,
      email_verified: false,
      created_at: now,
      updated_at: now,
      last_login: now,
      user_metadata: {},
      app_metadata: {},
      blocked: false
    };
    
    users.set(userId, newUser);
    console.log(`Mock user created with ID: ${userId}`);
    
    return UserResponseDto.fromAuth0User(newUser);
  }

  /**
   * Sign in an existing user
   */
  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    
    console.log(`Mock signin attempt for ${email}`);
    
    // Find user with this email
    const user = Array.from(users.values()).find(u => u.email === email);
    
    // In mock mode, create a user if it doesn't exist
    if (!user) {
      console.log(`Creating mock user for ${email} during signin`);
      const userId = `auth0|${uuidv4()}`;
      const mockUser = this.generateMockUserData(userId, email);
      users.set(userId, mockUser);
    }
    
    // Generate a mock token
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({
        sub: user?.user_id || `auth0|${uuidv4()}`,
        email: email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    )}.MOCK_SIGNATURE`;
    
    console.log(`Generated mock token for ${email}`);
    
    return { accessToken: mockToken };
  }
  
  /**
   * Helper to generate a mock user
   */
  private generateMockUser(userId: string): UserResponseDto {
    const userData = this.generateMockUserData(userId);
    return UserResponseDto.fromAuth0User(userData);
  }
  
  /**
   * Helper to generate mock user data
   */
  private generateMockUserData(userId: string, email?: string): any {
    const firstName = ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Sara'][Math.floor(Math.random() * 6)];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][Math.floor(Math.random() * 6)];
    const userEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const now = new Date().toISOString();
    
    return {
      user_id: userId,
      email: userEmail,
      given_name: firstName,
      family_name: lastName,
      name: `${firstName} ${lastName}`,
      username: userEmail.split('@')[0],
      picture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=128`,
      email_verified: true,
      created_at: now,
      updated_at: now,
      last_login: now,
      user_metadata: {},
      app_metadata: {},
      blocked: false
    };
  }
}
