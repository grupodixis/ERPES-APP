import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Ubicaciones"></app-en-desarrollo>'
})
export class UbicacionesComponent {}