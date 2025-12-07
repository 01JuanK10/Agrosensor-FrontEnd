import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeviceDialog } from './device-dialog';
import { Device } from '../../../../../../models/device.model';

describe('DeviceDialog', () => {
  let component: DeviceDialog;
  let fixture: ComponentFixture<DeviceDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DeviceDialog>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef<DeviceDialog>', ['close']);

    await TestBed.configureTestingModule({
      imports: [DeviceDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // PRUEBA: CREACION COMPONENTE
  it('componente debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // PRUEBA: CERRAR EL DIALOGO
  it('onUpdatedDevice debe cerrar el diálogo enviando el dispositivo', () => {
    const mockDevice: Device = {
      id: '1',
      type: 'esp32',
      active: true,
      location: {
        id: 100,
        latitude: 6.2442,
        longitude: -75.5812,
        address: 'Calle 10 #20-30'
      },
      client: {
        id: 50,
        cc: 1234567890
      }
    };

    component.onUpdatedDevice(mockDevice);

    expect(dialogRefSpy.close).toHaveBeenCalledWith(mockDevice);
  });

  // PRUEBA: INICIALIZACION DE DEVICEDATA
  it('deviceData debe iniciar en null', () => {
    expect(component.deviceData).toBeNull();
  });
});
