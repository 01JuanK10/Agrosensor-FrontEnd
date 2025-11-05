import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from "@angular/router";
import { MenuToggle } from '../../services/menu-toggle';
import { AuthService } from '../../../../auth/service/auth-service';

@Component({
  selector: 'app-user-topbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './user-topbar.html',
  styleUrl: './user-topbar.scss',
})
export class UserTopbar {
  private menuToggleService = inject(MenuToggle);

  constructor(private auth: AuthService) { }
  
  onMenuToggle(): void {
    this.menuToggleService.toggleMenu();
  }

  exitApp(): void {
    this.auth.logout();
  }
}
