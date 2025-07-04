# Auth Module

This module provides authentication and user management functionality using Clerk as the identity provider.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

You can get these keys from your [Clerk Dashboard](https://dashboard.clerk.com/).

### 2. Dependencies

The module uses the following dependencies:

- `@clerk/clerk-sdk-node` - Clerk Node.js SDK
- `@clerk/express` - Clerk Express middleware

These are automatically installed when you install the module.

## Features

### Authentication Guard

The `ClerkAuthGuard` can be used to protect routes:

```typescript
@Get('protected')
@UseGuards(ClerkAuthGuard)
async getProtectedData(@CurrentUser() user: UserResponseDto) {
  return { message: `Hello ${user.firstName}!` };
}
```

### Current User Decorator

Use the `@CurrentUser()` decorator to get the authenticated user:

```typescript
@Get('profile')
@UseGuards(ClerkAuthGuard)
async getProfile(@CurrentUser() user: UserResponseDto) {
  return user;
}
```

### User Management

The auth service provides methods for:

- Getting user information
- Updating user metadata
- Managing user status (ban/unban)
- Deleting users

## API Endpoints

### Public Endpoints

- `GET /auth/health` - Health check

### Protected Endpoints (require authentication)

- `GET /auth/me` - Get current user profile
- `GET /auth/user/:id` - Get user by ID
- `GET /auth/users` - Get users list (with pagination)
- `PUT /auth/me/metadata` - Update current user metadata
- `PUT /auth/user/:id/metadata` - Update user metadata (admin)
- `DELETE /auth/user/:id` - Delete user (admin)
- `POST /auth/user/:id/ban` - Ban user (admin)
- `POST /auth/user/:id/unban` - Unban user (admin)

## Usage Examples

### Frontend Integration

```typescript
// Get user profile
const response = await fetch('/auth/me', {
  headers: {
    Authorization: `Bearer ${clerkToken}`,
  },
});
const user = await response.json();
```

### Backend Service Usage

```typescript
@Injectable()
export class SomeService {
  constructor(private authService: AuthService) {}

  async getUserData(userId: string) {
    const user = await this.authService.getUserById(userId);
    return user;
  }
}
```

## Data Types

### UserResponseDto

```typescript
{
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
}
```

## Error Handling

The module provides proper error handling with HTTP status codes:

- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server errors

## Security Notes

1. Always validate tokens on the backend
2. Use HTTPS in production
3. Store sensitive data in Clerk's private metadata
4. Implement proper role-based access control
5. Rate limit authentication endpoints

## Development

### Testing

Run the auth controller tests:

```bash
npm run test -- auth.controller.spec.ts
```

Run the auth service tests:

```bash
npm run test -- auth.service.spec.ts
```

### Adding New Features

1. Add new methods to `AuthService`
2. Add corresponding endpoints to `AuthController`
3. Update types in `user.dto.ts` if needed
4. Add tests for new functionality

## Troubleshooting

### Common Issues

1. **"Clerk integration not fully implemented"**
   - Make sure `CLERK_SECRET_KEY` is set in your environment variables

2. **"Invalid authorization token"**
   - Check that the token is being sent correctly in the Authorization header
   - Verify the token format: `Bearer <token>`

3. **User not found errors**
   - Ensure the user exists in Clerk
   - Check that the user ID is correct

### Debug Mode

Set `NODE_ENV=development` to enable debug logging for Clerk operations.
