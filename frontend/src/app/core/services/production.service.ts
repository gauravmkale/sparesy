import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductionService {
    private api = '/api/production';

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.api);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.api}/${id}`);
    }

    getByProject(projectId: number): Observable<any> {
        return this.http.get(`${this.api}/project/${projectId}`);
    }

    advanceStage(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/advance`, {});
    }
}
