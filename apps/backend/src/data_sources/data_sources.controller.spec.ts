import { Test, TestingModule } from '@nestjs/testing';
import { DataSourcesController } from './data_sources.controller';

describe('DataSourcesController', () => {
  let controller: DataSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourcesController],
    }).compile();

    controller = module.get<DataSourcesController>(DataSourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
