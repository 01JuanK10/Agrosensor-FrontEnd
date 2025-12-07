export class User {
    constructor(
        public id: number | null,
        public cc: number,
        public name: string,
        public lastname: string,
        public email: string,
        public username: string,
        public password: string,
        public role: string
    ) {}
}

export interface ClientResponse extends User {} 

// Interfaz mínima para la respuesta de registro (aunque no se use directamente)
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    role: string;
    name: string;
    cc: number;
}
