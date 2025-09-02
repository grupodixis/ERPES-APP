import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-presupuestos-proveedor',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Presupuestos Proveedor"></app-en-desarrollo>'
})
export class PresupuestosProveedorComponent {}