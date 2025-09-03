export interface DatabaseEntity {
  id: string;
  name: string;
  tables?: TableEntity[];
  score?: number;
}


export interface TableEntity {
  id: string;
  name: string;
  database?: DatabaseEntity;
  columns?: ColumnEntity[];
  rules?: RuleEntity[];
  score?: number;
  primaryKey?: string[];
}


export interface ColumnEntity {
  id: string;
  name: string;
  table?: TableEntity;
  rules?: RuleEntity[];
  score?: number;
  dataType?: string;
}

export interface RuleEntity {
  id: string;
  name: string;
  columns?: ColumnEntity[];
  tables?: TableEntity[];
  score?: number;
}
