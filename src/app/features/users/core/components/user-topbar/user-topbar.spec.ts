// src/app/features/users/core/components/user-topbar/user-topbar.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTopbar } from './user-topbar';
import { AuthService } from '../../../../auth/service/auth-service';
import { MenuToggle } from '../../services/menu-toggle';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserTopbar', () => {
  let component: UserTopbar;
  let fixture: ComponentFixture<UserTopbar>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let menuToggleServiceSpy: jasmine.SpyObj<MenuToggle>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const menuSpy = jasmine.createSpyObj('MenuToggle', ['toggleMenu']);

    await TestBed.configureTestingModule({
      imports: [
        UserTopbar,
        RouterTestingModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MenuToggle, useValue: menuSpy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    menuToggleServiceSpy = TestBed.inject(MenuToggle) as jasmine.SpyObj<MenuToggle>;
    router = TestBed.inject(Router);

    // Mock sessionStorage
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user_role') return 'CLIENT';
      if (key === 'name') return 'Juan Pérez';
      return null;
    });

    fixture = TestBed.createComponent(UserTopbar);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should inject AuthService', () => {
      expect(component['auth']).toBeTruthy();
    });

    it('should inject MenuToggle service', () => {
      expect(component['menuToggleService']).toBeTruthy();
    });

    it('should render toolbar', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const toolbar = compiled.querySelector('mat-toolbar');
      expect(toolbar).toBeTruthy();
    });

    it('should render logo image', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const logo = compiled.querySelector('img[alt="Logo"]');
      expect(logo).toBeTruthy();
      expect(logo.getAttribute('src')).toBe('assets/logo.png');
    });

    it('should render app name', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('AgroSensor');
    });
  });

  describe('Menu Toggle', () => {
    it('should call menuToggleService.toggleMenu on button click', () => {
      fixture.detectChanges();
      const menuButton = fixture.nativeElement.querySelector('button[matTooltip="Abrir menú"]');
      
      menuButton.click();

      expect(menuToggleServiceSpy.toggleMenu).toHaveBeenCalled();
    });

    it('should call onMenuToggle method when menu button is clicked', () => {
      spyOn(component, 'onMenuToggle');
      fixture.detectChanges();

      const menuButton = fixture.nativeElement.querySelector('button[matTooltip="Abrir menú"]');
      menuButton.click();

      expect(component.onMenuToggle).toHaveBeenCalled();
    });

    it('should render menu icon button', () => {
      fixture.detectChanges();
      const menuButton = fixture.nativeElement.querySelector('button mat-icon');
      expect(menuButton.textContent).toContain('menu');
    });

    it('should have correct tooltip on menu button', () => {
      fixture.detectChanges();
      const menuButton = fixture.nativeElement.querySelector('button[matTooltip="Abrir menú"]');
      expect(menuButton).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('should call auth.logout when exitApp is called', () => {
      component.exitApp();

      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should call exitApp when logout button is clicked', () => {
      spyOn(component, 'exitApp');
      fixture.detectChanges();

      const logoutButton = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"]');
      logoutButton.click();

      expect(component.exitApp).toHaveBeenCalled();
    });

    it('should render logout icon', () => {
      fixture.detectChanges();
      const logoutIcon = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"] mat-icon');
      expect(logoutIcon.textContent).toContain('logout');
    });

    it('should have correct tooltip on logout button', () => {
      fixture.detectChanges();
      const logoutButton = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"]');
      expect(logoutButton).toBeTruthy();
    });
  });

  describe('Role-based UI Display', () => {
    describe('CLIENT Role', () => {
      beforeEach(() => {
        (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
          if (key === 'user_role') return 'CLIENT';
          return null;
        });
      });

      it('should return true for isClientRole when user is CLIENT', () => {
        fixture.detectChanges();
        expect(component.isClientRole()).toBe(true);
      });

      it('should display notifications button for CLIENT role', () => {
        fixture.detectChanges();
        const notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
        expect(notificationButton).toBeTruthy();
      });

      it('should have notifications icon for CLIENT', () => {
        fixture.detectChanges();
        const notificationIcon = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"] mat-icon');
        expect(notificationIcon.textContent).toContain('notifications');
      });

      it('should have correct routerLink on notifications button', () => {
        fixture.detectChanges();
        const notificationButton = fixture.nativeElement.querySelector('button[routerLink="/client/client-panel/notifications"]');
        expect(notificationButton).toBeTruthy();
      });

      it('should apply active-notification class when route is active', () => {
        fixture.detectChanges();
        const notificationButton = fixture.nativeElement.querySelector('button[routerLinkActive="active-notification"]');
        expect(notificationButton).toBeTruthy();
      });
    });

    describe('ADMIN Role', () => {
      beforeEach(() => {
        (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
          if (key === 'user_role') return 'ADMIN';
          return null;
        });
      });

      it('should return false for isClientRole when user is ADMIN', () => {
        fixture.detectChanges();
        expect(component.isClientRole()).toBe(false);
      });

      it('should not display notifications button for ADMIN role', () => {
        fixture.detectChanges();
        const notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
        expect(notificationButton).toBeFalsy();
      });

      it('should still display logout button for ADMIN', () => {
        fixture.detectChanges();
        const logoutButton = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"]');
        expect(logoutButton).toBeTruthy();
      });

      it('should still display menu button for ADMIN', () => {
        fixture.detectChanges();
        const menuButton = fixture.nativeElement.querySelector('button[matTooltip="Abrir menú"]');
        expect(menuButton).toBeTruthy();
      });
    });

    describe('Unknown Role', () => {
      beforeEach(() => {
        (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
          if (key === 'user_role') return null;
          return null;
        });
      });

      it('should return false for isClientRole when role is null', () => {
        fixture.detectChanges();
        expect(component.isClientRole()).toBe(false);
      });

      it('should not display notifications button when role is null', () => {
        fixture.detectChanges();
        const notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
        expect(notificationButton).toBeFalsy();
      });
    });
  });

  describe('Button Styling and Layout', () => {
    it('should render all buttons with mat-icon-button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // Menu + Logout minimum
    });

    it('should apply example-icon class to buttons', () => {
      fixture.detectChanges();
      const menuButton = fixture.nativeElement.querySelector('button.example-icon');
      expect(menuButton).toBeTruthy();
    });

    it('should have example-spacer for layout', () => {
      fixture.detectChanges();
      const spacer = fixture.nativeElement.querySelector('.example-spacer');
      expect(spacer).toBeTruthy();
    });

    it('should position notifications button with margin for CLIENT', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
      expect(notificationButton.style.margin).toBeTruthy();
    });

    it('should position logout button with margin', () => {
      fixture.detectChanges();
      const logoutButton = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"]');
      expect(logoutButton.style.margin).toBeTruthy();
    });
  });

  describe('Logo and Branding', () => {
    it('should have correct logo dimensions', () => {
      fixture.detectChanges();
      const logo = fixture.nativeElement.querySelector('img[alt="Logo"]');
      expect(logo.getAttribute('width')).toBe('34');
      expect(logo.getAttribute('height')).toBe('32');
    });

    it('should display "A" in orange color', () => {
      fixture.detectChanges();
      const orangeA = fixture.nativeElement.querySelector('.bold-text[style*="color: #F59E0B"]');
      expect(orangeA).toBeTruthy();
      expect(orangeA.textContent).toContain('A');
    });

    it('should display "S" in orange color', () => {
      fixture.detectChanges();
      const orangeSpans = fixture.nativeElement.querySelectorAll('.bold-text[style*="color: #F59E0B"]');
      expect(orangeSpans.length).toBe(2);
      expect(orangeSpans[1].textContent).toContain('S');
    });

    it('should have routerLink on brand', () => {
      fixture.detectChanges();
      const brand = fixture.nativeElement.querySelector('.navbar-brand[routerLink="/inicio"]');
      expect(brand).toBeTruthy();
    });

    it('should display complete "AgroSensor" text', () => {
      fixture.detectChanges();
      const brand = fixture.nativeElement.querySelector('.navbar-brand');
      expect(brand.textContent).toContain('AgroSensor');
    });
  });

  describe('Toolbar Structure', () => {
    it('should have mat-elevation-z3 class', () => {
      fixture.detectChanges();
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar.mat-elevation-z3');
      expect(toolbar).toBeTruthy();
    });

    it('should contain menu button as first element', () => {
      fixture.detectChanges();
      const firstButton = fixture.nativeElement.querySelector('mat-toolbar button');
      const icon = firstButton.querySelector('mat-icon');
      expect(icon.textContent).toContain('menu');
    });

    it('should render buttons in correct order', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Menu, Notifications, Logout
    });
  });

  describe('Accessibility', () => {
    it('should have tooltips on all action buttons', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const buttonsWithTooltip = fixture.nativeElement.querySelectorAll('button[matTooltip]');
      expect(buttonsWithTooltip.length).toBeGreaterThanOrEqual(3);
    });

    it('should have alt text on logo image', () => {
      fixture.detectChanges();
      const logo = fixture.nativeElement.querySelector('img');
      expect(logo.getAttribute('alt')).toBe('Logo');
    });

    it('should have mat-icon for visual feedback', () => {
      fixture.detectChanges();
      const icons = fixture.nativeElement.querySelectorAll('mat-icon');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Navigation', () => {
    it('should have correct routerLink for home/inicio', () => {
      fixture.detectChanges();
      const homeLink = fixture.nativeElement.querySelector('a[routerLink="/inicio"]');
      expect(homeLink).toBeTruthy();
    });

    it('should have correct routerLink for notifications', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const notificationsLink = fixture.nativeElement.querySelector('[routerLink="/client/client-panel/notifications"]');
      expect(notificationsLink).toBeTruthy();
    });

    it('should use routerLinkActive for notifications', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const notificationsButton = fixture.nativeElement.querySelector('[routerLinkActive="active-notification"]');
      expect(notificationsButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sessionStorage gracefully', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle empty string role', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return '';
        return null;
      });
      fixture.detectChanges();

      expect(component.isClientRole()).toBe(false);
    });

    it('should handle rapid logout clicks', () => {
      fixture.detectChanges();
      const logoutButton = fixture.nativeElement.querySelector('button[matTooltip="Cerrar sesión"]');

      logoutButton.click();
      logoutButton.click();
      logoutButton.click();

      expect(authServiceSpy.logout).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid menu toggle clicks', () => {
      fixture.detectChanges();
      const menuButton = fixture.nativeElement.querySelector('button[matTooltip="Abrir menú"]');

      menuButton.click();
      menuButton.click();
      menuButton.click();

      expect(menuToggleServiceSpy.toggleMenu).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup properly on destroy', () => {
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should maintain state after change detection', () => {
      fixture.detectChanges();
      const initialRole = component.isClientRole();

      fixture.detectChanges();
      fixture.detectChanges();

      expect(component.isClientRole()).toBe(initialRole);
    });
  });

  describe('Integration Tests', () => {
    it('should work with AuthService integration', () => {
      fixture.detectChanges();
      component.exitApp();

      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should work with MenuToggle integration', () => {
      fixture.detectChanges();
      component.onMenuToggle();

      expect(menuToggleServiceSpy.toggleMenu).toHaveBeenCalled();
    });

    it('should render correctly for both roles', () => {
      // Test CLIENT
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();
      let notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
      expect(notificationButton).toBeTruthy();

      // Reset and test ADMIN
      fixture.destroy();
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'ADMIN';
        return null;
      });
      fixture = TestBed.createComponent(UserTopbar);
      component = fixture.componentInstance;
      fixture.detectChanges();
      notificationButton = fixture.nativeElement.querySelector('button[matTooltip="Notificaciones"]');
      expect(notificationButton).toBeFalsy();
    });
  });
});