import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../domain/User';


@Injectable({
  providedIn: 'root'
})
export class ProfileUpdateService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.apiUrl; 

  userState = signal<string | null>(sessionStorage.getItem('name'));

  updateUser(newUser: string | null): void {
    this.userState.set(newUser);
  }

  // Headers con Token
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene la información del usuario por su cédula (CC).
   * Determina el endpoint (Admin o Client) basado en el rol almacenado.
   * @param cc Cédula del usuario
   */
  getUserByCc(cc: number): Observable<User> {
    const role = sessionStorage.getItem('user_role');
    const headers = this.getAuthHeaders();
    let endpoint = '';

    if (role === 'ADMIN') {
      // Endpoint: /api/users/admins/{cc}
      endpoint = `${this.API_BASE_URL}/api/users/admins/${cc}`;
    } else if (role === 'CLIENT') {
      // Endpoint: /api/users/clients/{cc}
      endpoint = `${this.API_BASE_URL}/api/users/clients/${cc}`;
    } else {
      throw new Error('Rol de usuario no identificado o no soportado.');
    }

    return this.http.get<User>(endpoint, { headers });
  }

  /**
   * Actualiza el perfil del usuario utilizando PATCH.
   * Determina el endpoint basado en el rol almacenado.
   * @param id ID del usuario (Long id de la BD)
   * @param updates Objeto con los campos a actualizar (Map<String, Object>)
   */
  updateProfile(id: number, updates: any): Observable<any> {
    const role = sessionStorage.getItem('user_role');
    const headers = this.getAuthHeaders();

    let endpoint = '';

    if (role === 'ADMIN') {
      // Endpoint: /api/users/admins/{id}
      endpoint = `${this.API_BASE_URL}/api/users/admins/${id}`;
    } else if (role === 'CLIENT') {
      // Endpoint: /api/users/clients/{id}
      endpoint = `${this.API_BASE_URL}/api/users/clients/${id}`;
    } else {
      throw new Error('Rol de usuario no identificado o no soportado.');
    }

    sessionStorage.setItem('name', `${updates.name} ${updates.lastname}`);
    this.updateUser( sessionStorage.getItem('name') || null);
    // Se envía 'updates' que será recibido como Map<String, Object> en el backend
    return this.http.patch(endpoint, updates, { headers });
  }
}