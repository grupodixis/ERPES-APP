import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppConfigService } from './core/app-config.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockConfigService: jasmine.SpyObj<AppConfigService>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('AppConfigService', [], {
      isDemo: true,
      envName: 'DEV'
    });

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AppConfigService, useValue: mockConfigService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Eliminado: la propiedad title no forma parte del contrato público del componente

  it('should toggle sidenav when toggleSidenav is called', () => {
    const initialValue = component.sidenavOpened();
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(!initialValue);
  });

  it('should display environment name from config service', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('DEV');
  });

  it('should display DEMO chip when in demo mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('DEMO');
  });
});
