import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/service/auth-service';
import { ResetPasswordForm } from '../../home/reset-password-form/reset-password-form';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  showPassword = false;
  authService = inject(AuthService);

  constructor(public matDialogRef: MatDialogRef<Login>, private _matDialog: MatDialog) {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  cerrarModal(): void {
    this.matDialogRef.close();
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();

    const usernameInput = (document.getElementById('username') as HTMLInputElement)?.value.trim();
    const passwordInput = (document.getElementById('password') as HTMLInputElement)?.value.trim();

    if (!usernameInput || !passwordInput) {
      alert('Please enter both username and password.');
      return;
    }

    const credentials = {
      username: usernameInput,
      password: passwordInput
    };

    this.authService.login(credentials).subscribe({
      next: () => this.cerrarModal(),
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid credentials. Please try again.');
      }
    });
  }

  private abrirModal(): void {
    this.cerrarModal();
    this._matDialog.open(ResetPasswordForm, {
      width: '90vw',          
      maxWidth: '400px',      
      height: 'auto',
      maxHeight: '90vh',       
      position: { top: '5vh' },
      panelClass: 'responsive-login-modal',
      exitAnimationDuration: '200ms',
      disableClose: true
    });
  }

  resetPassword(): void {
    this.abrirModal();
  }

}
