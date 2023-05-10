import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { Seller } from '../../seller/entities/seller.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateSellerDto } from 'src/seller/dto/create-seller.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CommonService } from '../../common/common.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let sellerRepository: Repository<Seller>;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let configSevice: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'mypass',
        }),
      ],
      providers: [
        AuthService,
        ConfigService,
        CommonService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn((x) => new User()),
          },
        },
        {
          provide: getRepositoryToken(Seller),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn((x) => new Seller()),
          },
        },
      ],
    }).compile();

    configSevice = moduleRef.get<ConfigService>(ConfigService);
    authService = moduleRef.get<AuthService>(AuthService);
    sellerRepository = moduleRef.get<Repository<Seller>>('SellerRepository');
    jwtService = moduleRef.get<JwtService>(JwtService);
    userRepository = moduleRef.get<Repository<User>>('UserRepository');
  });

  describe('createSeller', () => {
    it('should create a new seller and return a token', async () => {
      const createSellerDto: CreateSellerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        company: 'hola',
      };

      const mockSeller: Seller = {
        id: '1',
        firstName: createSellerDto.firstName,
        lastName: createSellerDto.lastName,
        email: createSellerDto.email,
        password: bcrypt.hashSync(createSellerDto.password, 10),
        company: null,
        products: [],
        orders: [],
        isActive: true,
        emailToLowerCase: () => {}, // Mock the emailToLowerCase method
        checkBeforeUpdate: async () => {}, // Mock the checkBeforeUpdate method
      };

      jest.spyOn(sellerRepository, 'create').mockReturnValue(mockSeller);
      jest
        .spyOn(sellerRepository, 'save')
        .mockImplementation(async () => mockSeller);

      const result = await authService.createSeller(createSellerDto);

      expect(result.token).toBeDefined();
      expect(result.firstName).toEqual(createSellerDto.firstName);
      expect(result.lastName).toEqual(createSellerDto.lastName);
      expect(result.email).toEqual(createSellerDto.email);
      expect(result.password).toBeUndefined();
    });
  });

  describe('loginSeller', () => {
    it('should return a token for a valid seller login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'seller@example.com',
        password: 'password123',
      };

      const mockSeller: Seller = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: loginUserDto.email,
        password: bcrypt.hashSync(loginUserDto.password, 10),
        company: null,
        products: [],
        orders: [],
        isActive: true,
        emailToLowerCase: () => {}, // Mock the emailToLowerCase method
        checkBeforeUpdate: async () => {}, // Mock the checkBeforeUpdate method
      };

      jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(mockSeller);

      const result = await authService.loginSeller(loginUserDto);

      expect(result.token).toBeDefined();
    });

    it('should throw an unauthorized exception for an invalid seller login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'seller@example.com',
        password: 'password123',
      };

      jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(null);

      try {
        await authService.loginSeller(loginUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual('Las credenciales son incorrectas');
      }
    });
  });
  describe('createUser', () => {
    it('should create a new user and return a token', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        adress: '123 Main St',
      };

      const mockUser: User = {
        id: '1',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: bcrypt.hashSync(createUserDto.password, 10),
        adress: createUserDto.adress,
        rol: 'user',
        isActive: true,
        emailToLowerCase: () => {}, // Mock the emailToLowerCase method
        checkBeforeUpdate: async () => {}, // Mock the checkBeforeUpdate method
        order: [], // add the order property
      };

      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await authService.createUser(createUserDto);

      expect(result.token).toBeDefined();
      expect(result.firstName).toEqual(createUserDto.firstName);
      expect(result.lastName).toEqual(createUserDto.lastName);
      expect(result.email).toEqual(createUserDto.email);
      expect(result.password).toBeUndefined();
    });
  });

  describe('loginUser', () => {
    it('should return a token for a valid user login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: loginUserDto.email,
        password: bcrypt.hashSync(loginUserDto.password, 10),
        adress: '123 Main St',
        rol: 'user',
        isActive: true,
        emailToLowerCase: () => {}, // Mock the emailToLowerCase method
        checkBeforeUpdate: async () => {}, // Mock the checkBeforeUpdate method
        order: [], // add the order property
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await authService.loginUser(loginUserDto);

      expect(result.token).toBeDefined();
    });

    it('should throw an unauthorized exception for an invalid user login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      try {
        await authService.loginUser(loginUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual('Las credenciales son incorrectas');
      }
    });
  });
});
