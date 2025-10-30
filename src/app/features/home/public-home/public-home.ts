import { Component, OnInit } from '@angular/core';
import { PublicTopbar } from '../public-topbar/public-topbar';
import { HomeSlider } from '../home-slider/home-slider';
import { Footer } from '../../core/footer/footer';
import { AuthService } from '../../auth/service/auth-service';

@Component({
  selector: 'app-public-home',
  imports: [PublicTopbar, HomeSlider, Footer],
  templateUrl: './public-home.html',
  styleUrl: './public-home.scss',
})
export class PublicHome implements OnInit {

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.logout();
  }

}
