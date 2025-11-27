// src/app/features/users/client/notifications-panel/notifications-panel.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
  deviceId: string;
  timestamp: Date;
}

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './notifications-panel.html',
  styleUrls: ['./notifications-panel.scss']
})
export class NotificationsPanel implements OnInit {
  private measurementsService = inject(MeasurementsService);
  
  alerts = signal<Alert[]>([]);
  
  private readonly THRESHOLDS = {
    erosion: { critical: 60, warning: 35 },
    soilMoisture: { low: 20, high: 80 },
    temperature: { low: 10, high: 35 }
  };

  ngOnInit(): void {
    this.loadAlerts();
    setInterval(() => this.loadAlerts(), 30000);
  }

  private loadAlerts(): void {
    this.measurementsService.getAllMeasurements().subscribe({
      next: (data) => this.generateAlerts(data),
      error: (err) => console.error('Error loading alerts:', err)
    });
  }

  private generateAlerts(measurements: SoilMeasurement[]): void {
    const newAlerts: Alert[] = [];

    measurements.forEach(measurement => {
      if (measurement.erosion >= this.THRESHOLDS.erosion.critical) {
        newAlerts.push({
          type: 'danger',
          message: `⚠️ EROSIÓN CRÍTICA: ${measurement.erosion.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      } 
      else if (measurement.erosion >= this.THRESHOLDS.erosion.warning) {
        newAlerts.push({
          type: 'warning',
          message: `⚡ Erosión moderada: ${measurement.erosion.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      if (measurement.soilMoisture < this.THRESHOLDS.soilMoisture.low) {
        newAlerts.push({
          type: 'warning',
          message: `💧 Humedad del suelo baja: ${measurement.soilMoisture.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      if (measurement.environmentTemperature > this.THRESHOLDS.temperature.high) {
        newAlerts.push({
          type: 'warning',
          message: `🌡️ Temperatura alta: ${measurement.environmentTemperature.toFixed(1)}°C en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }
    });

    this.alerts.set(
      newAlerts
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    );
  }
}