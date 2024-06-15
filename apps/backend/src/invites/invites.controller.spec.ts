import { Test, TestingModule } from '@nestjs/testing';
import { InvitesController } from './invites.controller';

describe('InvitesController', () => {
  let controller: InvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
    }).compile();

    controller = module.get<InvitesController>(InvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
