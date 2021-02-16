import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Log } from '../models/log';

@Injectable({
    providedIn: 'root'
})

export class LogsService {
    constructor(private http: HttpClient){
    }

    private apiUrl = environment.apiUrl;

    public getAllLogs(): Promise<Log[]> {
        const url = `${this.apiUrl}/logs`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getAllLogsForSource(id: number): Promise<Log[]> {
        const url = `${this.apiUrl}/logs/source/${id}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getLog(id: number): Promise<Log> {
        const url = `${this.apiUrl}/log/${id}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public createNewLog(log: Log): Promise<any> {
        const url = `${this.apiUrl}/log`;
        const res = this.http
                        .post(url, log)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error.error.errmsg || error);
        return Promise.reject(error.error.errmsg || error);
    }
}
