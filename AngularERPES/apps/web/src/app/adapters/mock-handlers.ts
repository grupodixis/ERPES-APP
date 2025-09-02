import { mockDb } from './mock-db';
import { User, Role, Permission, Empresa, LoginRequest, LoginResponse } from '../domain/auth.types';
import { Moneda, TipoCambio, CreateMonedaDto, UpdateMonedaDto, CreateTipoCambioDto, UpdateTipoCambioDto, SerieDocumental, CreateSerieDocumentalDto, UpdateSerieDocumentalDto } from '../domain/configuracion.types';
import { Persona, CreatePersonaDto, UpdatePersonaDto, Direccion, CreateDireccionDto, UpdateDireccionDto, CuentaBancaria, CreateCuentaBancariaDto, UpdateCuentaBancariaDto, PersonaDetalle } from '../domain/terceros.types';
import { 
  Producto, CreateProductoDto, UpdateProductoDto, ProductoDetalle, ProductoFilters,
  UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto,
  TipoArticulo, CreateTipoArticuloDto, UpdateTipoArticuloDto,
  TipoIva, CreateTipoIvaDto, UpdateTipoIvaDto,
  CategoriaProducto, CreateCategoriaProductoDto, UpdateCategoriaProductoDto,
  ComponenteBOM, CreateComponenteBOMDto, UpdateComponenteBOMDto,
  CosteEstimadoResponse, ProductoSelectorData
} from '../domain/productos.types';

export interface MockResponse<T = any> {
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

export class MockHandlers {
  private static minLatency = 100;
  private static maxLatency = 600;

  static setLatency(min: number, max: number): void {
    MockHandlers.minLatency = min;
    MockHandlers.maxLatency = max;
  }

  private static simulateLatency(): Promise<number> {
    const delay = Math.random() * (MockHandlers.maxLatency - MockHandlers.minLatency) + MockHandlers.minLatency;
    return new Promise(resolve => setTimeout(() => resolve(delay), delay));
  }

  // Handlers de autenticación
  static async handleLogin(request: LoginRequest): Promise<MockResponse<LoginResponse>> {
    const latency = await this.simulateLatency();

    const usuarios = mockDb.getUsuarios();
    const usuario = usuarios.find(u => 
      (u.email === request.username || u.username === request.username) && 
      u.password === request.password && 
      u.activo
    );

    if (!usuario) {
      return {
        error: {
          code: 401,
          message: 'Credenciales inválidas'
        }
      };
    }

    const empresas = mockDb.getEmpresas();
    const empresa = empresas.find(e => e.id === usuario.empresaId);

    if (!empresa || !empresa.activa) {
      return {
        error: {
          code: 403,
          message: 'Empresa inactiva o no encontrada'
        }
      };
    }

    // Generar token mock
    const token = `mock_token_${usuario.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${usuario.id}_${Date.now()}`;

    // Actualizar último acceso
    mockDb.updateUsuario(usuario.id, { ultimoAcceso: new Date() });

    return {
      data: {
        user: usuario,
        token,
        refreshToken,
        expiresIn: 3600
      }
    };
  }

  // Handlers de usuarios
  static async handleGetUsuarios(params?: any): Promise<MockResponse<User[]>> {
    await this.simulateLatency();

    let usuarios = mockDb.getUsuarios();

    // Aplicar filtros
    if (params?.search) {
      const search = params.search.toLowerCase();
      usuarios = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(search) ||
        u.apellidos.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    if (params?.activo !== undefined) {
      usuarios = usuarios.filter(u => u.activo === params.activo);
    }

    if (params?.empresaId) {
      usuarios = usuarios.filter(u => u.empresaId === params.empresaId);
    }

    // Aplicar paginación
    const page = params?.page || 0;
    const limit = params?.limit || 10;
    const start = page * limit;
    const end = start + limit;
    const paginatedUsuarios = usuarios.slice(start, end);

    return {
      data: paginatedUsuarios
    };
  }

  static async handleGetUsuario(id: number): Promise<MockResponse<User>> {
    await this.simulateLatency();

    const usuarios = mockDb.getUsuarios();
    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
      return {
        error: {
          code: 404,
          message: 'Usuario no encontrado'
        }
      };
    }

    return {
      data: usuario
    };
  }

