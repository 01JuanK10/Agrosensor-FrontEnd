import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceForm } from './device-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Device } from '../../../../../../models/device.model';

describe('DeviceForm', () => {
  let component: DeviceForm;
  let fixture: ComponentFixture<DeviceForm>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  const mockDevice: Device = {
    id: '1',
    type: 'esp32',
    active: true,
    location: {
      id: 10,
      latitude: 6.25,
      longitude: -75.56,
      address: 'Calle 10'
    },
    client: {
      id: 55,
      cc: 1234567890
    }
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef<DeviceDialog>', ['close']);

    await TestBed.configureTestingModule({
      imports: [DeviceForm],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceForm);
    component = fixture.componentInstance;
  });

  // PRUEBA: CREACION COMPONENTE
  it('debe crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  //PRUEBA: FORMULARIO VACIO
  it('ngOnInit debe crear el formulario vacío cuando no hay deviceData', () => {
    component.deviceData = null;

    fixture.detectChanges(); // ejecuta ngOnInit

    expect(component.newDevice).toBeTrue();
    expect(component.deviceForm.value.type).toBe('');
    expect(component.deviceForm.value.location.latitude).toBe('');
  });

  // PRUEBA: FORMULARIO LLENO
  it('ngOnInit debe cargar datos en el formulario cuando deviceData tiene información', () => {
    component.deviceData = mockDevice;

    fixture.detectChanges();

    expect(component.newDevice).toBeFalse();
    expect(component.deviceForm.value.id).toBe('1');
    expect(component.deviceForm.value.location.latitude).toBe(6.25);
    expect(component.deviceForm.value.client.cc).toBe(1234567890);
  });

  // PRUEBA: CERRAR DIALOGO INVALIDO
  it('onSubmit no debe cerrar el diálogo si el formulario es inválido', () => {
    fixture.detectChanges();

    component.deviceForm.patchValue({ type: '' }); // invalidamos el form

    component.onSubmit();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  // PRUEBA: CERRAR DIALOGO VALIDO Y ENVIAR INFO
  it('onSubmit debe cerrar el diálogo enviando el dispositivo mapeado', () => {
    component.deviceData = mockDevice;

    fixture.detectChanges();

    component.onSubmit();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      id: '1',
      type: 'esp32',
      active: true,
      location: {
        id: 10,
        latitude: 6.25,
        longitude: -75.56,
        address: 'Calle 10'
      },
      client: {
        id: 55,
        cc: 1234567890
      }
    });
  });
});
