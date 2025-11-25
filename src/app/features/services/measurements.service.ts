// src/app/features/services/measurements.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getAllMeasurements(): Observable<SoilMeasurement[]> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.get<SoilMeasurement[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}