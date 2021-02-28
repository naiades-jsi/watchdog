import { Component, OnInit } from '@angular/core';
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
    chartSources: Source[] = [];
    alarms: Alarm[] = [];
    sourceLogs: SourceLogs[] = [];
    numOfDailyPings: number = 24 * 60 * 2;
    overallUpPercentage: string[] = [];

    constructor(private logsService: LogsService,
                private sourceService: SourcesService) {}

    private async getAllSources(): Promise<void> {
        await this.sourceService
                    .getAllSources()
                    .then((sources) => {
                        this.sources = sources;
                        this.getChartSources();
                    });
    }

    private getChartSources(): void {
        this.chartSources = [];
        for (const src of this.sources) {
            if (src.typeId !== 'kafkaTopicLastTs') {
                this.chartSources.push(src);
            }
        }
        this.getLogsForSources();
    }

    private async getLogsForSources(): Promise<void> {
        this.sourceLogs = [];
        for (const src of this.chartSources) {
            const srcLog = new SourceLogs();
            srcLog.source = src;
            srcLog.logs = await this.getAllLogsForSource(src.id);
            this.sourceLogs.push(srcLog);
        }

        console.log(this.sourceLogs);
        this.drawCharts();
    }

    private async getAllLogsForSource(id: number): Promise<Log[]> {
        return await this.logsService.getAllLogsForSource(id);
    }

    private drawCharts(): void {
        this.overallUpPercentage = [];
        for (const srcLogs of this.sourceLogs) {
            const canvas: any = document.getElementById('chart' + srcLogs.source.id);
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
                for (const log of srcLogs.logs) {
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
            this.overallUpPercentage.push(((overallUp / (this.numOfDailyPings * 30)) * 100).toFixed(2));

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
    }

    ngOnInit(): void {
        this.getAllSources();
        this.interval = setInterval(() => {
            this.getAllSources();
        }, 30000);
    }

}
