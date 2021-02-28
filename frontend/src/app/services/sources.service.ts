import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Source } from '../models/source';

@Injectable({
    providedIn: 'root'
})

export class SourcesService {
    constructor(private http: HttpClient){
    }

    private apiUrl = environment.apiUrl;

    public getAllSources(): Promise<Source[]> {
        const url = `${this.apiUrl}/sources`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getSource(id: number): Promise<Source> {
        const url = `${this.apiUrl}/source/${id}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getSourcesWithoutKafkaTopics(): Promise<Source[]> {
        const url = `${this.apiUrl}/sourcesWithoutTopics`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getKafkaSources(): Promise<Source[]> {
        const url = `${this.apiUrl}/sourcesKafka`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public createNewSource(source: Source): Promise<any> {
        const url = `${this.apiUrl}/source`;
        const res = this.http
                        .post(url, source)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error.error.errmsg || error);
        return Promise.reject(error.error.errmsg || error);
    }
}
