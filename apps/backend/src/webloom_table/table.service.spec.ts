import { Test, TestingModule } from '@nestjs/testing';
import { TablecxService } from './table.service';

describe('TablecxService', () => {
  let service: TablecxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TablecxService],
    }).compile();

    service = module.get<TablecxService>(TablecxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
