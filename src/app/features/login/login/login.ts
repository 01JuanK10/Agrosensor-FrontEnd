import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  showPassword = false;

  constructor(public matDialogRef: MatDialogRef<Login>) {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  cerrarModal(): void {
    this.matDialogRef.close();
  }
}