  static async handleCreateUsuario(usuarioData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockResponse<User>> {
    await this.simulateLatency();

    // Validar unicidad de email
    const usuarios = mockDb.getUsuarios();
    const emailExists = usuarios.some(u => u.email === usuarioData.email);
    
    if (emailExists) {
      return {
        error: {
          code: 409,
          message: 'El email ya está en uso'
        }
      };
    }

    // Validar que la empresa existe y está activa
    const empresas = mockDb.getEmpresas();
    const empresa = empresas.find(e => e.id === usuarioData.empresaId);
    
    if (!empresa || !empresa.activa) {
      return {
        error: {
          code: 422,
          message: 'Empresa no válida'
        }
      };
    }

    const newUsuario = mockDb.addUsuario(usuarioData);
    return {
      data: newUsuario
    };
  }

  static async handleUpdateUsuario(id: number, updates: Partial<User>): Promise<MockResponse<User>> {
    await this.simulateLatency();

    // Validar que el usuario existe
    const usuarios = mockDb.getUsuarios();
    const existingUsuario = usuarios.find(u => u.id === id);
    
    if (!existingUsuario) {
      return {
        error: {
          code: 404,
          message: 'Usuario no encontrado'
        }
      };
    }

    // Validar unicidad de email si se está cambiando
    if (updates.email && updates.email !== existingUsuario.email) {
      const emailExists = usuarios.some(u => u.email === updates.email && u.id !== id);
      
      if (emailExists) {
        return {
          error: {
            code: 409,
            message: 'El email ya está en uso'
          }
        };
      }
    }

    const updatedUsuario = mockDb.updateUsuario(id, updates);
    
    if (!updatedUsuario) {
      return {
        error: {
          code: 500,
          message: 'Error al actualizar usuario'
        }
      };
    }

    return {
      data: updatedUsuario
    };
  }

  static async handleDeleteUsuario(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteUsuario(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Usuario no encontrado'
        }
      };
    }

    return {
      data: true
    };
  }

  // Handlers de roles
  static async handleGetRoles(): Promise<MockResponse<Role[]>> {
    await this.simulateLatency();
    
    const roles = mockDb.getRoles();
    return {
      data: roles
    };
  }

  static async handleGetRole(id: number): Promise<MockResponse<Role>> {
    await this.simulateLatency();

    const roles = mockDb.getRoles();
    const role = roles.find(r => r.id === id);

    if (!role) {
      return {
        error: {
          code: 404,
          message: 'Rol no encontrado'
        }
      };
    }

    return {
      data: role
    };
  }

  static async handleCreateRole(roleData: Omit<Role, 'id'>): Promise<MockResponse<Role>> {
    await this.simulateLatency();

    // Validar unicidad de nombre
    const roles = mockDb.getRoles();
    const nameExists = roles.some(r => r.nombre === roleData.nombre);
    
    if (nameExists) {
      return {
        error: {
          code: 409,
          message: 'El nombre del rol ya existe'
        }
      };
    }

    const newRole = mockDb.addRole(roleData);
    return {
      data: newRole
    };
  }

  static async handleUpdateRole(id: number, updates: Partial<Role>): Promise<MockResponse<Role>> {
    await this.simulateLatency();

    // Validar que el rol existe
    const roles = mockDb.getRoles();
    const existingRole = roles.find(r => r.id === id);
    
    if (!existingRole) {
      return {
        error: {
          code: 404,
          message: 'Rol no encontrado'
        }
      };
    }

    // Validar unicidad de nombre si se está cambiando
    if (updates.nombre && updates.nombre !== existingRole.nombre) {
      const nameExists = roles.some(r => r.nombre === updates.nombre && r.id !== id);
      
      if (nameExists) {
        return {
          error: {
            code: 409,
            message: 'El nombre del rol ya existe'
          }
        };
      }
    }

    const updatedRole = mockDb.updateRole(id, updates);
    
    if (!updatedRole) {
      return {
        error: {
          code: 500,
          message: 'Error al actualizar rol'
        }
      };
    }

    return {
      data: updatedRole
    };
  }

