import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { DocumentosListComponent } from './presentation/documentos-list/documentos-list.component';
import { TemplateWizardComponent } from './presentation/template-wizard/template-wizard.component';
import { TemplateDetailComponent } from './presentation/template-detail/template-detail.component';
import { FillPreviewComponent } from './presentation/fill-preview/fill-preview.component';
import { FillJobsListComponent } from './presentation/fill-jobs-list/fill-jobs-list.component';

// Guards (si se necesitan)
// import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'plantillas',
    pathMatch: 'full'
  },
  {
    path: 'plantillas',
    component: DocumentosListComponent,
    data: { 
      title: 'Plantillas PDF',
      breadcrumb: 'Plantillas'
    }
  },
  {
    path: 'plantillas/nueva',
    component: TemplateWizardComponent,
    data: { 
      title: 'Nueva Plantilla',
      breadcrumb: 'Nueva Plantilla'
    }
  },
  {
    path: 'plantillas/:id',
    component: TemplateDetailComponent,
    data: { 
      title: 'Detalle de Plantilla',
      breadcrumb: 'Detalle'
    }
  },
  {
    path: 'plantillas/:id/editar',
    component: TemplateWizardComponent,
    data: { 
      title: 'Editar Plantilla',
      breadcrumb: 'Editar',
      mode: 'edit'
    }
  },
  {
    path: 'rellenar/:templateId',
    component: FillPreviewComponent,
    data: { 
      title: 'Rellenar PDF',
      breadcrumb: 'Rellenar'
    }
  },
  {
    path: 'trabajos',
    component: FillJobsListComponent,
    data: { 
      title: 'Trabajos de Rellenado',
      breadcrumb: 'Trabajos'
    }
  },
  {
    path: '**',
    redirectTo: 'plantillas'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentosRoutingModule { }