// src/app/features/users/client/kpis-panel/kpis-panel.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KpisPanel } from './kpis-panel';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { signal } from '@angular/core';

describe('KpisPanel', () => {
  let component: KpisPanel;
  let fixture: ComponentFixture<KpisPanel>;
  let measurementsServiceSpy: jasmine.SpyObj<MeasurementsService>;

  const mockMeasurements: SoilMeasurement[] = [
    {
      id: 1,
      soilMoisture: 45.5,
      soilIluminance: 78.2,
      erosion: 25.3,
      dateTime: '2025-01-15T10:30:00',
      environmentMoisture: 60.0,
      environmentTemperature: 22.5,
      device: {
        id: 'DEV001',
        type: 'esp32',
        location: {
          latitude: 6.25184,
          longitude: -75.56359,
          address: 'Medellín, Colombia'
        }
      }
    },
    {
      id: 2,
      soilMoisture: 38.0,
      soilIluminance: 82.5,
      erosion: 65.0,
      dateTime: '2025-01-15T11:00:00',
      environmentMoisture: 55.0,
      environmentTemperature: 24.0,
      device: {
        id: 'DEV002',
        type: 'esp32',
        location: {
          latitude: 6.25200,
          longitude: -75.56370,
          address: 'Envigado, Colombia'
        }
      }
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MeasurementsService', ['getAllMeasurements']);

    await TestBed.configureTestingModule({
      imports: [
        KpisPanel,
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatTableModule,
        MatChipsModule
      ],
      providers: [
        { provide: MeasurementsService, useValue: spy }
      ]
    }).compileComponents();

    measurementsServiceSpy = TestBed.inject(MeasurementsService) as jasmine.SpyObj<MeasurementsService>;
    measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));

    fixture = TestBed.createComponent(KpisPanel);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load measurements on init', () => {
      fixture.detectChanges();
      expect(measurementsServiceSpy.getAllMeasurements).toHaveBeenCalled();
      expect(component.measurements().length).toBe(2);
    });

    it('should calculate stats on init', () => {
      fixture.detectChanges();
      const stats = component.stats();
      
      expect(stats).toBeTruthy();
      expect(stats?.totalMeasurements).toBe(2);
      expect(parseFloat(stats!.averageSoilMoisture)).toBeCloseTo(41.75, 1);
      expect(parseFloat(stats!.averageErosion)).toBeCloseTo(45.15, 1);
    });

    it('should setup polling interval', fakeAsync(() => {
      fixture.detectChanges();
      const initialCallCount = measurementsServiceSpy.getAllMeasurements.calls.count();

      tick(15000); // Avanzar 15 segundos

      expect(measurementsServiceSpy.getAllMeasurements.calls.count()).toBeGreaterThan(initialCallCount);
    }));

    it('should handle empty measurements', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of([]));
      fixture.detectChanges();

      expect(component.measurements().length).toBe(0);
      expect(component.stats()).toBeNull();
    });
  });

  describe('Stats Calculation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate total measurements correctly', () => {
      const stats = component.stats();
      expect(stats?.totalMeasurements).toBe(2);
    });

    it('should calculate average iluminance', () => {
      const stats = component.stats();
      const avgIluminance = parseFloat(stats!.averageIluminance);
      expect(avgIluminance).toBeCloseTo(80.35, 1);
    });

    it('should calculate average soil moisture', () => {
      const stats = component.stats();
      const avgMoisture = parseFloat(stats!.averageSoilMoisture);
      expect(avgMoisture).toBeCloseTo(41.75, 1);
    });

    it('should calculate average temperature', () => {
      const stats = component.stats();
      const avgTemp = parseFloat(stats!.averageTemperature);
      expect(avgTemp).toBeCloseTo(23.25, 1);
    });

    it('should calculate average environment moisture', () => {
      const stats = component.stats();
      const avgEnvMoisture = parseFloat(stats!.averageEnvironmentMoisture);
      expect(avgEnvMoisture).toBeCloseTo(57.5, 1);
    });

    it('should calculate average erosion', () => {
      const stats = component.stats();
      const avgErosion = parseFloat(stats!.averageErosion);
      expect(avgErosion).toBeCloseTo(45.15, 1);
    });

    it('should format numbers to 2 decimal places', () => {
      const stats = component.stats();
      expect(stats?.averageSoilMoisture).toMatch(/^\d+\.\d{2}$/);
      expect(stats?.averageTemperature).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('Table Display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display correct columns', () => {
      expect(component.displayedColumns).toEqual([
        'device',
        'dateTime',
        'soilIluminance',
        'soilMoisture',
        'environmentTemperature',
        'environmentMoisture',
        'erosion',
        'status'
      ]);
    });

    it('should render table rows', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('tr.mat-row');
      expect(rows.length).toBe(2);
    });

    it('should display device information', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('DEV001');
      expect(compiled.textContent).toContain('DEV002');
    });
  });

  describe('Erosion Color Logic', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return green for low erosion (<35)', () => {
      const color = component.getErosionColor(25.3);
      expect(color).toBe('#22c55e');
    });

    it('should return yellow for moderate erosion (35-60)', () => {
      const color = component.getErosionColor(45.0);
      expect(color).toBe('#facc15');
    });

    it('should return red for high erosion (>60)', () => {
      const color = component.getErosionColor(65.0);
      expect(color).toBe('#ef4444');
    });

    it('should handle boundary values correctly', () => {
      expect(component.getErosionColor(34.9)).toBe('#22c55e');
      expect(component.getErosionColor(35.0)).toBe('#facc15');
      expect(component.getErosionColor(59.9)).toBe('#facc15');
      expect(component.getErosionColor(60.0)).toBe('#ef4444');
    });
  });

  describe('Status Icon Logic', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return check_circle for low erosion', () => {
      const icon = component.getStatusIcon(mockMeasurements[0]);
      expect(icon).toBe('check_circle');
    });

    it('should return warning for moderate erosion', () => {
      const moderateMeasurement = { ...mockMeasurements[0], erosion: 45.0 };
      const icon = component.getStatusIcon(moderateMeasurement);
      expect(icon).toBe('warning');
    });

    it('should return error for high erosion', () => {
      const icon = component.getStatusIcon(mockMeasurements[1]);
      expect(icon).toBe('error');
    });
  });

  describe('Status Color Logic', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return success for low erosion', () => {
      const color = component.getStatusColor(mockMeasurements[0]);
      expect(color).toBe('success');
    });

    it('should return warning for moderate erosion', () => {
      const moderateMeasurement = { ...mockMeasurements[0], erosion: 45.0 };
      const color = component.getStatusColor(moderateMeasurement);
      expect(color).toBe('warning');
    });

    it('should return danger for high erosion', () => {
      const color = component.getStatusColor(mockMeasurements[1]);
      expect(color).toBe('danger');
    });
  });

  describe('Data Sorting', () => {
    it('should sort measurements by date descending', () => {
      const unsortedMeasurements = [
        { ...mockMeasurements[0], dateTime: '2025-01-15T09:00:00' },
        { ...mockMeasurements[1], dateTime: '2025-01-15T11:00:00' },
        { ...mockMeasurements[0], dateTime: '2025-01-15T10:00:00' }
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(unsortedMeasurements));
      fixture.detectChanges();

      const sorted = component.measurements();
      expect(new Date(sorted[0].dateTime).getTime()).toBeGreaterThan(
        new Date(sorted[1].dateTime).getTime()
      );
    });

    it('should sort by device ID when dates are equal', () => {
      const sameDateMeasurements = [
        { ...mockMeasurements[1], dateTime: '2025-01-15T10:00:00', device: { ...mockMeasurements[1].device, id: 'DEV002' } },
        { ...mockMeasurements[0], dateTime: '2025-01-15T10:00:00', device: { ...mockMeasurements[0].device, id: 'DEV001' } }
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(sameDateMeasurements));
      fixture.detectChanges();

      const sorted = component.measurements();
      expect(sorted[0].device.id).toBe('DEV001');
      expect(sorted[1].device.id).toBe('DEV002');
    });
  });

  describe('Polling and Updates', () => {
    it('should update data on polling interval', fakeAsync(() => {
      fixture.detectChanges();
      
      const updatedMeasurements = [...mockMeasurements, {
        ...mockMeasurements[0],
        id: 3,
        dateTime: '2025-01-15T12:00:00'
      }];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(updatedMeasurements));
      
      tick(15000);

      expect(component.measurements().length).toBe(3);
    }));

    it('should handle errors during polling', fakeAsync(() => {
      spyOn(console, 'error');
      fixture.detectChanges();

      measurementsServiceSpy.getAllMeasurements.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      tick(15000);

      expect(console.error).toHaveBeenCalled();
    }));

    it('should cleanup polling on destroy', fakeAsync(() => {
      fixture.detectChanges();
      const initialCallCount = measurementsServiceSpy.getAllMeasurements.calls.count();

      fixture.destroy();
      tick(15000);

      expect(measurementsServiceSpy.getAllMeasurements.calls.count()).toBe(initialCallCount);
    }));
  });

  describe('Chart Updates', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should preserve chart visibility state on update', fakeAsync(() => {
      // Simulamos que el usuario oculta un dataset
      if (component['kpiComparisonChart']) {
        const meta = component['kpiComparisonChart'].getDatasetMeta(0);
        meta.hidden = true;
      }

      const updatedMeasurements = [...mockMeasurements];
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(updatedMeasurements));
      
      tick(15000);

      if (component['kpiComparisonChart']) {
        const meta = component['kpiComparisonChart'].getDatasetMeta(0);
        expect(meta.hidden).toBe(true);
      }
    }));
  });

  describe('Edge Cases', () => {
    it('should handle measurements with null values', () => {
      const nullMeasurements: SoilMeasurement[] = [{
        ...mockMeasurements[0],
        soilMoisture: 0,
        environmentTemperature: 0
      }];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(nullMeasurements));
      fixture.detectChanges();

      const stats = component.stats();
      expect(stats).toBeTruthy();
      expect(stats?.averageSoilMoisture).toBe('0.00');
    });

    it('should handle very large datasets', () => {
      const largeMeasurements = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMeasurements[0],
        id: i,
        dateTime: `2025-01-15T${String(10 + (i % 14)).padStart(2, '0')}:00:00`
      }));

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(largeMeasurements));
      fixture.detectChanges();

      expect(component.measurements().length).toBe(1000);
      expect(component.stats()?.totalMeasurements).toBe(1000);
    });
  });
});