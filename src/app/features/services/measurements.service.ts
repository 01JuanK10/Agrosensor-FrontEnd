// src/app/features/services/measurements.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SoilMeasurement {
  id: number;
  soilMoisture: number;
  soilIluminance: number;
  erosion: number;
  dateTime: string;
  environmentMoisture: number;
  environmentTemperature: number;
  device: {
    id: string;
    type: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/measurements/soil`;

  /**
   * Obtiene todas las mediciones del suelo
   * Utiliza shareReplay para evitar múltiples llamadas simultáneas al mismo endpoint
   */
  getAllMeasurements(): Observable<SoilMeasurement[]> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.get<SoilMeasurement[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      shareReplay(1) // Comparte el resultado con múltiples suscriptores
    );
  }

  /**
   * Obtiene las mediciones más recientes por dispositivo
   */
  getLatestMeasurementsByDevice(): Observable<Map<string, SoilMeasurement>> {
    return new Observable(observer => {
      this.getAllMeasurements().subscribe({
        next: (measurements) => {
          const latestByDevice = new Map<string, SoilMeasurement>();
          
          measurements.forEach(m => {
            const deviceId = m.device.id;
            const existing = latestByDevice.get(deviceId);
            
            if (!existing || new Date(m.dateTime) > new Date(existing.dateTime)) {
              latestByDevice.set(deviceId, m);
            }
          });
          
          observer.next(latestByDevice);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Filtra mediciones por rango de fechas
   */
  getMeasurementsByDateRange(
    startDate: Date, 
    endDate: Date
  ): Observable<SoilMeasurement[]> {
    return new Observable(observer => {
      this.getAllMeasurements().subscribe({
        next: (measurements) => {
          const filtered = measurements.filter(m => {
            const measurementDate = new Date(m.dateTime);
            return measurementDate >= startDate && measurementDate <= endDate;
          });
          observer.next(filtered);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Obtiene estadísticas agregadas de las mediciones
   */
  getMeasurementStats(): Observable<{
    totalMeasurements: number;
    avgSoilMoisture: number;
    avgTemperature: number;
    avgErosion: number;
    maxErosion: number;
    minErosion: number;
  }> {
    return new Observable(observer => {
      this.getAllMeasurements().subscribe({
        next: (measurements) => {
          if (measurements.length === 0) {
            observer.next({
              totalMeasurements: 0,
              avgSoilMoisture: 0,
              avgTemperature: 0,
              avgErosion: 0,
              maxErosion: 0,
              minErosion: 0
            });
            observer.complete();
            return;
          }

          const stats = {
            totalMeasurements: measurements.length,
            avgSoilMoisture: measurements.reduce((sum, m) => sum + m.soilMoisture, 0) / measurements.length,
            avgTemperature: measurements.reduce((sum, m) => sum + m.environmentTemperature, 0) / measurements.length,
            avgErosion: measurements.reduce((sum, m) => sum + m.erosion, 0) / measurements.length,
            maxErosion: Math.max(...measurements.map(m => m.erosion)),
            minErosion: Math.min(...measurements.map(m => m.erosion))
          };

          observer.next(stats);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}