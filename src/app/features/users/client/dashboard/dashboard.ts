// src/app/features/users/client/dashboard/dashboard.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
  deviceId: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private measurementsService = inject(MeasurementsService);
  
  measurements = signal<SoilMeasurement[]>([]);
  alerts = signal<Alert[]>([]);
  
  // Umbrales críticos para alertas
  private readonly THRESHOLDS = {
    erosion: { critical: 60, warning: 35 },
    soilMoisture: { low: 20, high: 80 },
    temperature: { low: 10, high: 35 }
  };

  // Estadísticas computadas
  stats = computed(() => {
    const data = this.measurements();
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const avgErosion = data.reduce((sum, m) => sum + m.erosion, 0) / data.length;
    const avgMoisture = data.reduce((sum, m) => sum + m.soilMoisture, 0) / data.length;

    return {
      totalMeasurements: data.length,
      latestMeasurement: latest,
      averageErosion: avgErosion.toFixed(2),
      averageMoisture: avgMoisture.toFixed(2),
      criticalDevices: data.filter(m => m.erosion >= this.THRESHOLDS.erosion.critical).length
    };
  });

  displayedColumns: string[] = [
    'device',
    'dateTime',
    'erosion',
    'soilMoisture',
    'temperature',
    'status'
  ];

  ngOnInit(): void {
    this.loadMeasurements();
    // Actualizar cada 30 segundos
    setInterval(() => this.loadMeasurements(), 30000);
  }

  loadMeasurements(): void {
    this.measurementsService.getAllMeasurements().subscribe({
      next: (data) => {
        this.measurements.set(data);
        this.generateAlerts(data);
      },
      error: (err) => console.error('Error loading measurements:', err)
    });
  }

  private generateAlerts(measurements: SoilMeasurement[]): void {
    const newAlerts: Alert[] = [];

    measurements.forEach(measurement => {
      // Alerta de erosión crítica
      if (measurement.erosion >= this.THRESHOLDS.erosion.critical) {
        newAlerts.push({
          type: 'danger',
          message: `⚠️ EROSIÓN CRÍTICA: ${measurement.erosion.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      } 
      // Alerta de erosión moderada
      else if (measurement.erosion >= this.THRESHOLDS.erosion.warning) {
        newAlerts.push({
          type: 'warning',
          message: `⚡ Erosión moderada: ${measurement.erosion.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      // Alerta de humedad baja
      if (measurement.soilMoisture < this.THRESHOLDS.soilMoisture.low) {
        newAlerts.push({
          type: 'warning',
          message: `💧 Humedad del suelo baja: ${measurement.soilMoisture.toFixed(1)}% en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      // Alerta de temperatura alta
      if (measurement.environmentTemperature > this.THRESHOLDS.temperature.high) {
        newAlerts.push({
          type: 'warning',
          message: `🌡️ Temperatura alta: ${measurement.environmentTemperature.toFixed(1)}°C en ${measurement.device.location.address}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }
    });

    // Ordenar por timestamp descendente y tomar las últimas 10
    this.alerts.set(
      newAlerts
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    );
  }

  getErosionColor(value: number): string {
    if (value < this.THRESHOLDS.erosion.warning) return '#22c55e'; // Verde
    if (value < this.THRESHOLDS.erosion.critical) return '#facc15'; // Amarillo
    return '#ef4444'; // Rojo
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