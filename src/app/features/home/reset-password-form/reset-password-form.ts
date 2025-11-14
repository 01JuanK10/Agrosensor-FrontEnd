import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/service/auth-service';

@Component({
  selector: 'app-reset-password-form',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.scss',
})
export class ResetPasswordForm {
  constructor(public matDialogRef: MatDialogRef<ResetPasswordForm>) {
  }
  
  cerrarModal(){
    this.matDialogRef.close();
  }
}
