import { Component } from '@angular/core';
import { EnDesarrolloComponent } from '../../shared/components/en-desarrollo/en-desarrollo.component';

@Component({
  selector: 'app-pedidos-cliente',
  standalone: true,
  imports: [EnDesarrolloComponent],
  template: '<app-en-desarrollo titulo="Pedidos Cliente"></app-en-desarrollo>'
})
export class PedidosClienteComponent {}