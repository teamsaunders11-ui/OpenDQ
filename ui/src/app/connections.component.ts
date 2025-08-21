import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  selector: 'app-connections',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Connections</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Host: <input formControlName="host" autocomplete="host" /></label><br />
      <label>Port: <input formControlName="port" type="number" autocomplete="off" /></label><br />
      <label>Database: <input formControlName="database" autocomplete="database" /></label><br />
      <label>Username: <input formControlName="user" autocomplete="username" /></label><br />
      <label
        >Password:
        <input formControlName="password" type="password" autocomplete="current-password" /></label
      ><br />
      <button type="button" (click)="validate()">Validate</button>
      <button type="submit">Save</button>
    </form>
    <div *ngIf="validationResult">
      <span *ngIf="validationResult.valid" style="color:green">Connection valid!</span>
      <span *ngIf="!validationResult.valid" style="color:red"
        >Invalid: {{ validationResult.error }}</span
      >
    </div>
    <h3>Saved Connections</h3>
    <ul>
      <li *ngFor="let c of connections">
        {{ c.host }}:{{ c.port }}/{{ c.database }} ({{ c.user }})
      </li>
    </ul>
  `,
})
export class ConnectionsComponent {
  form: FormGroup;
  connections: any[] = [];
  validationResult: any = null;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
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

  save() {
    this.api.saveConnection(this.form.value).subscribe(() => {
      this.loadConnections();
      this.form.reset({ port: 5432 });
    });
  }
}
