import {
  Controller,
  Get,
  UseGuards,
  Param,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth0Guard } from './guards/auth0.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserResponseDto } from './dto/user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(Auth0Guard)
  getCurrentUser(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }

  /**
   * Get user by ID (admin/internal use)
   */
  @Get('user/:id')
  @UseGuards(Auth0Guard)
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.authService.getUserById(id);
  }

  /**
   * Get users list with pagination
   */
  @Get('users')
  @UseGuards(Auth0Guard)
  async getUsers(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<UserResponseDto[]> {
    return this.authService.getUsers(Number(limit), Number(offset));
  }

  /**
   * Update current user metadata
   */
  @Put('me/metadata')
  @UseGuards(Auth0Guard)
  @HttpCode(HttpStatus.OK)
  async updateMyMetadata(
    @CurrentUser() user: UserResponseDto,
    @Body() metadata: Record<string, any>,
  ): Promise<UserResponseDto> {
    return this.authService.updateUserMetadata(user.id, metadata);
  }

  /**
   * Update user metadata (admin)
   */
  @Put('user/:id/metadata')
  @UseGuards(Auth0Guard)
  @HttpCode(HttpStatus.OK)
  async updateUserMetadata(
    @Param('id') userId: string,
    @Body() metadata: Record<string, any>,
    @Query('type') type: 'public' | 'private' | 'unsafe' = 'public',
  ): Promise<UserResponseDto> {
    return this.authService.updateUserMetadata(userId, metadata, type);
  }

  /**
   * Delete user (admin)
   */
  @Delete('user/:id')
  @UseGuards(Auth0Guard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string): Promise<void> {
    return this.authService.deleteUser(userId);
  }

  /**
   * Ban user (admin)
   */
  @Post('user/:id/ban')
  @UseGuards(Auth0Guard)
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.authService.banUser(userId, true);
  }

  /**
   * Unban user (admin)
   */
  @Post('user/:id/unban')
  @UseGuards(Auth0Guard)
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.authService.banUser(userId, false);
  }

  /**
   * Health check endpoint for auth service
   */
  @Get('health')
  healthCheck(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sign up a new user
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto): Promise<UserResponseDto> {
    return this.authService.signUp(signUpDto);
  }

  /**
   * Sign in an existing user
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }
}
