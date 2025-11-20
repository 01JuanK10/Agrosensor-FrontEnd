export class Device {
    constructor(
        public mac: string,
        public tipo: string,
        public ubicacion: string,
        public estado: boolean,
        public cliente: string
    ) {}
}
