import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { firstValueFrom } from 'rxjs';
import { MetadataService } from '../services/metadata.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';

interface Asset {
  name: string;
  type: string;
  score?: number | null;
  [key: string]: any;
}

@Component({
  selector: 'opendq-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [InputTextModule, SelectModule, TableModule, CardModule, ButtonModule, PaginatorModule, FormsModule, CommonModule],
})
export class AssetsComponent {
  private readonly metadataService = inject(MetadataService);

  public title = 'Assets';
  public readonly assets = signal<Asset[]>([]);
  public readonly filterValue = signal('');
  public readonly typeFilterValue = signal('');
  public readonly typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Instance', value: 'rdbms_instance' },
    { label: 'Database', value: 'rdbms_db' },
    { label: 'Table', value: 'rdbms_table' },
    { label: 'Column', value: 'rdbms_column' },
  ];
  public viewMode: 'grid' | 'card' = 'grid';
  public cardPage = 0;
  public cardRows = 8;
  public get cardFirst() {
    return this.cardPage * this.cardRows;
  }

  public readonly filteredAssets = computed(() => {
    const filter = this.filterValue().toLowerCase();
    const type = this.typeFilterValue();
    return this.assets().filter(asset => {
      const matchesName = asset.name?.toLowerCase().includes(filter);
      const matchesType = !type || asset.type === type;
      return matchesName && matchesType;
    });
  });

  public Object = Object;

  constructor() {
    this.loadAssets();
  }

  public setViewMode(mode: 'grid' | 'card') {
    this.viewMode = mode;
    this.cardPage = 0;
  }

  public onCardPageChange(event: any) {
    this.cardPage = event.page;
    this.cardRows = event.rows;
  }

  private async loadAssets() {
    try {
      const data = await firstValueFrom(this.metadataService.getAssets());
      this.assets.set(Array.isArray(data) ? data : []);
    } catch (err) {
      this.assets.set([]);
    }
  }
}
