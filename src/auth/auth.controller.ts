import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import e from 'express';

@Controller('company/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-up')
  async signUp(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    let status = await this.authService.signUp(email, password);
    console.log('Sign-up status:', status);

    return {
      message: status,
    };
  }
  @Post('sign-in')
  signIn(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      console.error('Email and password are required for sign-in.');
    }
    return this.authService.signIn(email, password);
  }
}
