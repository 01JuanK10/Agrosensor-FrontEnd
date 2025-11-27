// src/app/features/users/client/kpis-panel/kpis-panel.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-kpis-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './kpis-panel.html',
  styleUrls: ['./kpis-panel.scss']
})
export class KpisPanel implements OnInit {
  private measurementsService = inject(MeasurementsService);
  
  measurements = signal<SoilMeasurement[]>([]);
  
  private readonly THRESHOLDS = {
    erosion: { critical: 60, warning: 35 }
  };

  stats = computed(() => {
    const data = this.measurements();
    if (data.length === 0) return null;

    const avgIluminance = data.reduce((sum, m) => sum + m.soilIluminance, 0) / data.length;
    const avgSoilMoisture = data.reduce((sum, m) => sum + m.soilMoisture, 0) / data.length;
    const avgTemperature = data.reduce((sum, m) => sum + m.environmentTemperature, 0) / data.length;
    const avgEnvironmentMoisture = data.reduce((sum, m) => sum + m.environmentMoisture, 0) / data.length;
    const avgErosion = data.reduce((sum, m) => sum + m.erosion, 0) / data.length;

    return {
      totalMeasurements: data.length,
      averageIluminance: avgIluminance.toFixed(2),
      averageSoilMoisture: avgSoilMoisture.toFixed(2),
      averageTemperature: avgTemperature.toFixed(2),
      averageEnvironmentMoisture: avgEnvironmentMoisture.toFixed(2),
      averageErosion: avgErosion.toFixed(2)
    };
  });

  displayedColumns: string[] = [
    'device',
    'dateTime',
    'soilIluminance',
    'soilMoisture',
    'environmentTemperature',
    'environmentMoisture',
    'erosion',
    'status'
  ];

  ngOnInit(): void {
    this.loadMeasurements();
    setInterval(() => this.loadMeasurements(), 30000);
  }

  loadMeasurements(): void {
    this.measurementsService.getAllMeasurements().subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.dateTime).getTime();
          const dateB = new Date(b.dateTime).getTime();
          return dateB - dateA;
        });
        this.measurements.set(sortedData);
      },
      error: (err) => console.error('Error loading measurements:', err)
    });
  }

  getErosionColor(value: number): string {
    if (value < this.THRESHOLDS.erosion.warning) return '#22c55e';
    if (value < this.THRESHOLDS.erosion.critical) return '#facc15';
    return '#ef4444';
  }

  getStatusIcon(measurement: SoilMeasurement): string {
    if (measurement.erosion >= this.THRESHOLDS.erosion.critical) return 'error';
    if (measurement.erosion >= this.THRESHOLDS.erosion.warning) return 'warning';
    return 'check_circle';
  }

  getStatusColor(measurement: SoilMeasurement): string {
    if (measurement.erosion >= this.THRESHOLDS.erosion.critical) return 'danger';
    if (measurement.erosion >= this.THRESHOLDS.erosion.warning) return 'warning';
    return 'success';
  }
}