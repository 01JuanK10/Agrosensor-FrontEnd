import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeviceForm } from '../../forms/device-form/device-form';
import { Device } from '../../../../../../models/device.model';

@Component({
  selector: 'app-device-dialog',
  imports: [MatButtonModule, MatDialogModule, DeviceForm],
  templateUrl: './device-dialog.html',
  styleUrl: './device-dialog.scss',
})
export class DeviceDialog {
    deviceData: Device | null = null
    constructor(private dialogRef: MatDialogRef<DeviceDialog>) {}

    onUpdatedDevice(device: Device) {
      console.log('Dispositivo editado recibido en el diálogo:', device);
      this.dialogRef.close(device)
    }

}
