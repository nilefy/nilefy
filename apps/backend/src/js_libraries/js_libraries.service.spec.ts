import { Test, TestingModule } from '@nestjs/testing';
import { JsLibrariesService } from './js_libraries.service';

describe('JsLibrariesService', () => {
  let service: JsLibrariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsLibrariesService],
    }).compile();

    service = module.get<JsLibrariesService>(JsLibrariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
