import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuoteService {
    private api = '/api/quotes';

    constructor(private http: HttpClient) { }

    createQuote(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }

    getByProject(projectId: number): Observable<any> {
        return this.http.get(`${this.api}/project/${projectId}`);
    }

    getMyQuotes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/my`);
    }

    send(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/send`, {});
    }

    approve(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/approve`, {});
    }

    reject(id: number, note?: string): Observable<any> {
        return this.http.put(`${this.api}/${id}/reject`, { note });
    }
}
