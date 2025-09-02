import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from '../services/toast.service';

export const ApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
  const authStore = inject(AuthStore);
  const toastService = inject(ToastService);

  // Añadir headers de autenticación y tenant
  const modifiedRequest = addAuthHeaders(req, authStore);

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      return handleError(error, authStore, toastService);
    })
  );
};

function addAuthHeaders(request: HttpRequest<unknown>, authStore: AuthStore): HttpRequest<unknown> {
  const token = authStore.token();
  const empresaId = authStore.empresaId();

  let headers = request.headers;

  // Añadir token de autorización
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Añadir empresa ID
  if (empresaId) {
    headers = headers.set('x-empresa-id', empresaId.toString());
  }

  // Añadir Content-Type si no existe
  if (!headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return request.clone({ headers });
}

function handleError(error: HttpErrorResponse, authStore: AuthStore, toastService: ToastService): Observable<never> {
  let errorMessage = 'Ha ocurrido un error inesperado';

  switch (error.status) {
    case 401:
      errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      authStore.logout();
      break;
    case 403:
      errorMessage = 'No tiene permisos para realizar esta acción.';
      break;
    case 404:
      errorMessage = 'Recurso no encontrado.';
      break;
    case 409:
      errorMessage = 'Conflicto: El recurso ya existe o hay un conflicto de datos.';
      break;
    case 422:
      errorMessage = 'Datos inválidos. Por favor, revise la información.';
      break;
    case 500:
      errorMessage = 'Error interno del servidor.';
      break;
    default:
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
  }

  // Mostrar toast de error
  toastService.showError(errorMessage);

  return throwError(() => error);
}
