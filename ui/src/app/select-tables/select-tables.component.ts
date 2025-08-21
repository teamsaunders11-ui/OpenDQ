
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

interface Connection {
  id: number;
  name?: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

@Component({
  selector: 'app-select-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-tables.component.html',  
})
export class SelectTablesComponent implements OnInit {
  connections: Connection[] = [];
  selectedConnectionId: string = '';
  selectedConnectionIdx: number | null = null;
  tables: string[] = [];
  selectedTables: Set<string> = new Set();
  loadingTables = false;
  catalogMessage = '';
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get('/connections').subscribe({
      next: (data: Connection[]) => {
        this.connections = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load connections.';
      }
    });
  }

  onConnectionChange() {
    if (!this.selectedConnectionId) return;
    this.loadingTables = true;
    this.errorMessage = '';
    const conn = this.connections.find(c => c.id.toString() === this.selectedConnectionId);
    if (!conn) {
      this.tables = [];
      this.selectedTables.clear();
      this.loadingTables = false;
      this.errorMessage = 'Connection not found.';
      return;
    }
    this.api.get(`/connections/schema/${conn.id}`).subscribe({
      next: (res: { tables: string[] }) => {
        this.tables = res.tables || [];
        this.selectedTables.clear();
        this.loadingTables = false;
      },
      error: () => {
        this.tables = [];
        this.selectedTables.clear();
        this.loadingTables = false;
        this.errorMessage = 'Failed to load tables.';
      }
    });
  }

  toggleTable(table: string) {
    if (this.selectedTables.has(table)) {
      this.selectedTables.delete(table);
    } else {
      this.selectedTables.add(table);
    }
  }

  catalogSelected() {
    if (!this.selectedConnectionId || this.selectedTables.size === 0) return;
    this.catalogMessage = '';
    this.errorMessage = '';
    this.api.post('/catalog', {
      connectionId: this.selectedConnectionId,
      tables: Array.from(this.selectedTables)
    }).subscribe({
      next: (res: { message: string }) => {
        this.catalogMessage = res.message;
      },
      error: () => {
        this.errorMessage = 'Failed to catalog selected tables.';
      }
    });
  }
}
