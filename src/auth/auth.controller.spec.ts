import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: UserResponseDto = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    imageUrl: 'https://example.com/avatar.jpg',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  };

  const mockAuthService: Partial<AuthService> = {
    getUserById: jest.fn().mockResolvedValue(mockUser),
    getUsers: jest.fn().mockResolvedValue([mockUser]),
    updateUserMetadata: jest.fn().mockResolvedValue(mockUser),
    deleteUser: jest.fn().mockResolvedValue(undefined),
    banUser: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return the current user', () => {
      const result = controller.getCurrentUser(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const result = await controller.getUserById('user_123');
      expect(result).toEqual(mockUser);
      expect(mockAuthService.getUserById as jest.Mock).toHaveBeenCalledWith(
        'user_123',
      );
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const result = await controller.getUsers(10, 0);
      expect(result).toEqual([mockUser]);
      expect(mockAuthService.getUsers as jest.Mock).toHaveBeenCalledWith(10, 0);
    });
  });

  describe('updateMyMetadata', () => {
    it('should update current user metadata', async () => {
      const metadata = { role: 'admin' };
      const result = await controller.updateMyMetadata(mockUser, metadata);
      expect(result).toEqual(mockUser);
      expect(
        mockAuthService.updateUserMetadata as jest.Mock,
      ).toHaveBeenCalledWith(mockUser.id, metadata);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = controller.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.message).toBe('Auth service is running');
      expect(result.timestamp).toBeDefined();
    });
  });
});
