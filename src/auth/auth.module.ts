import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth0Guard } from './guards/auth0.guard';
import { MockAuthService } from './mock-auth.service';

const authServiceProvider = {
  provide: AuthService,
  useFactory: () => {
    // Use mock service if no Auth0 credentials are provided or in development mode
    const useMock = process.env.NODE_ENV !== 'production' || 
                    !process.env.AUTH0_DOMAIN || 
                    !process.env.AUTH0_CLIENT_ID || 
                    !process.env.AUTH0_CLIENT_SECRET ||
                    process.env.USE_MOCK_AUTH === 'true';
    
    console.log(`Using ${useMock ? 'mock' : 'real'} Auth0 service`);
    
    return useMock ? new MockAuthService() : new AuthService();
  }
};

@Module({
  controllers: [AuthController],
  providers: [authServiceProvider, Auth0Guard],
  exports: [AuthService, Auth0Guard],
})
export class AuthModule {}
