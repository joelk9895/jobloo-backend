
export interface Auth0User {
  user_id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  username?: string;
  picture?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;

  static fromAuth0User(auth0User: Partial<Auth0User>): UserResponseDto {
    return {
      id: auth0User.user_id ?? '',
      email: auth0User.email ?? '',
      firstName: auth0User.given_name,
      lastName: auth0User.family_name,
      username: auth0User.username,
      imageUrl: auth0User.picture,
      isEmailVerified: auth0User.email_verified ?? false,
      createdAt: auth0User.created_at
        ? new Date(auth0User.created_at)
        : new Date(),
      updatedAt: auth0User.updated_at
        ? new Date(auth0User.updated_at)
        : new Date(),
      lastSignInAt: auth0User.last_login
        ? new Date(auth0User.last_login)
        : undefined,
    };
  }
}
