import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Subject, takeUntil, switchMap, of, EMPTY } from 'rxjs';

import { PresupuestosService } from '../../services/presupuestos.service';
import {
  Presupuesto,
  CapituloArbol,
  Partida,
  EstadoPresupuesto,
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
  CreateCapituloDto,
  CreatePartidaDto,
  NodoArbol,
  EstadoEditor
} from '../../../../domain/presupuestos.types';

// Interfaz para nodos del árbol aplanado
interface NodoArbolFlat {
  expandable: boolean;
  id: number;
  tipo: 'capitulo' | 'partida';
  codigo: string;
  nombre: string;
  nivel: number;
  totalConIva: number;
  seleccionado: boolean;
  editando?: boolean;
  codigoTemporal?: string;
  nombreTemporal?: string;
  unidades?: number;
  unidadesTemporal?: number;
  precioUnitario?: number;
  precioUnitarioTemporal?: number;
  expandido?: boolean;
}

@Component({
  selector: 'app-presupuesto-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTreeModule,
    MatMenuModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './presupuesto-editor.component.html',
  styleUrls: ['./presupuesto-editor.component.scss']
})
export class PresupuestoEditorComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  // Signals
  readonly presupuesto = signal<Presupuesto | null>(null);
  readonly arbolCapitulos = signal<CapituloArbol[]>([]);
  readonly loading = computed(() => this.presupuestosService.loading());
  readonly error = computed(() => this.presupuestosService.error());
  readonly estadoEditor = signal<EstadoEditor>({
    presupuestoId: 0,
    modoEdicion: 'presupuesto',
    cambiosPendientes: false
  });

  // Formulario
  presupuestoForm!: FormGroup;
  readonly estadosPresupuesto: EstadoPresupuesto[] = ['Borrador', 'Enviado', 'Aceptado', 'Rechazado', 'Cancelado'];
  readonly esNuevo = signal(false);

  // Árbol de capítulos y partidas
  private transformer = (node: CapituloArbol | Partida, level: number): NodoArbolFlat => {
    const esCapitulo = 'hijos' in node;
    const partida = node as Partida;
    return {
      expandable: esCapitulo && node.hijos.length > 0,
      id: node.id,
      tipo: esCapitulo ? 'capitulo' : 'partida',
      codigo: node.codigo,
      nombre: node.nombre,
      nivel: level,
      totalConIva: esCapitulo ? node.totalConIva : partida.totalConIva,
      seleccionado: false,
      editando: false,
      codigoTemporal: undefined,
      nombreTemporal: undefined,
      unidades: esCapitulo ? undefined : partida.unidades,
      unidadesTemporal: undefined,
      precioUnitario: esCapitulo ? undefined : partida.precioUnitario,
      precioUnitarioTemporal: undefined,
      expandido: true
    };
  };

  treeControl = new FlatTreeControl<NodoArbolFlat>(
    node => node.nivel,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.nivel,
    node => node.expandable,
    node => {
      const result: (CapituloArbol | Partida)[] = [];
      if ('hijos' in node) {
        result.push(...node.hijos);
        result.push(...node.partidas);
      }
      return result;
    }
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // Propiedades para la grilla
  selectedCell: { node: NodoArbolFlat; field: string } | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadPresupuesto();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.presupuestoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', Validators.maxLength(1000)],
      clienteId: [null, Validators.required],
      estado: ['Borrador', Validators.required],
      fechaValidez: [null],
      observaciones: ['', Validators.maxLength(2000)]
    });

    // Detectar cambios en el formulario
    this.presupuestoForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.estadoEditor.update(estado => ({
          ...estado,
          cambiosPendientes: this.presupuestoForm.dirty
        }));
      });
  }

  private loadPresupuesto(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id === 'nuevo') {
      this.esNuevo.set(true);
      this.estadoEditor.update(estado => ({
        ...estado,
        presupuestoId: 0,
        modoEdicion: 'presupuesto'
      }));
      return;
    }

    if (id) {
      const presupuestoId = parseInt(id, 10);
      this.estadoEditor.update(estado => ({
        ...estado,
        presupuestoId
      }));

      // Cargar presupuesto
      this.presupuestosService.getPresupuesto(presupuestoId)
        .pipe(
          takeUntil(this.destroy$),
          switchMap(presupuesto => {
            if (presupuesto) {
              this.presupuesto.set(presupuesto);
              this.populateForm(presupuesto);
              // Cargar árbol de capítulos
              return this.presupuestosService.getCapitulosArbol(presupuestoId);
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: (arbol) => {
            this.arbolCapitulos.set(arbol);
            this.dataSource.data = arbol;
            this.treeControl.expandAll();
          },
          error: (error) => {
            console.error('Error cargando presupuesto:', error);
            this.showError('Error al cargar el presupuesto');
          }
        });
    }
  }

  private populateForm(presupuesto: Presupuesto): void {
    this.presupuestoForm.patchValue({
      codigo: presupuesto.codigo,
      nombre: presupuesto.nombre,
      descripcion: presupuesto.descripcion,
      clienteId: presupuesto.clienteId,
      estado: presupuesto.estado,
      fechaValidez: presupuesto.fechaValidez,
      observaciones: presupuesto.observaciones
    });
    this.presupuestoForm.markAsPristine();
  }

  // ===== ACCIONES DEL FORMULARIO =====

  onSubmit(): void {
    if (this.presupuestoForm.valid) {
      const formValue = this.presupuestoForm.value;
      
      if (this.esNuevo()) {
        this.createPresupuesto(formValue);
      } else {
        this.updatePresupuesto(formValue);
      }
    } else {
      this.markFormGroupTouched();
      this.showError('Por favor, corrija los errores en el formulario');
    }
  }

  private createPresupuesto(formValue: any): void {
    const dto: CreatePresupuestoDto = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      clienteId: formValue.clienteId,
      fechaValidez: formValue.fechaValidez,
      observaciones: formValue.observaciones,
      empresaId: 1 // Mock
    };

    this.presupuestosService.createPresupuesto(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (presupuesto) => {
          this.presupuesto.set(presupuesto);
          this.esNuevo.set(false);
          this.estadoEditor.update(estado => ({
            ...estado,
            presupuestoId: presupuesto.id,
            cambiosPendientes: false
          }));
          this.presupuestoForm.markAsPristine();
          this.showSuccess('Presupuesto creado correctamente');
          // Navegar a la URL del presupuesto creado
          this.router.navigate(['/presupuestos/editor', presupuesto.id], { replaceUrl: true });
        },
        error: (error) => {
          console.error('Error creando presupuesto:', error);
          this.showError('Error al crear el presupuesto');
        }
      });
  }

  private updatePresupuesto(formValue: any): void {
    const presupuestoActual = this.presupuesto();
    if (!presupuestoActual) return;

    const dto: UpdatePresupuestoDto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      clienteId: formValue.clienteId,
      estado: formValue.estado,
      fechaValidez: formValue.fechaValidez,
      observaciones: formValue.observaciones
    };

    this.presupuestosService.updatePresupuesto(presupuestoActual.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (presupuesto) => {
          this.presupuesto.set(presupuesto);
          this.estadoEditor.update(estado => ({
            ...estado,
            cambiosPendientes: false
          }));
          this.presupuestoForm.markAsPristine();
          this.showSuccess('Presupuesto actualizado correctamente');
        },
        error: (error) => {
          console.error('Error actualizando presupuesto:', error);
          this.showError('Error al actualizar el presupuesto');
        }
      });
  }

  onCancel(): void {
    if (this.estadoEditor().cambiosPendientes) {
      if (confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
  }

  private navigateBack(): void {
    this.router.navigate(['/presupuestos']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.presupuestoForm.controls).forEach(key => {
      this.presupuestoForm.get(key)?.markAsTouched();
    });
  }

  // ===== ACCIONES DEL ÁRBOL =====

  hasChild = (_: number, node: NodoArbolFlat) => node.expandable;

  // Métodos para la grilla
  getFlattenedNodes(): NodoArbolFlat[] {
    const allNodes = this.treeControl.dataNodes;
    const visibleNodes: NodoArbolFlat[] = [];
    
    for (const node of allNodes) {
      if (node.nivel === 0 || this.isParentExpanded(node, allNodes)) {
        visibleNodes.push(node);
      }
    }
    
    return visibleNodes;
  }
  
  private isParentExpanded(node: NodoArbolFlat, allNodes: NodoArbolFlat[]): boolean {
    // Si es un nodo de nivel 0 (capítulo principal), siempre es visible
    if (node.nivel === 0) {
      return true;
    }

    // Para nodos de nivel superior, necesitamos encontrar su padre real
    const parentNode = this.findParentNode(node, allNodes);
    
    if (!parentNode) {
      return false;
    }

    // Verificar si el padre está expandido
    const isExpanded = this.treeControl.isExpanded(parentNode);
    
    if (!isExpanded) {
      return false;
    }
    
    // Recursivamente verificar que todos los ancestros estén expandidos
    return this.isParentExpanded(parentNode, allNodes);
  }
  
  private findParentNode(node: NodoArbolFlat, allNodes: NodoArbolFlat[]): NodoArbolFlat | null {
    // Para partidas, buscar el capítulo al que pertenecen
    if (node.tipo === 'partida') {
      // Buscar en los datos originales para encontrar el capítulo padre
      const arbol = this.arbolCapitulos();
      for (const capitulo of arbol) {
        if (this.findPartidaInCapitulo(capitulo, node.id)) {
          return allNodes.find(n => n.id === capitulo.id && n.tipo === 'capitulo') || null;
        }
      }
    }
    
    // Para capítulos, buscar el capítulo padre basándose en los datos originales
    if (node.tipo === 'capitulo') {
      const arbol = this.arbolCapitulos();
      for (const capitulo of arbol) {
        const foundChild = this.findCapituloInChildren(capitulo, node.id);
        if (foundChild) {
          return allNodes.find(n => n.id === capitulo.id && n.tipo === 'capitulo') || null;
        }
      }
    }
    
    return null;
  }
  
  private findPartidaInCapitulo(capitulo: CapituloArbol, partidaId: number): boolean {
    // Buscar en las partidas directas del capítulo
    if (capitulo.partidas?.some(p => p.id === partidaId)) {
      return true;
    }
    
    // Buscar recursivamente en los hijos
    if (capitulo.hijos) {
      for (const hijo of capitulo.hijos) {
        if (this.findPartidaInCapitulo(hijo, partidaId)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private findCapituloInChildren(capitulo: CapituloArbol, capituloId: number): boolean {
    if (capitulo.hijos) {
      return capitulo.hijos.some(hijo => hijo.id === capituloId);
    }
    return false;
  }



  onNodeClick(node: NodoArbolFlat): void {
    console.log('onNodeClick called with node:', node);
    
    // Si hay otro nodo en edición, cancelar su edición
    this.cancelarEdicionActiva();
    
    // Iniciar edición del nodo clickeado
    this.iniciarEdicion(node);
    
    console.log('Node after iniciarEdicion:', node);
    
    if (node.tipo === 'capitulo') {
      this.estadoEditor.update(estado => ({
        ...estado,
        capituloSeleccionado: node.id,
        partidaSeleccionada: undefined,
        modoEdicion: 'presupuesto'
      }));
    } else {
      this.estadoEditor.update(estado => ({
        ...estado,
        partidaSeleccionada: node.id,
        modoEdicion: 'partida'
      }));
    }
  }

  onAddCapitulo(parentId?: number): void {
    const presupuestoId = this.estadoEditor().presupuestoId;
    if (!presupuestoId) {
      this.showError('No se puede crear capítulo: presupuesto no válido');
      return;
    }

    const nuevoCapitulo: CreateCapituloDto = {
      codigo: `CAP-${Date.now()}`,
      nombre: 'Nuevo Capítulo',
      descripcion: '',
      presupuestoId: this.presupuesto()?.id || 0,
      capituloPadreId: parentId || undefined
    };

    this.presupuestosService.createCapitulo(nuevoCapitulo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (capitulo) => {
          this.showSuccess('Capítulo creado correctamente');
          
          // Recargar el árbol para obtener los datos actualizados
          this.reloadArbol();
          
          // Después de recargar, expandir el capítulo padre si existe y encontrar el nodo
          setTimeout(() => {
            // Expandir el capítulo padre si existe
            if (parentId) {
              const capituloPadre = this.treeControl.dataNodes.find(n => n.id === parentId && n.tipo === 'capitulo');
              if (capituloPadre && !this.treeControl.isExpanded(capituloPadre)) {
                this.treeControl.expand(capituloPadre);
              }
            }
            
            // Encontrar el nodo creado y establecer la edición
            const flatNodes = this.getFlattenedNodes();
            const nodoCreado = flatNodes.find(n => n.id === capitulo.id && n.tipo === 'capitulo');
            if (nodoCreado) {
              this.selectedCell = { node: nodoCreado, field: 'codigo' };
              this.iniciarEdicion(nodoCreado);
            }
          }, 100);
          
          this.cdr.detectChanges();
          
          // Enfocar el primer campo editable después de un breve delay
          setTimeout(() => {
            const codigoInput = document.querySelector('.cell-input') as HTMLInputElement;
            if (codigoInput) {
              codigoInput.focus();
              codigoInput.select();
            }
          }, 50);
        },
        error: (error) => {
          console.error('Error creando capítulo:', error);
          this.showError('Error al crear el capítulo');
        }
      });
  }

  onAddPartida(capituloId: number): void {
    const presupuestoId = this.estadoEditor().presupuestoId;
    if (!presupuestoId) {
      this.showError('No se puede crear partida: presupuesto no válido');
      return;
    }

    const nuevaPartida: CreatePartidaDto = {
      codigo: `PART-${Date.now()}`,
      nombre: 'Nueva Partida',
      descripcion: '',
      presupuestoId: this.presupuesto()?.id || 0,
      capituloId: capituloId,
      unidadMedidaId: 1, // Mock
      cantidad: 1,
      precio: 0
    };

    this.presupuestosService.createPartida(nuevaPartida)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (partida) => {
          this.showSuccess('Partida creada correctamente');
          
          // Recargar el árbol para obtener los datos actualizados
          this.reloadArbol();
          
          // Después de recargar, expandir el capítulo padre y encontrar el nodo
          setTimeout(() => {
            // Expandir el capítulo padre
            const capituloPadre = this.treeControl.dataNodes.find(n => n.id === capituloId && n.tipo === 'capitulo');
            if (capituloPadre && !this.treeControl.isExpanded(capituloPadre)) {
              this.treeControl.expand(capituloPadre);
            }
            
            // Encontrar el nodo creado y establecer la edición
            const flatNodes = this.getFlattenedNodes();
            const nodoCreado = flatNodes.find(n => n.id === partida.id && n.tipo === 'partida');
            if (nodoCreado) {
              this.selectedCell = { node: nodoCreado, field: 'codigo' };
              this.iniciarEdicion(nodoCreado);
            }
          }, 100);
          
          this.cdr.detectChanges();
          
          // Enfocar el primer campo editable después de un breve delay
          setTimeout(() => {
            const codigoInput = document.querySelector('.cell-input') as HTMLInputElement;
            if (codigoInput) {
              codigoInput.focus();
              codigoInput.select();
            }
          }, 50);
        },
        error: (error) => {
          console.error('Error creando partida:', error);
          this.showError('Error al crear la partida');
        }
      });
  }

  onEditNode(node: NodoArbolFlat): void {
    this.iniciarEdicion(node);
  }

  onEditPartidas(capituloId: number): void {
    // Navegar a la pantalla de edición de partidas del capítulo
    this.router.navigate(['/presupuestos', this.presupuesto()?.id, 'capitulos', capituloId, 'partidas']);
  }

  onInsertPartida(node: NodoArbolFlat): void {
    // Si es un capítulo, insertar partida en ese capítulo
    // Si es una partida, insertar en el mismo capítulo
    let capituloId: number;
    
    if (node.tipo === 'capitulo') {
      capituloId = node.id;
    } else {
      // Buscar el capítulo padre de la partida
      const capituloParent = this.encontrarCapituloPadre(node.id);
      if (!capituloParent) {
        this.showError('No se pudo encontrar el capítulo padre');
        return;
      }
      capituloId = capituloParent;
    }
    
    this.onAddPartida(capituloId);
  }

  toggleExpand(node: NodoArbolFlat): void {
    this.treeControl.toggle(node);
  }

  iniciarEdicion(node: NodoArbolFlat): void {
    // Marcar el nodo como en edición y guardar valores temporales
    node.editando = true;
    node.codigoTemporal = node.codigo;
    node.nombreTemporal = node.nombre;
    if (node.tipo === 'partida') {
      node.unidadesTemporal = node.unidades;
      node.precioUnitarioTemporal = node.precioUnitario;
    }
    node.seleccionado = true;
    
    // Forzar actualización del dataSource para que Angular detecte los cambios
    this.dataSource.data = [...this.dataSource.data];
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  cancelarEdicionActiva(): void {
    // Cancelar edición en todos los nodos planos del árbol
    const flatNodes = this.treeControl.dataNodes;
    let hasChanges = false;
    flatNodes.forEach(node => {
      if (node.editando) {
        node.editando = false;
        node.seleccionado = false;
        delete node.codigoTemporal;
        delete node.nombreTemporal;
        delete node.unidadesTemporal;
        delete node.precioUnitarioTemporal;
        hasChanges = true;
      }
    });
    
    // Forzar actualización del dataSource si hubo cambios
    if (hasChanges) {
      this.dataSource.data = [...this.dataSource.data];
      this.cdr.detectChanges();
    }
  }

  cancelarEdicionActivaExcepto(nodoExcepcion: NodoArbolFlat): void {
    // Cancelar edición en todos los nodos planos del árbol excepto el especificado
    const flatNodes = this.treeControl.dataNodes;
    let hasChanges = false;
    flatNodes.forEach(node => {
      if (node.editando && node.id !== nodoExcepcion.id) {
        node.editando = false;
        node.seleccionado = false;
        delete node.codigoTemporal;
        delete node.nombreTemporal;
        delete node.unidadesTemporal;
        delete node.precioUnitarioTemporal;
        hasChanges = true;
      }
    });
    
    // Forzar actualización del dataSource si hubo cambios
    if (hasChanges) {
      this.dataSource.data = [...this.dataSource.data];
      this.cdr.detectChanges();
    }
  }



  guardarEdicion(node: NodoArbolFlat): void {
    if (!node.codigoTemporal?.trim() || !node.nombreTemporal?.trim()) {
      this.showError('El código y nombre son obligatorios');
      return;
    }

    const updateData: any = {
      codigo: node.codigoTemporal.trim(),
      nombre: node.nombreTemporal.trim()
    };

    // Agregar campos específicos de partidas
    if (node.tipo === 'partida') {
      updateData.unidades = node.unidadesTemporal || 0;
      updateData.precioUnitario = node.precioUnitarioTemporal || 0;
    }

    if (node.tipo === 'capitulo') {
      this.presupuestosService.updateCapitulo(node.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            node.codigo = updateData.codigo;
            node.nombre = updateData.nombre;
            node.editando = false;
            node.seleccionado = false;
            delete node.codigoTemporal;
            delete node.nombreTemporal;
            this.showSuccess('Capítulo actualizado correctamente');
            // Forzar actualización del dataSource
             this.dataSource.data = [...this.dataSource.data];
             this.cdr.detectChanges();
            this.reloadArbol();
          },
          error: (error) => {
            console.error('Error al actualizar capítulo:', error);
            this.showError('Error al actualizar el capítulo');
          }
        });
    } else {
      this.presupuestosService.updatePartida(node.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            node.codigo = updateData.codigo;
            node.nombre = updateData.nombre;
            if (node.tipo === 'partida') {
              node.unidades = updateData.unidades;
              node.precioUnitario = updateData.precioUnitario;
              // Recalcular total automáticamente
              this.recalcularTotalPartida(node);
            }
            node.editando = false;
            node.seleccionado = false;
            delete node.codigoTemporal;
            delete node.nombreTemporal;
            delete node.unidadesTemporal;
            delete node.precioUnitarioTemporal;
            this.showSuccess('Partida actualizada correctamente');
            
            // Recalcular totales de capítulos padre y presupuesto
            this.recalcularTotalesCompletos();
          },
          error: (error) => {
            console.error('Error al actualizar partida:', error);
            this.showError('Error al actualizar la partida');
          }
        });
    }
  }

  cancelarEdicion(node: NodoArbolFlat): void {
    node.editando = false;
    node.seleccionado = false;
    delete node.codigoTemporal;
    delete node.nombreTemporal;
    delete node.unidadesTemporal;
    delete node.precioUnitarioTemporal;
    
    // Forzar actualización del dataSource
    this.dataSource.data = [...this.dataSource.data];
    this.cdr.detectChanges();
  }

  onKeyDown(event: KeyboardEvent, node: NodoArbolFlat): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.guardarEdicion(node);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelarEdicion(node);
    }
  }

  onDeleteNode(node: NodoArbolFlat): void {
    const tipoTexto = node.tipo === 'capitulo' ? 'el capítulo' : 'la partida';
    const mensaje = `¿Está seguro de que desea eliminar ${tipoTexto} "${node.nombre}"?`;
    
    if (confirm(mensaje)) {
      if (node.tipo === 'capitulo') {
        this.deleteCapitulo(node.id);
      } else {
        this.deletePartida(node.id);
      }
    }
  }

  private deleteCapitulo(id: number): void {
    this.presupuestosService.deleteCapitulo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Capítulo eliminado correctamente');
          this.reloadArbol();
          // Recalcular totales después de eliminar
          setTimeout(() => {
            this.recalcularTotalesCompletos();
          }, 100);
        },
        error: (error) => {
          console.error('Error eliminando capítulo:', error);
          this.showError('Error al eliminar el capítulo');
        }
      });
  }

  private deletePartida(id: number): void {
    this.presupuestosService.deletePartida(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Partida eliminada correctamente');
          this.reloadArbol();
          // Recalcular totales después de eliminar
          setTimeout(() => {
            this.recalcularTotalesCompletos();
          }, 100);
        },
        error: (error) => {
          console.error('Error eliminando partida:', error);
          this.showError('Error al eliminar la partida');
        }
      });
  }

  private reloadArbol(): void {
    const presupuestoId = this.estadoEditor().presupuestoId;
    if (presupuestoId) {
      // Guardar el estado de expansión actual
      const expandedNodes = new Set<number>();
      this.treeControl.dataNodes.forEach(node => {
        if (this.treeControl.isExpanded(node)) {
          expandedNodes.add(node.id);
        }
      });

      this.presupuestosService.getCapitulosArbol(presupuestoId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(arbol => {
          this.arbolCapitulos.set(arbol);
          this.dataSource.data = arbol;
          
          // Restaurar el estado de expansión después de que el árbol se haya actualizado
          setTimeout(() => {
            this.treeControl.dataNodes.forEach(node => {
              if (expandedNodes.has(node.id)) {
                this.treeControl.expand(node);
              }
            });
          }, 0);
        });
    }
  }

  // ===== ACCIONES ADICIONALES =====

  onDuplicatePresupuesto(): void {
    const presupuestoActual = this.presupuesto();
    if (!presupuestoActual) return;

    const nuevoCodigo = prompt('Código del nuevo presupuesto:', `${presupuestoActual.codigo}-COPIA`);
    const nuevoNombre = prompt('Nombre del nuevo presupuesto:', `${presupuestoActual.nombre} (Copia)`);
    
    if (nuevoCodigo && nuevoNombre) {
      this.presupuestosService.duplicarPresupuesto(presupuestoActual.id, nuevoCodigo, nuevoNombre)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (nuevoPres) => {
            this.showSuccess('Presupuesto duplicado correctamente');
            this.router.navigate(['/presupuestos/editor', nuevoPres.id]);
          },
          error: (error) => {
            console.error('Error duplicando presupuesto:', error);
            this.showError('Error al duplicar el presupuesto');
          }
        });
    }
  }

  onExportPresupuesto(): void {
    // TODO: Implementar exportación
    this.showInfo('Funcionalidad de exportación en desarrollo');
  }

  onPrintPresupuesto(): void {
    // TODO: Implementar impresión
    this.showInfo('Funcionalidad de impresión en desarrollo');
  }

  // ===== UTILIDADES =====

  getNodeIcon(node: NodoArbolFlat): string {
    return node.tipo === 'capitulo' ? 'folder' : 'description';
  }

  getNodeColor(node: NodoArbolFlat): string {
    return node.seleccionado ? 'primary' : '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  getEstadoColor(estado: EstadoPresupuesto): string {
    const colores = {
      'Borrador': 'accent',
      'Enviado': 'primary',
      'Aceptado': 'primary',
      'Rechazado': 'warn',
      'Cancelado': 'warn'
    };
    return colores[estado] || '';
  }

  // ===== MENSAJES =====

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  // ===== GETTERS PARA TEMPLATE =====

  get totalSinIva(): number {
    return this.presupuesto()?.totalSinIva || 0;
  }

  get totalIva(): number {
    return this.presupuesto()?.totalIva || 0;
  }

  get totalConIva(): number {
    return this.presupuesto()?.totalConIva || 0;
  }

  get numeroCapitulos(): number {
    return this.arbolCapitulos().length;
  }

  get numeroPartidas(): number {
    return this.arbolCapitulos().reduce((total, cap) => {
      return total + this.contarPartidasRecursivo(cap);
    }, 0);
  }

  private contarPartidasRecursivo(capitulo: CapituloArbol): number {
    let total = capitulo.partidas.length;
    for (const hijo of capitulo.hijos) {
      total += this.contarPartidasRecursivo(hijo);
    }
    return total;
  }

  // ===== MÉTODOS DE CÁLCULO AUTOMÁTICO =====
  
  private recalcularTotalPartida(node: NodoArbolFlat): void {
    if (node.tipo === 'partida' && node.unidades && node.precioUnitario) {
      const totalSinIva = node.unidades * node.precioUnitario;
      const totalIva = totalSinIva * 0.21; // IVA del 21%
      node.totalConIva = totalSinIva + totalIva;
    }
  }
  
  private recalcularTotalesCompletos(): void {
    // Recalcular todos los totales de partidas
    this.treeControl.dataNodes.forEach(node => {
      if (node.tipo === 'partida') {
        this.recalcularTotalPartida(node);
      }
    });
    
    // Recalcular totales de capítulos
    this.recalcularTotalesCapitulos();
    
    // Actualizar la vista
    this.dataSource.data = [...this.dataSource.data];
    this.cdr.detectChanges();
  }
  
  private recalcularTotalesCapitulos(): void {
    const capitulosMap = new Map<number, NodoArbolFlat[]>();
    
    // Agrupar partidas por capítulo padre
    this.treeControl.dataNodes.forEach(node => {
      if (node.tipo === 'partida') {
        // Encontrar el capítulo padre de esta partida
        const capituloId = this.encontrarCapituloPadre(node.id);
        if (capituloId) {
          if (!capitulosMap.has(capituloId)) {
            capitulosMap.set(capituloId, []);
          }
          capitulosMap.get(capituloId)!.push(node);
        }
      }
    });
    
    // Calcular totales para cada capítulo
    capitulosMap.forEach((partidas, capituloId) => {
      const totalCapitulo = partidas.reduce((sum, partida) => sum + (partida.totalConIva || 0), 0);
      
      // Actualizar el total del capítulo en el dataSource
      const capituloNode = this.treeControl.dataNodes.find(node => node.id === capituloId && node.tipo === 'capitulo');
      if (capituloNode) {
        capituloNode.totalConIva = totalCapitulo;
      }
    });
  }
  
  private encontrarCapituloPadre(partidaId: number): number | null {
    // Esta función debería encontrar el ID del capítulo padre de una partida
    // Por ahora, implementamos una lógica básica
    // En una implementación real, esto dependería de la estructura de datos
    const arbol = this.arbolCapitulos();
    for (const capitulo of arbol) {
      if (this.buscarPartidaEnCapitulo(capitulo, partidaId)) {
        return capitulo.id;
      }
    }
    return null;
  }
  
  private buscarPartidaEnCapitulo(capitulo: CapituloArbol, partidaId: number): boolean {
    // Buscar en partidas directas
    if (capitulo.partidas.some(p => p.id === partidaId)) {
      return true;
    }
    
    // Buscar en capítulos hijos
    for (const hijo of capitulo.hijos) {
      if (this.buscarPartidaEnCapitulo(hijo, partidaId)) {
        return true;
      }
    }
    
    return false;
  }
}