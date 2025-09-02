import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-trabajos-a-realizar',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Trabajos a Realizar"></app-en-desarrollo>'
})
export class TrabajosARealizarComponent {}