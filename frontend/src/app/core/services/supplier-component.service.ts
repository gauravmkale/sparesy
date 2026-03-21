import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupplierComponentService {
    private api = '/api/supplier-components';

    constructor(private http: HttpClient) { }

    addToCatalog(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }

    getMyCatalog(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/my`);
    }

    getSupplierCatalog(supplierId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/${supplierId}`);
    }

    updateStock(id: number, quantity: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/stock`, null, { params: { quantity } });
    }

    updatePrice(id: number, price: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/price`, null, { params: { price } });
    }

    deleteFromCatalog(id: number): Observable<void> {
        return this.http.put<void>(`${this.api}/${id}/delete`, {});
    }
}
