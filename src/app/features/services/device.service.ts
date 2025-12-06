import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device } from '../../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private apiUrl = 'http://localhost:8080/api/devices/esp32';

  constructor(private http: HttpClient) { }

  // Obtener todos los dispositivos
  getDevices(): Observable<Device[]> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.get<Device[]>(`${this.apiUrl}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  //Obtener dispositivo por Id
  getDeviceById(id: number): Observable<Device> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.get<Device>(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Crear un dispositivo
  createDevice(device: Device): Observable<Device> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.post<Device>(`${this.apiUrl}`, device, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
  }

  // Editar un dispositivo
  updateDevice(id: string, device: Device): Observable<Device> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.put<Device>(`${this.apiUrl}`, device, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
  }

  // Eliminar un dispositivo
  deleteDevice(id: string): Observable<void> {
    const token = sessionStorage.getItem('auth_token');
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
