import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DqRuleEntity } from './dq-rule.entity';
import { CreateDqRuleDto } from './dto/create-dq-rule.dto';
import { UpdateDqRuleDto } from './dto/update-dq-rule.dto';

@Injectable()
export class DqRulesService {
  constructor(
    @InjectRepository(DqRuleEntity)
    private dqRuleRepository: Repository<DqRuleEntity>,
  ) {}

  create(createDqRuleDto: CreateDqRuleDto) {
    const rule = this.dqRuleRepository.create(createDqRuleDto);
    return this.dqRuleRepository.save(rule);
  }

  findAll() {
    return this.dqRuleRepository.find();
  }


  async update(id: number, updateDqRuleDto: UpdateDqRuleDto) {
    const rule = await this.dqRuleRepository.findOneBy({ id });
    if (!rule) throw new NotFoundException('Rule not found');
    Object.assign(rule, updateDqRuleDto);
    return this.dqRuleRepository.save(rule);
  }

  async findById(id: number) {
    return this.dqRuleRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const result = await this.dqRuleRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Rule not found');
    return { deleted: true };
  }
}
