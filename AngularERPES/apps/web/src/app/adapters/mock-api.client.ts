import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../ports/api-client.interface';
import { AppConfigService } from '../core/app-config.service';
import { MockHandlers, MockResponse } from './mock-handlers';
import { LatencyService } from '../core/services/latency.service';

@Injectable()
export class MockApiClient implements ApiClient {
  private latencyService = inject(LatencyService);

  constructor(private configService: AppConfigService) {}

  async get<T>(url: string, opts?: any): Promise<T> {
    const response = await this.routeRequest('GET', url, opts);
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, body: any, opts?: any): Promise<T> {
    console.log('🎭 MockApiClient.post() - URL:', url, 'Body:', body);
    
    // Mostrar banner de latencia
    this.latencyService.showLatency(150);
    
    try {
      const response = await this.routeRequest('POST', url, opts, body);
      console.log('🎭 MockApiClient.post() - Response:', response);
      return this.handleResponse<T>(response);
    } finally {
      // Ocultar banner de latencia
      this.latencyService.hideLatency();
    }
  }

  async patch<T>(url: string, body: any, opts?: any): Promise<T> {
    const response = await this.routeRequest('PATCH', url, opts, body);
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, opts?: any): Promise<T> {
    const response = await this.routeRequest('DELETE', url, opts);
    return this.handleResponse<T>(response);
  }

  private async routeRequest(method: string, url: string, opts?: any, body?: any): Promise<MockResponse> {
    console.log('🎭 MockApiClient.routeRequest() - Method:', method, 'URL:', url);
    
    // Extraer parámetros de la URL
    const urlParts = url.split('?');
    const path = urlParts[0];
    const queryParams = urlParts[1] ? this.parseQueryParams(urlParts[1]) : {};

    // Extraer ID de la URL si existe
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1] && !isNaN(Number(pathParts[pathParts.length - 1])) 
      ? Number(pathParts[pathParts.length - 1]) 
      : null;

    console.log('🎭 MockApiClient.routeRequest() - Path:', path, 'ID:', id, 'QueryParams:', queryParams);

