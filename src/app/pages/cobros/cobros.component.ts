import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-cobros',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Cobros"></app-en-desarrollo>'
})
export class CobrosComponent {}