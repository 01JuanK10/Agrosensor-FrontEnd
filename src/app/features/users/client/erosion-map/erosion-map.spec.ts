import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErosionMap } from './erosion-map';

describe('ErosionMap', () => {
  let component: ErosionMap;
  let fixture: ComponentFixture<ErosionMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErosionMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErosionMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
