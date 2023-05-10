import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  const mockSeedService = {
    runSeed: jest.fn().mockImplementation(() => {
      return 'SEED EXECUTED';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [SeedService],
    })
      .overrideProvider(SeedService)
      .useValue(mockSeedService)
      .compile();

    controller = module.get<SeedController>(SeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('seed', () => {
    it('should seed', () => {
      expect(controller.executeSeed()).toBeDefined();
      expect(controller.executeSeed()).toEqual('SEED EXECUTED');
      expect(mockSeedService.runSeed).toHaveBeenCalled();
    });
  });
});
