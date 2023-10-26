import { Test, TestingModule } from '@nestjs/testing';
import { TablecxController } from './tablecx.controller';

describe('TablecxController', () => {
  let controller: TablecxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablecxController],
    }).compile();

    controller = module.get<TablecxController>(TablecxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
