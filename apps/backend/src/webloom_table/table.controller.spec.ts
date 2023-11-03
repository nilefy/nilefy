import { Test, TestingModule } from '@nestjs/testing';
import { WebloomDbController } from './table.controller';

describe('TablecxController', () => {
  let controller: WebloomDbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebloomDbController],
    }).compile();

    controller = module.get<WebloomDbController>(WebloomDbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
