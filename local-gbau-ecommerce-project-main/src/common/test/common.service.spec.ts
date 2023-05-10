import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '../common.service';
import { ConfigService } from '@nestjs/config';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService, ConfigService],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNextPrev', () => {
    it('should return next and prev', () => {
      const dto = {
        page: 1,
      };
      const result = service.getNextPrev(dto, 1, 'variant');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('pages');
      expect(result).toHaveProperty('prev');
      expect(result).toHaveProperty('next');
    });
  });
});
