import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/service/auth-service';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password-form',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.scss',
})
export class ResetPasswordForm {

  http = inject(HttpClient);
  authService = inject(AuthService);

  constructor(public matDialogRef: MatDialogRef<ResetPasswordForm>) {
  }
  
  closeModal(){
    this.matDialogRef.close();
  }

  
  onSubmit(event?: Event): void {
    event?.preventDefault();

    const emailInput = (document.getElementById('email') as HTMLInputElement)?.value.trim();

    if (!emailInput) {
      return;
    }

  this.http.get(`${environment.apiUrl}/utilities/send/${emailInput}`, {
    responseType: 'text'
  }).subscribe({
    next: (msg) => {
      alert(msg);
      this.matDialogRef.close();
    },
    error: (err) => {
      console.error('Password reset failed:', err);
      alert('Error sending reset email. Please try again.');
    }
  });

  }
}
