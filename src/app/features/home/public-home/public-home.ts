import { Component, OnInit } from '@angular/core';
import { PublicTopbar } from '../public-topbar/public-topbar';
import { HomeSlider } from '../home-slider/home-slider';

@Component({
  selector: 'app-public-home',
  imports: [PublicTopbar, HomeSlider],
  templateUrl: './public-home.html',
  styleUrl: './public-home.scss',
})
export class PublicHome implements OnInit {

  ngOnInit(): void {
    
  }

}
