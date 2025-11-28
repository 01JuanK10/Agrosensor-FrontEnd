import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpisPanel } from './kpis-panel';

describe('KpisPanel', () => {
  let component: KpisPanel;
  let fixture: ComponentFixture<KpisPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpisPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpisPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
