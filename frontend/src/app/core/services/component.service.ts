import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComponentService {
    private api = '/api/components';

    constructor(private http: HttpClient) { }

    addComponent(data: any): Observable<any> {
        return this.http.post(this.api, data);
    }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.api);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.api}/${id}`);
    }

    search(partNumber: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/search`, { params: { partNumber } });
    }

    getByCategory(category: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/category`, { params: { category } });
    }
}
