import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTopbar } from './public-topbar';

describe('PublicTopbar', () => {
  let component: PublicTopbar;
  let fixture: ComponentFixture<PublicTopbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTopbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicTopbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
