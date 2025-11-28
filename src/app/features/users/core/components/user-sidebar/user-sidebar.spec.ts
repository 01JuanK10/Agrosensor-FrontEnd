// src/app/features/users/core/components/user-sidebar/user-sidebar.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSidebar } from './user-sidebar';
import { MenuToggle } from '../../services/menu-toggle';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

describe('UserSidebar', () => {
  let component: UserSidebar;
  let fixture: ComponentFixture<UserSidebar>;
  let menuToggleService: MenuToggle;
  let toggleSubject: Subject<void>;

  beforeEach(async () => {
    toggleSubject = new Subject<void>();

    const menuToggleSpy = jasmine.createSpyObj('MenuToggle', ['toggleMenu'], {
      toggle$: toggleSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        UserSidebar,
        RouterTestingModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MenuToggle, useValue: menuToggleSpy }
      ]
    }).compileComponents();

    menuToggleService = TestBed.inject(MenuToggle);
    
    // Mock sessionStorage
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'name') return 'Juan Pérez';
      if (key === 'user_role') return 'CLIENT';
      return null;
    });

    fixture = TestBed.createComponent(UserSidebar);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with collapsed state as true', () => {
      expect(component.collapsed()).toBe(true);
    });

    it('should set default sidenav width to 250px', () => {
      expect(component.sidenavWidth).toBe('250px');
    });

    it('should set default profile picture size to 150px', () => {
      expect(component.profilePictureSize).toBe('150px');
    });

    it('should set showText to block by default', () => {
      expect(component.showText).toBe('block');
    });

    it('should load user name from sessionStorage', () => {
      fixture.detectChanges();
      expect(component.name).toBe('Juan Pérez');
    });

    it('should default to "Usuario" when name not in sessionStorage', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      fixture.detectChanges();
      expect(component.name).toBe('Usuario');
    });

    it('should set role to "Cliente" for CLIENT role', () => {
      fixture.detectChanges();
      expect(component.role).toBe('Cliente');
    });

    it('should set role to "Administrador" for ADMIN role', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'ADMIN';
        if (key === 'name') return 'Admin User';
        return null;
      });
      fixture.detectChanges();
      expect(component.role).toBe('Administrador');
    });

    it('should default to "usuario" for unknown roles', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'UNKNOWN';
        return null;
      });
      fixture.detectChanges();
      expect(component.role).toBe('usuario');
    });
  });

  describe('Menu Toggle Subscription', () => {
    it('should subscribe to menu toggle service on init', () => {
      fixture.detectChanges();
      expect(component['menuToggleService']).toBeTruthy();
    });

    it('should toggle collapsed state when toggle service emits', () => {
      fixture.detectChanges();
      const initialState = component.collapsed();

      toggleSubject.next();

      expect(component.collapsed()).toBe(!initialState);
    });

    it('should call collapsedElements when toggle emits', () => {
      spyOn<any>(component, 'collapsedElements');
      fixture.detectChanges();

      toggleSubject.next();

      expect(component['collapsedElements']).toHaveBeenCalled();
    });

    it('should handle multiple toggle events', () => {
      fixture.detectChanges();
      const initialState = component.collapsed();

      toggleSubject.next();
      toggleSubject.next();

      expect(component.collapsed()).toBe(initialState);
    });
  });

  describe('Collapse/Expand Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should collapse sidebar when called with true', () => {
      component['collapsedElements'](true);

      expect(component.collapsed()).toBe(false);
      expect(component.sidenavWidth).toBe('65px');
      expect(component.profilePictureSize).toBe('50px');
      expect(component.showText).toBe('none');
    });

    it('should expand sidebar when called with false', () => {
      component['collapsedElements'](false);

      expect(component.collapsed()).toBe(true);
      expect(component.sidenavWidth).toBe('250px');
      expect(component.profilePictureSize).toBe('150px');
      expect(component.showText).toBe('block');
    });

    it('should toggle between collapsed and expanded states', () => {
      // Start expanded
      expect(component.sidenavWidth).toBe('250px');

      // Collapse
      component['collapsedElements'](true);
      expect(component.sidenavWidth).toBe('65px');

      // Expand
      component['collapsedElements'](false);
      expect(component.sidenavWidth).toBe('250px');
    });

    it('should update all related properties on collapse', () => {
      component['collapsedElements'](true);

      expect(component.collapsed()).toBe(false);
      expect(component.sidenavWidth).toBe('65px');
      expect(component.profilePictureSize).toBe('50px');
      expect(component.showText).toBe('none');
    });

    it('should update all related properties on expand', () => {
      component['collapsedElements'](true); // First collapse
      component['collapsedElements'](false); // Then expand

      expect(component.collapsed()).toBe(true);
      expect(component.sidenavWidth).toBe('250px');
      expect(component.profilePictureSize).toBe('150px');
      expect(component.showText).toBe('block');
    });
  });

  describe('Menu Items by Role', () => {
    it('should return client menu items for CLIENT role', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems.length).toBe(4);
      expect(menuItems[0].label).toBe('Información Usuario');
      expect(menuItems[1].label).toBe('Mapa');
      expect(menuItems[2].label).toBe('Analíticas');
      expect(menuItems[3].label).toBe('Dashboard');
    });

    it('should return admin menu items for ADMIN role', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'ADMIN';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems.length).toBe(3);
      expect(menuItems[0].label).toBe('Usuarios');
      expect(menuItems[1].label).toBe('Dispositivos');
      expect(menuItems[2].label).toBe('Analíticas');
    });

    it('should return empty array for unknown role', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'UNKNOWN';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems.length).toBe(0);
    });

    it('should include correct icons for client menu items', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems[0].icon).toBe('person');
      expect(menuItems[1].icon).toBe('map');
      expect(menuItems[2].icon).toBe('analytics');
      expect(menuItems[3].icon).toBe('analytics');
    });

    it('should include correct routes for client menu items', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'CLIENT';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems[0].route).toBe('user');
      expect(menuItems[1].route).toBe('erosion-map');
      expect(menuItems[2].route).toBe('analytics');
      expect(menuItems[3].route).toBe('kpis');
    });

    it('should include correct icons for admin menu items', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'ADMIN';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems[0].icon).toBe('group');
      expect(menuItems[1].icon).toBe('wifi_4_bar');
      expect(menuItems[2].icon).toBe('analytics');
    });

    it('should include correct routes for admin menu items', () => {
      (sessionStorage.getItem as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'user_role') return 'ADMIN';
        return null;
      });
      fixture.detectChanges();

      const menuItems = component.getMenuItemsByRole();

      expect(menuItems[0].route).toBe('users');
      expect(menuItems[1].route).toBe('devices');
      expect(menuItems[2].route).toBe('analytics');
    });
  });

  describe('Signal State Management', () => {
    it('should use signal for collapsed state', () => {
      fixture.detectChanges();
      expect(typeof component.collapsed).toBe('function');
      expect(component.collapsed()).toBe(true);
    });

    it('should update collapsed signal correctly', () => {
      fixture.detectChanges();
      
      component['collapsedElements'](true);
      expect(component.collapsed()).toBe(false);

      component['collapsedElements'](false);
      expect(component.collapsed()).toBe(true);
    });

    it('should use signal for client menu items', () => {
      expect(typeof component.menuItemsClient).toBe('function');
      expect(component.menuItemsClient().length).toBe(4);
    });

    it('should use signal for admin menu items', () => {
      expect(typeof component.menuItemsAdmin).toBe('function');
      expect(component.menuItemsAdmin().length).toBe(3);
    });
  });

  describe('UI Rendering', () => {
    it('should render mat-sidenav', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const sidenav = compiled.querySelector('mat-sidenav');
      expect(sidenav).toBeTruthy();
    });

    it('should render mat-nav-list', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const navList = compiled.querySelector('mat-nav-list');
      expect(navList).toBeTruthy();
    });

    it('should render user name', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Juan Pérez');
    });

    it('should render user role', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Cliente');
    });

    it('should render menu items based on role', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const menuItems = compiled.querySelectorAll('a[mat-list-item]');
      expect(menuItems.length).toBe(4); // CLIENT has 4 menu items
    });

    it('should apply correct width styles', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const sidenav = compiled.querySelector('mat-sidenav');
      expect(sidenav.style.width).toBeTruthy();
    });

    it('should hide text when collapsed', () => {
      fixture.detectChanges();
      component['collapsedElements'](true);
      fixture.detectChanges();

      expect(component.showText).toBe('none');
    });

    it('should show text when expanded', () => {
      fixture.detectChanges();
      component['collapsedElements'](false);
      fixture.detectChanges();

      expect(component.showText).toBe('block');
    });
  });

  describe('Router Integration', () => {
    it('should have routerLink on menu items', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const menuLinks = compiled.querySelectorAll('a[routerLink]');
      expect(menuLinks.length).toBeGreaterThan(0);
    });

    it('should have router-outlet in content area', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const routerOutlet = compiled.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sessionStorage values', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      expect(component.name).toBe('Usuario');
      expect(component.role).toBe('usuario');
    });

    it('should handle rapid toggle events', () => {
      fixture.detectChanges();

      for (let i = 0; i < 10; i++) {
        toggleSubject.next();
      }

      expect(component.collapsed()).toBeDefined();
    });

    it('should maintain state consistency during rapid toggles', () => {
      fixture.detectChanges();
      const initialState = component.collapsed();

      // Toggle even number of times
      for (let i = 0; i < 4; i++) {
        toggleSubject.next();
      }

      expect(component.collapsed()).toBe(initialState);
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on destroy', () => {
      fixture.detectChanges();
      
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should not respond to toggle events after destroy', () => {
      fixture.detectChanges();
      const stateBefore = component.collapsed();
      
      fixture.destroy();
      toggleSubject.next();

      // State should not change after destroy
      expect(component.collapsed()).toBe(stateBefore);
    });
  });
});