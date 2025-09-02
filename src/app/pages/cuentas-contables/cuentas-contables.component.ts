import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-cuentas-contables',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: `
    <app-en-desarrollo 
      titulo="Cuentas Contables"
      descripcion="Gestión del plan contable y cuentas del sistema">
    </app-en-desarrollo>
  `
})
export class CuentasContablesComponent {

}