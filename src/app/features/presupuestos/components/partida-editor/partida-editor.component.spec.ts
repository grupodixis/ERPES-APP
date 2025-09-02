import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PartidaEditorComponent } from './partida-editor.component';
import { PresupuestosService } from '../../services/presupuestos.service';
import { Partida, TipoRecurso, UnidadMedida, TipoIva } from '../../../../domain/presupuestos.types';

describe('PartidaEditorComponent', () => {
  let component: PartidaEditorComponent;
  let fixture: ComponentFixture<PartidaEditorComponent>;
  let mockPresupuestosService: jasmine.SpyObj<PresupuestosService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<PartidaEditorComponent>>;

  const mockPartida: Partida = {
    id: 'part-1',
    codigo: 'PART-001',
    nombre: 'Partida Test',
    descripcion: 'Descripción test',
    tipoRecurso: 'material',
    unidadMedida: 'ud',
    cantidad: 10,
    precioUnitario: 25.50,
    tipoIva: 'general',
    porcentajeIva: 21,
    totalBase: 255,
    totalIva: 53.55,
    totalFinal: 308.55,
    activo: true,
    orden: 1
  };

  const mockDialogData = {
    presupuestoId: 'pres-1',
    capituloId: 'cap-1',
    partida: mockPartida
  };

  beforeEach(async () => {
    const presupuestosServiceSpy = jasmine.createSpyObj('PresupuestosService', [
      'crearPartida',
      'actualizarPartida',
      'tiposRecurso',
      'unidadesMedida'
    ]);

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        PartidaEditorComponent,
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

    fixture = TestBed.createComponent(PartidaEditorComponent);
    component = fixture.componentInstance;
    mockPresupuestosService = TestBed.inject(PresupuestosService) as jasmine.SpyObj<PresupuestosService>;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<PartidaEditorComponent>>;

    // Setup mock data
    mockPresupuestosService.tiposRecurso.and.returnValue([
      { id: 'material', nombre: 'Material' },
      { id: 'mano_obra', nombre: 'Mano de Obra' }
    ]);
    mockPresupuestosService.unidadesMedida.and.returnValue([
      { id: 'ud', nombre: 'Unidad' },
      { id: 'kg', nombre: 'Kilogramo' }
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with partida data when editing', () => {
      component.ngOnInit();
      
      expect(component.partidaForm.get('codigo')?.value).toBe(mockPartida.codigo);
      expect(component.partidaForm.get('nombre')?.value).toBe(mockPartida.nombre);
      expect(component.partidaForm.get('cantidad')?.value).toBe(mockPartida.cantidad);
      expect(component.partidaForm.get('precioUnitario')?.value).toBe(mockPartida.precioUnitario);
    });

    it('should initialize form with default values when creating new', () => {
      component.data = { presupuestoId: 'pres-1', capituloId: 'cap-1' };
      component.ngOnInit();
      
      expect(component.partidaForm.get('codigo')?.value).toBe('');
      expect(component.partidaForm.get('cantidad')?.value).toBe(1);
      expect(component.partidaForm.get('precioUnitario')?.value).toBe(0);
      expect(component.partidaForm.get('activo')?.value).toBe(true);
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate required fields', () => {
      const form = component.partidaForm;
      form.patchValue({
        codigo: '',
        nombre: '',
        tipoRecurso: '',
        unidadMedida: ''
      });
      
      expect(form.get('codigo')?.hasError('required')).toBe(true);
      expect(form.get('nombre')?.hasError('required')).toBe(true);
      expect(form.get('tipoRecurso')?.hasError('required')).toBe(true);
      expect(form.get('unidadMedida')?.hasError('required')).toBe(true);
    });

    it('should validate numeric fields', () => {
      const form = component.partidaForm;
      
      form.get('cantidad')?.setValue(-1);
      expect(form.get('cantidad')?.hasError('min')).toBe(true);
      
      form.get('precioUnitario')?.setValue(-1);
      expect(form.get('precioUnitario')?.hasError('min')).toBe(true);
    });
  });

  describe('Calculations', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should calculate totals correctly', () => {
      component.partidaForm.patchValue({
        cantidad: 10,
        precioUnitario: 100,
        tipoIva: 'general' // 21%
      });
      
      expect(component.totalBase()).toBe(1000);
      expect(component.totalIva()).toBe(210);
      expect(component.totalFinal()).toBe(1210);
    });

    it('should handle zero values', () => {
      component.partidaForm.patchValue({
        cantidad: 0,
        precioUnitario: 100
      });
      
      expect(component.totalBase()).toBe(0);
      expect(component.totalIva()).toBe(0);
      expect(component.totalFinal()).toBe(0);
    });
  });

  describe('Save functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.partidaForm.patchValue({
        codigo: 'PART-001',
        nombre: 'Test Partida',
        tipoRecurso: 'material',
        unidadMedida: 'ud',
        cantidad: 5,
        precioUnitario: 20
      });
    });

    it('should create new partida when not editing', async () => {
      component.data = { presupuestoId: 'pres-1', capituloId: 'cap-1' };
      component.ngOnInit();
      
      mockPresupuestosService.crearPartida.and.returnValue(Promise.resolve(mockPartida));
      
      await component.guardar();
      
      expect(mockPresupuestosService.crearPartida).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(mockPartida);
    });

    it('should update existing partida when editing', async () => {
      mockPresupuestosService.actualizarPartida.and.returnValue(Promise.resolve(mockPartida));
      
      await component.guardar();
      
      expect(mockPresupuestosService.actualizarPartida).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(mockPartida);
    });

    it('should not save when form is invalid', async () => {
      component.partidaForm.patchValue({ codigo: '' });
      
      await component.guardar();
      
      expect(mockPresupuestosService.crearPartida).not.toHaveBeenCalled();
      expect(mockPresupuestosService.actualizarPartida).not.toHaveBeenCalled();
    });
  });

  describe('Dialog actions', () => {
    it('should close dialog on cancel', () => {
      component.cancelar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should reset form', () => {
      component.ngOnInit();
      component.partidaForm.patchValue({ nombre: 'Changed' });
      
      component.resetear();
      
      expect(component.partidaForm.get('nombre')?.value).toBe(mockPartida.nombre);
    });
  });
});