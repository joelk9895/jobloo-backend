import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ManagementClient } from 'auth0';

jest.mock('auth0', () => {
  const mockUsers = {
    get: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockMgmt = {
    users: mockUsers,
  };
  const ManagementClient = jest.fn(() => mockMgmt);
  return { ManagementClient };
});

describe('AuthService', () => {
  let service: AuthService;
  let managementClientInstance: { users: { get: jest.Mock; getAll: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  const mockAuth0User = {
    user_id: 'auth0|1234567890',
    email: 'test@example.com',
    given_name: 'John',
    family_name: 'Doe',
    username: 'johndoe',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // grab the most recent mock instance
    const MockMgmtClientConstructor = ManagementClient as jest.Mock;
    expect(MockMgmtClientConstructor).toHaveBeenCalled();

    managementClientInstance = MockMgmtClientConstructor.mock.instances[0];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate and return user data', async () => {
      (managementClientInstance.users.get as jest.Mock).mockResolvedValue({
        data: mockAuth0User,
      });

      const result = await service.validateUser('auth0|1234567890');

      expect(result.id).toBe('auth0|1234567890');
      expect(result.email).toBe('test@example.com');
      expect(managementClientInstance.users.get).toHaveBeenCalledWith({
        id: 'auth0|1234567890',
      });
    });

    it('should throw UnauthorizedException when user validation fails', async () => {
      (managementClientInstance.users.get as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.validateUser('invalid_user')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      (managementClientInstance.users.get as jest.Mock).mockResolvedValue({
        data: mockAuth0User,
      });

      const result = await service.getUserById('auth0|1234567890');

      expect(result.id).toBe('auth0|1234567890');
      expect(managementClientInstance.users.get).toHaveBeenCalledWith({
        id: 'auth0|1234567890',
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      (managementClientInstance.users.get as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.getUserById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsers', () => {
    it('should return list of users', async () => {
      (managementClientInstance.users.getAll as jest.Mock).mockResolvedValue({
        data: [mockAuth0User],
      });

      const result = await service.getUsers(10, 0);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('auth0|1234567890');
      expect(managementClientInstance.users.getAll).toHaveBeenCalledWith({
        per_page: 10,
        page: 0,
      });
    });
  });
});
