import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private api = '/api/transactions';

    constructor(private http: HttpClient) { }

    getMy(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/my`);
    }

    getRevenue(type: string): Observable<any> {
        return this.http.get(`${this.api}/revenue`, { params: { type } });
    }

    getProjectSummary(id: number): Observable<any> {
        return this.http.get(`${this.api}/project/${id}/summary`);
    }

    getClientSummary(id: number): Observable<any> {
        return this.http.get(`${this.api}/client/${id}/summary`);
    }

    getClientSummaries(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/clients/summaries`);
    }
}
