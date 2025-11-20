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

@Component({
  selector: 'app-devices-management',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './devices-management.html',
  styleUrl: './devices-management.scss',
})

export class DevicesManagement {

  devices: Device[] = [
    { mac: "AA:BB:CC:DD:EE:01", tipo: "ESP32", ubicacion: "Invernadero 1", estado: true, cliente: "Camilo" },
    { mac: "AA:BB:CC:DD:EE:02", tipo: "ESP32", ubicacion: "Invernadero 2", estado: true, cliente: "Andrés" },
    { mac: "AA:BB:CC:DD:EE:03", tipo: "ESP32", ubicacion: "Parcela Norte", estado: true, cliente: "María" },
    { mac: "AA:BB:CC:DD:EE:04", tipo: "ESP32", ubicacion: "Bodega Central", estado: true, cliente: "Sofía" },
    { mac: "AA:BB:CC:DD:EE:05", tipo: "ESP32", ubicacion: "Zona de riego 1", estado: true, cliente: "Juan" },
    { mac: "AA:BB:CC:DD:EE:06", tipo: "ESP32", ubicacion: "Pozo principal", estado: true, cliente: "Carlos" },
    { mac: "AA:BB:CC:DD:EE:07", tipo: "ESP32", ubicacion: "Establo 1", estado: true, cliente: "Valentina" },
    { mac: "AA:BB:CC:DD:EE:08", tipo: "ESP32", ubicacion: "Establo 2", estado: true, cliente: "Samuel" },
    { mac: "AA:BB:CC:DD:EE:09", tipo: "ESP32", ubicacion: "Parcela Sur", estado: true, cliente: "Felipe" },
    { mac: "AA:BB:CC:DD:EE:0A", tipo: "ESP32", ubicacion: "Huerto 1", estado: true, cliente: "Laura" },
    { mac: "AA:BB:CC:DD:EE:0B", tipo: "ESP32", ubicacion: "Huerto 2", estado: true, cliente: "Daniel" },
    { mac: "AA:BB:CC:DD:EE:0C", tipo: "ESP32", ubicacion: "Laboratorio Agrícola", estado: true, cliente: "Paula" },
    { mac: "AA:BB:CC:DD:EE:0D", tipo: "ESP32", ubicacion: "Zona de monitoreo 3", estado: true, cliente: "Fabio" },
    { mac: "AA:BB:CC:DD:EE:0E", tipo: "ESP32", ubicacion: "Control de plagas", estado: true, cliente: "Natalia" },
    { mac: "AA:BB:CC:DD:EE:0F", tipo: "ESP32", ubicacion: "Vivero", estado: true, cliente: "Santiago" },
    { mac: "AA:BB:CC:DD:EE:10", tipo: "ESP32", ubicacion: "Tanque de agua", estado: true, cliente: "Isabella" },
    { mac: "AA:BB:CC:DD:EE:11", tipo: "ESP32", ubicacion: "Cámara de compostaje", estado: true, cliente: "Tomás" },
    { mac: "AA:BB:CC:DD:EE:12", tipo: "ESP32", ubicacion: "Centro de control", estado: true, cliente: "Elena" },
    { mac: "AA:BB:CC:DD:EE:13", tipo: "ESP32", ubicacion: "Sensor remoto A", estado: true, cliente: "Julián" },
    { mac: "AA:BB:CC:DD:EE:14", tipo: "ESP32", ubicacion: "Sensor remoto B", estado: true, cliente: "Manuela" }
  ];

  displayedColumns: string[] = ['MAC', 'Tipo', 'Ubicación', 'Estado', 'Cliente', 'Acciones'];
  dataSource: MatTableDataSource<Device>;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog){
    this.dataSource = new MatTableDataSource(this.devices)
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'MAC': return item.mac;
        case 'Tipo': return item.tipo;
        case 'Ubicación': return item.ubicacion;
        case 'Estado': return item.estado;
        case 'Cliente': return item.cliente;
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
      console.log(`Dialog result: ${result}`);
    });
  }

    abrirEditar(mac: string) {
      const dialogRef = this.dialog.open(DeviceDialog);
      dialogRef.componentInstance.deviceData = this.dataSource.data.filter(d => d.mac === mac)[0];
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }

    abrirEliminar(deviceMac: string) {
      const dialogRef = this.dialog.open(DeleteDeviceDialog);

      dialogRef.componentInstance.deviceMac = deviceMac;
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
/*




    */
}
