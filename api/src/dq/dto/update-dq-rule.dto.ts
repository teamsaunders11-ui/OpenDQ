import { PartialType } from '@nestjs/mapped-types';
import { CreateDqRuleDto } from './create-dq-rule.dto';

export class UpdateDqRuleDto extends PartialType(CreateDqRuleDto) {}
