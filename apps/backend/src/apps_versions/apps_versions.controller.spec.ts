import { Test, TestingModule } from '@nestjs/testing';
import { AppsVersionsController } from './apps_versions.controller';

describe('AppsVersionsController', () => {
  let controller: AppsVersionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppsVersionsController],
    }).compile();

    controller = module.get<AppsVersionsController>(AppsVersionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
