// src\chat\history\history.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChatHistoryService } from './history.service';

describe('ChatHistoryService', () => {
  let service: ChatHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatHistoryService],
    }).compile();

    service = module.get<ChatHistoryService>(ChatHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
