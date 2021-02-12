import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})

export class TypesService {
    constructor(private http: HttpClient){
    }

    private apiUrl = environment.apiUrl;
}
