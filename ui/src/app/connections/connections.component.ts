import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  standalone: true,
  selector: 'app-connections',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent {
  form: FormGroup;
  connections: any[] = [];
  validationResult: any = null;
  editingId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      name: '',
      host: '',
      port: 5432,
      database: '',
      user: '',
      password: '',
    });
    this.loadConnections();
  }

  loadConnections() {
    this.api.getConnections().subscribe((data) => (this.connections = data));
  }

  validate() {
    this.api.validateConnection(this.form.value).subscribe((res) => (this.validationResult = res));
  }

  onSubmit() {
    if (this.editingId) {
      this.api.put(`/connections/${this.editingId}`, this.form.value).subscribe(() => {
        this.loadConnections();
        this.resetForm();
      });
    } else {
      this.api.saveConnection(this.form.value).subscribe(() => {
        this.loadConnections();
        this.form.reset({ port: 5432 });
      });
    }
  }

  editConnection(conn: any) {
    this.editingId = conn.id;
    this.form.setValue({
      name: conn.name || '',
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.user,
      password: conn.password,
    });
  }

  resetForm() {
    this.editingId = null;
    this.form.reset({ port: 5432 });
  }

  deleteConnection(conn: any) {
    if (!confirm('Are you sure you want to delete this connection?')) return;
    this.api.delete(`/connections/${conn.id}`).subscribe(() => {
      this.loadConnections();
    });
  }
}
