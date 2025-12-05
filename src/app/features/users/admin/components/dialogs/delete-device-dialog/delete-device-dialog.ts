import { Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-device-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-device-dialog.html',
  styleUrl: './delete-device-dialog.scss',
})
export class DeleteDeviceDialog {
  @Input() deviceId: string = '';

  constructor(private dialogRef: MatDialogRef<DeleteDeviceDialog>) { }

  deleteDevice() {
    if (!this.deviceId) {
      console.error('ERROR en DeleteDeviceDialog: Los datos inyectados son inválidos o falta el ID.');
    }
    console.log(`id del dispositivo a eliminar ${ this.deviceId } `);
    this.dialogRef.close(this.deviceId);
  }
}
