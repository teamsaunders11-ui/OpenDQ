import { Module } from '@nestjs/common';
import { DqController } from './dq.controller';
import { DqService } from './dq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DqRuleEntity } from './dq-rule.entity';
import { DqRulesService } from './dq-rules.service';
import { DqRulesController } from './dq-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DqRuleEntity])],
  controllers: [DqController, DqRulesController],
  providers: [DqService, DqRulesService],
})
export class DqModule {}
