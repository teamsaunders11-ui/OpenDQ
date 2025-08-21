import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDqRuleDto {
  @IsNotEmpty()
  @IsString()
  ruleName: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tableName: string;

  @IsNotEmpty()
  @IsString()
  columnName: string;

  @IsNotEmpty()
  @IsString()
  condition: string;

  @IsNotEmpty()
  @IsString()
  ruleType: string;
}
