import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Rule {
  id?: number;
  ruleName: string;
  description: string;
  tableName: string;
  columnName: string;
  condition: string;
  ruleType: string;
}

@Component({
  selector: 'app-rules-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rules-management.component.html',
  styleUrls: ['./rules-management.component.scss']
})
export class RulesManagementComponent implements OnInit {
  rules: Rule[] = [];
  rule: Rule = this.emptyRule();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadRules();
  }

  emptyRule(): Rule {
    return {
      ruleName: '',
      description: '',
      tableName: '',
      columnName: '',
      condition: '',
      ruleType: ''
    };
  }

  loadRules() {
    this.api.get('/dq/rules').subscribe((data: Rule[]) => this.rules = data);
  }

  onSubmit() {
    if (this.rule.id) {
      this.api.put(`/dq/rules/${this.rule.id}`, this.rule).subscribe(() => {
        this.loadRules();
        this.resetForm();
      });
    } else {
      this.api.post('/dq/rules', this.rule).subscribe(() => {
        this.loadRules();
        this.resetForm();
      });
    }
  }

  editRule(r: Rule) {
    this.rule = { ...r };
  }

  deleteRule(id: number) {
    this.api.delete(`/dq/rules/${id}`).subscribe(() => this.loadRules());
  }

  resetForm() {
    this.rule = this.emptyRule();
  }
}
