import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from './api.service';
import { NgFor } from '@angular/common';
import { interval } from 'rxjs';
import { LiveChartComponent } from './live-chart/live-chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [NgFor, LiveChartComponent]
})
export class AppComponent implements OnInit {
  @ViewChild(LiveChartComponent) liveChart!: LiveChartComponent; 
  data: any[] = [];
  lastUpdated: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchData();
    
    // Poll data every 5 seconds
    interval(5000).subscribe(() => {
      this.fetchData();
    });
  }

  fetchData() {
    this.apiService.getData().subscribe(
      response => {
        console.log('Flask API Response:', response);
        if (Array.isArray(response)) {
          this.data = response;
          this.lastUpdated = new Date().toLocaleTimeString();
          if (this.liveChart) {
            this.liveChart.sensorData = this.data;
            this.liveChart.updateChart();
          }
        } else {
          console.error('Data is not an array:', response);
        }
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
