import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventoryService {
    private api = '/api/inventory';

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.api);
    }

    getByComponent(componentId: number): Observable<any> {
        return this.http.get(`${this.api}/component/${componentId}`);
    }

    getAlerts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/alerts`);
    }

    updateStock(componentId: number, data: any): Observable<any> {
        return this.http.put(`${this.api}/${componentId}/stock`, data);
    }
}
