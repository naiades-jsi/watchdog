import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { Alarm } from 'src/app/models/alarm';
import { AlarmsService } from 'src/app/services/alarms.service';
import { SortableDirective, SortEvent } from 'src/app/services/sortable.directive';


@Component({
  selector: 'app-alarm-table',
  templateUrl: './alarm-table.component.html',
  providers: [AlarmsService, DecimalPipe],
  styleUrls: ['./alarm-table.component.css']
})
export class AlarmTableComponent {

  alarms$: Observable<Alarm[]>;
  total$: Observable<number>;

  @ViewChildren(SortableDirective) headers!: QueryList<SortableDirective>;

  constructor(public service: AlarmsService) {
        this.alarms$ = service.alarms$;
        this.total$ = service.total$;
  }

  onSort({column, direction}: SortEvent): void {
    // resetting other headers
    this.headers.forEach(header => {
        if (header.sortable !== column) {
            header.direction = '';
        }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
