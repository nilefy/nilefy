import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionController } from './encryption.controller';

describe('EncryptionController', () => {
  let controller: EncryptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncryptionController],
    }).compile();

    controller = module.get<EncryptionController>(EncryptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
