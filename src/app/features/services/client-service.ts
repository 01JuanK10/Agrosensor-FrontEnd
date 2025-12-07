// src/app/services/client.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientResponse, TokenResponse, User } from '../domain/User';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
    private http = inject(HttpClient);
    // Cambia esto por la URL base de tu API de Render
    private readonly API_BASE_URL = environment.apiUrl;

    // Endpoints del controlador de clientes (GET)
    private readonly CLIENTS_ENDPOINT = `${this.API_BASE_URL}/api/users/clients`;
    
    // Endpoint del controlador de registro (POST)
    private readonly REGISTER_ENDPOINT = `${this.API_BASE_URL}/admin/clients/register`;


    /**
     * Obtiene los headers de autorización con el token almacenado en sessionStorage.
     * @returns HttpHeaders o null si no hay token.
     */
    private getAuthHeaders(): HttpHeaders | null {
        // Asegúrate de usar la clave correcta con la que guardas el token, por ejemplo 'auth_token'
        const token = sessionStorage.getItem('auth_token'); 
        
        if (!token) {
            console.warn('Token de autenticación no encontrado.');
            return null;
        }

        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // ----------------------------------------------------------------------
    // 1. Método para obtener todos los clientes (GET)
    // Spring Controller: @GetMapping -> /api/users/clients
    // ----------------------------------------------------------------------
    
    /**
     * Realiza una petición GET para obtener la lista completa de clientes.
     * Requiere el token de autenticación.
     * @returns Observable<ClientResponse[]>
     */
    public findAllClients(): Observable<ClientResponse[]> {
        const headers = this.getAuthHeaders();

        if (!headers) {
            // Manejar la falta de token (ej. retornar un Observable vacío o lanzar un error)
            throw new Error('No se puede obtener la lista de clientes: Token de autenticación requerido.');
        }

        return this.http.get<ClientResponse[]>(this.CLIENTS_ENDPOINT, { headers });
    }

    // ----------------------------------------------------------------------
    // 2. Método para registrar/crear un nuevo cliente (POST)
    // Spring Controller: @PostMapping("/register") -> /admin/clients/register
    // ----------------------------------------------------------------------
    
    /**
     * Realiza una petición POST para registrar un nuevo cliente.
     * Requiere el token de autenticación (rol ADMIN).
     * @param request Los datos del nuevo cliente.
     * @returns Observable<TokenResponse>
     */
    public registerClient(request: User): Observable<TokenResponse> {
        const headers = this.getAuthHeaders();

        if (!headers) {
            throw new Error('No se puede registrar el cliente: Token de autenticación de ADMIN requerido.');
        }
        
        // El cuerpo de la petición es el objeto User (que coincide con RegisterRequest)
        // Se asume que el backend espera el objeto completo del User.
        return this.http.post<TokenResponse>(this.REGISTER_ENDPOINT, request, { headers });
    }
}