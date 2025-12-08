import { Component, Input, OnInit, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../../domain/User';
import { DeviceTypes } from '../../../../../domain/DeviceTypes';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeviceDialog } from '../../dialogs/device-dialog/device-dialog';
import { ClientService } from '../../../../../services/client-service';
import { Device } from '../../../../../domain/Device';

@Component({
  selector: 'app-device-form',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceForm implements OnInit {
  deviceForm!: FormGroup;
  newDevice: boolean = true;
  types = Object.values(DeviceTypes);
  clients: User[] = [];

  clientService = inject(ClientService)
  @Input() deviceData: Device | null = null;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<DeviceDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.loadClients();
    this.deviceForm = this.fb.group({
      id: [''],
      type: ['', Validators.required],
      active: [true, Validators.required],
      //Datos ubicación
      location: this.fb.group({
        latitude: ['', Validators.required],
        longitude: ['', Validators.required],
        address: ['', Validators.required]
      }),
      client: [null]
    });
    console.log("Datos del dispositivo recibidos en el formulario:", this.deviceData);
    if (this.deviceData) {
      this.newDevice = false;
      this.deviceForm.patchValue({
        id: this.deviceData.id,
        type: this.deviceData.type,
        active: this.deviceData.active,
        location: {
          locationId: this.deviceData.location.id,
          latitude: this.deviceData.location.latitude,
          longitude: this.deviceData.location.longitude,
          address: this.deviceData.location.address
        },
        client: this.deviceData.client
      });
    }
  }

  onSubmit(): void {
    if (!this.deviceForm.valid) {
      console.log('Formulario inválido');
      return;
    }

    const form = this.deviceForm.value;

    const device: Device = {
      id: form.id,
      type: form.type,
      active: form.active,
      location: {
        id: form.location.locationId,
        latitude: form.location.latitude,
        longitude: form.location.longitude,
        address: form.location.address
      },
      client: form.client
    };
    console.log("Dispositivo enviado: ", device);
    this.dialogRef.close(device);
    //(window as any).deviceFormSubmit = device;
  }

  compareClientes(c1: User, c2: User): boolean {
    return c1 && c2 ? c1.cc === c2.cc : c1 === c2;
  }

  loadClients(): void {
    this.clientService.findAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
      }
    });
  }

}
