import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth/service/auth-service';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound implements OnInit {
  authService = inject(AuthService);

  ngOnInit() {
    this.authService.logout();
  }
}
