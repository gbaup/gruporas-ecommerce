import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { CommonService } from '../../common/common.service';
import { PaginationInput } from '../../common/dto/pagination.dto';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCommonService = {
    getNextPrev: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return an array of users and pagination data', async () => {
      const paginationInput: PaginationInput = {
        page: 1,
        limit: 10,
      };

      const allUser: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'asd',
          adress: '123 Main St',
          rol: 'user',
          isActive: true,
          emailToLowerCase: function () {
            return this.email.toLowerCase();
          },
          checkBeforeUpdate: async function () {
            // Perform some checks before updating the user
            return true;
          },
          order: [],
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password456',
          adress: '456 Elm St',
          rol: 'admin',
          isActive: false,
          emailToLowerCase: function () {
            return this.email.toLowerCase();
          },
          checkBeforeUpdate: async function () {
            // Perform some checks before updating the user
            return true;
          },
          order: [],
        },
      ];

      const expected = [allUser, 'next', 'prev', 'pages'];

      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(10);
      jest
        .spyOn(userRepository, 'findAndCount')
        .mockResolvedValueOnce([allUser, allUser.length]);
      jest.spyOn(mockCommonService, 'getNextPrev').mockReturnValueOnce({
        next: 'next',
        prev: 'prev',
        pages: 'pages',
      });

      const result = await userService.findAll(paginationInput);

      expect(result).toEqual(expected);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: { isActive: true },
        take: 10,
        skip: 0,
      });
      expect(mockCommonService.getNextPrev).toHaveBeenCalledWith(
        paginationInput,
        2,
        'user',
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user: User = {
        id: '1',
        firstName: 'asd',
        lastName: 'asd',
        email: 'asd',
        password: 'asd',
        adress: 'asd',
        rol: 'user',
        isActive: true,
        emailToLowerCase: jest.fn().mockReturnValue('asd'), // Mock the emailToLowerCase method
        checkBeforeUpdate: jest.fn().mockResolvedValue(true), // Mock the checkBeforeUpdate method // Mock the checkBeforeUpdate method
        order: [], // add the order property
      };

      const id = user.id;

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(userRepository, 'preload').mockResolvedValueOnce({
        ...user,
        emailToLowerCase: jest.fn().mockReturnValue('asd'),
        checkBeforeUpdate: jest.fn().mockResolvedValue(true),
        isActive: false,
      });
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(user);

      const result = await userService.remove(id, user);

      expect(result).toEqual('Usuario eliminado exitosamente');
      expect(userService.findOne).toHaveBeenCalledWith(id);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        emailToLowerCase: expect.any(Function),
        checkBeforeUpdate: expect.any(Function),
        isActive: false,
      });
    });

    it('should throw a ForbiddenException if user tries to remove another user', async () => {
      const id = '1';
      const user = new User();
      user.id = '2';

      expect(userService.remove(id, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'newpassword',
        adress: '123 Main St',
      };
      const user: User = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'oldpassword',
        adress: '456 Elm St',
        rol: 'user',
        isActive: true,
        emailToLowerCase: jest.fn().mockReturnValue('john.doe@example.com'),
        checkBeforeUpdate: jest.fn().mockResolvedValue(true),
        order: [],
      };
      const updatedUser: User = {
        id,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        email: updateUserDto.email,
        password: updateUserDto.password,
        adress: updateUserDto.adress,
        rol: user.rol,
        isActive: user.isActive,
        emailToLowerCase: expect.any(Function),
        checkBeforeUpdate: expect.any(Function),
        order: user.order,
      };

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(userRepository, 'preload').mockResolvedValueOnce(updatedUser);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(updatedUser);

      const result = await userService.update(id, updateUserDto, user);

      expect(result).toEqual({
        id,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        adress: '123 Main St',
        rol: 'user',
        isActive: true,
        emailToLowerCase: expect.any(Function),
        checkBeforeUpdate: expect.any(Function),
        order: [],
      });

      const userId = user.id;

      expect(userService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('UpdateUserDto', () => {
    it('should create a partial update user dto', () => {
      const dto = new UpdateUserDto();
      expect(dto).toBeDefined();
      expect(dto.firstName).toBeUndefined();
      expect(dto.lastName).toBeUndefined();
      expect(dto.email).toBeUndefined();
      expect(dto.password).toBeUndefined();

      dto.firstName = 'John';
      dto.lastName = 'Doe';

      expect(dto.firstName).toEqual('John');
      expect(dto.lastName).toEqual('Doe');
    });
  });
});
