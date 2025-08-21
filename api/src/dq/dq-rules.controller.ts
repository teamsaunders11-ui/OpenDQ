import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DqRulesService } from './dq-rules.service';
import { CreateDqRuleDto } from './dto/create-dq-rule.dto';
import { UpdateDqRuleDto } from './dto/update-dq-rule.dto';

@Controller('dq/rules')
export class DqRulesController {
  constructor(private readonly dqRulesService: DqRulesService) {}

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
