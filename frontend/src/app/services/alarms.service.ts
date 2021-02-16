import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Alarm } from '../models/alarm';

@Injectable({
    providedIn: 'root'
})

export class AlarmsService {
    constructor(private http: HttpClient){
    }

    private apiUrl = environment.apiUrl;

    public getAllAlarms(): Promise<Alarm[]> {
        const url = `${this.apiUrl}/alarms`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getAlarm(id: number): Promise<Alarm> {
        const url = `${this.apiUrl}/alarm/${id}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public createNewAlarm(alarm: Alarm): Promise<any> {
        const url = `${this.apiUrl}/alarm`;
        const res = this.http
                        .post(url, alarm)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error.error.errmsg || error);
        return Promise.reject(error.error.errmsg || error);
    }
}
