import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns'; // Date adapter for time scales

Chart.register(...registerables, annotationPlugin); // Register annotation plugin

@Component({
  selector: 'app-live-chart',
  templateUrl: './live-chart.component.html',
  styleUrls: ['./live-chart.component.css'],
  standalone: true,
})
export class LiveChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() sensorData: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor() {}

  ngOnInit(): void {
    console.log('LiveChartComponent ngOnInit, sensorData:', this.sensorData);
  }

  ngAfterViewInit(): void {
    console.log('LiveChartComponent ngAfterViewInit');
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('LiveChartComponent ngOnChanges', changes);
    if (changes['sensorData'] && this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    if (!this.chartCanvas) {
      console.error("Chart canvas not found!");
      return;
    }

    const ctx = this.chartCanvas.nativeElement;
    const reversedData = this.sensorData.slice().reverse();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: reversedData.map((d) => d.timestamp),
        datasets: [
          {
            label: 'Temperature (°F)',
            data: reversedData.map((d) => d.temperature),
            borderColor: 'red',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            yAxisID: 'y'
          },
          {
            label: 'Humidity (%)',
            data: reversedData.map((d) => d.humidity),
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'yyyy-MM-dd HH:mm:ss',
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm'
              }
            },
            ticks: {
              stepSize: 5
            },
            title: {
              display: true,
              text: 'Timestamp'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Temperature (°F)'
            },
            min: 64,
            max: 75,
            ticks: {
              stepSize: 1
            }
          },
          y1: {
            title: {
              display: true,
              text: 'Humidity (%)'
            },
            position: 'right',
            min: 20,
            max: 70,
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          annotation: {
            annotations: {
              redBand: {
                type: 'box',
                yMin: 72,
                yMax: 75,
                backgroundColor: 'rgba(255, 0, 0, 0.2)', // Slightly transparent red
                borderWidth: 0,
                drawTime: 'beforeDatasetsDraw'
              },
              blueBand: {
                type: 'box',
                yMin: 64,
                yMax: 67,
                backgroundColor: 'rgba(0, 0, 255, 0.2)', // Slightly transparent blue
                borderWidth: 0,
                drawTime: 'beforeDatasetsDraw'
              }
            }
          }
        }
      }
    });

    console.log("Chart successfully created with temperature bands.");
  }

  updateChart() {
    if (!this.chart) {
      console.warn("Chart instance not found! Skipping update.");
      return;
    }

    if (!this.sensorData || this.sensorData.length === 0) {
      console.warn("No sensor data available for update.");
      return;
    }

    const reversedData = this.sensorData.slice().reverse();
    console.log("Updating chart with data:", reversedData);

    this.chart.data.labels = reversedData.map((d) => d.timestamp);
    this.chart.data.datasets[0].data = reversedData.map((d) => d.temperature);
    this.chart.data.datasets[1].data = reversedData.map((d) => d.humidity);
    this.chart.update();
    console.log("Chart updated successfully.");
  }
}
