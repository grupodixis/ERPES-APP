import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ObrasService } from './obras.service';
import {
  Obra,
  CapituloObra,
  PartidaObra,
  OrdenTrabajo,
  EstadoObra,
  EstadoCapitulo,
  EstadoPartida,
  EstadoOrdenTrabajo
} from '../../domain/obras.types';

interface TreeNode {
  id: number;
  nombre: string;
  tipo: 'capitulo' | 'partida' | 'orden';
  nivel: number;
  expandible: boolean;
  expandido: boolean;
  data: CapituloObra | PartidaObra | OrdenTrabajo;
  children?: TreeNode[];
}

@Component({
  selector: 'app-obra-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTreeModule
  ],
  templateUrl: './obra-detail.component.html',
  styleUrls: ['./obra-detail.component.scss']
})
export class ObraDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  obra: Obra | null = null;
  capitulos: CapituloObra[] = [];
  partidas: { [capituloId: number]: PartidaObra[] } = {};
  ordenes: { [partidaId: number]: OrdenTrabajo[] } = {};
  
  treeData: TreeNode[] = [];
  cargando = false;
  editando = false;
  
  obraForm: FormGroup;
  tabSeleccionada = 0;
  
  // Columnas para las tablas
  columnasCapitulos = ['codigo', 'nombre', 'descripcion', 'estado', 'presupuesto', 'acciones'];
  columnasPartidas = ['codigo', 'nombre', 'descripcion', 'cantidad', 'precio', 'total', 'estado', 'acciones'];
  columnasOrdenes = ['codigo', 'descripcion', 'fechaInicio', 'fechaFin', 'estado', 'responsable', 'acciones'];
  
  // Estados disponibles
  estadosObra = ['Planificacion', 'EnCurso', 'Pausada', 'Finalizada', 'Cancelada'];
  estadosCapitulo = ['Pendiente', 'EnCurso', 'Finalizada', 'Cancelada'];
  estadosPartida = ['Pendiente', 'EnCurso', 'Finalizada', 'Cancelada'];
  estadosOrden = ['Creada', 'Asignada', 'EnCurso', 'Finalizada', 'Cancelada'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private obrasService: ObrasService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.obraForm = this.crearFormulario();
  }

  ngOnInit(): void {
    const obraId = Number(this.route.snapshot.paramMap.get('id'));
    if (obraId) {
      this.cargarObra(obraId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: [''],
      estado: ['Planificacion', [Validators.required]],
      fechaInicio: [null],
      fechaFinPrevista: [null],
      presupuestoTotal: [0, [Validators.min(0)]],
      clienteId: [null, [Validators.required]],
      responsableId: [null, [Validators.required]],
      ubicacion: [''],
      observaciones: [''],
      esProvisional: [false]
    });
  }

  private cargarObra(id: number): void {
    this.cargando = true;
    
    forkJoin({
      obra: this.obrasService.getObraById(id),
      capitulos: this.obrasService.getCapitulosByObra(id)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ obra, capitulos }) => {
        if (obra) {
          this.obra = obra;
          this.capitulos = capitulos;
          this.actualizarFormulario();
          this.cargarEstructuraCompleta();
        } else {
          this.mostrarError('Obra no encontrada');
          this.router.navigate(['/obras']);
        }
        this.cargando = false;
      },
      error: (error) => {
        this.mostrarError('Error al cargar la obra');
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  private cargarEstructuraCompleta(): void {
    // Cargar partidas para cada capítulo
    const partidasPromises = this.capitulos.map(capitulo => 
      this.obrasService.getPartidasByCapitulo(capitulo.id)
    );
    
    forkJoin(partidasPromises).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (partidasArrays) => {
        // Organizar partidas por capítulo
        this.capitulos.forEach((capitulo, index) => {
          this.partidas[capitulo.id] = partidasArrays[index];
        });
        
        // Cargar órdenes para cada partida
        this.cargarOrdenesTrabajo();
      },
      error: (error) => {
        console.error('Error al cargar partidas:', error);
      }
    });
  }

  private cargarOrdenesTrabajo(): void {
    const todasLasPartidas = Object.values(this.partidas).flat();
    const ordenesPromises = todasLasPartidas.map(partida => 
      this.obrasService.getOrdenesByPartida(partida.id)
    );
    
    if (ordenesPromises.length === 0) {
      this.construirArbolJerarquico();
      return;
    }
    
    forkJoin(ordenesPromises).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ordenesArrays) => {
        // Organizar órdenes por partida
        todasLasPartidas.forEach((partida, index) => {
          this.ordenes[partida.id] = ordenesArrays[index];
        });
        
        this.construirArbolJerarquico();
      },
      error: (error) => {
        console.error('Error al cargar órdenes de trabajo:', error);
        this.construirArbolJerarquico();
      }
    });
  }

  private construirArbolJerarquico(): void {
    this.treeData = this.capitulos.map(capitulo => {
      const nodoCapitulo: TreeNode = {
        id: capitulo.id,
        nombre: `${capitulo.codigo} - ${capitulo.nombre}`,
        tipo: 'capitulo',
        nivel: 0,
        expandible: true,
        expandido: false,
        data: capitulo,
        children: []
      };
      
      const partidasCapitulo = this.partidas[capitulo.id] || [];
      nodoCapitulo.children = partidasCapitulo.map(partida => {
        const nodoPartida: TreeNode = {
          id: partida.id,
          nombre: `${partida.codigo} - ${partida.nombre}`,
          tipo: 'partida',
          nivel: 1,
          expandible: true,
          expandido: false,
          data: partida,
          children: []
        };
        
        const ordenesPartida = this.ordenes[partida.id] || [];
        nodoPartida.children = ordenesPartida.map(orden => ({
          id: orden.id,
          nombre: `${orden.codigo} - ${orden.descripcion}`,
          tipo: 'orden' as const,
          nivel: 2,
          expandible: false,
          expandido: false,
          data: orden
        }));
        
        return nodoPartida;
      });
      
      return nodoCapitulo;
    });
  }

  private actualizarFormulario(): void {
    if (this.obra) {
      this.obraForm.patchValue({
        codigo: this.obra.codigo,
        nombre: this.obra.nombre,
        estado: this.obra.estado,
        fechaInicio: this.obra.fechaInicioReal,
        fechaFinPrevista: this.obra.fechaFinPrevista,
        presupuestoTotal: this.obra.presupuestoObjetivo,
        clienteId: this.obra.clienteId,
        responsableId: this.obra.responsableId
      });
    }
  }

  // Métodos de acción
  toggleEdicion(): void {
    this.editando = !this.editando;
    if (!this.editando) {
      this.actualizarFormulario(); // Restaurar valores originales
    }
  }

  guardarCambios(): void {
    if (this.obraForm.valid && this.obra) {
      const datosActualizados = {
        ...this.obraForm.value,
        fechaInicioReal: this.obraForm.value.fechaInicio,
        presupuestoObjetivo: this.obraForm.value.presupuestoTotal
      };
      
      this.obrasService.actualizarObra(this.obra.id, datosActualizados)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (obraActualizada) => {
            this.obra = obraActualizada;
            this.editando = false;
            this.mostrarExito('Obra actualizada correctamente');
          },
          error: (error) => {
            this.mostrarError('Error al actualizar la obra');
            console.error('Error:', error);
          }
        });
    }
  }

  volver(): void {
    this.router.navigate(['/obras']);
  }

  // Métodos para gestión de capítulos, partidas y órdenes
  agregarCapitulo(): void {
    // TODO: Implementar diálogo para agregar capítulo
    console.log('Agregar capítulo');
  }

  editarCapitulo(capitulo: CapituloObra): void {
    // TODO: Implementar diálogo para editar capítulo
    console.log('Editar capítulo:', capitulo);
  }

  eliminarCapitulo(capituloId: number): void {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar capítulo:', capituloId);
  }

  agregarPartida(capituloId: number): void {
    // TODO: Implementar diálogo para agregar partida
    console.log('Agregar partida al capítulo:', capituloId);
  }

  editarPartida(partida: PartidaObra): void {
    // TODO: Implementar diálogo para editar partida
    console.log('Editar partida:', partida);
  }

  eliminarPartida(partidaId: number): void {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar partida:', partidaId);
  }

  agregarOrdenTrabajo(partidaId: number): void {
    // TODO: Implementar diálogo para agregar orden de trabajo
    console.log('Agregar orden de trabajo a partida:', partidaId);
  }

  editarOrdenTrabajo(orden: OrdenTrabajo): void {
    // TODO: Implementar diálogo para editar orden de trabajo
    console.log('Editar orden de trabajo:', orden);
  }

  editarOrdenTrabajoFromNode(node: TreeNode): void {
    if (node.tipo === 'orden') {
      this.editarOrdenTrabajo(node.data as OrdenTrabajo);
    }
  }

  isOrdenTrabajo(node: TreeNode): boolean {
    return node.tipo === 'orden';
  }

  getOrdenFechaInicio(node: TreeNode): Date | undefined {
    if (node.tipo === 'orden') {
      return (node.data as OrdenTrabajo).fechaInicioPrevista;
    }
    return undefined;
  }

  isPartida(node: TreeNode): boolean {
    return node.tipo === 'partida';
  }

  calcularTotalPartidaFromNode(node: TreeNode): number {
    if (node.tipo === 'partida') {
      return this.calcularTotalPartida(node.data as PartidaObra);
    }
    return 0;
  }

  editarPartidaFromNode(node: TreeNode): void {
    if (node.tipo === 'partida') {
      this.editarPartida(node.data as PartidaObra);
    }
  }

  isCapitulo(node: TreeNode): boolean {
    return node.tipo === 'capitulo';
  }

  editarCapituloFromNode(node: TreeNode): void {
    if (node.tipo === 'capitulo') {
      this.editarCapitulo(node.data as CapituloObra);
    }
  }

  getPartidaCantidad(node: TreeNode): number {
    if (node.tipo === 'partida') {
      return (node.data as PartidaObra).cantidad;
    }
    return 0;
  }

  eliminarOrdenTrabajo(ordenId: number): void {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar orden de trabajo:', ordenId);
  }

  // Métodos auxiliares
  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'PLANIFICACION': 'Planificación',
      'EN_CURSO': 'En Curso',
      'SUSPENDIDA': 'Suspendida',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada',
      'PENDIENTE': 'Pendiente',
      'COMPLETADA': 'Completada'
    };
    return labels[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado.toLowerCase().replace('_', '')}`;
  }

  calcularTotalCapitulo(capituloId: number): number {
    const partidasCapitulo = this.partidas[capituloId] || [];
    return partidasCapitulo.reduce((total, partida) => {
      return total + (partida.cantidad * partida.precioUnitario);
    }, 0);
  }

  calcularTotalPartida(partida: PartidaObra): number {
    return partida.cantidad * partida.precioUnitario;
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}