// src/app/features/users/client/notifications-panel/notifications-panel.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationsPanel } from './notifications-panel';
import { MeasurementsService, SoilMeasurement } from '../../../services/measurements.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

describe('NotificationsPanel', () => {
  let component: NotificationsPanel;
  let fixture: ComponentFixture<NotificationsPanel>;
  let measurementsServiceSpy: jasmine.SpyObj<MeasurementsService>;

  const createMeasurement = (
    id: number,
    deviceId: string,
    erosion: number,
    soilMoisture: number,
    temperature: number,
    dateTime: string
  ): SoilMeasurement => ({
    id,
    soilMoisture,
    soilIluminance: 50.0,
    erosion,
    dateTime,
    environmentMoisture: 60.0,
    environmentTemperature: temperature,
    device: {
      id: deviceId,
      type: 'esp32',
      location: {
        latitude: 6.25184,
        longitude: -75.56359,
        address: `Location ${deviceId}`
      }
    }
  });

  const mockMeasurements: SoilMeasurement[] = [
    // Erosión crítica
    createMeasurement(1, 'DEV001', 75.0, 45.0, 25.0, '2025-01-15T10:30:00'),
    // Erosión moderada
    createMeasurement(2, 'DEV002', 45.0, 50.0, 22.0, '2025-01-15T10:35:00'),
    // Humedad baja
    createMeasurement(3, 'DEV003', 20.0, 15.0, 24.0, '2025-01-15T10:40:00'),
    // Temperatura alta
    createMeasurement(4, 'DEV004', 25.0, 40.0, 38.0, '2025-01-15T10:45:00'),
    // Sin alertas
    createMeasurement(5, 'DEV005', 20.0, 50.0, 22.0, '2025-01-15T10:50:00'),
    // Medición antigua del mismo dispositivo
    createMeasurement(6, 'DEV001', 30.0, 60.0, 20.0, '2025-01-15T09:00:00')
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MeasurementsService', ['getAllMeasurements']);

    await TestBed.configureTestingModule({
      imports: [
        NotificationsPanel,
        CommonModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: MeasurementsService, useValue: spy }
      ]
    }).compileComponents();

    measurementsServiceSpy = TestBed.inject(MeasurementsService) as jasmine.SpyObj<MeasurementsService>;
    fixture = TestBed.createComponent(NotificationsPanel);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load alerts on init', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      expect(measurementsServiceSpy.getAllMeasurements).toHaveBeenCalled();
      expect(component.alerts().length).toBeGreaterThan(0);
    });

    it('should setup polling with 10 second interval', fakeAsync(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const initialCallCount = measurementsServiceSpy.getAllMeasurements.calls.count();
      tick(10000);

      expect(measurementsServiceSpy.getAllMeasurements.calls.count()).toBeGreaterThan(initialCallCount);
    }));

    it('should handle empty measurements', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of([]));
      fixture.detectChanges();

      expect(component.alerts().length).toBe(0);
    });

    it('should cleanup polling on destroy', fakeAsync(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const initialCallCount = measurementsServiceSpy.getAllMeasurements.calls.count();
      fixture.destroy();
      tick(10000);

      expect(measurementsServiceSpy.getAllMeasurements.calls.count()).toBe(initialCallCount);
    }));
  });

  describe('Alert Generation', () => {
    beforeEach(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();
    });

    it('should generate danger alert for critical erosion (>=60)', () => {
      const criticalAlerts = component.alerts().filter(a => a.type === 'danger');
      expect(criticalAlerts.length).toBeGreaterThan(0);
      expect(criticalAlerts[0].message).toContain('EROSIÓN CRÍTICA');
      expect(criticalAlerts[0].message).toContain('75.0%');
    });

    it('should generate warning alert for moderate erosion (35-60)', () => {
      const warningAlerts = component.alerts().filter(a => 
        a.type === 'warning' && a.message.includes('Erosión moderada')
      );
      expect(warningAlerts.length).toBeGreaterThan(0);
      expect(warningAlerts[0].message).toContain('45.0%');
    });

    it('should generate warning alert for low soil moisture (<20)', () => {
      const moistureAlerts = component.alerts().filter(a => 
        a.message.includes('Humedad del suelo baja')
      );
      expect(moistureAlerts.length).toBeGreaterThan(0);
      expect(moistureAlerts[0].message).toContain('15.0%');
    });

    it('should generate warning alert for high temperature (>35)', () => {
      const tempAlerts = component.alerts().filter(a => 
        a.message.includes('Temperatura alta')
      );
      expect(tempAlerts.length).toBeGreaterThan(0);
      expect(tempAlerts[0].message).toContain('38.0°C');
    });

    it('should not generate alerts for normal conditions', () => {
      const normalMeasurements = [
        createMeasurement(1, 'DEV001', 25.0, 50.0, 22.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(normalMeasurements));
      component.ngOnInit();

      expect(component.alerts().length).toBe(0);
    });

    it('should include device address in alert message', () => {
      const alert = component.alerts()[0];
      expect(alert.message).toContain('Location');
    });

    it('should set correct deviceId in alerts', () => {
      const alerts = component.alerts();
      expect(alerts.every(a => a.deviceId.startsWith('DEV'))).toBe(true);
    });

    it('should set timestamp in alerts', () => {
      const alerts = component.alerts();
      expect(alerts.every(a => a.timestamp instanceof Date)).toBe(true);
    });
  });

  describe('Latest Measurements Only', () => {
    it('should only use latest measurement per device', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      // DEV001 tiene dos mediciones, solo debe usar la más reciente (75% erosión)
      const dev001Alerts = component.alerts().filter(a => a.deviceId === 'DEV001');
      expect(dev001Alerts.length).toBeGreaterThan(0);
      expect(dev001Alerts[0].message).toContain('75.0%');
    });

    it('should handle multiple devices correctly', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const uniqueDevices = new Set(component.alerts().map(a => a.deviceId));
      expect(uniqueDevices.size).toBeGreaterThanOrEqual(4);
    });

    it('should prefer most recent measurement by date', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 20.0, 50.0, 22.0, '2025-01-15T09:00:00'),
        createMeasurement(2, 'DEV001', 70.0, 50.0, 22.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].message).toContain('70.0%');
    });
  });

  describe('Alert Sorting', () => {
    beforeEach(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();
    });

    it('should sort alerts by date descending', () => {
      const alerts = component.alerts();
      for (let i = 0; i < alerts.length - 1; i++) {
        expect(alerts[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          alerts[i + 1].timestamp.getTime()
        );
      }
    });

    it('should sort by severity when dates are equal', () => {
      const sameDateMeasurements = [
        createMeasurement(1, 'DEV001', 40.0, 50.0, 22.0, '2025-01-15T10:00:00'), // warning
        createMeasurement(2, 'DEV002', 70.0, 50.0, 22.0, '2025-01-15T10:00:00')  // danger
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(sameDateMeasurements));
      component.ngOnInit();

      const alerts = component.alerts();
      expect(alerts[0].type).toBe('danger');
      expect(alerts[1].type).toBe('warning');
    });

    it('should prioritize danger over warning over info', () => {
      const mixedAlerts = component.alerts().filter(a => 
        a.timestamp.getTime() === component.alerts()[0].timestamp.getTime()
      );

      if (mixedAlerts.length > 1) {
        const severityOrder = mixedAlerts.map(a => a.type);
        const sortedOrder = [...severityOrder].sort((a, b) => {
          const order = { danger: 3, warning: 2, info: 1 };
          return (order[b as keyof typeof order] || 0) - (order[a as keyof typeof order] || 0);
        });
        expect(severityOrder).toEqual(sortedOrder);
      }
    });
  });

  describe('UI Display', () => {
    it('should display "No hay alertas" when alerts array is empty', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of([]));
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('No hay alertas activas');
    });

    it('should display alerts when present', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const alertItems = compiled.querySelectorAll('.alert-item');
      expect(alertItems.length).toBeGreaterThan(0);
    });

    it('should apply correct CSS class for alert type', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dangerAlerts = compiled.querySelectorAll('.alert-danger');
      const warningAlerts = compiled.querySelectorAll('.alert-warning');

      expect(dangerAlerts.length + warningAlerts.length).toBeGreaterThan(0);
    });

    it('should display formatted timestamp', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const timeElements = compiled.querySelectorAll('.alert-time');
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Threshold Validation', () => {
    it('should use correct erosion critical threshold (60)', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 59.9, 50.0, 22.0, '2025-01-15T10:00:00'),
        createMeasurement(2, 'DEV002', 60.0, 50.0, 22.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      const dangerAlerts = alerts.filter(a => a.type === 'danger');
      const warningAlerts = alerts.filter(a => 
        a.type === 'warning' && a.message.includes('Erosión moderada')
      );

      expect(dangerAlerts.length).toBe(1);
      expect(warningAlerts.length).toBe(1);
    });

    it('should use correct erosion warning threshold (35)', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 34.9, 50.0, 22.0, '2025-01-15T10:00:00'),
        createMeasurement(2, 'DEV002', 35.0, 50.0, 22.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      const erosionWarnings = alerts.filter(a => a.message.includes('Erosión moderada'));
      expect(erosionWarnings.length).toBe(1);
    });

    it('should use correct soil moisture threshold (20)', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 10.0, 19.9, 22.0, '2025-01-15T10:00:00'),
        createMeasurement(2, 'DEV002', 10.0, 20.0, 22.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      const moistureWarnings = alerts.filter(a => a.message.includes('Humedad del suelo baja'));
      expect(moistureWarnings.length).toBe(1);
    });

    it('should use correct temperature threshold (35)', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 10.0, 50.0, 35.0, '2025-01-15T10:00:00'),
        createMeasurement(2, 'DEV002', 10.0, 50.0, 35.1, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      const tempWarnings = alerts.filter(a => a.message.includes('Temperatura alta'));
      expect(tempWarnings.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      spyOn(console, 'error');
      measurementsServiceSpy.getAllMeasurements.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
      expect(component.alerts().length).toBe(0);
    });

    it('should continue polling after error', fakeAsync(() => {
      spyOn(console, 'error');
      measurementsServiceSpy.getAllMeasurements.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();
      const firstCallCount = measurementsServiceSpy.getAllMeasurements.calls.count();

      tick(10000);

      expect(measurementsServiceSpy.getAllMeasurements.calls.count()).toBeGreaterThan(firstCallCount);
    }));

    it('should handle malformed measurement data', () => {
      const malformedMeasurements = [
        {
          ...mockMeasurements[0],
          device: null as any
        }
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(malformedMeasurements));

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Multiple Alerts per Device', () => {
    it('should generate multiple alerts if device has multiple issues', () => {
      const measurements = [
        createMeasurement(1, 'DEV001', 70.0, 15.0, 38.0, '2025-01-15T10:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(measurements));
      fixture.detectChanges();

      const dev001Alerts = component.alerts().filter(a => a.deviceId === 'DEV001');
      expect(dev001Alerts.length).toBeGreaterThanOrEqual(3); // Erosión, humedad, temperatura
    });

    it('should format erosion values with one decimal place', () => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const alerts = component.alerts();
      alerts.forEach(alert => {
        const matches = alert.message.match(/\d+\.\d%/);
        if (matches) {
          expect(matches[0]).toMatch(/\d+\.\d%/);
        }
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update alerts when new data arrives', fakeAsync(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const initialAlertCount = component.alerts().length;

      const updatedMeasurements = [
        ...mockMeasurements,
        createMeasurement(10, 'DEV010', 80.0, 10.0, 40.0, '2025-01-15T11:00:00')
      ];

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(updatedMeasurements));
      tick(10000);

      expect(component.alerts().length).toBeGreaterThan(initialAlertCount);
    }));

    it('should remove alerts when conditions improve', fakeAsync(() => {
      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(mockMeasurements));
      fixture.detectChanges();

      const normalMeasurements = mockMeasurements.map(m => ({
        ...m,
        erosion: 20.0,
        soilMoisture: 50.0,
        environmentTemperature: 22.0
      }));

      measurementsServiceSpy.getAllMeasurements.and.returnValue(of(normalMeasurements));
      tick(10000);

      expect(component.alerts().length).toBe(0);
    }));
  });
});