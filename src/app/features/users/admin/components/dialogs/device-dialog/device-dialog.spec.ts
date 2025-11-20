import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDialog } from './device-dialog';

describe('DeviceDialog', () => {
  let component: DeviceDialog;
  let fixture: ComponentFixture<DeviceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
