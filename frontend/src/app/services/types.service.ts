import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Type } from '../models/type';

@Injectable({
    providedIn: 'root'
})

export class TypesService {
    constructor(private http: HttpClient){
    }

    private apiUrl = environment.apiUrl;

    public getAllTypes(): Promise<Type[]> {
        const url = `${this.apiUrl}/types`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getType(id: number): Promise<Type> {
        const url = `${this.apiUrl}/log/${id}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public createNewType(type: Type): Promise<any> {
        const url = `${this.apiUrl}/type`;
        const res = this.http
                        .post(url, type)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error.error.errmsg || error);
        return Promise.reject(error.error.errmsg || error);
    }
}
