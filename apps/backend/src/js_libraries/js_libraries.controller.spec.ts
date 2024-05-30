import { Test, TestingModule } from '@nestjs/testing';
import { JsLibrariesController } from './js_libraries.controller';

describe('JsLibrariesController', () => {
  let controller: JsLibrariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsLibrariesController],
    }).compile();

    controller = module.get<JsLibrariesController>(JsLibrariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
