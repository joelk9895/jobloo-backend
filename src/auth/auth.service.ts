import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ManagementClient, AuthenticationClient } from 'auth0';
import { UserResponseDto } from './dto/user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserType } from './types/user-type.enum';

@Injectable()
export class AuthService {
  private readonly managementClient: ManagementClient;
  private readonly authenticationClient: AuthenticationClient;

  constructor() {
    this.managementClient = new ManagementClient({
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN || '',
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
    });

    this.authenticationClient = new AuthenticationClient({
      domain: process.env.AUTH0_DOMAIN || '',
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    });
  }

  async validateUser(userId: string): Promise<UserResponseDto> {
    try {
      const auth0User = await this.managementClient.users.get({ id: userId });
      return UserResponseDto.fromAuth0User({
        user_id: auth0User.data.user_id,
        email: auth0User.data.email,
        given_name: auth0User.data.given_name,
        family_name: auth0User.data.family_name,
        username: auth0User.data.username,
        picture: auth0User.data.picture,
        email_verified: auth0User.data.email_verified,
        created_at: auth0User.data.created_at as string,
        updated_at: auth0User.data.updated_at as string,
        last_login: auth0User.data.last_login as string,
      });
    } catch (error: unknown) {
      // Log the error for debugging purposes
      console.error('AuthService - validateUser error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const auth0User = await this.managementClient.users.get({ id: userId });
      return UserResponseDto.fromAuth0User({
        user_id: auth0User.data.user_id,
        email: auth0User.data.email,
        given_name: auth0User.data.given_name,
        family_name: auth0User.data.family_name,
        username: auth0User.data.username,
        picture: auth0User.data.picture,
        email_verified: auth0User.data.email_verified,
        created_at: auth0User.data.created_at as string,
        updated_at: auth0User.data.updated_at as string,
        last_login: auth0User.data.last_login as string,
      });
    } catch (error: unknown) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async getUsers(limit = 10, offset = 0): Promise<UserResponseDto[]> {
    try {
      const auth0Users = await this.managementClient.users.getAll({
        per_page: limit,
        page: offset,
      });
      return auth0Users.data.map((user) =>
        UserResponseDto.fromAuth0User({
          user_id: user.user_id,
          email: user.email,
          given_name: user.given_name,
          family_name: user.family_name,
          username: user.username,
          picture: user.picture,
          email_verified: user.email_verified,
          created_at: user.created_at as string,
          updated_at: user.updated_at as string,
          last_login: user.last_login as string,
        }),
      );
    } catch (error: unknown) {
      throw new Error(`Failed to fetch users: ${(error as Error).message}`);
    }
  }

  async updateUserMetadata(
    userId: string,
    metadata: Record<string, any>,
    type: 'public' | 'private' | 'unsafe' = 'public',
  ): Promise<UserResponseDto> {
    try {
      // Determine which metadata field to update based on type
      let updateData: Record<string, any> = {};

      if (type === 'public') {
        updateData = { user_metadata: metadata };
      } else if (type === 'private') {
        updateData = { app_metadata: metadata };
      } else if (type === 'unsafe') {
        // Direct property update (use with caution)
        updateData = metadata;
      }

      const updatedUser = await this.managementClient.users.update(
        { id: userId },
        updateData,
      );
      return UserResponseDto.fromAuth0User({
        user_id: updatedUser.data.user_id,
        email: updatedUser.data.email,
        given_name: updatedUser.data.given_name,
        family_name: updatedUser.data.family_name,
        username: updatedUser.data.username,
        picture: updatedUser.data.picture,
        email_verified: updatedUser.data.email_verified,
        created_at: updatedUser.data.created_at as string,
        updated_at: updatedUser.data.updated_at as string,
        last_login: updatedUser.data.last_login as string,
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to update user metadata: ${(error as Error).message}`,
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.managementClient.users.delete({ id: userId });
    } catch (error: unknown) {
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }

  async banUser(userId: string, ban = true): Promise<UserResponseDto> {
    try {
      const updatedUser = await this.managementClient.users.update(
        { id: userId },
        { blocked: ban },
      );
      return UserResponseDto.fromAuth0User({
        user_id: updatedUser.data.user_id,
        email: updatedUser.data.email,
        given_name: updatedUser.data.given_name,
        family_name: updatedUser.data.family_name,
        username: updatedUser.data.username,
        picture: updatedUser.data.picture,
        email_verified: updatedUser.data.email_verified,
        created_at: updatedUser.data.created_at as string,
        updated_at: updatedUser.data.updated_at as string,
        last_login: updatedUser.data.last_login as string,
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to ${ban ? 'ban' : 'unban'} user: ${(error as Error).message}`,
      );
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<UserResponseDto> {
    const {
      email,
      password,
      firstName,
      lastName,
      userType,
      companyName,
      companyWebsite,
      companySize,
      industry,
    } = signUpDto;

    const user_metadata: any = {
      firstName,
      lastName,
      userType,
    };

    if (userType === UserType.COMPANY) {
      user_metadata.companyName = companyName;
      user_metadata.companyWebsite = companyWebsite;
      user_metadata.companySize = companySize;
      user_metadata.industry = industry;
    }

    try {
      // Create a new user in Auth0
      const newUser = await this.authenticationClient.database.signUp({
        email,
        password,
        connection: 'Username-Password-Authentication', // Specify your Auth0 DB connection name
        user_metadata,
      });

      // Get the user's profile from Auth0 Management API to return the full user object
      const userProfile = await this.managementClient.users.getAll({
        q: `email:"${email}"`,
        search_engine: 'v3',
      });

      if (!userProfile.data || userProfile.data.length === 0) {
        throw new Error('Failed to retrieve created user profile');
      }

      return UserResponseDto.fromAuth0User({
        user_id: userProfile.data[0].user_id,
        email: userProfile.data[0].email,
        given_name: userProfile.data[0].given_name,
        family_name: userProfile.data[0].family_name,
        username: userProfile.data[0].username,
        picture: userProfile.data[0].picture,
        email_verified: userProfile.data[0].email_verified,
        created_at: userProfile.data[0].created_at as string,
        updated_at: userProfile.data[0].updated_at as string,
        last_login: userProfile.data[0].last_login as string,
      });
    } catch (error) {
      if (error.message?.includes('The user already exists')) {
        throw new ConflictException('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;

    try {
      // Authenticate with Auth0
      const authResult = await this.authenticationClient.oauth.passwordGrant({
        username: email,
        password,
        scope: 'openid profile email',
        audience: process.env.AUTH0_AUDIENCE,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
      });

      return {
        accessToken: authResult.data.access_token,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
