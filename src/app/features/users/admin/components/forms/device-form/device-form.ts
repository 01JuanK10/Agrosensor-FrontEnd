import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Device } from '../../../../../domain/Device';
import { User } from '../../../../../domain/User';
import { DeviceTypes } from '../../../../../domain/DeviceTypes';

@Component({
  selector: 'app-device-form',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceForm implements OnInit {
  deviceForm!: FormGroup;
  newDevice: boolean = true;
  types: DeviceTypes[];
  clients: User[];
  @Input() deviceData: Device | null = null;

    constructor(private fb: FormBuilder) {
    this.clients = [
      new User(1, 1234567890, 'Camilo', 'Alzate', 'camilo@example.com', 'camilo.alzate', 'password123', 'ADMIN'),
      new User(2, 9876543210, 'Laura', 'Gómez', 'laura@example.com', 'laura.gomez', 'password123', 'CLIENT'),
      new User(3, 1122334455, 'Carlos', 'Pérez', 'carlos@example.com', 'carlos.perez', 'password123', 'CLIENT'),
      new User(4, 5566778899, 'Sofía', 'Ramírez', 'sofia@example.com', 'sofia.ramirez', 'password123', 'CLIENT'),
      new User(5, 9988776655, 'Andrés', 'Torres', 'andres@example.com', 'andres.torres', 'password123', 'ADMIN'),
    ];
    this.types = Object.values(DeviceTypes);

  }

  ngOnInit(): void {
    this.deviceForm = this.fb.group({
      mac: ['', Validators.required],
      types: ['', Validators.required],
      ubication: ['', [Validators.required, Validators.min(0)]],
      cliente: [null]
    });
    console.log("Datos del dispositivo recibidos en el formulario:", this.deviceData);
    if (this.deviceData) {
      this.newDevice = false;
      this.deviceForm.patchValue({
        mac: this.deviceData.mac,
        types: this.deviceData.tipo,
        ubication: this.deviceData.ubicacion,
        cliente: this.deviceData.cliente
      });
    }
  }

    onSubmit(): void {
    if (this.deviceForm.valid) {
      const device: Device = this.deviceForm.value;
      if(this.newDevice){
        console.log(`nuevo dispositivo = ${device}`)
      }else{
        console.log(`dispositivo existente = ${device}`)
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  compareClientes(c1: User, c2: User): boolean {
    return c1 && c2 ? c1.cc === c2.cc : c1 === c2;
  }

}
