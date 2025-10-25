import { Routes } from '@angular/router';
import { PublicHome } from './features/home/public-home/public-home';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: PublicHome }
];
