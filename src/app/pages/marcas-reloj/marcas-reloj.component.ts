import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-marcas-reloj',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Marcas de Reloj"></app-en-desarrollo>'
})
export class MarcasRelojComponent {}