  static async handleDeleteRole(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    // Verificar que no hay usuarios usando este rol
    const usuarios = mockDb.getUsuarios();
    const usuariosConRol = usuarios.filter(u => u.roles.some(r => r.id === id));
    
    if (usuariosConRol.length > 0) {
      return {
        error: {
          code: 409,
          message: 'No se puede eliminar el rol porque hay usuarios asignados',
          details: {
            usuariosAsignados: usuariosConRol.length
          }
        }
      };
    }

    const success = mockDb.deleteRole(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Rol no encontrado'
        }
      };
    }

    return {
      data: true
    };
  }

  // Handlers de permisos
  static async handleGetPermisos(): Promise<MockResponse<Permission[]>> {
    await this.simulateLatency();
    
    const permisos = mockDb.getPermisos();
    return {
      data: permisos
    };
  }

  // Handlers de empresas
  static async handleGetEmpresas(): Promise<MockResponse<Empresa[]>> {
    await this.simulateLatency();
    
    const empresas = mockDb.getEmpresas();
    return {
      data: empresas
    };
  }

  static async handleGetEmpresa(id: number): Promise<MockResponse<Empresa>> {
    await this.simulateLatency();

    const empresas = mockDb.getEmpresas();
    const empresa = empresas.find(e => e.id === id);

    if (!empresa) {
      return {
        error: {
          code: 404,
          message: 'Empresa no encontrada'
        }
      };
    }

    return {
      data: empresa
    };
  }

  static async handleUpdateEmpresa(id: number, updates: Partial<Empresa>): Promise<MockResponse<Empresa>> {
    await this.simulateLatency();

    const empresa = mockDb.updateEmpresa(id, updates);
    if (!empresa) {
      return {
        error: {
          code: 404,
          message: 'Empresa no encontrada'
        }
      };
    }

    return { data: empresa };
  }

  // Handlers para Monedas
  static async handleGetMonedas(): Promise<MockResponse<Moneda[]>> {
    await this.simulateLatency();
    
    const monedas = mockDb.getMonedas();
    return { data: monedas };
  }

  static async handleCreateMoneda(dto: CreateMonedaDto): Promise<MockResponse<Moneda>> {
    await this.simulateLatency();

    // Validar código único
    const existingMoneda = mockDb.getMonedas().find(m => m.codigo === dto.codigo);
    if (existingMoneda) {
      return {
        error: {
          code: 409,
          message: `Ya existe una moneda con el código ${dto.codigo}`
        }
      };
    }

    const nuevaMoneda = mockDb.addMoneda({
      codigo: dto.codigo,
      nombre: dto.nombre,
      simbolo: dto.simbolo,
      activa: true,
      esBase: false,
      precision: dto.precision || 2
    });

    return { data: nuevaMoneda };
  }

  static async handleUpdateMoneda(id: number, updates: UpdateMonedaDto): Promise<MockResponse<Moneda>> {
    await this.simulateLatency();

    const updatedMoneda = mockDb.updateMoneda(id, updates);
    if (!updatedMoneda) {
      return {
        error: {
          code: 404,
          message: 'Moneda no encontrada'
        }
      };
    }

    return { data: updatedMoneda };
  }

  static async handleDeleteMoneda(id: number): Promise<MockResponse<void>> {
    await this.simulateLatency();

    const success = mockDb.deleteMoneda(id);
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Moneda no encontrada'
        }
      };
    }

    return { data: undefined };
  }

  // Handlers para Tipos de Cambio
  static async handleGetTiposCambio(queryParams?: any): Promise<MockResponse<TipoCambio[]>> {
    await this.simulateLatency();
    
    let tiposCambio = mockDb.getTiposCambio();

    // Aplicar filtros si se proporcionan
    if (queryParams) {
      if (queryParams.monedaOrigenId) {
        tiposCambio = tiposCambio.filter(tc => tc.monedaOrigenId === parseInt(queryParams.monedaOrigenId));
      }
      if (queryParams.monedaDestinoId) {
        tiposCambio = tiposCambio.filter(tc => tc.monedaDestinoId === parseInt(queryParams.monedaDestinoId));
      }
      if (queryParams.fechaDesde) {
        const fechaDesde = new Date(queryParams.fechaDesde);
        tiposCambio = tiposCambio.filter(tc => tc.fecha >= fechaDesde);
      }
      if (queryParams.fechaHasta) {
        const fechaHasta = new Date(queryParams.fechaHasta);
        tiposCambio = tiposCambio.filter(tc => tc.fecha <= fechaHasta);
      }
      if (queryParams.activo !== undefined) {
        tiposCambio = tiposCambio.filter(tc => tc.activo === (queryParams.activo === 'true'));
      }
    }

    return { data: tiposCambio };
  }

  static async handleCreateTipoCambio(dto: CreateTipoCambioDto): Promise<MockResponse<TipoCambio>> {
    await this.simulateLatency();

    // Validar que las monedas existan
    const monedas = mockDb.getMonedas();
    const monedaOrigen = monedas.find(m => m.id === dto.monedaOrigenId);
    const monedaDestino = monedas.find(m => m.id === dto.monedaDestinoId);

    if (!monedaOrigen || !monedaDestino) {
      return {
        error: {
          code: 400,
          message: 'Moneda de origen o destino no válida'
        }
      };
    }

    // Validar que no exista un tipo de cambio para la misma fecha y monedas
    const existingTc = mockDb.getTiposCambio().find(tc => 
      tc.monedaOrigenId === dto.monedaOrigenId &&
      tc.monedaDestinoId === dto.monedaDestinoId &&
      tc.fecha.toISOString().split('T')[0] === dto.fecha.toISOString().split('T')[0]
    );

    if (existingTc) {
      return {
        error: {
          code: 409,
          message: 'Ya existe un tipo de cambio para esta fecha y monedas'
        }
      };
    }

    const nuevoTipoCambio = mockDb.addTipoCambio({
      monedaOrigenId: dto.monedaOrigenId,
      monedaDestinoId: dto.monedaDestinoId,
      fecha: dto.fecha,
      cambio: dto.cambio,
      fuente: dto.fuente || 'manual',
      activo: true
    });

    return { data: nuevoTipoCambio };
  }

  static async handleUpdateTipoCambio(id: number, updates: UpdateTipoCambioDto): Promise<MockResponse<TipoCambio>> {
    await this.simulateLatency();

    const updatedTipoCambio = mockDb.updateTipoCambio(id, updates);
    if (!updatedTipoCambio) {
      return {
        error: {
          code: 404,
          message: 'Tipo de cambio no encontrado'
        }
      };
    }

    return { data: updatedTipoCambio };
  }

  static async handleDeleteTipoCambio(id: number): Promise<MockResponse<void>> {
    await this.simulateLatency();

    const success = mockDb.deleteTipoCambio(id);
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Tipo de cambio no encontrado'
        }
      };
    }

    return { data: undefined };
  }

  static async handleImportTiposCambio(csvData: string): Promise<MockResponse<{ success: number; errors: string[] }>> {
    await this.simulateLatency();

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1);
    
    let success = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const values = line.split(',');
      
      try {
        const monedaOrigen = values[0]?.trim();
        const monedaDestino = values[0]?.trim();
        const fecha = values[2]?.trim();
        const cambio = parseFloat(values[3]?.trim() || '0');
        const fuente = values[4]?.trim() || 'manual';

        if (!monedaOrigen || !monedaDestino || !fecha || isNaN(cambio)) {
          errors.push(`Línea ${i + 2}: Datos incompletos o inválidos`);
          continue;
        }

        // Buscar monedas por código
        const monedas = mockDb.getMonedas();
        const monedaOrigenObj = monedas.find(m => m.codigo === monedaOrigen);
        const monedaDestinoObj = monedas.find(m => m.codigo === monedaDestino);

        if (!monedaOrigenObj || !monedaDestinoObj) {
          errors.push(`Línea ${i + 2}: Moneda no encontrada`);
          continue;
        }

        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
          errors.push(`Línea ${i + 2}: Fecha inválida`);
          continue;
        }

        // Verificar si ya existe
        const existingTc = mockDb.getTiposCambio().find(tc => 
          tc.monedaOrigenId === monedaOrigenObj.id &&
          tc.monedaDestinoId === monedaDestinoObj.id &&
          tc.fecha.toISOString().split('T')[0] === fechaObj.toISOString().split('T')[0]
        );

        if (existingTc) {
          errors.push(`Línea ${i + 2}: Ya existe un tipo de cambio para esta fecha y monedas`);
          continue;
        }

        // Crear tipo de cambio
        mockDb.addTipoCambio({
          monedaOrigenId: monedaOrigenObj.id,
          monedaDestinoId: monedaDestinoObj.id,
          fecha: fechaObj,
          cambio: cambio,
          fuente: fuente,
          activo: true
        });

        success++;
      } catch (error) {
        errors.push(`Línea ${i + 2}: Error al procesar`);
      }
    }

    return { data: { success, errors } };
  }

  // Handlers para Series Documentales
  static async handleGetSeriesDocumentales(params?: any): Promise<MockResponse<SerieDocumental[]>> {
    await this.simulateLatency();

    let series = mockDb.getSeriesDocumentales();

    if (params?.search) {
      const search = params.search.toLowerCase();
      series = series.filter(s => 
        s.nombre.toLowerCase().includes(search) ||
        s.codigo.toLowerCase().includes(search)
      );
    }

         if (params?.activa !== undefined) {
       series = series.filter(s => s.activa === params.activa);
     }

    if (params?.empresaId) {
      series = series.filter(s => s.empresaId === params.empresaId);
    }

    const page = params?.page || 0;
    const limit = params?.limit || 10;
    const start = page * limit;
    const end = start + limit;
    const paginatedSeries = series.slice(start, end);

    return { data: paginatedSeries };
  }

  static async handleGetSerieDocumental(id: number): Promise<MockResponse<SerieDocumental>> {
    await this.simulateLatency();

    const series = mockDb.getSeriesDocumentales();
    const serie = series.find(s => s.id === id);

    if (!serie) {
      return {
        error: {
          code: 404,
          message: 'Serie documental no encontrada'
        }
      };
    }

    return { data: serie };
  }

     static async handleCreateSerieDocumental(dto: CreateSerieDocumentalDto): Promise<MockResponse<SerieDocumental>> {
     await this.simulateLatency();

     // Validar unicidad de código
     const series = mockDb.getSeriesDocumentales();
     const codeExists = series.some(s => s.codigo === dto.codigo);
      
     if (codeExists) {
       return {
         error: {
           code: 409,
           message: `El código ${dto.codigo} ya está en uso`
         }
       };
     }

     // Usar empresa demo por defecto
     const empresaId = 1;

     const newSerie = mockDb.addSerieDocumental({
       ...dto,
       empresaId,
       activa: true,
       ultimoNumero: 0
     });
     return { data: newSerie };
   }

     static async handleUpdateSerieDocumental(id: number, updates: UpdateSerieDocumentalDto): Promise<MockResponse<SerieDocumental>> {
     await this.simulateLatency();

     // Validar que la serie existe
     const series = mockDb.getSeriesDocumentales();
     const existingSerie = series.find(s => s.id === id);
      
     if (!existingSerie) {
       return {
         error: {
           code: 404,
           message: 'Serie documental no encontrada'
         }
       };
     }

     const updatedSerie = mockDb.updateSerieDocumental(id, updates);
      
     if (!updatedSerie) {
       return {
         error: {
           code: 500,
           message: 'Error al actualizar serie documental'
         }
       };
     }

     return { data: updatedSerie };
   }

  static async handleDeleteSerieDocumental(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteSerieDocumental(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Serie documental no encontrada'
        }
      };
    }

    return { data: true };
  }

  // Handlers para Personas
  static async handleGetPersonas(params?: any): Promise<MockResponse<Persona[]>> {
    await this.simulateLatency();

    let personas = mockDb.getPersonas();

    // Aplicar filtros
    if (params?.texto) {
      const texto = params.texto.toLowerCase();
      personas = personas.filter(p => 
        p.nombre.toLowerCase().includes(texto) ||
        p.apellidos.toLowerCase().includes(texto) ||
        p.nif.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto) ||
        (p.email && p.email.toLowerCase().includes(texto))
      );
    }

    if (params?.tipo) {
      personas = personas.filter(p => p.tipo === params.tipo);
    }

    if (params?.activa !== undefined) {
      personas = personas.filter(p => p.activa === params.activa);
    }

    if (params?.empresaId) {
      personas = personas.filter(p => p.empresaId === params.empresaId);
    }

    return { data: personas };
  }

  static async handleGetPersona(id: number): Promise<MockResponse<Persona>> {
    await this.simulateLatency();

    const persona = mockDb.getPersona(id);
    
    if (!persona) {
      return {
        error: {
          code: 404,
          message: 'Persona no encontrada'
        }
      };
    }

    return { data: persona };
  }

  static async handleGetPersonaDetalle(id: number): Promise<MockResponse<PersonaDetalle>> {
    await this.simulateLatency();

    const persona = mockDb.getPersona(id);
    
    if (!persona) {
      return {
        error: {
          code: 404,
          message: 'Persona no encontrada'
        }
      };
    }

    // Obtener direcciones y cuentas bancarias
    const direcciones = mockDb.getDirecciones(id);
    const cuentasBancarias = mockDb.getCuentasBancarias(id);

    const personaDetalle: PersonaDetalle = {
      ...persona,
      direcciones,
      cuentasBancarias
    };

    return { data: personaDetalle };
  }

  static async handleCreatePersona(dto: CreatePersonaDto): Promise<MockResponse<Persona>> {
    await this.simulateLatency();

    // Validar unicidad de NIF
    const personas = mockDb.getPersonas();
    const nifExists = personas.some(p => p.nif === dto.nif);
    
    if (nifExists) {
      return {
        error: {
          code: 409,
          message: `El NIF ${dto.nif} ya está registrado`
        }
      };
    }

    // Validar unicidad de código
    const codeExists = personas.some(p => p.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newPersona = mockDb.addPersona({
      ...dto,
      empresaId: 1, // Empresa demo
      activa: true
    });

    return { data: newPersona };
  }

  static async handleUpdatePersona(id: number, updates: UpdatePersonaDto): Promise<MockResponse<Persona>> {
    await this.simulateLatency();

    // Validar que la persona existe
    const personas = mockDb.getPersonas();
    const existingPersona = personas.find(p => p.id === id);
    
    if (!existingPersona) {
      return {
        error: {
          code: 404,
          message: 'Persona no encontrada'
        }
      };
    }



    const updatedPersona = mockDb.updatePersona(id, updates);
    
    if (!updatedPersona) {
      return {
        error: {
          code: 500,
          message: 'Error al actualizar persona'
        }
      };
    }

    return { data: updatedPersona };
  }

  static async handleDeletePersona(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deletePersona(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Persona no encontrada'
        }
      };
    }

    return { data: true };
  }

  // Handlers para Direcciones
  static async handleGetDirecciones(personaId?: number): Promise<MockResponse<Direccion[]>> {
    await this.simulateLatency();

    const direcciones = mockDb.getDirecciones(personaId);
    return { data: direcciones };
  }

  static async handleCreateDireccion(dto: CreateDireccionDto): Promise<MockResponse<Direccion>> {
    await this.simulateLatency();

    const newDireccion = mockDb.addDireccion(dto);
    return { data: newDireccion };
  }

  static async handleUpdateDireccion(id: number, updates: UpdateDireccionDto): Promise<MockResponse<Direccion>> {
    await this.simulateLatency();

    const updatedDireccion = mockDb.updateDireccion(id, updates);
    
    if (!updatedDireccion) {
      return {
        error: {
          code: 404,
          message: 'Dirección no encontrada'
        }
      };
    }

    return { data: updatedDireccion };
  }

  static async handleDeleteDireccion(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteDireccion(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Dirección no encontrada'
        }
      };
    }

    return { data: true };
  }

  // Handlers para Cuentas Bancarias
  static async handleGetCuentasBancarias(personaId?: number): Promise<MockResponse<CuentaBancaria[]>> {
    await this.simulateLatency();

    const cuentas = mockDb.getCuentasBancarias(personaId);
    return { data: cuentas };
  }

  static async handleCreateCuentaBancaria(dto: CreateCuentaBancariaDto): Promise<MockResponse<CuentaBancaria>> {
    await this.simulateLatency();

    const newCuenta = mockDb.addCuentaBancaria(dto);
    return { data: newCuenta };
  }

  static async handleUpdateCuentaBancaria(id: number, updates: UpdateCuentaBancariaDto): Promise<MockResponse<CuentaBancaria>> {
    await this.simulateLatency();

    const updatedCuenta = mockDb.updateCuentaBancaria(id, updates);
    
    if (!updatedCuenta) {
      return {
        error: {
          code: 404,
          message: 'Cuenta bancaria no encontrada'
        }
      };
    }

    return { data: updatedCuenta };
  }

  static async handleDeleteCuentaBancaria(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteCuentaBancaria(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Cuenta bancaria no encontrada'
        }
      };
    }

    return { data: true };
  }

  // ===== HANDLERS PARA PRODUCTOS =====

  static async handleGetProductos(params?: any): Promise<MockResponse<Producto[]>> {
    await this.simulateLatency();

    let productos = mockDb.getProductos();

    // Aplicar filtros
    if (params?.texto) {
      const texto = params.texto.toLowerCase();
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(texto)) ||
        false
      );
    }

    if (params?.tipoProducto) {
      productos = productos.filter(p => p.tipoProducto === params.tipoProducto);
    }

    if (params?.tipoArticulo) {
      productos = productos.filter(p => p.tipoArticulo === params.tipoArticulo);
    }

    if (params?.estado) {
      productos = productos.filter(p => p.estado === params.estado);
    }

    if (params?.categoriaPadreId) {
      productos = productos.filter(p => p.categoriaPadreId === params.categoriaPadreId);
    }

    if (params?.activa !== undefined) {
      productos = productos.filter(p => p.activa === params.activa);
    }

    if (params?.stockBajo) {
      productos = productos.filter(p => p.stockActual <= p.stockMinimo);
    }

    if (params?.esCompuesto !== undefined) {
      productos = productos.filter(p => p.esCompuesto === params.esCompuesto);
    }

    return { data: productos };
  }

  static async handleGetProducto(id: number): Promise<MockResponse<Producto>> {
    await this.simulateLatency();

    const producto = mockDb.getProducto(id);
    
    if (!producto) {
      return {
        error: {
          code: 404,
          message: 'Producto no encontrado'
        }
      };
    }

    return { data: producto };
  }

  static async handleGetProductoDetalle(id: number): Promise<MockResponse<ProductoDetalle>> {
    await this.simulateLatency();

    const producto = mockDb.getProducto(id);
    
    if (!producto) {
      return {
        error: {
          code: 404,
          message: 'Producto no encontrado'
        }
      };
    }

    // Obtener datos expandidos
    const unidadMedidaVenta = mockDb.getUnidadMedida(producto.unidadMedidaVentaId);
    const unidadMedidaCompra = producto.unidadMedidaCompraId ? mockDb.getUnidadMedida(producto.unidadMedidaCompraId) : undefined;
    const unidadMedidaStock = mockDb.getUnidadMedida(producto.unidadMedidaStockId);
    const tipoIva = mockDb.getTipoIva(producto.tipoIvaId);
    const categoriaPadre = producto.categoriaPadreId ? mockDb.getCategoriaProducto(producto.categoriaPadreId) : undefined;
    const componentes = mockDb.getComponentesBOM(producto.id);

    const productoDetalle: ProductoDetalle = {
      ...producto,
      unidadMedidaVenta,
      unidadMedidaCompra,
      unidadMedidaStock,
      tipoIva,
      categoriaPadre,
      componentes
    };

    return { data: productoDetalle };
  }

  static async handleCreateProducto(dto: CreateProductoDto): Promise<MockResponse<Producto>> {
    await this.simulateLatency();

    // Validar unicidad de código
    const productos = mockDb.getProductos();
    const codeExists = productos.some(p => p.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newProducto = mockDb.addProducto({
      ...dto,
      empresaId: 1, // Empresa demo
      stockActual: 0,
      margenBruto: 0,
      nivel: 0,
      tipoArticulo: dto.tipoArticulo as any // Cast temporal para evitar error de tipo
    });

    return { data: newProducto };
  }

  static async handleUpdateProducto(id: number, updates: UpdateProductoDto): Promise<MockResponse<Producto>> {
    await this.simulateLatency();

    // Validar que el producto existe
    const productos = mockDb.getProductos();
    const existingProducto = productos.find(p => p.id === id);
    
    if (!existingProducto) {
      return {
        error: {
          code: 404,
          message: 'Producto no encontrado'
        }
      };
    }

    // Validar unicidad de código si se está cambiando
    if (updates.codigo && updates.codigo !== existingProducto.codigo) {
      const codeExists = productos.some(p => p.codigo === updates.codigo && p.id !== id);
      
      if (codeExists) {
        return {
          error: {
            code: 409,
            message: `El código ${updates.codigo} ya está en uso`
          }
        };
      }
    }

    const updatedProducto = mockDb.updateProducto(id, updates as any); // Cast temporal para evitar error de tipo
    
    if (!updatedProducto) {
      return {
        error: {
          code: 500,
          message: 'Error al actualizar producto'
        }
      };
    }

    return { data: updatedProducto };
  }

  static async handleDeleteProducto(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteProducto(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Producto no encontrado'
        }
      };
    }

    return { data: true };
  }

  // ===== HANDLERS PARA UNIDADES DE MEDIDA =====

  static async handleGetUnidadesMedida(): Promise<MockResponse<UnidadMedida[]>> {
    await this.simulateLatency();
    
    const unidadesMedida = mockDb.getUnidadesMedida();
    return { data: unidadesMedida };
  }

  static async handleCreateUnidadMedida(dto: CreateUnidadMedidaDto): Promise<MockResponse<UnidadMedida>> {
    await this.simulateLatency();

    // Validar unicidad de código
    const unidadesMedida = mockDb.getUnidadesMedida();
    const codeExists = unidadesMedida.some(um => um.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newUnidadMedida = mockDb.addUnidadMedida({
      ...dto,
      empresaId: 1 // Empresa demo
    } as any); // Cast temporal para evitar error de tipo

    return { data: newUnidadMedida };
  }

  // ===== HANDLERS PARA TIPOS DE ARTÍCULO =====

  static async handleGetTiposArticulo(): Promise<MockResponse<TipoArticulo[]>> {
    await this.simulateLatency();
    
    const tiposArticulo = mockDb.getTiposArticulo();
    return { data: tiposArticulo };
  }

  static async handleCreateTipoArticulo(dto: CreateTipoArticuloDto): Promise<MockResponse<TipoArticulo>> {
    await this.simulateLatency();

    // Validar unicidad de código
    const tiposArticulo = mockDb.getTiposArticulo();
    const codeExists = tiposArticulo.some(ta => ta.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newTipoArticulo = mockDb.addTipoArticulo({
      ...dto,
      empresaId: 1 // Empresa demo
    });

    return { data: newTipoArticulo };
  }

  // ===== HANDLERS PARA TIPOS DE IVA =====

  static async handleGetTiposIva(): Promise<MockResponse<TipoIva[]>> {
    await this.simulateLatency();
    
    const tiposIva = mockDb.getTiposIva();
    return { data: tiposIva };
  }

  static async handleCreateTipoIva(dto: CreateTipoIvaDto): Promise<MockResponse<TipoIva>> {
    await this.simulateLatency();

    // Validar unicidad de código
    const tiposIva = mockDb.getTiposIva();
    const codeExists = tiposIva.some(ti => ti.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newTipoIva = mockDb.addTipoIva({
      ...dto,
      empresaId: 1 // Empresa demo
    });

    return { data: newTipoIva };
  }

  // ===== HANDLERS PARA CATEGORÍAS =====

  static async handleGetCategoriasProducto(): Promise<MockResponse<CategoriaProducto[]>> {
    await this.simulateLatency();
    
    const categorias = mockDb.getCategoriasProducto();
    return { data: categorias };
  }

  static async handleCreateCategoriaProducto(dto: CreateCategoriaProductoDto): Promise<MockResponse<CategoriaProducto>> {
    await this.simulateLatency();

    // Validar unicidad de código
    const categorias = mockDb.getCategoriasProducto();
    const codeExists = categorias.some(c => c.codigo === dto.codigo);
    
    if (codeExists) {
      return {
        error: {
          code: 409,
          message: `El código ${dto.codigo} ya está en uso`
        }
      };
    }

    const newCategoria = mockDb.addCategoriaProducto({
      ...dto,
      nivel: 1,
      stockActual: 0,
      tipoArticulo: dto.tipoArticulo as any,
      empresaId: 1 // Empresa demo
    });

    return { data: newCategoria };
  }

  // ===== HANDLERS PARA COMPONENTES BOM =====

  static async handleGetComponentesBOM(productoId: number): Promise<MockResponse<ComponenteBOM[]>> {
    await this.simulateLatency();

    const componentes = mockDb.getComponentesBOM(productoId);
    return { data: componentes };
  }

  static async handleCreateComponenteBOM(dto: CreateComponenteBOMDto): Promise<MockResponse<ComponenteBOM>> {
    await this.simulateLatency();

    const newComponente = mockDb.addComponenteBOM(dto);
    return { data: newComponente };
  }

  static async handleUpdateComponenteBOM(id: number, updates: UpdateComponenteBOMDto): Promise<MockResponse<ComponenteBOM>> {
    await this.simulateLatency();

    const componenteActualizado = mockDb.updateComponenteBOM(id, updates);
    
    if (!componenteActualizado) {
      return {
        error: {
          code: 404,
          message: 'Componente BOM no encontrado'
        }
      };
    }

    return { data: componenteActualizado };
  }

  static async handleDeleteComponenteBOM(id: number): Promise<MockResponse<boolean>> {
    await this.simulateLatency();

    const success = mockDb.deleteComponenteBOM(id);
    
    if (!success) {
      return {
        error: {
          code: 404,
          message: 'Componente BOM no encontrado'
        }
      };
    }

    return { data: true };
  }

  // ===== HANDLERS PARA CÁLCULO DE COSTES =====

  static async handleCalcularCosteEstimado(productoId: number): Promise<MockResponse<CosteEstimadoResponse>> {
    await this.simulateLatency();

    const producto = mockDb.getProducto(productoId);
    if (!producto) {
      return {
        error: {
          code: 404,
          message: 'Producto no encontrado'
        }
      };
    }

    const componentes = mockDb.getComponentesBOM(productoId);
    let costeEstimado = 0;
    const componentesDetalle = [];

    for (const componente of componentes) {
      const productoComponente = mockDb.getProducto(componente.componenteId);
      if (productoComponente) {
        const costeUnitario = productoComponente.costeEstandar || 0;
        const costeTotal = componente.cantidad * costeUnitario;
        costeEstimado += costeTotal;

        componentesDetalle.push({
          componenteId: componente.componenteId,
          cantidad: componente.cantidad,
          costeUnitario,
          costeTotal
        });
      }
    }

    const response: CosteEstimadoResponse = {
      productoId,
      costeEstimado,
      componentes: componentesDetalle,
      fechaCalculo: new Date()
    };

    return { data: response };
  }

  // ===== HANDLERS PARA SELECTOR DE PRODUCTOS =====

  static async handleBuscarProductosSelector(texto: string): Promise<MockResponse<ProductoSelectorData[]>> {
    await this.simulateLatency();

    const productos = mockDb.getProductos();
    const productosFiltrados = productos
      .filter(p => p.activa && (
        p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        p.codigo.toLowerCase().includes(texto.toLowerCase())
      ))
      .slice(0, 20) // Limitar a 20 resultados
      .map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        tipoProducto: p.tipoProducto,
        precioVenta: p.precioVenta,
        stockActual: p.stockActual,
        activa: p.activa
      }));

    return { data: productosFiltrados };
  }

  // Handler genérico para rutas no encontradas
  static async handleNotFound(): Promise<MockResponse> {
    await this.simulateLatency();
    
    return {
      error: {
        code: 404,
        message: 'Endpoint no encontrado'
      }
    };
  }

  // Handler para errores de servidor
  static async handleServerError(): Promise<MockResponse> {
    await this.simulateLatency();
    
    return {
      error: {
        code: 500,
        message: 'Error interno del servidor'
      }
    };
  }
}
