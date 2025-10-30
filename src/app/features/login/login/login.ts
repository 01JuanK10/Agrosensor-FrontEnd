import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/service/auth-service';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  showPassword = false;
  authService = inject(AuthService);

  constructor(public matDialogRef: MatDialogRef<Login>) {
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

}
