import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dq_rules' })
export class DqRuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rule_name' })
  ruleName: string;

  @Column()
  description: string;

  @Column({ name: 'table_name' })
  tableName: string;

  @Column({ name: 'column_name' })
  columnName: string;

  @Column()
  condition: string;

  @Column({ name: 'rule_type' })
  ruleType: string;
}
