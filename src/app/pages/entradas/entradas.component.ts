import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Entradas"></app-en-desarrollo>'
})
export class EntradasComponent {}