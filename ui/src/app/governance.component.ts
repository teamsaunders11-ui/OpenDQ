

import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  selector: 'app-governance',
  imports: [CommonModule],
  template: `
    <h2>Governance</h2>
    <table *ngIf="entities().length">
      <thead>
        <tr>
          <th *ngFor="let key of entityKeys()">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let entity of entities()">
          <td *ngFor="let key of entityKeys()">{{ entity[key] }}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!entities().length">No entities found.</p>
  `
})

export class GovernanceComponent {
  private api = inject(ApiService);
  entities = signal<any[]>([]);
  entityKeys = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.api.getGovernanceEntities().subscribe((data: any[]) => {
        this.entities.set(data || []);
        this.entityKeys.set(this.entities().length ? Object.keys(this.entities()[0]) : []);
      });
    });
  }
}
