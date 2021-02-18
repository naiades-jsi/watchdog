import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, debounceTime, switchMap, delay } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { Alarm } from 'src/app/models/alarm';
import { environment } from 'src/environments/environment';
import { SortColumn, SortDirection } from 'src/app/directives/sortable.directive';


interface SearchResult {
    alarms: Alarm[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(alarms: Alarm[], column: SortColumn, direction: string): Alarm[] {
    if (direction === '' || column === '') {
        return alarms;
    } else {
        return [...alarms].sort((a, b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

@Injectable({
    providedIn: 'root'
})

export class AlarmsService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _alarms$ = new BehaviorSubject<Alarm[]>([]);
    private _search$ = new Subject<void>();
    private _total$ = new BehaviorSubject<number>(0);

    private alarmsList: Alarm[] = [];

    private _state: State = {
        page: 1,
        pageSize: 10,
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private http: HttpClient){
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            result.subscribe(val => {
                this._alarms$.next(val.alarms);
                this._total$.next(val.total);
            });
        });

        this._search$.next();
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

    get alarms$(): Observable<Alarm[]> {
        return this._alarms$.asObservable();
    }

    get total$(): Observable<number> {
        return this._total$.asObservable();
    }

    get page(): number {
        return this._state.page;
    }

    set page(page: number) {
        this._set({page});
    }

    get pageSize(): number {
        return this._state.pageSize;
    }

    set pageSize(pageSize: number) {
        this._set({pageSize});
    }

    set sortColumn(sortColumn: SortColumn) {
        this._set({sortColumn});
    }

    set sortDirection(sortDirection: SortDirection) {
        this._set({sortDirection});
    }

    private _set(patch: Partial<State>): void {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    private async _search(): Promise<Observable<SearchResult>> {
        const {sortColumn, sortDirection, pageSize, page} = this._state;

        await this.getAllAlarms()
            .then((res) => {
                this.alarmsList = res;
                console.log(res);
            });

        // 1. sort
        let alarms = sort(this.alarmsList, sortColumn, sortDirection);

        const total = alarms.length;

        // 2. paginate
        alarms = alarms.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        return of({alarms, total});
    }

}
