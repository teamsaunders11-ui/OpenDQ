import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}

  registerTable(connectionId: string, tables: string[]): Observable<any> {
    return this.api.post('/catalog/register', { connectionId, tables });
  }
}
