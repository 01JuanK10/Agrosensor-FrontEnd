import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/service/auth-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-reset-password',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './user-reset-password.html',
  styleUrl: './user-reset-password.scss',
})
export class UserResetPassword{
  form: any;
  token: string | null = null;
  username: string | null = null;
  role: string | null = null;
  private readonly ROLE_KEY = 'user_role';
  private readonly USERNAME_KEY = 'name';
  private readonly TOKEN_KEY = 'auth_token';


  authService = inject(AuthService)

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: (formGroup) => {
      const pass = formGroup.get('password')?.value;
      const confirm = formGroup.get('confirmPassword')?.value;
      return pass === confirm ? null : { passwordMismatch: true };
    }
  });
  }

  

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['tk'] ?? null;
      this.username = params['usr'] ?? null;
      this.role = params['role'] ?? null

      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem(this.ROLE_KEY, this.role!);
        sessionStorage.setItem(this.USERNAME_KEY, this.username!);
        sessionStorage.setItem(this.TOKEN_KEY, this.token!);
        
      }
      
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.username) return;

    const newPassword = this.form.value.password!;

    this.authService.resetPassword(this.username, newPassword, this.token!).subscribe({
      next: () => {
        alert('Contraseña actualizada con éxito');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al actualizar la contraseña:', err);
        alert('No se pudo actualizar la contraseña.');
      }
    });
  }
}
