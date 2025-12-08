import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-user-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-user-dialog.html',
  styleUrl: './delete-user-dialog.scss',
})
export class DeleteUserDialog {
  @Input() clientId?: number;

  constructor(private dialogRef: MatDialogRef<DeleteUserDialog>) { }

  deleteClient() {
    if (!this.clientId) {
      console.error('ERROR en DeleteDeviceDialog: Los datos inyectados son inválidos o falta el ID.');
    }
    console.log(`id del dispositivo a eliminar ${ this.clientId } `);
    this.dialogRef.close(this.clientId);
  }
}