    // Router por recurso
    switch (method) {
      case 'GET':
        return this.handleGet(path, id, queryParams);
      case 'POST':
        return this.handlePost(path, body);
      case 'PATCH':
        return this.handlePatch(path, id, body);
      case 'DELETE':
        return this.handleDelete(path, id);
      default:
        return MockHandlers.handleNotFound();
    }
  }

  private async handleGet(path: string, id: number | null, params: any): Promise<MockResponse> {
    if (path.startsWith('/auth/login')) {
      return MockHandlers.handleNotFound(); // Login se maneja con POST
    }
    
    if (path.startsWith('/usuarios')) {
      if (id) {
        return MockHandlers.handleGetUsuario(id);
      } else {
        return MockHandlers.handleGetUsuarios(params);
      }
    }
    
    if (path.startsWith('/roles')) {
      if (id) {
        return MockHandlers.handleGetRole(id);
      } else {
        return MockHandlers.handleGetRoles();
      }
    }
    
    if (path.startsWith('/permisos')) {
      return MockHandlers.handleGetPermisos();
    }
    
    if (path.startsWith('/empresas')) {
      if (id) {
        return MockHandlers.handleGetEmpresa(id);
      } else {
        return MockHandlers.handleGetEmpresas();
      }
    }

    if (path.startsWith('/monedas')) {
      return MockHandlers.handleGetMonedas();
    }

    if (path.startsWith('/tipos-cambio')) {
      return MockHandlers.handleGetTiposCambio(params);
    }
    
    if (path.startsWith('/series-documentales')) {
      if (id) {
        return MockHandlers.handleGetSerieDocumental(id);
      } else {
        return MockHandlers.handleGetSeriesDocumentales(params);
      }
    }
    
    if (path.startsWith('/personas')) {
      if (path.includes('/detalle')) {
        return MockHandlers.handleGetPersonaDetalle(id!);
      } else if (id) {
        return MockHandlers.handleGetPersona(id);
      } else {
        return MockHandlers.handleGetPersonas(params);
      }
    }
    
    if (path.startsWith('/direcciones')) {
      return MockHandlers.handleGetDirecciones(params?.personaId);
    }
    
    if (path.startsWith('/cuentas-bancarias')) {
      return MockHandlers.handleGetCuentasBancarias(params?.personaId);
    }

    // ===== RUTAS PARA PRODUCTOS =====

    if (path.startsWith('/productos')) {
      if (path.includes('/detalle')) {
        return MockHandlers.handleGetProductoDetalle(id!);
      } else if (path.includes('/coste-estimado')) {
        return MockHandlers.handleCalcularCosteEstimado(id!);
      } else if (path.includes('/selector')) {
        return MockHandlers.handleBuscarProductosSelector(params?.texto || '');
      } else if (id) {
        return MockHandlers.handleGetProducto(id);
      } else {
        return MockHandlers.handleGetProductos(params);
      }
    }

    if (path.startsWith('/unidades-medida')) {
      return MockHandlers.handleGetUnidadesMedida();
    }

    if (path.startsWith('/tipos-articulo')) {
      return MockHandlers.handleGetTiposArticulo();
    }

    if (path.startsWith('/tipos-iva')) {
      return MockHandlers.handleGetTiposIva();
    }

    if (path.startsWith('/categorias-producto')) {
      return MockHandlers.handleGetCategoriasProducto();
    }

    if (path.startsWith('/componentes-bom')) {
      return MockHandlers.handleGetComponentesBOM(id!);
    }

    return MockHandlers.handleNotFound();
  }

  private async handlePost(path: string, body: any): Promise<MockResponse> {
    console.log('🎭 MockApiClient.handlePost() - Path:', path, 'Body:', body);
    
    let response: MockResponse;
    
    if (path.startsWith('/auth/login')) {
      console.log('🎭 MockApiClient.handlePost() - Manejando login...');
      response = await MockHandlers.handleLogin(body);
    } else if (path.startsWith('/usuarios')) {
      console.log('🎭 MockApiClient.handlePost() - Manejando creación de usuario...');
      response = await MockHandlers.handleCreateUsuario(body);
    } else if (path.startsWith('/roles')) {
      response = await MockHandlers.handleCreateRole(body);
    } else if (path.startsWith('/monedas')) {
      response = await MockHandlers.handleCreateMoneda(body);
    } else if (path.startsWith('/tipos-cambio')) {
      if (path === '/tipos-cambio/import') {
        response = await MockHandlers.handleImportTiposCambio(body.csvData);
      } else {
        response = await MockHandlers.handleCreateTipoCambio(body);
      }
    } else if (path.startsWith('/series-documentales')) {
      response = await MockHandlers.handleCreateSerieDocumental(body);
    } else if (path.startsWith('/personas')) {
      response = await MockHandlers.handleCreatePersona(body);
    } else if (path.startsWith('/direcciones')) {
      response = await MockHandlers.handleCreateDireccion(body);
    } else if (path.startsWith('/cuentas-bancarias')) {
      response = await MockHandlers.handleCreateCuentaBancaria(body);
    } else if (path.startsWith('/productos')) {
      response = await MockHandlers.handleCreateProducto(body);
    } else if (path.startsWith('/unidades-medida')) {
      response = await MockHandlers.handleCreateUnidadMedida(body);
    } else if (path.startsWith('/tipos-articulo')) {
      response = await MockHandlers.handleCreateTipoArticulo(body);
    } else if (path.startsWith('/tipos-iva')) {
      response = await MockHandlers.handleCreateTipoIva(body);
    } else if (path.startsWith('/categorias-producto')) {
      response = await MockHandlers.handleCreateCategoriaProducto(body);
    } else if (path.startsWith('/componentes-bom')) {
      response = await MockHandlers.handleCreateComponenteBOM(body);
    } else {
      response = await MockHandlers.handleNotFound();
    }

    return response;
  }

  private async handlePatch(path: string, id: number | null, body: any): Promise<MockResponse> {
    if (!id) {
      return MockHandlers.handleNotFound();
    }
    
    if (path.startsWith('/usuarios')) {
      return MockHandlers.handleUpdateUsuario(id, body);
    }
    
    if (path.startsWith('/roles')) {
      return MockHandlers.handleUpdateRole(id, body);
    }

    if (path.startsWith('/empresas')) {
      return MockHandlers.handleUpdateEmpresa(id, body);
    }

    if (path.startsWith('/monedas')) {
      return MockHandlers.handleUpdateMoneda(id, body);
    }

    if (path.startsWith('/tipos-cambio')) {
      return MockHandlers.handleUpdateTipoCambio(id, body);
    }

    if (path.startsWith('/series-documentales')) {
      return MockHandlers.handleUpdateSerieDocumental(id, body);
    }
    
    if (path.startsWith('/personas')) {
      return MockHandlers.handleUpdatePersona(id, body);
    }
    
    if (path.startsWith('/direcciones')) {
      return MockHandlers.handleUpdateDireccion(id, body);
    }
    
    if (path.startsWith('/cuentas-bancarias')) {
      return MockHandlers.handleUpdateCuentaBancaria(id, body);
    }

    if (path.startsWith('/productos')) {
      return MockHandlers.handleUpdateProducto(id, body);
    }

    if (path.startsWith('/componentes-bom')) {
      return MockHandlers.handleUpdateComponenteBOM(id, body);
    }

    return MockHandlers.handleNotFound();
  }

  private async handleDelete(path: string, id: number | null): Promise<MockResponse> {
    if (!id) {
      return MockHandlers.handleNotFound();
    }
    
    if (path.startsWith('/usuarios')) {
      return MockHandlers.handleDeleteUsuario(id);
    }
    
    if (path.startsWith('/roles')) {
      return MockHandlers.handleDeleteRole(id);
    }

    if (path.startsWith('/monedas')) {
      return MockHandlers.handleDeleteMoneda(id);
    }

    if (path.startsWith('/tipos-cambio')) {
      return MockHandlers.handleDeleteTipoCambio(id);
    }

    if (path.startsWith('/series-documentales')) {
      return MockHandlers.handleDeleteSerieDocumental(id);
    }
    
    if (path.startsWith('/personas')) {
      return MockHandlers.handleDeletePersona(id);
    }
    
    if (path.startsWith('/direcciones')) {
      return MockHandlers.handleDeleteDireccion(id);
    }
    
    if (path.startsWith('/cuentas-bancarias')) {
      return MockHandlers.handleDeleteCuentaBancaria(id);
    }

    if (path.startsWith('/productos')) {
      return MockHandlers.handleDeleteProducto(id);
    }

    if (path.startsWith('/componentes-bom')) {
      return MockHandlers.handleDeleteComponenteBOM(id);
    }

    return MockHandlers.handleNotFound();
  }

  private parseQueryParams(queryString: string): any {
    const params: any = {};
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
    
    return params;
  }

  private handleResponse<T>(response: MockResponse): T {
    if (response.error) {
      // Simular error HTTP
      const error = new Error(response.error.message);
      (error as any).status = response.error.code;
      (error as any).details = response.error.details;
      throw error;
    }
    
    return response.data as T;
  }
}
