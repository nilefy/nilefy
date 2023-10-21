import { Test, TestingModule } from '@nestjs/testing';
import { TableController } from './table.controller';

describe('TableController', () => {
  let controller: TableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
    }).compile();

    controller = module.get<TableController>(TableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
