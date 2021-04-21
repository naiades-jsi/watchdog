import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import 'datejs';

import { Source } from '../../models/source';
import { Alarm } from '../../models/alarm';
import { Log } from '../../models/log';

import { SourcesService } from '../../services/sources.service';
import { LogsService } from '../../services/logs.service';

class SourceLogs {
    source!: Source;
    logs!: Log[];
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    interval: any;
    sources: Source[] = [];
    alarms: Alarm[] = [];
    sourceLogs: any;
    selectedSource: any;
    numOfDailyPings: number = 24 * 60 * 2;
    overallUpPercentage = '';

    constructor(private logsService: LogsService,
                private sourceService: SourcesService) {}

    private async getAllSources(): Promise<void> {
        await this.sourceService
                    .getSourcesWithoutKafkaTopics()
                    .then((sources) => {
                        this.sources = sources;
                        if (this.sources.length > 0) {
                            if (this.selectedSource === undefined) {
                                this.selectedSource = this.sources[0];
                                this.getLogsForSource(this.sources[0]);
                            } else {
                                this.getLogsForSource(this.selectedSource);
                            }
                        }
                    });
    }

    private async getLogsForSource(source: Source): Promise<void> {
        const srcLog = new SourceLogs();
        srcLog.source = source;
        srcLog.logs = await this.getAllLogsForSource(source.id);
        this.sourceLogs = srcLog;
        this.drawChart();
    }

    private async getAllLogsForSource(id: number): Promise<Log[]> {
        return await this.logsService.getAllLogsForSource(id);
    }

    private drawChart(): void {
        const canvas: any = document.getElementById('chart_id');
        const ctx: any = canvas.getContext('2d');

        const dates: string[] = [];
        const upStatus: number[] = [];
        const downStatus: number[] = [];
        const noDataStatus: number[] = [];

        let overallUp = 0;
        for (let i = 0; i < 30; i++){
            const date = new Date();
            date.setDate(new Date().getDate() - i);
            dates.push(date.toISOString().split('T')[0]);

            let numOfUp = 0;
            let numOfDown = 0;
            for (const log of this.sourceLogs.logs) {
                const logDate = log.ts.split(' ')[0];
                if (logDate === date.toISOString().split('T')[0]) {
                    if (log.status === 'UP') {
                        numOfUp++;
                        overallUp++;
                    } else {
                        numOfDown++;
                    }
                }
            }
            upStatus.push((numOfUp / this.numOfDailyPings) * 100);
            downStatus.push((numOfDown / this.numOfDailyPings) * 100);
            noDataStatus.push(((this.numOfDailyPings - numOfUp - numOfDown) / this.numOfDailyPings) * 100);
        }
        dates.reverse();
        upStatus.reverse();
        downStatus.reverse();
        noDataStatus.reverse();
        this.overallUpPercentage = ((overallUp / (this.numOfDailyPings * 30)) * 100).toFixed(2);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'No data',
                    backgroundColor: '#A9A9A9',
                    data: noDataStatus
                }, {
                    label: 'DOWN',
                    backgroundColor: '#F84F31',
                    data: downStatus
                }, {
                    label: 'UP',
                    backgroundColor: '#23C552',
                    data: upStatus
                }]
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            min: 0,
                            max: 100,
                            callback: val => {
                                return val + '%';
                            }
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            autoSkip: true,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }]
                }
            }
        });
    }

    onSelectChange(val: any): void {
        for (const s of this.sources) {
            if (s.id === Number(val)) {
                this.selectedSource = s;
                this.getLogsForSource(s);
            }
        }
    }

    ngOnInit(): void {
        this.getAllSources();
        this.interval = setInterval(() => {
            this.getAllSources();
        }, 30000);
    }
}
