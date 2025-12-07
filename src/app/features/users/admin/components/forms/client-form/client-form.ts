import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../../domain/User';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserDialog } from '../../dialogs/user-dialog/user-dialog';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss',
})
export class ClientForm implements OnInit {
  clientForm!: FormGroup;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<UserDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      cc: [''],
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (!this.clientForm.valid) {
      console.log('Formulario inválido');
      return;
    }

    const form = this.clientForm.value;

    const user: User = {
      id: null,
      cc: form.cc,
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      username: form.username,
      password: form.password,
      role: form.role
    };
    console.log("Dispositivo enviado: ", user);
    this.dialogRef.close(user);
    //(window as any).clientFormSubmit = device;
  }
}
