import { Test, TestingModule } from '@nestjs/testing';
import { GooglesheetsController } from './googlesheets.controller';

describe('GooglesheetsController', () => {
  let controller: GooglesheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GooglesheetsController],
    }).compile();

    controller = module.get<GooglesheetsController>(GooglesheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
