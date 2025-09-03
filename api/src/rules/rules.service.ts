import { Injectable } from '@nestjs/common';
import { TableEntity, ColumnEntity, RuleEntity } from '../common/models';

@Injectable()
export class RulesService {
  generateDefaultRules(schema: TableEntity[]): RuleEntity[] {
    const rules: RuleEntity[] = [];

    for (const table of schema) {
      if (!table.columns) continue;
      for (const column of table.columns) {
        // NOT NULL check
        rules.push({
          id: `${table.name}_${column.name}_not_null`,
          name: `NOT NULL check for ${table.name}.${column.name}`,
          columns: [column],
          tables: [table],
        });

        // Data type checks
        if (column.dataType) {
          const dataType = column.dataType.toLowerCase();
          if ([
            'int', 'integer', 'bigint', 'decimal', 'numeric', 'float', 'double'
          ].some(type => dataType.includes(type))) {
            rules.push({
              id: `${table.name}_${column.name}_numeric_type`,
              name: `Numeric type check for ${table.name}.${column.name}`,
              columns: [column],
              tables: [table],
            });
          }
          if ([
            'date', 'timestamp', 'datetime'
          ].some(type => dataType.includes(type))) {
            rules.push({
              id: `${table.name}_${column.name}_date_type`,
              name: `Date type check for ${table.name}.${column.name}`,
              columns: [column],
              tables: [table],
            });
          }
        }
      }
      // Uniqueness check for primary key
      if (table.primaryKey && Array.isArray(table.primaryKey)) {
        rules.push({
          id: `${table.name}_primary_key_unique`,
          name: `Uniqueness check for primary key of ${table.name}`,
          columns: table.columns.filter(col => table.primaryKey!.includes(col.name)),
          tables: [table],
        });
      }
    }
    return rules;
  }
}
