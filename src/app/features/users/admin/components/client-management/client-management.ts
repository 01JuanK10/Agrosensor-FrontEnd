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
import { User } from '../../../../domain/User';
import { UserDialog } from '../dialogs/user-dialog/user-dialog';
import { ClientService } from '../../../../services/client-service';
import { DeleteUserDialog } from '../dialogs/delete-user-dialog/delete-user-dialog';

@Component({
  selector: 'app-client-management',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './client-management.html',
  styleUrl: './client-management.scss',
})
export class ClientManagement {

  displayedColumns: string[] = ['cc', 'name', 'lastname', 'Acciones'];
  dataSource: MatTableDataSource<User>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  clientService =  inject(ClientService)
  //servicio tambien
  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.users)
  }

  ngOnInit(): void {
    this.loadClients();
  }

    loadClients(): void {
      this.clientService.findAllClients().subscribe({
        next: (data) => {
          this.users = data;
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
        case 'cc': return item.cc;
        case 'name': return item.name;
        case 'lastname': return item.lastname;
        case 'email': return item.email;
        case 'username': return item.username;
        case 'role': return item.role;
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
      const dialogRef = this.dialog.open(UserDialog);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.clientService.registerClient(result).subscribe({
            next: (created) => {
              console.log('Usuario creado: ', created)
              this.loadClients();
            },
            error: (err) => {
              console.error('Error registrando usuario', err);
            }
          });
        }
        console.log(`Dialog result: ${result}`);
      });
    }

    abrirEliminar(id: number) {
      console.log('ID recibido en el componente padre antes de abrir el diálogo:', id);
      if (!id) {
        console.error('ERROR: No se pudo obtener el ID del dispositivo para eliminar.');
        return;
      }
      const dialogRef = this.dialog.open(DeleteUserDialog);
      dialogRef.componentInstance.clientId = id;
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.clientService.deleteClient(id).subscribe({
            next: () => {
              console.log("Cliente eliminado correctamente");
              this.loadClients();
            },
            error: (err) => {
              console.log("Error eliminando cliente", err);
            }
          })
          //this.loadDevices();
        }
        console.log(`Dialog result: ${result}`);
      });
    }

}
