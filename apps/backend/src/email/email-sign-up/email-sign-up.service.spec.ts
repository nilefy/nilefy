import { Test, TestingModule } from '@nestjs/testing';
import { EmailSignUpService } from './email-sign-up.service';

describe('EmailSignUpService', () => {
  let service: EmailSignUpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailSignUpService],
    }).compile();

    service = module.get<EmailSignUpService>(EmailSignUpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
