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

    getSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/suppliers`);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.api}/${id}`);
    }
}
