import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { DqService } from './dq.service';
import { DqRulesService } from './dq-rules.service';
import { CreateDqRuleDto } from './dto/create-dq-rule.dto';
import { UpdateDqRuleDto } from './dto/update-dq-rule.dto';

@Controller('dq/rules')
export class DqRulesController {
  constructor(
    private readonly dqRulesService: DqRulesService,
    private readonly dqService: DqService,
  ) {}

  @Post('run-rule')
  async runRule(@Body() body: { ruleId: number }) {
    const rule = await this.dqRulesService.findById(body.ruleId);
    if (!rule) throw new NotFoundException('Rule not found');

    // Build Soda YAML for the table and rule (use only the condition field)
    const checks = `checks for ${rule.tableName}:\n  - ${rule.condition}`;

    // Call dynamic scan with only checks YAML (no CSV)
    const result = await this.dqService.runDynamicScan({ checks });
    // Return a simple result format for the UI
    return [
      {
        ruleName: rule.ruleName,
        tableName: rule.tableName,
        status: result?.checks?.[0]?.outcome || 'unknown',
        score: result?.checks?.[0]?.score || null,
      },
    ];
  }

  @Post()
  create(@Body() createDqRuleDto: CreateDqRuleDto) {
    return this.dqRulesService.create(createDqRuleDto);
  }

  @Get()
  findAll() {
    return this.dqRulesService.findAll();
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDqRuleDto: UpdateDqRuleDto,
  ) {
    return this.dqRulesService.update(id, updateDqRuleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dqRulesService.remove(id);
  }
}
