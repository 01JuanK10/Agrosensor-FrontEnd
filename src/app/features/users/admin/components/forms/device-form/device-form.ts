import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../../domain/User';
import { DeviceTypes } from '../../../../../domain/DeviceTypes';
import { Device } from '../../../../../../models/device.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeviceDialog } from '../../dialogs/device-dialog/device-dialog';

@Component({
  selector: 'app-device-form',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceForm implements OnInit {
  deviceForm!: FormGroup;
  newDevice: boolean = true;

  @Input() deviceData: Device | null = null;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<DeviceDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.deviceForm = this.fb.group({
      id: [''],
      type: ['', Validators.required],
      active: [true, Validators.required],
      //Datos ubicación
      location: this.fb.group({
        locationId: [''],
        latitude: ['', Validators.required],
        longitude: ['', Validators.required],
        address: ['', Validators.required]
      }),

      //Datos cliente
      client: this.fb.group({
        id: [''],
        cc: ['', Validators.required]
      })

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
        client: {
          id: this.deviceData.client.id,
          cc: this.deviceData.client.cc
        }
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
      client: {
        id: form.client.id,
        cc: form.client.cc
      }
    };
    console.log("Dispositivo enviado: ", device);
    this.dialogRef.close(device);
    //(window as any).deviceFormSubmit = device;
  }

}
