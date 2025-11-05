import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { interval, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-slider',
  standalone: true,
  templateUrl: './home-slider.html',
  styleUrls: ['./home-slider.scss'],
})
export class HomeSlider implements OnInit, OnDestroy {

  // Signal para la imagen actual
  $imagenActual = signal('/assets/home/background1.webp');

  // Signal para el texto actual
  $textoActual = signal('Suelo sano, suelo fuerte.');

  // Arreglos de imágenes y textos
  imagenes = [
    '/assets/home/background1.webp',
    '/assets/home/background2.webp'
  ];

  textos = [
    'Suelo sano, suelo fuerte.',
    'Anticipando la erosión, protegiendo la tierra.'
  ];

  private intervalSubscription!: Subscription;

  ngOnInit(): void {
    this.intervalSubscription = interval(10000)
      .pipe(
        map(count => count % this.imagenes.length)
      )
      .subscribe(index => {
        this.$imagenActual.set(this.imagenes[index]);
        this.$textoActual.set(this.textos[index]);
      });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
