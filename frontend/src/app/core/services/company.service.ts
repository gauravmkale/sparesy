import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private api = '/api/companies';

    constructor(private http: HttpClient) { }

    getClients(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/clients`);
    }

    getApprovedClients(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Approvedclients`);
    }

    getSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/suppliers`);
    }

    getApprovedSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Approvedsuppliers`);
    }

    deleteCompany(id: number): Observable<void> {
        return this.http.put<void>(`${this.api}/${id}/delete`, {});
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.api}/${id}`);
    }

    getPending(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/pending`);
    }

    approve(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/approve`, {});
    }

    reject(id: number): Observable<any> {
        return this.http.put(`${this.api}/${id}/reject`, {});
    }
}
