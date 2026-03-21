import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestService {
    private api = '/api/requests';

    constructor(private http: HttpClient) { }

    sendRequest(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }

    sendBulkRequest(data: any): Observable<any> {
        return this.http.post(`${this.api}/bulk`, data);
    }

    getByProject(projectId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/project/${projectId}`);
    }

    getMyRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/my`);
    }

    submitQuote(id: number, data: any): Observable<any> {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + data.deliveryDays);
        return this.http.put(`${this.api}/${id}/quote`, null, {
            params: {
                price: data.quotedPrice.toString(),
                delivery: deliveryDate.toISOString().slice(0, 19)
            }
        });
    }

    approve(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/approve`, {});
    }

    reject(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/reject`, {});
    }
}
