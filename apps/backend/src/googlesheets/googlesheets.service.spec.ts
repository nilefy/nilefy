import { Test, TestingModule } from '@nestjs/testing';
import { GooglesheetsService } from './googlesheets.service';

describe('GooglesheetsService', () => {
  let service: GooglesheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GooglesheetsService],
    }).compile();

    service = module.get<GooglesheetsService>(GooglesheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
