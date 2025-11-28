// src/app/features/services/measurements.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeasurementsService, SoilMeasurement } from './measurements.service';
import { environment } from '../../../environments/environment';

describe('MeasurementsService', () => {
  let service: MeasurementsService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/measurements/soil`;

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
      erosion: 42.8,
      dateTime: '2025-01-15T11:00:00',
      environmentMoisture: 55.0,
      environmentTemperature: 24.0,
      device: {
        id: 'DEV002',
        type: 'esp32',
        location: {
          latitude: 6.25200,
          longitude: -75.56370,
          address: 'Medellín, Colombia'
        }
      }
    },
    {
      id: 3,
      soilMoisture: 50.0,
      soilIluminance: 70.0,
      erosion: 15.0,
      dateTime: '2025-01-15T09:00:00',
      environmentMoisture: 65.0,
      environmentTemperature: 20.0,
      device: {
        id: 'DEV001',
        type: 'esp32',
        location: {
          latitude: 6.25184,
          longitude: -75.56359,
          address: 'Medellín, Colombia'
        }
      }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MeasurementsService]
    });

    service = TestBed.inject(MeasurementsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock sessionStorage
    spyOn(sessionStorage, 'getItem').and.returnValue('fake-token-123');
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllMeasurements', () => {
    it('should fetch all measurements with authorization header', () => {
      service.getAllMeasurements().subscribe(measurements => {
        expect(measurements).toEqual(mockMeasurements);
        expect(measurements.length).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token-123');
      req.flush(mockMeasurements);
    });

    it('should handle empty measurements array', () => {
      service.getAllMeasurements().subscribe(measurements => {
        expect(measurements).toEqual([]);
        expect(measurements.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      service.getAllMeasurements().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should use shareReplay to cache results', () => {
      const observable = service.getAllMeasurements();

      observable.subscribe();
      observable.subscribe();

      // Solo debe hacer una petición HTTP
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });
  });

  describe('getLatestMeasurementsByDevice', () => {
    it('should return latest measurement for each device', (done) => {
      service.getLatestMeasurementsByDevice().subscribe(latestMap => {
        expect(latestMap.size).toBe(2);
        
        const dev1Latest = latestMap.get('DEV001');
        expect(dev1Latest?.id).toBe(1); // La medición más reciente de DEV001
        expect(dev1Latest?.dateTime).toBe('2025-01-15T10:30:00');
        
        const dev2Latest = latestMap.get('DEV002');
        expect(dev2Latest?.id).toBe(2);
        
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });

    it('should handle single device with multiple measurements', (done) => {
      const singleDeviceMeasurements = mockMeasurements.filter(m => m.device.id === 'DEV001');
      
      service.getLatestMeasurementsByDevice().subscribe(latestMap => {
        expect(latestMap.size).toBe(1);
        const latest = latestMap.get('DEV001');
        expect(latest?.id).toBe(1); // La más reciente
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(singleDeviceMeasurements);
    });
  });

  describe('getMeasurementsByDateRange', () => {
    it('should filter measurements by date range', (done) => {
      const startDate = new Date('2025-01-15T09:30:00');
      const endDate = new Date('2025-01-15T10:45:00');

      service.getMeasurementsByDateRange(startDate, endDate).subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });

    it('should return empty array when no measurements in range', (done) => {
      const startDate = new Date('2025-01-16T00:00:00');
      const endDate = new Date('2025-01-17T00:00:00');

      service.getMeasurementsByDateRange(startDate, endDate).subscribe(filtered => {
        expect(filtered.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });

    it('should include boundary dates', (done) => {
      const startDate = new Date('2025-01-15T10:30:00');
      const endDate = new Date('2025-01-15T10:30:00');

      service.getMeasurementsByDateRange(startDate, endDate).subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });
  });

  describe('getMeasurementStats', () => {
    it('should calculate correct statistics', (done) => {
      service.getMeasurementStats().subscribe(stats => {
        expect(stats.totalMeasurements).toBe(3);
        expect(stats.avgSoilMoisture).toBeCloseTo(44.5, 1);
        expect(stats.avgTemperature).toBeCloseTo(22.17, 1);
        expect(stats.avgErosion).toBeCloseTo(27.7, 1);
        expect(stats.maxErosion).toBe(42.8);
        expect(stats.minErosion).toBe(15.0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockMeasurements);
    });

    it('should handle empty measurements array', (done) => {
      service.getMeasurementStats().subscribe(stats => {
        expect(stats.totalMeasurements).toBe(0);
        expect(stats.avgSoilMoisture).toBe(0);
        expect(stats.avgTemperature).toBe(0);
        expect(stats.avgErosion).toBe(0);
        expect(stats.maxErosion).toBe(0);
        expect(stats.minErosion).toBe(0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });

    it('should handle single measurement', (done) => {
      const singleMeasurement = [mockMeasurements[0]];

      service.getMeasurementStats().subscribe(stats => {
        expect(stats.totalMeasurements).toBe(1);
        expect(stats.avgSoilMoisture).toBe(45.5);
        expect(stats.avgTemperature).toBe(22.5);
        expect(stats.avgErosion).toBe(25.3);
        expect(stats.maxErosion).toBe(25.3);
        expect(stats.minErosion).toBe(25.3);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(singleMeasurement);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      service.getAllMeasurements().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 404 Not Found error', () => {
      service.getAllMeasurements().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network error', () => {
      service.getAllMeasurements().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Network error'));
    });
  });
});