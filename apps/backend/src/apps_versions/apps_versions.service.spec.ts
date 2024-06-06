import { Test, TestingModule } from '@nestjs/testing';
import { AppsVersionsService } from './apps_versions.service';

describe('AppsVersionsService', () => {
  let service: AppsVersionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppsVersionsService],
    }).compile();

    service = module.get<AppsVersionsService>(AppsVersionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
