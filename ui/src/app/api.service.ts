import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getGovernanceEntities(): Observable<any> {
    return this.http.get('/governance/entities');
  }

  getConnections(): Observable<any[]> {
    return this.http.get<any[]>('/api/connections');
  }

  saveConnection(conn: any): Observable<any> {
    return this.http.post('/api/connections', conn);
  }

  validateConnection(conn: any): Observable<any> {
    return this.http.post('/api/connections/validate', conn);
  }
}
