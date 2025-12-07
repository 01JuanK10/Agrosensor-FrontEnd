import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Device } from '../../../../domain/Device';
import { DeviceDialog } from '../dialogs/device-dialog/device-dialog';
import { DeleteDeviceDialog } from '../dialogs/delete-device-dialog/delete-device-dialog';
import { DeviceService } from '../../../../services/device.service';

@Component({
  selector: 'app-devices-management',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './devices-management.html',
  styleUrl: './devices-management.scss',
})

export class DevicesManagement {

  devices: Device[] = [];

  displayedColumns: string[] = ['id', 'type', 'location', 'active', 'client', 'Acciones'];
  dataSource: MatTableDataSource<Device>;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog, private deviceService: DeviceService) {
    this.dataSource = new MatTableDataSource(this.devices)
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    
    this.deviceService.getDevices().subscribe({
      next: (data) => {
        this.devices = data;
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Error cargando dispositivos', err);
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'id': return item.id;
        case 'type': return item.type;
        case 'location': return item.location.address;
        case 'active': return item.active ? 'Activo' : 'Inactivo';
        //case 'client': return item.client.name + ' ' + item.client.lastname;
        case 'client': return item.client;
        default: return (item as any)[property];
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  abrirAgregar() {
    const dialogRef = this.dialog.open(DeviceDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deviceService.createDevice(result).subscribe({
          next: (created) => {
            console.log('Dispositivo creado: ', created)
            this.loadDevices();
          },
          error: (err) => {
            console.error('Error creando dispositivo', err);
          }
        });
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  abrirEditar(deviceId: string) {
    const dialogRef = this.dialog.open(DeviceDialog);
    dialogRef.componentInstance.deviceData = this.devices.find(d => d.id === deviceId) || null;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deviceService.updateDevice(deviceId, result).subscribe({
          next: () => {
            console.log("Dispositivo actualizado correctamente");
            this.loadDevices();
          },
          error: err => {
            console.error("Error actualizando el dispositivo", err);
          }
        })
      }
      console.log(`Dialog result: ${result}`);
    });
  }

  abrirEliminar(deviceId: string) {
    console.log('ID recibido en el componente padre antes de abrir el diálogo:', deviceId);
    if (!deviceId) {
      console.error('ERROR: No se pudo obtener el ID del dispositivo para eliminar.');
      return;
    }

    const dialogRef = this.dialog.open(DeleteDeviceDialog);
    dialogRef.componentInstance.deviceId = deviceId;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deviceService.deleteDevice(result).subscribe({
          next: () => {
            console.log("Dispositivo eliminado correctamente");
            this.loadDevices();
          },
          error: (err) => {
            console.log("Error eliminando dispotivo", err);
          }
        })
        //this.loadDevices();
      }
      console.log(`Dialog result: ${result}`);
    });
  }
}
