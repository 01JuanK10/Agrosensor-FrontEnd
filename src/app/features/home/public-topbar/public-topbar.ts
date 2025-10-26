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
  cantidadModalsAbiertos: number = 0;
  abrirModal(): void {
    if (this.cantidadModalsAbiertos > 0) {
      this._matDialog.closeAll();
      this.cantidadModalsAbiertos = 0;
      return;
    }
    this._matDialog.open(Login, { 
        width: '800px',
        height: 'auto',
        position: { top: '100px'},
        exitAnimationDuration: '200ms',
        disableClose: true
      } 
    );
    this.cantidadModalsAbiertos++;
  }

  cerrarModal(): void {
    this._matDialog.closeAll();
    this.cantidadModalsAbiertos = 0;
  }
}
