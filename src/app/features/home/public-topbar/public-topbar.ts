import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import { Login } from '../../login/login/login';

@Component({
  selector: 'app-public-topbar',
  imports: [RouterLink, MatButtonModule, MatDialogModule],
  templateUrl: './public-topbar.html',
  styleUrl: './public-topbar.scss',
})
export class PublicTopbar {

  constructor(private _matDialog: MatDialog) {}
  
  abrirModal(): void {
    this._matDialog.open(Login, {
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

}
