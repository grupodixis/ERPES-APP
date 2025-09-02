import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DesglosePartidaComponent } from './desglose-partida.component';
import { PresupuestosService } from '../../services/presupuestos.service';
import { DesglosePartida } from '../../../../domain/presupuestos.types';

describe('DesglosePartidaComponent', () => {
  let component: DesglosePartidaComponent;
  let fixture: ComponentFixture<DesglosePartidaComponent>;
  let mockPresupuestosService: jasmine.SpyObj<PresupuestosService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DesglosePartidaComponent>>;

  const mockDesgloses: DesglosePartida[] = [
    {
      id: 'desg-1',
      codigo: 'DESG-001',
      nombre: 'Desglose 1',
      descripcion: 'Descripción 1',
      tipoRecurso: 'material',
      unidadMedida: 'kg',
      cantidad: 5,
      precioUnitario: 10,
      tipoIva: 'general',
      porcentajeIva: 21,
      totalBase: 50,
      totalIva: 10.5,
      totalFinal: 60.5,
      activo: true,
      enStock: true,
      orden: 1
    },
    {
      id: 'desg-2',
      codigo: 'DESG-002',
      nombre: 'Desglose 2',
      descripcion: 'Descripción 2',
      tipoRecurso: 'mano_obra',
      unidadMedida: 'h',
      cantidad: 8,
      precioUnitario: 25,
      tipoIva: 'general',
      porcentajeIva: 21,
      totalBase: 200,
      totalIva: 42,
      totalFinal: 242,
      activo: true,
      enStock: false,
      orden: 2
    }
  ];

  const mockDialogData = {
    presupuestoId: 'pres-1',
    capituloId: 'cap-1',
    partidaId: 'part-1',
    desgloses: mockDesgloses
  };

  beforeEach(async () => {
    const presupuestosServiceSpy = jasmine.createSpyObj('PresupuestosService', [
      'crearDesglosePartida',
      'actualizarDesglosePartida',
      'eliminarDesglosePartida',
      'tiposRecurso',
      'unidadesMedida'
    ]);

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        DesglosePartidaComponent,
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PresupuestosService, useValue: presupuestosServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DesglosePartidaComponent);
    component = fixture.componentInstance;
    mockPresupuestosService = TestBed.inject(PresupuestosService) as jasmine.SpyObj<PresupuestosService>;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DesglosePartidaComponent>>;

    // Setup mock data
    mockPresupuestosService.tiposRecurso.and.returnValue([
      { id: 'material', nombre: 'Material' },
      { id: 'mano_obra', nombre: 'Mano de Obra' }
    ]);
    mockPresupuestosService.unidadesMedida.and.returnValue([
      { id: 'kg', nombre: 'Kilogramo' },
      { id: 'h', nombre: 'Hora' }
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with provided desgloses', () => {
      component.ngOnInit();
      
      expect(component.desgloses()).toEqual(mockDesgloses);
      expect(component.filteredDesgloses()).toEqual(mockDesgloses);
    });

    it('should calculate totals correctly', () => {
      component.ngOnInit();
      
      expect(component.totalElementos()).toBe(2);
      expect(component.totalCantidad()).toBe(13); // 5 + 8
      expect(component.totalImporte()).toBe(302.5); // 60.5 + 242
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should filter by search term', () => {
      component.filtroForm.patchValue({ busqueda: 'Desglose 1' });
      
      const filtered = component.filteredDesgloses();
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Desglose 1');
    });

    it('should filter by tipo recurso', () => {
      component.filtroForm.patchValue({ tipoRecurso: 'material' });
      
      const filtered = component.filteredDesgloses();
      expect(filtered.length).toBe(1);
      expect(filtered[0].tipoRecurso).toBe('material');
    });

    it('should filter by activo status', () => {
      const desglosesWithInactive = [
        ...mockDesgloses,
        { ...mockDesgloses[0], id: 'desg-3', activo: false }
      ];
      component.desgloses.set(desglosesWithInactive);
      
      component.filtroForm.patchValue({ soloActivos: true });
      
      const filtered = component.filteredDesgloses();
      expect(filtered.length).toBe(2);
      expect(filtered.every(d => d.activo)).toBe(true);
    });

    it('should filter by stock status', () => {
      component.filtroForm.patchValue({ soloEnStock: true });
      
      const filtered = component.filteredDesgloses();
      expect(filtered.length).toBe(1);
      expect(filtered[0].enStock).toBe(true);
    });
  });

  describe('CRUD operations', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should add new desglose', async () => {
      const newDesglose: DesglosePartida = {
        id: 'desg-3',
        codigo: 'DESG-003',
        nombre: 'Nuevo Desglose',
        descripcion: '',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 1,
        precioUnitario: 15,
        tipoIva: 'general',
        porcentajeIva: 21,
        totalBase: 15,
        totalIva: 3.15,
        totalFinal: 18.15,
        activo: true,
        enStock: true,
        orden: 3
      };

      mockPresupuestosService.crearDesglosePartida.and.returnValue(Promise.resolve(newDesglose));
      
      await component.agregar();
      
      expect(mockPresupuestosService.crearDesglosePartida).toHaveBeenCalled();
    });

    it('should duplicate selected desglose', async () => {
      component.selection.select(mockDesgloses[0]);
      
      const duplicatedDesglose = {
        ...mockDesgloses[0],
        id: 'desg-dup',
        codigo: 'DESG-001-COPIA'
      };
      
      mockPresupuestosService.crearDesglosePartida.and.returnValue(Promise.resolve(duplicatedDesglose));
      
      await component.duplicar();
      
      expect(mockPresupuestosService.crearDesglosePartida).toHaveBeenCalled();
    });

    it('should delete selected desgloses', async () => {
      component.selection.select(mockDesgloses[0]);
      mockPresupuestosService.eliminarDesglosePartida.and.returnValue(Promise.resolve());
      
      spyOn(window, 'confirm').and.returnValue(true);
      
      await component.eliminar();
      
      expect(mockPresupuestosService.eliminarDesglosePartida).toHaveBeenCalledWith(
        'pres-1', 'cap-1', 'part-1', 'desg-1'
      );
    });

    it('should not delete if user cancels confirmation', async () => {
      component.selection.select(mockDesgloses[0]);
      
      spyOn(window, 'confirm').and.returnValue(false);
      
      await component.eliminar();
      
      expect(mockPresupuestosService.eliminarDesglosePartida).not.toHaveBeenCalled();
    });
  });

  describe('Inline editing', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should start editing', () => {
      const mockDesglose = { id: 'desg-1', nombre: 'Test' } as any;
      component.startEdit(mockDesglose);
      expect(component.editingRowId()).toBe('desg-1');
    });

    it('should save edit', async () => {
      const updatedDesglose = { ...mockDesgloses[0], nombre: 'Nombre Actualizado' };
      mockPresupuestosService.actualizarDesglosePartida.and.returnValue(Promise.resolve(updatedDesglose));
      
      const mockDesglose = { id: 'desg-1', nombre: 'Test' } as any;
      component.startEdit(mockDesglose);
      
      await component.saveEdit();
      
      expect(mockPresupuestosService.updateDesglosePartida).toHaveBeenCalled();
      expect(component.editingRowId()).toBeNull();
    });

    it('should cancel edit', () => {
      const mockDesglose = { id: 'desg-1', nombre: 'Test' } as any;
      component.startEdit(mockDesglose);
      component.cancelEdit();
      
      expect(component.editingRowId()).toBeNull();
    });
  });

  describe('Selection', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should select all items', () => {
      component.masterToggle();
      
      expect(component.selection.selected.length).toBe(mockDesgloses.length);
    });

    it('should deselect all when all are selected', () => {
      component.selection.select(...mockDesgloses);
      component.masterToggle();
      
      expect(component.selection.selected.length).toBe(0);
    });

    it('should check if all selected', () => {
      component.selection.select(...mockDesgloses);
      
      expect(component.isAllSelected()).toBe(true);
    });

    it('should check indeterminate state', () => {
      component.selection.select(mockDesgloses[0]);
      
      expect(component.isIndeterminate()).toBe(true);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should sort by column', () => {
      const sortEvent = {
        active: 'nombre',
        direction: 'asc' as const
      };
      
      component.sortData(sortEvent);
      
      const sorted = component.filteredDesgloses();
      expect(sorted[0].nombre).toBe('Desglose 1');
      expect(sorted[1].nombre).toBe('Desglose 2');
    });
  });

  describe('Dialog actions', () => {
    it('should close dialog and return updated desgloses', () => {
      component.ngOnInit();
      component.guardar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(component.desgloses());
    });

    it('should close dialog without saving', () => {
      component.cancelar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate numeric fields during inline edit', () => {
      expect(component.isValidNumber('10')).toBe(true);
      expect(component.isValidNumber('10.5')).toBe(true);
      expect(component.isValidNumber('abc')).toBe(false);
      expect(component.isValidNumber('-5')).toBe(false);
    });
  });
});