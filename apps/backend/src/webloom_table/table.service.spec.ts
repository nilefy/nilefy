import { Test, TestingModule } from '@nestjs/testing';
import { WebloomDbService } from './table.service';

describe('TablecxService', () => {
  let service: WebloomDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebloomDbService],
    }).compile();

    service = module.get<WebloomDbService>(WebloomDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
