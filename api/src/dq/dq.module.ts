import { Module } from '@nestjs/common';
import { DqController } from './dq.controller';
import { DqService } from './dq.service';

@Module({
  controllers: [DqController],
  providers: [DqService],
})
export class DqModule {}
