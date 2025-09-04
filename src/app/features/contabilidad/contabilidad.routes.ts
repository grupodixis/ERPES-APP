import { Routes } from '@angular/router';
import { EjerciciosContablesComponent } from './ejercicios-contables/ejercicios-contables.component';
import { CuentasContablesComponent } from './cuentas-contables/cuentas-contables.component';
import { AsientosContablesComponent } from './asientos-contables/asientos-contables.component';
import { InformesContablesComponent } from './informes-contables/informes-contables.component';

export const CONTABILIDAD_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: 'ejercicios', 
    pathMatch: 'full' 
  },
  { 
    path: 'ejercicios', 
    component: EjerciciosContablesComponent, 
    data: { 
      title: 'Ejercicios Contables',
      description: 'Gestión de períodos contables'
    } 
  },
  { 
    path: 'cuentas', 
    component: CuentasContablesComponent, 
    data: { 
      title: 'Plan Contable',
      description: 'Gestión del plan de cuentas contables'
    } 
  },
  { 
    path: 'asientos', 
    component: AsientosContablesComponent, 
    data: { 
      title: 'Asientos Contables',
      description: 'Registro de movimientos contables'
    } 
  },
  { 
    path: 'ejercicios/:ejercicioId/asientos', 
    component: AsientosContablesComponent, 
    data: { 
      title: 'Asientos Contables',
      description: 'Asientos del ejercicio contable'
    } 
  },
  { 
    path: 'informes', 
    component: InformesContablesComponent, 
    data: { 
      title: 'Informes Contables',
      description: 'Balance de situación y cuenta de pérdidas y ganancias'
    } 
  }
];
