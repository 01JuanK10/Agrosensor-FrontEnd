import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../domain/User';
import { ProfileUpdateService } from '../../../../services/profile-update-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-profile-component',
  imports: [ReactiveFormsModule,
    MatFormFieldModule, // Importa el componente de formulario
    MatInputModule,     // Importa los inputs
    MatButtonModule],
  templateUrl: './user-profile-component.html',
  styleUrl: './user-profile-component.scss',
})
export class UserProfileComponent implements OnInit {
  // Inyecciones
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileUpdateService);

  // Propiedad local para el usuario (ya no es @Input)
  currentUser: User | null = null;

  profileForm!: FormGroup;

  // Signals para manejar estado de UI
  loading = signal<boolean>(false);       // Carga durante el guardado (onSubmit)
  dataLoading = signal<boolean>(true);    // Carga inicial de datos del usuario
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.dataLoading.set(true);

    const storedCc = sessionStorage.getItem('cc');

    if (storedCc) {
      const ccNumber = Number(storedCc);

      this.profileService.getUserByCc(ccNumber).subscribe({
        next: (user) => {
          // Aseguramos que el rol esté en el currentUser
          user.role = sessionStorage.getItem('user_role') || 'Fallo cargando rol';
          this.currentUser = user;
          this.initForm();
          this.dataLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuario:', err);
          this.errorMessage.set("No se pudo cargar la información del usuario. Verifique el token.");
          this.dataLoading.set(false);
        }
      });
    } else {
      this.errorMessage.set("Error: No se encontró la Cédula (CC) en la sesión.");
      this.dataLoading.set(false);
    }
  }

  private initForm(): void {
    if (!this.currentUser) return;

    this.profileForm = this.fb.group({
      // Campos a editar. Los hacemos opcionales a nivel de *PATCH* quitando el 'required' por defecto si el valor ya existe.
      // Sin embargo, para no romper la validación inicial, los dejamos. La lógica clave está en onSubmit.
      name: [this.currentUser.name, [Validators.required]],
      lastname: [this.currentUser.lastname, [Validators.required]],
      email: ['', [Validators.email]],
      username: ['', [Validators.minLength(5)]],
      // Password es opcional en la edición
      password: ['', [Validators.minLength(6)]]
    });
  }

  // 🚀 LÓGICA DE ACTUALIZACIÓN MODIFICADA
  onSubmit(): void {
    // Verificamos que el formulario sea válido y que el usuario esté cargado
    if (this.profileForm.invalid || !this.currentUser || !this.currentUser.cc) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValues = this.profileForm.value;
    const updates: any = {};

    // 🔑 Lógica PATCH: Solo se incluyen los campos si el valor actual del formulario DIFIERE del valor original del currentUser.
    // Esto imita el comportamiento de la contraseña, donde solo el cambio dispara la inclusión.

    // Nombre
    if (formValues.name !== this.currentUser.name) {
      updates.name = formValues.name;
    }

    // Apellido
    if (formValues.lastname !== this.currentUser.lastname) {
      updates.lastname = formValues.lastname;
    }

    // Email
    if (formValues.email && this.currentUser.email.trim() !== '') {
      updates.email = formValues.email;
    }

    // Nombre de Usuario
    if (formValues.username && this.currentUser.username.trim() !== '') {
      updates.username = formValues.username;
    }

    // Contraseña (lógica ya existente)
    if (formValues.password && formValues.password.trim() !== '') {
      updates.password = formValues.password;
    }

    if (Object.keys(updates).length === 0) {
      this.successMessage.set("No se detectaron cambios para guardar.");
      this.loading.set(false);
      return;
    }

    // 💡 Nota: Usamos this.currentUser.cc en lugar de this.currentUser.id para la actualización,
    // lo cual coincide con la estructura de tu backend si está diseñada para usar CC como ID de ruta.
    this.profileService.updateProfile(this.currentUser.cc, updates).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Perfil actualizado correctamente.');

        // Sincronizar el modelo local y limpiar el formulario
        if (this.currentUser) {
          // Clonamos el usuario actual y aplicamos las actualizaciones
          this.currentUser = { ...this.currentUser, ...updates };
          // Limpiamos el campo de contraseña
          this.profileForm.get('password')?.reset();
          // Esto asegura que la validación se reinicie
          this.profileForm.markAsPristine();
        }
      },
      error: (err) => {
        console.error('Error de actualización:', err);
        this.loading.set(false);
        this.errorMessage.set('Error al actualizar el perfil. Revise la consola para más detalles.');
      }
    });
  }
}