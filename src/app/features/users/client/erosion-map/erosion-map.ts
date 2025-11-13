import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ErosionPoint {
  latitude: number;
  longitude: number;
  address: string;
  erosion: number;
}

@Component({
  selector: 'app-erosion-map',
  imports: [CommonModule],
  templateUrl: './erosion-map.html',
  styleUrl: './erosion-map.scss',
})
export class ErosionMap implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private map: any;
  erosionPoints = signal<ErosionPoint[]>([]);

  private apiUrl = `${environment.apiUrl}/api/map/erosion-points`;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const cedula = Number(sessionStorage.getItem('cc'));
      this.loadErosionData(cedula);
    }
    
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet');

      this.map = L.map('map', {
        center: [6.25184, -75.56359],
        zoom: 6,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);

    }
  }

  private loadErosionData(cedula: number): void {
    const token = sessionStorage.getItem('auth_token');
    
    this.http.get<ErosionPoint[]>(`${this.apiUrl}/${cedula}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: async (data) => {
        this.erosionPoints.set(data);
        if (data.length > 0 && isPlatformBrowser(this.platformId)) {
          const L = await import('leaflet');
          this.updateMap(L, data);
        }
      },
      error: (err) => console.error('Error fetching erosion data:', err),
    });
  }


  private updateMap(L: any, points: ErosionPoint[]): void {
    this.map.eachLayer((layer: any) => {
      if (!layer._url) this.map.removeLayer(layer);
    });

    const center = this.calculateCenter(points);
    this.map.setView([center.lat, center.lng], 8);

    points.forEach((point) => {
      const color = this.getErosionColor(point.erosion);

      const circle = L.circleMarker([point.latitude, point.longitude], {
        radius: 10,
        fillColor: color,
        color: color,
        weight: 1,
        fillOpacity: 0.6,
      }).addTo(this.map);

      const popupContent = `
        <div class="popup">
          <h3>${point.address}</h3>
          <p><strong>Erosión:</strong> 
            <span style="color:${color}">
              ${point.erosion.toFixed(1)}
            </span>
          </p>
        </div>
      `;
      circle.bindPopup(popupContent);
    });
  }

  private calculateCenter(points: ErosionPoint[]): { lat: number; lng: number } {
    const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
    return { lat: avgLat, lng: avgLng };
  }

  getErosionColor(value: number): string {
    const LOW_MAX = 35.0;
    const MODERATE_MAX = 60.0;

    if (value < LOW_MAX) return '#22c55e'; // Verde
    if (value < MODERATE_MAX) return '#facc15'; // Amarillo
    return '#ef4444'; // Rojo
  }
}
