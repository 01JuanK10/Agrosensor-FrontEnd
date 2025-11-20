import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-device-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-device-dialog.html',
  styleUrl: './delete-device-dialog.scss',
})
export class DeleteDeviceDialog {
  @Input() deviceMac: string = '';

  deleteDevice(porcinoId: string){
    console.log(`id del porcino a eliminar ${porcinoId}`);
  }
}
