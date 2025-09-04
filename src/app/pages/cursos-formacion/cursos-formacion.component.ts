import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { OperariosService } from '../../services/operarios.service';
import { CursoFormacion, FormacionOperario } from '../../domain/rrhh.types';

@Component({
  selector: 'app-cursos-formacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule
  ],
  templateUrl: './cursos-formacion.component.html',
  styleUrls: ['./cursos-formacion.component.scss']
})
export class CursosFormacionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('cursoDialog') cursoDialog!: TemplateRef<any>;
  @ViewChild('inscripcionDialog') inscripcionDialog!: TemplateRef<any>;

  displayedColumnsCursos: string[] = ['nombre', 'descripcion', 'duracion', 'modalidad', 'fechaInicio', 'estado', 'acciones'];
  displayedColumnsInscripciones: string[] = ['operario', 'curso', 'fechaInscripcion', 'estado', 'calificacion', 'acciones'];
  
  dataSourceCursos = new MatTableDataSource<CursoFormacion>();
  dataSourceInscripciones = new MatTableDataSource<FormacionOperario>();
  
  cursoForm: FormGroup;
  inscripcionForm: FormGroup;
  filtroForm: FormGroup;
  
  loading = false;
  editingCurso: CursoFormacion | null = null;
  editingInscripcion: FormacionOperario | null = null;
  
  totalCursos = 0;
  cursosActivos = 0;
  totalInscripciones = 0;
  inscripcionesCompletadas = 0;
  
  modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'mixta', label: 'Mixta' }
  ];
  
  estadosCurso = [
    { value: 'planificado', label: 'Planificado' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];
  
  estadosInscripcion = [
    { value: 'inscrito', label: 'Inscrito' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completado', label: 'Completado' },
    { value: 'abandonado', label: 'Abandonado' }
  ];

  constructor(
    private fb: FormBuilder,
    private operariosService: OperariosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.cursoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      duracion: [0, [Validators.required, Validators.min(1)]],
      modalidad: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      instructor: ['', Validators.required],
      capacidadMaxima: [0, [Validators.required, Validators.min(1)]],
      costo: [0, [Validators.min(0)]],
      activo: [true]
    });

    this.inscripcionForm = this.fb.group({
      operarioId: ['', Validators.required],
      cursoId: ['', Validators.required],
      fechaInscripcion: [new Date(), Validators.required],
      estado: ['inscrito', Validators.required],
      calificacion: [0, [Validators.min(0), Validators.max(10)]],
      observaciones: ['']
    });

    this.filtroForm = this.fb.group({
      busqueda: [''],
      modalidad: ['todos'],
      estado: ['todos'],
      fechaDesde: [''],
      fechaHasta: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarInscripciones();
    this.calcularEstadisticas();
    this.configurarFiltros();
  }

  ngAfterViewInit(): void {
    this.dataSourceCursos.paginator = this.paginator;
    this.dataSourceCursos.sort = this.sort;
  }

  cargarCursos(): void {
    this.loading = true;
    this.operariosService.getCursosFormacion().subscribe({
      next: (cursos) => {
        this.dataSourceCursos.data = cursos;
        this.loading = false;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.snackBar.open('Error al cargar los cursos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cargarInscripciones(): void {
    this.operariosService.getInscripcionesCursos().subscribe({
      next: (inscripciones) => {
        this.dataSourceInscripciones.data = inscripciones;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.snackBar.open('Error al cargar las inscripciones', 'Cerrar', { duration: 3000 });
      }
    });
  }

  configurarFiltros(): void {
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    const filtros = this.filtroForm.value;
    let datosFiltrados = [...this.dataSourceCursos.data];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      datosFiltrados = datosFiltrados.filter(curso =>
        curso.nombre.toLowerCase().includes(busqueda) ||
        curso.descripcion.toLowerCase().includes(busqueda) ||
        curso.instructor.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por modalidad
    if (filtros.modalidad !== 'todos') {
      datosFiltrados = datosFiltrados.filter(curso => curso.modalidad === filtros.modalidad);
    }

    // Filtro por estado
    if (filtros.estado !== 'todos') {
      datosFiltrados = datosFiltrados.filter(curso => curso.estado === filtros.estado);
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      datosFiltrados = datosFiltrados.filter(curso => 
        new Date(curso.fechaInicio) >= new Date(filtros.fechaDesde)
      );
    }

    if (filtros.fechaHasta) {
      datosFiltrados = datosFiltrados.filter(curso => 
        new Date(curso.fechaInicio) <= new Date(filtros.fechaHasta)
      );
    }

    this.dataSourceCursos.data = datosFiltrados;
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      busqueda: '',
      modalidad: 'todos',
      estado: 'todos',
      fechaDesde: '',
      fechaHasta: ''
    });
    this.cargarCursos();
  }

  calcularEstadisticas(): void {
    const cursos = this.dataSourceCursos.data;
    const inscripciones = this.dataSourceInscripciones.data;
    
    this.totalCursos = cursos.length;
    this.cursosActivos = cursos.filter(c => c.activo && c.estado !== 'cancelado').length;
    this.totalInscripciones = inscripciones.length;
    this.inscripcionesCompletadas = inscripciones.filter(i => i.estado === 'completado').length;
  }

  abrirDialogoCurso(curso?: CursoFormacion): void {
    this.editingCurso = curso || null;
    
    if (curso) {
      this.cursoForm.patchValue({
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        duracion: curso.duracion,
        modalidad: curso.modalidad,
        fechaInicio: curso.fechaInicio,
        fechaFin: curso.fechaFin,
        instructor: curso.instructor,
        capacidadMaxima: curso.capacidadMaxima,
        costo: curso.costo,
        activo: curso.activo
      });
    } else {
      this.cursoForm.reset({
        nombre: '',
        descripcion: '',
        duracion: 0,
        modalidad: '',
        fechaInicio: '',
        fechaFin: '',
        instructor: '',
        capacidadMaxima: 0,
        costo: 0,
        activo: true
      });
    }

    const dialogRef = this.dialog.open(this.cursoDialog, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarCurso();
      }
    });
  }

  abrirDialogoInscripcion(inscripcion?: FormacionOperario): void {
    this.editingInscripcion = inscripcion || null;
    
    if (inscripcion) {
      this.inscripcionForm.patchValue({
        operarioId: inscripcion.idOperario,
        cursoId: inscripcion.idCurso,
        fechaInscripcion: inscripcion.fechaInscripcion,
        estado: inscripcion.estado,
        calificacion: inscripcion.calificacion,
        observaciones: inscripcion.observaciones
      });
    } else {
      this.inscripcionForm.reset({
        operarioId: '',
        cursoId: '',
        fechaInscripcion: new Date(),
        estado: 'inscrito',
        calificacion: 0,
        observaciones: ''
      });
    }

    const dialogRef = this.dialog.open(this.inscripcionDialog, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarInscripcion();
      }
    });
  }

  guardarCurso(): void {
    if (this.cursoForm.valid) {
      const cursoData = this.cursoForm.value;
      
      if (this.editingCurso) {
        // Actualizar curso existente
        const cursoActualizado: CursoFormacion = {
          ...this.editingCurso,
          ...cursoData,
          fechaModificacion: new Date()
        };
        
        this.operariosService.updateCursoFormacion(cursoActualizado).subscribe({
          next: () => {
            this.snackBar.open('Curso actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarCursos();
          },
          error: (error) => {
            console.error('Error al actualizar curso:', error);
            this.snackBar.open('Error al actualizar el curso', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Crear nuevo curso
        const nuevoCurso: Partial<CursoFormacion> = {
          ...cursoData,
          estado: 'planificado',
          fechaCreacion: new Date()
        };
        
        this.operariosService.createCursoFormacion(nuevoCurso).subscribe({
          next: () => {
            this.snackBar.open('Curso creado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarCursos();
          },
          error: (error) => {
            console.error('Error al crear curso:', error);
            this.snackBar.open('Error al crear el curso', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  guardarInscripcion(): void {
    if (this.inscripcionForm.valid) {
      const inscripcionData = this.inscripcionForm.value;
      
      if (this.editingInscripcion) {
        // Actualizar inscripción existente
        const inscripcionActualizada: FormacionOperario = {
          ...this.editingInscripcion,
          ...inscripcionData,
          fechaModificacion: new Date()
        };
        
        this.operariosService.updateInscripcionCurso(inscripcionActualizada).subscribe({
          next: () => {
            this.snackBar.open('Inscripción actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarInscripciones();
          },
          error: (error) => {
            console.error('Error al actualizar inscripción:', error);
            this.snackBar.open('Error al actualizar la inscripción', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Crear nueva inscripción
        const nuevaInscripcion: Partial<FormacionOperario> = {
          ...inscripcionData,
          fechaCreacion: new Date()
        };
        
        this.operariosService.createInscripcionCurso(nuevaInscripcion).subscribe({
          next: () => {
            this.snackBar.open('Inscripción creada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarInscripciones();
          },
          error: (error) => {
            console.error('Error al crear inscripción:', error);
            this.snackBar.open('Error al crear la inscripción', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  eliminarCurso(curso: CursoFormacion): void {
    if (confirm(`¿Está seguro de que desea eliminar el curso "${curso.nombre}"?`)) {
      this.operariosService.deleteCursoFormacion(curso.idCurso).subscribe({
        next: () => {
          this.snackBar.open('Curso eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarCursos();
        },
        error: (error) => {
          console.error('Error al eliminar curso:', error);
          this.snackBar.open('Error al eliminar el curso', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarInscripcion(inscripcion: FormacionOperario): void {
    if (confirm('¿Está seguro de que desea eliminar esta inscripción?')) {
      this.operariosService.deleteInscripcionCurso(inscripcion.idFormacionOperario).subscribe({
        next: () => {
          this.snackBar.open('Inscripción eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarInscripciones();
        },
        error: (error) => {
          console.error('Error al eliminar inscripción:', error);
          this.snackBar.open('Error al eliminar la inscripción', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  exportarCursos(): void {
    const cursos = this.dataSourceCursos.data;
    const csvContent = this.convertirCursosACSV(cursos);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cursos_formacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertirCursosACSV(cursos: CursoFormacion[]): string {
    const headers = ['Nombre', 'Descripción', 'Duración (horas)', 'Modalidad', 'Fecha Inicio', 'Instructor', 'Estado'];
    const csvArray = [headers.join(',')];
    
    cursos.forEach(curso => {
      const row = [
        curso.nombre,
        `"${curso.descripcion}"`,
        curso.duracion.toString(),
        curso.modalidad,
        curso.fechaInicio,
        curso.instructor,
        curso.estado
      ];
      csvArray.push(row.join(','));
    });
    
    return csvArray.join('\n');
  }

  cerrarDialogo(): void {
    this.dialog.closeAll();
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estadosCurso.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }

  getModalidadLabel(modalidad: string): string {
    const modalidadObj = this.modalidades.find(m => m.value === modalidad);
    return modalidadObj ? modalidadObj.label : modalidad;
  }
}