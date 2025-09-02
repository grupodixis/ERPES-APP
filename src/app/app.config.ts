import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';


import { routes } from './app.routes';
import { AppConfigService } from './core/app-config.service';
import { AuthStore } from './core/stores/auth.store';
import { AuthHeadersService } from './core/services/auth-headers.service';
import { API_CLIENT } from './ports/api-client.token';
import { HttpApiClient } from './adapters/http-api.client';
import { MockApiClient } from './adapters/mock-api.client';
import { ApiInterceptor } from './core/interceptors/api.interceptor';

// Factory para cargar la configuración al inicio
export function initializeApp(configService: AppConfigService) {
  return () => configService.loadConfig();
}

// Factory para el provider del API_CLIENT
export function apiClientFactory(
  http: HttpClient,
  configService: AppConfigService,
  authHeadersService: AuthHeadersService
) {
  return configService.isDemo 
    ? new MockApiClient(configService)
    : new HttpApiClient(http, configService, authHeadersService);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([ApiInterceptor])
    ),

    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true
    },
    {
      provide: API_CLIENT,
      useFactory: apiClientFactory,
      deps: [HttpClient, AppConfigService, AuthHeadersService]
    }
  ]
};
