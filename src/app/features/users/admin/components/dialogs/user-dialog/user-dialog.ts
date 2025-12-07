import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClientForm } from '../../forms/client-form/client-form';
import { User } from '../../../../../domain/User';

@Component({
  selector: 'app-user-dialog',
  imports: [MatButtonModule, MatDialogModule, ClientForm],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialog {
  constructor(private dialogRef: MatDialogRef<UserDialog>) {}

}
