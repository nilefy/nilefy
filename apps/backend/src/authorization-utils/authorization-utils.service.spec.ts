import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationUtilsService } from './authorization-utils.service';

describe('AuthorizationUtilsService', () => {
  let service: AuthorizationUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationUtilsService],
    }).compile();

    service = module.get<AuthorizationUtilsService>(AuthorizationUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
