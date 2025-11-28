// src/app/features/users/client/notifications-panel/notifications-panel.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subscription } from 'rxjs';

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
export class NotificationsPanel implements OnInit, OnDestroy {
  private measurementsService = inject(MeasurementsService);
  
  alerts = signal<Alert[]>([]);
  private pollingSubscription?: Subscription;
  
  private readonly THRESHOLDS = {
    erosion: { critical: 60, warning: 35 },
    soilMoisture: { low: 20, high: 80 },
    temperature: { low: 10, high: 35 }
  };

  // Intervalo de actualización: cada 10 segundos
  private readonly POLLING_INTERVAL = 10000;

  ngOnInit(): void {
    // Carga inicial
    this.loadAlerts();
    
    // Configurar polling automático
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .subscribe(() => {
        this.loadAlerts();
      });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al destruir el componente
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private loadAlerts(): void {
    this.measurementsService.getAllMeasurements().subscribe({
      next: (data) => this.generateAlerts(data),
      error: (err) => console.error('Error loading alerts:', err)
    });
  }

  private generateAlerts(measurements: SoilMeasurement[]): void {
    // Agrupar mediciones por dispositivo y obtener solo la más reciente
    const measurementsByDevice = new Map<string, SoilMeasurement>();
    
    measurements.forEach(measurement => {
      const deviceId = measurement.device.id;
      const existing = measurementsByDevice.get(deviceId);
      
      if (!existing || new Date(measurement.dateTime) > new Date(existing.dateTime)) {
        measurementsByDevice.set(deviceId, measurement);
      }
    });

    const newAlerts: Alert[] = [];

    // Generar alertas solo para las mediciones más recientes
    measurementsByDevice.forEach((measurement) => {
      const deviceAddress = measurement.device.location.address;
      
      // Verificar erosión
      if (measurement.erosion >= this.THRESHOLDS.erosion.critical) {
        newAlerts.push({
          type: 'danger',
          message: `⚠️ EROSIÓN CRÍTICA: ${measurement.erosion.toFixed(1)}% en ${deviceAddress}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      } 
      else if (measurement.erosion >= this.THRESHOLDS.erosion.warning) {
        newAlerts.push({
          type: 'warning',
          message: `⚡ Erosión moderada: ${measurement.erosion.toFixed(1)}% en ${deviceAddress}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      // Verificar humedad del suelo
      if (measurement.soilMoisture < this.THRESHOLDS.soilMoisture.low) {
        newAlerts.push({
          type: 'warning',
          message: `💧 Humedad del suelo baja: ${measurement.soilMoisture.toFixed(1)}% en ${deviceAddress}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }

      // Verificar temperatura
      if (measurement.environmentTemperature > this.THRESHOLDS.temperature.high) {
        newAlerts.push({
          type: 'warning',
          message: `🌡️ Temperatura alta: ${measurement.environmentTemperature.toFixed(1)}°C en ${deviceAddress}`,
          deviceId: measurement.device.id,
          timestamp: new Date(measurement.dateTime)
        });
      }
    });

    // Ordenar por timestamp descendente (más reciente primero)
    this.alerts.set(
      newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    );
  }
}