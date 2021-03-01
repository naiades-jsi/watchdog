import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from 'src/app/app.component';
import { AppRoutingModule } from 'src/app/modules/app-routing/app-routing.module';
import { FrameComponent } from 'src/app/components/frame/frame.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
import { AlarmTableComponent } from 'src/app/components/alarm-table/alarm-table.component';
import { SortableDirective } from 'src/app/directives/sortable.directive';

@NgModule({
    declarations: [
        AppComponent,
        FrameComponent,
        DashboardComponent,
        AlarmTableComponent,
        SortableDirective
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        NgbPaginationModule,
        NgbAlertModule,
        ChartsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
