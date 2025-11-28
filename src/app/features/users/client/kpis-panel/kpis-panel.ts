// src/app/features/users/client/kpis-panel/kpis-panel.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { interval, Subscription } from 'rxjs';

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
export class KpisPanel implements OnInit, OnDestroy, AfterViewInit {
  private measurementsService = inject(MeasurementsService);
  
  measurements = signal<SoilMeasurement[]>([]);
  private pollingSubscription?: Subscription;
  private kpiComparisonChart?: Chart;
  private healthStatusChart?: Chart;
  
  private readonly THRESHOLDS = {
    erosion: { critical: 60, warning: 35 }
  };

  // Intervalo de actualización: cada 15 segundos
  private readonly POLLING_INTERVAL = 15000;

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
    // Carga inicial
    this.loadMeasurements();
    
    // Configurar polling automático
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .subscribe(() => {
        this.loadMeasurements();
      });
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de la primera carga de datos
  }

  ngOnDestroy(): void {
    // Limpiar suscripción y gráficos
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.kpiComparisonChart) {
      this.kpiComparisonChart.destroy();
    }
    if (this.healthStatusChart) {
      this.healthStatusChart.destroy();
    }
  }

  private loadMeasurements(): void {
    this.measurementsService.getAllMeasurements().subscribe({
      next: (data) => {
        // 1. Ordenar por fecha (más reciente primero)
        // 2. Luego por nombre de dispositivo (alfabéticamente)
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.dateTime).getTime();
          const dateB = new Date(b.dateTime).getTime();
          
          // Primero ordenar por fecha (descendente - más reciente primero)
          if (dateB !== dateA) {
            return dateB - dateA;
          }
          
          // Si las fechas son iguales, ordenar alfabéticamente por device ID
          return a.device.id.localeCompare(b.device.id);
        });
        
        this.measurements.set(sortedData);
        
        // Actualizar gráficos
        this.updateCharts(sortedData);
      },
      error: (err) => console.error('Error loading measurements:', err)
    });
  }

  private updateCharts(data: SoilMeasurement[]): void {
    if (data.length === 0) return;

    // Actualizar o crear gráficos
    this.updateComparisonChart(data);
    this.updateHealthStatusChart(data);
  }

  private updateComparisonChart(data: SoilMeasurement[]): void {
    // Agrupar por dispositivo, manteniendo SOLO la medición más reciente
    const latestByDevice = new Map<string, SoilMeasurement>();

    data.forEach(m => {
      const deviceId = m.device.id;
      const existing = latestByDevice.get(deviceId);

      if (!existing || new Date(m.dateTime) > new Date(existing.dateTime)) {
        latestByDevice.set(deviceId, m);
      }
    });

    // Convertir a formato del gráfico y ordenar alfabéticamente
    const sortedEntries = Array.from(latestByDevice.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );
    
    const labels = sortedEntries.map(entry => entry[0]);
    const latestMeasurements = sortedEntries.map(entry => entry[1]);

    const humidity = latestMeasurements.map(m => m.soilMoisture);
    const temperature = latestMeasurements.map(m => m.environmentTemperature);
    const erosion = latestMeasurements.map(m => m.erosion);

    const chartData = {
      labels,
      datasets: [
        { 
          label: 'Humedad (%)', 
          data: humidity,
          backgroundColor: '#60a5fa'
        },
        { 
          label: 'Temperatura (°C)', 
          data: temperature,
          backgroundColor: '#f97316'
        },
        { 
          label: 'Erosión (%)', 
          data: erosion,
          backgroundColor: '#ef4444'
        }
      ]
    };

    if (this.kpiComparisonChart) {
      // Actualizar gráfico existente
      this.kpiComparisonChart.data = chartData;
      this.kpiComparisonChart.update('none'); // 'none' evita animación
    } else {
      // Crear nuevo gráfico
      const canvas = document.getElementById('kpiComparisonChart') as HTMLCanvasElement;
      if (canvas) {
        this.kpiComparisonChart = new Chart(canvas, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' }
            },
            animation: false // Desactivar animación en actualizaciones
          }
        });
      }
    }
  }

  private updateHealthStatusChart(data: SoilMeasurement[]): void {
    let ok = 0, warning = 0, critical = 0;

    data.forEach(m => {
      if (m.erosion < 35) ok++;
      else if (m.erosion < 60) warning++;
      else critical++;
    });

    const chartData = {
      labels: ['Óptimo', 'Advertencia', 'Crítico'],
      datasets: [{
        data: [ok, warning, critical],
        backgroundColor: ['#22c55e', '#facc15', '#ef4444']
      }]
    };

    if (this.healthStatusChart) {
      // Actualizar gráfico existente
      this.healthStatusChart.data = chartData;
      this.healthStatusChart.update('none');
    } else {
      // Crear nuevo gráfico
      const canvas = document.getElementById('healthStatusChart') as HTMLCanvasElement;
      if (canvas) {
        this.healthStatusChart = new Chart(canvas, {
          type: 'doughnut',
          data: chartData,
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            },
            animation: false
          }
        });
      }
    }
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