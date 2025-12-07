import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteDeviceDialog } from './delete-device-dialog';
import { MatDialogRef } from '@angular/material/dialog';

describe('DeleteDeviceDialog', () => {
  let component: DeleteDeviceDialog;
  let fixture: ComponentFixture<DeleteDeviceDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DeleteDeviceDialog>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef<DeleteDeviceDialog>', ['close']);

    await TestBed.configureTestingModule({
      imports: [DeleteDeviceDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteDeviceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // PRUEBA: CREACION COMPONENTE
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // PRUEBA: CERRAR EL DIALOGO
  it('deleteDevice debe cerrar el dialogo enviando el ID del dispositivo', () => {
    component.deviceId = 'ABC123';

    component.deleteDevice();

    expect(dialogRefSpy.close).toHaveBeenCalledWith('ABC123');
  });

  // PRUEBA: CERRAR EL DIALOGO SIN ID
  it('deleteDevice debe llamar a close incluso sin ID', () => {
    component.deviceId = '';

    component.deleteDevice();

    expect(dialogRefSpy.close).toHaveBeenCalledWith('');
  });
});
