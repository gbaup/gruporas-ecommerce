import { Test, TestingModule } from '@nestjs/testing';
import { BulkImportController } from '../bulk-import.controller';
import { BulkImportService } from '../bulk-import.service';

describe('BulkImportController', () => {
  let controller: BulkImportController;
  const mockBulkImportService = {
    upload: jest.fn().mockImplementation((seller, file) => {
      return 'This action adds a new bulkImport';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkImportController],
      providers: [BulkImportService],
    })
      .overrideProvider(BulkImportService)
      .useValue(mockBulkImportService)
      .compile();

    controller = module.get<BulkImportController>(BulkImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload and import a file', () => {
    const seller = {
      company: 'company',
      orders: [],
      id: '1',
      products: [],
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      password: 'password',
      isActive: true,
      emailToLowerCase: undefined,
      checkBeforeUpdate: undefined,
    };
    const file: Express.Multer.File = {
      fieldname: 'fieldname',
      originalname: 'originalname',
      encoding: 'encoding',
      mimetype: 'mimetype',
      buffer: Buffer.from('buffer'),
      size: 1,
      stream: null,
      destination: 'destination',
      filename: 'filename',
      path: 'path',
    };
    expect(controller.create(seller, file)).toBeDefined();
    expect(controller.create(seller, file)).toEqual(
      'This action adds a new bulkImport',
    );
    expect(mockBulkImportService.upload).toHaveBeenCalled();
  });
});
