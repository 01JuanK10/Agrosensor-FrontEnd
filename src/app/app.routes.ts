import { Routes } from '@angular/router';
import { PublicHome } from './features/home/public-home/public-home';
import { authGuard } from './features/auth/guard/auth-guard';
import { NotFound } from './features/core/not-found/not-found';
import { AdminPanel } from './features/users/admin/components/admin-panel/admin-panel';
import { ClientPanel } from './features/users/client/client-panel/client-panel';
import { ErosionMap } from './features/users/client/erosion-map/erosion-map';
import { UserResetPassword } from './features/users/core/components/user-reset-password/user-reset-password';
import { DevicesManagement } from './features/users/admin/components/devices-management/devices-management';
import { NotificationsPanel } from './features/users/client/notifications-panel/notifications-panel';
import { KpisPanel } from './features/users/client/kpis-panel/kpis-panel';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: PublicHome },
    { path: 'admin',
        data: { role: 'ADMIN' },
        canActivateChild: [authGuard],
        children: [
            { path: 'admin-panel', component: AdminPanel, 
                children: [
                    {path: 'devices', component: DevicesManagement }
                ]
            }
        ]
    },
    { path: 'client',
        data: { role: 'CLIENT' },
        canActivateChild: [authGuard],
        children: [
            { path: 'client-panel', component: ClientPanel,
                children: [
                    { path: 'erosion-map', component: ErosionMap },
                    { path: 'notifications', component: NotificationsPanel },
                    { path: 'kpis', component: KpisPanel }
                ]
            }
        ]
    },
    { path: 'reset-password', component: UserResetPassword },
    {path: '**', component: NotFound }
];
