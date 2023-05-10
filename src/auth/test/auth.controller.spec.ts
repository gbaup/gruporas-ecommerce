import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    userData: jest.fn().mockImplementation((user) => {
      if (user.company) {
        return {
          adress: user.address,
          company: user.company,
          order: user.order,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          isActive: true,
        };
      } else {
        return {
          adress: user.address,
          rol: 'common',
          order: user.order,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          isActive: true,
        };
      }
    }),
    createUser: jest.fn().mockImplementation((user) => {
      return {
        adress: user.address,
        rol: 'common',
        order: user.order,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        isActive: true,
      };
    }),
    createSeller: jest.fn().mockImplementation((user) => {
      return {
        adress: user.address,
        company: user.company,
        order: user.order,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        isActive: true,
      };
    }),
    loginUser: jest.fn().mockImplementation((user) => {
      return {
        token: 'token',
      };
    }),
    loginSeller: jest.fn().mockImplementation((user) => {
      return {
        token: 'token',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userData', () => {
    it('should return user data', () => {
      const user = {
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'common',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.userData(user)).toBeDefined();
      expect(controller.userData(user)).toEqual({
        adress: 'address',
        rol: 'common',
        order: [],
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
      });
      expect(mockAuthService.userData).toHaveBeenCalled();
    });
    it('should return seller data', () => {
      const seller = {
        company: 'company',
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'seller',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.userData(seller)).toBeDefined();
      expect(controller.userData(seller)).toEqual({
        adress: 'address',
        company: 'company',
        order: [],
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
      });
      expect(mockAuthService.userData).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create user', () => {
      const user = {
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'common',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.createUser(user)).toBeDefined();
      expect(controller.createUser(user)).toEqual({
        adress: 'address',
        rol: 'common',
        order: [],
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
      });
      expect(mockAuthService.createUser).toHaveBeenCalled();
    });
  });

  describe('createSeller', () => {
    it('should create seller', () => {
      const seller = {
        company: 'company',
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'seller',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.createSeller(seller)).toBeDefined();
      expect(controller.createSeller(seller)).toEqual({
        adress: 'address',
        order: [],
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        company: 'company',
      });
      expect(mockAuthService.createSeller).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should login user', () => {
      const user = {
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'common',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.loginUser(user)).toBeDefined();
      expect(controller.loginUser(user)).toEqual({
        token: 'token',
      });
      expect(mockAuthService.loginUser).toHaveBeenCalled();
    });
  });

  describe('loginSeller', () => {
    it('should login seller', () => {
      const seller = {
        company: 'company',
        id: '1',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
        isActive: true,
        rol: 'seller',
        address: 'address',
        order: [],
        adress: 'address',
        emailToLowerCase: undefined,
        checkBeforeUpdate: undefined,
      };
      expect(controller.loginSeller(seller)).toBeDefined();
      expect(controller.loginSeller(seller)).toEqual({
        token: 'token',
      });
      expect(mockAuthService.loginSeller).toHaveBeenCalled();
    });
  });
});
