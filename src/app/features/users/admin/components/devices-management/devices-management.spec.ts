import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevicesManagement } from './devices-management';
import { MatDialog } from '@angular/material/dialog';
import { DeviceService } from '../../../../services/device.service';
import { of, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// 1. Define Mocks y Spies fuera del beforeEach
let deviceServiceSpy: jasmine.SpyObj<DeviceService>;
let matDialogSpy: jasmine.SpyObj<MatDialog>;

describe('DevicesManagement', () => {
  let component: DevicesManagement;
  let fixture: ComponentFixture<DevicesManagement>;

  // Datos mock para usar en las pruebas
  const mockDevices = [
    {
      id: '1',
      type: 'Sensor',
      active: true,
      location: {
        id: 10,
        latitude: 6.25,
        longitude: -75.56,
        address: 'Calle 10'
      },
      client: {
        id: 55,
        cc: 1234567890,
        name: 'juan',
        lastname: 'alzate'
      }
    } as any,
    {
      id: '2',
      type: 'esp32',
      active: false,
      location: {
        id: 20,
        latitude: 56.25,
        longitude: -795.56,
        address: 'Calle 20'
      },
      client: {
        id: 50,
        cc: 1234567891,
        name: 'camilo',
        lastname: 'bedoya'
      }
    } as any,
  ];

  beforeEach(async () => {
    // 2. Crea los Spies (objetos que simulan los servicios)
    deviceServiceSpy = jasmine.createSpyObj('DeviceService', [
      'getDevices',
      'createDevice',
      'updateDevice',
      'deleteDevice'
    ]);

    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // 3. Configura el TestBed
    await TestBed.configureTestingModule({
      imports: [DevicesManagement], // Usamos el componente standalone directamente
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy },
      ],
    }).compileComponents();

    const setupDialogRefMock = (result: any = null, error: any = null) => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
      if (error) {
        dialogRefSpy.afterClosed.and.returnValue(throwError(() => error));
      } else {
        dialogRefSpy.afterClosed.and.returnValue(of(result));
      }
      // Aseguramos que el método open del diálogo devuelva nuestro mock de referencia
      matDialogSpy.open.and.returnValue(dialogRefSpy as any);
      return dialogRefSpy;
    };

    fixture = TestBed.createComponent(DevicesManagement);
    component = fixture.componentInstance;

    // 4. Inicializa los ViewChilds para evitar errores de objetos nulos
    component.paginator = jasmine.createSpyObj('MatPaginator', ['firstPage']) as MatPaginator;
    component.sort = {} as MatSort;

    // 5. Configura el mock para el servicio getDevices por defecto
    deviceServiceSpy.getDevices.and.returnValue(of(mockDevices));
    deviceServiceSpy.createDevice.and.returnValue(of(mockDevices[0] as any));
    deviceServiceSpy.updateDevice.and.returnValue(of(mockDevices[0]));
    deviceServiceSpy.deleteDevice.and.returnValue(of(undefined));
  });

  // PRUEBA: CREACION COMPONENTE
  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // PRUEBA: INICIALIZACIÓN
  it('debe llamar a loadDevices al inicializarse (ngOnInit)', () => {
    expect(component.devices.length).toBe(0); // Antes de detectChanges

    fixture.detectChanges(); // Esto llama a ngOnInit

    expect(deviceServiceSpy.getDevices).toHaveBeenCalledTimes(1);
    expect(component.devices.length).toBe(mockDevices.length);
    expect(component.dataSource.data.length).toBe(mockDevices.length);
  });

  // PRUEBA: CARGAR DATOS EN LA LISTA
  it('loadDevices debe actualizar la lista y dataSource al recibir datos (Éxito)', () => {
    // Aseguramos que los datos se han cargado en la inicialización
    fixture.detectChanges();
    expect(component.dataSource.data.length).toBe(mockDevices.length);
  });
});