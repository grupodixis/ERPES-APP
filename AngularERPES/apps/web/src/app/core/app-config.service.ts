import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppConfig {
  demo: boolean;
  apiBaseUrl: string;
  envName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: AppConfig = { ...environment };

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    console.log('🔧 AppConfigService.loadConfig() - Iniciando carga de configuración...');
    try {
      // Agregar un pequeño delay para asegurar que el servidor esté listo
      console.log('🔧 AppConfigService.loadConfig() - Esperando 100ms...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔧 AppConfigService.loadConfig() - Intentando cargar /assets/app-config.json...');
      const runtimeConfig = await firstValueFrom(
        this.http.get<AppConfig>('/assets/app-config.json')
      );
      
      if (runtimeConfig) {
        this.config = { ...this.config, ...runtimeConfig };
        console.log('✅ AppConfigService.loadConfig() - Configuración runtime cargada:', this.config);
      }
    } catch (error) {
      console.warn('⚠️ AppConfigService.loadConfig() - No se pudo cargar app-config.json, usando configuración por defecto:', error);
      console.log('🔧 AppConfigService.loadConfig() - Configuración por defecto:', this.config);
    }
    console.log('🔧 AppConfigService.loadConfig() - Finalizado');
  }

  getConfig(): AppConfig {
    return this.config;
  }

  get isDemo(): boolean {
    return this.config.demo;
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get envName(): string {
    return this.config.envName;
  }
}
