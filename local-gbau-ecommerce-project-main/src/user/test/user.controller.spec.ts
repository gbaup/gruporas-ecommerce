import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;
  const User = {
    firstName: 'test',
    lastName: 'test',
    email: 'test@test.com',
    adress: 'test',
    products: [],
  };
  const UserLogged = {
    id: '1',
    ...User,
    order: [],
    password: ' ',
    rol: 'common',
    isActive: true,
    emailToLowerCase: undefined,
    checkBeforeUpdate: undefined,
  };
  const mockUserService = {
    findAll: jest.fn().mockImplementation(() => {
      return [];
    }),
    findOne: jest.fn().mockImplementation((id) => {
      return {
        ...User,
        id,
      };
    }),
    update: jest.fn().mockImplementation((id, dto, UserToUpdate) => {
      return {
        id,
        order: UserToUpdate.order,
        ...dto,
      };
    }),
    remove: jest.fn().mockImplementation((id) => {
      return `Buyer con id ${id} ahora está inactivo`;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should findAll Users', () => {
    const dto = { page: 1 };
    expect(controller.findAll(dto)).toEqual([]);
    expect(mockUserService.findAll).toHaveBeenCalledWith(dto);
  });

  it('should findOne User', () => {
    expect(controller.findOne('1')).toEqual({ ...User, id: '1' });
    expect(mockUserService.findOne).toHaveBeenCalledWith('1');
  });

  it('should update User', () => {
    const dto = {
      firstName: 'test',
      lastName: 'test',
      email: '',
    };

    expect(controller.update('1', dto, UserLogged)).toEqual({
      id: '1',
      order: UserLogged.order,
      ...dto,
    });
    expect(mockUserService.update).toHaveBeenCalledWith('1', dto, UserLogged);
  });

  it('should delete User', () => {
    expect(controller.remove('1', UserLogged)).toEqual(
      `Buyer con id 1 ahora está inactivo`,
    );
    expect(mockUserService.remove).toHaveBeenCalledWith('1', UserLogged);
  });
});
