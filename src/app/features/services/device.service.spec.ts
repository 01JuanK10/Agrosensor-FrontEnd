import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DeviceService } from './device.service';
import { Device } from '../../models/device.model';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8080/api/devices/esp32';

  const mockDevice: Device = {
    id: '1',
    type: 'sensor',
    active: true,
    location: {
      id: 100,
      latitude: 6.2442,
      longitude: -75.5812,
      address: 'Calle 10 #20-30'
    },
    client: {
      id: 50,
      cc: 1234567890
    }
  };

  const mockDevice2: Device = {
    id: '2',
    type: 'sensor',
    active: false,
    location: {
      id: 101,
      latitude: 6.3000,
      longitude: -75.5800,
      address: 'Carrera 50 #40-20'
    },
    client: {
      id: 51,
      cc: 987654321
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeviceService]
    });

    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);

    sessionStorage.setItem('auth_token', 'fake-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  //PRUEBA: OBTENER DISPOSITIVOS
  it('debe obtener la lista de dispositivos (GET)', () => {
    const mockDevices = [mockDevice, mockDevice2];

    service.getDevices().subscribe(res => {
      expect(res.length).toBe(2);
      expect(res).toEqual(mockDevices);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(mockDevices);
  });

  //PRUEBA: OBTENER DISPOSITIVO POR ID
  it('debe obtener un dispositivo por ID (GET)', () => {
    service.getDeviceById(1).subscribe(res => {
      expect(res).toEqual(mockDevice);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(mockDevice);
  });

  //PRUEBA: CREAR DIPOSITIVO
  it('debe crear un dispositivo (POST)', () => {
    service.createDevice(mockDevice2).subscribe(res => {
      expect(res).toEqual(mockDevice2);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(mockDevice2);

    req.flush(mockDevice2);
  });

  //PRUEBA: ACTUALIZAR DISPOSITIVO
  it('debe actualizar un dispositivo (PUT)', () => {
    const updatedDevice = { ...mockDevice, active: false };

    service.updateDevice('1', updatedDevice).subscribe(res => {
      expect(res).toEqual(updatedDevice);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(updatedDevice);

    req.flush(updatedDevice);
  });

  //PRUEBA: BORRAR DISPOSITIVO
  it('debe eliminar un dispositivo (DELETE)', () => {
    service.deleteDevice('1').subscribe(res => {
      expect(res).toBeNull();
      //expect(res).toEqual({ message: 'deleted' });
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush(null, { status: 204, statusText: 'No Content'});
    //req.flush({ message: 'deleted' });

  });

});
