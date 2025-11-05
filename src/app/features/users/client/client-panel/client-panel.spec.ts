import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPanel } from './client-panel';

describe('ClientPanel', () => {
  let component: ClientPanel;
  let fixture: ComponentFixture<ClientPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
