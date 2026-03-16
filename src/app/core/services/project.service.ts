import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    private api = '/api/projects';

    constructor(private http: HttpClient) { }

    submitProject(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }

    getAllProjects(): Observable<any[]> {
        return this.http.get<any[]>(this.api);
    }

    getMyProjects(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/my`);
    }

    getProject(id: number): Observable<any> {
        return this.http.get(`${this.api}/${id}`);
    }

    updateStatus(id: number, status: string): Observable<any> {
        return this.http.put(`${this.api}/${id}/status`, null, { params: { status } });
    }
}
