import { Routes } from '@angular/router';
import { PublicHome } from './features/home/public-home/public-home';
import { authGuard } from './features/auth/guard/auth-guard';
import { NotFound } from './features/core/not-found/not-found';
import { AdminPanel } from './features/users/admin/components/admin-panel/admin-panel';
import { ClientPanel } from './features/users/client/client-panel/client-panel';
import { ErosionMap } from './features/users/client/erosion-map/erosion-map';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: PublicHome },
    { path: 'admin',
        data: { role: 'ADMIN' },
        canActivateChild: [authGuard],
        children: [
            { path: 'admin-panel', component: AdminPanel }
        ]
    },
    { path: 'client',
        data: { role: 'CLIENT' },
//        canActivateChild: [authGuard],
        children: [
            { path: 'client-panel', component: ClientPanel,
                children: [
                    { path: 'erosion-map', component: ErosionMap }
                ]
            }
        ]
    },
    {path: '**', component: NotFound }
];
