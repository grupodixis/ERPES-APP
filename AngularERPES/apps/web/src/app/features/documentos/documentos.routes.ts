import { Routes } from '@angular/router';
import { DocumentosListComponent } from './presentation/documentos-list/documentos-list.component';
import { TemplateWizardComponent } from './presentation/template-wizard/template-wizard.component';
import { FillPreviewComponent } from './presentation/fill-preview/fill-preview.component';

export const DOCUMENTOS_ROUTES: Routes = [
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
    path: '**',
    redirectTo: 'plantillas'
  }
];