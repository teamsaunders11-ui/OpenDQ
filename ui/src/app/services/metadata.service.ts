import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
export interface Asset {
  id: string;
  name: string;
  type: string;
  score?: number | null;
  parentId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MetadataService {
  constructor(private http: HttpClient) {}

  sync(payload: any) {
    // Map 'username' to 'user' for backend compatibility
    const { username, ...rest } = payload;
    const finalPayload = username ? { ...rest, user: username } : payload;
    return firstValueFrom(this.http.post('/api/metadata/sync', finalPayload));
  }

  /**
   * Get assets from API, optionally filtered by type and search
   */
  getAssets(type?: string, search?: string): Observable<Asset[]> {
    let params: any = {};
    if (type) params.type = type;
    if (search) params.search = search;
    return this.http.get<Asset[]>('/api/metadata/assets', { params });
  }
}
