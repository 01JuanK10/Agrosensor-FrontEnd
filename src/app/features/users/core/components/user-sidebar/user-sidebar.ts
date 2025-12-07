import { Component, computed, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MenuToggle } from '../../services/menu-toggle';
import { ProfileUpdateService } from '../../../../services/profile-update-service';


export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
}

@Component({
  selector: 'app-user-sidebar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterOutlet, RouterLink],
  templateUrl: './user-sidebar.html',
  styleUrl: './user-sidebar.scss',
})
export class UserSidebar {
  @ViewChild('snav') snav!: MatSidenav;
  menuToggleService = inject(MenuToggle);
  profileUpdateService = inject(ProfileUpdateService);

  collapsed = signal(true);
  sidenavWidth: string = '250px';
  profilePictureSize: string = '150px';
  showText: string = 'block'
  name = 'usuario';
  role = 'usuario'
  
  updateName = computed<string | null> (() => {
    return this.profileUpdateService.userState();
  });
  
  ngOnInit(): void {
    this.menuToggleService.toggle$.subscribe(() => {
      this.collapsedElements(this.collapsed());
    });

    this.name = this.updateName() || 'Usuario';

    if(sessionStorage.getItem('user_role') === 'CLIENT'){
      this.role = 'Cliente';
    }else if(sessionStorage.getItem('user_role') === 'ADMIN'){
      this.role = 'Administrador';
    }

  }  

  private collapsedElements(collapsed: boolean) {
      if (collapsed) {
        this.collapsed.set(false);
        this.sidenavWidth = '65px';
        this.profilePictureSize = '50px';
        this.showText = 'none'
      }else{
        this.collapsed.set(true);
        this.profilePictureSize = '150px';
        this.sidenavWidth = '250px';
        this.showText = 'block'
      }

  }
  
  menuItemsClient = signal<MenuItem[]>([
    {
      icon: 'person',
      label: 'Información Usuario',
      route: 'user'
    },
    {
      icon: 'map',
      label: 'Mapa',
      route: 'erosion-map'
    },
    {
      icon: 'analytics',
      label: 'Dashboard',
      route: 'kpis'
    }
  ]);

  menuItemsAdmin = signal<MenuItem[]>([
    {
      icon: 'group',
      label: 'Usuarios',
      route: 'users'
    },
    {
      icon: 'wifi_4_bar',
      label: 'Dispositivos',
      route: 'devices'
    },
    {
      icon: 'person',
      label: 'Información Usuario',
      route: 'user'
    },
  ]);

  getMenuItemsByRole(): MenuItem[] {
    const role = sessionStorage.getItem('user_role');
    if (role === 'ADMIN') {
      return this.menuItemsAdmin();
    } else if (role === 'CLIENT') {
      return this.menuItemsClient();
    } else {
      return [];
    } 
  }
}
