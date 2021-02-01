import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import * as $ from 'jquery';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // https://discordstatus.com/
  // https://github.com/CachetHQ/Cachet/pull/2752

  constructor() { }

  canvas0: any;
  context0: any;

  canvas1: any;
  context1: any;

  canvas2: any;
  context2: any;

  private drawChartKafka(): void{
    this.canvas0 = document.getElementById('chartKafka');
    this.context0 = this.canvas0.getContext('2d');

    let timestamps: string[] = [];
    const statusKafkaUp: number[] = [];
    const statusKafkaDown: number[] = [];

    const date2: Date = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    for (let i = 0; i < 31; i++){
      timestamps.push(date2.toLocaleString('en-GB', options));
      date2.setDate(date2.getDate() - 1);

      const random = Math.floor(Math.random() * 100) + 0;
      statusKafkaUp.push(random);
      statusKafkaDown.push(100 - random);
    }
    timestamps = timestamps.reverse();

    const chart = new Chart(this.context0, {
      type: 'bar',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'UP',
          backgroundColor: '#23C552',
          data: statusKafkaUp
        }, {
          label: 'DOWN',
          backgroundColor: '#F84F31',
          data: statusKafkaDown
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

  private drawChartAnotherKafka(): void{
    this.canvas1 = document.getElementById('chartAnotherKafka');
    this.context1 = this.canvas1.getContext('2d');

    let timestamps: string[] = [];
    const statusKafkaUp: number[] = [];
    const statusKafkaDown: number[] = [];

    const date2: Date = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    for (let i = 0; i < 31; i++){
      timestamps.push(date2.toLocaleString('en-GB', options));
      date2.setDate(date2.getDate() - 1);

      const random = Math.floor(Math.random() * 100) + 0;
      statusKafkaUp.push(random);
      statusKafkaDown.push(100 - random);
    }
    timestamps = timestamps.reverse();

    const chart = new Chart(this.context1, {
      type: 'bar',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'UP',
          backgroundColor: '#23C552',
          data: statusKafkaUp
        }, {
          label: 'DOWN',
          backgroundColor: '#F84F31',
          data: statusKafkaDown
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

  private drawChartDatabase(): void{
    this.canvas2 = document.getElementById('chartDatabase');
    this.context2 = this.canvas2.getContext('2d');

    let timestamps: string[] = [];
    const statusKafkaUp: number[] = [];
    const statusKafkaDown: number[] = [];

    const date2: Date = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    for (let i = 0; i < 31; i++){
      timestamps.push(date2.toLocaleString('en-GB', options));
      date2.setDate(date2.getDate() - 1);

      const random = Math.floor(Math.random() * 100) + 0;
      statusKafkaUp.push(random);
      statusKafkaDown.push(100 - random);
    }
    timestamps = timestamps.reverse();

    const chart = new Chart(this.context2, {
      type: 'bar',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'UP',
          backgroundColor: '#23C552',
          data: statusKafkaUp
        }, {
          label: 'DOWN',
          backgroundColor: '#F84F31',
          data: statusKafkaDown
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

  ngOnInit(): void {
    this.drawChartKafka();
    this.drawChartAnotherKafka();
    this.drawChartDatabase();
  }

}
