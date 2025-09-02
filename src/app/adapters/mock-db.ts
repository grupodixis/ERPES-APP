import { faker } from '@faker-js/faker/locale/es';
import { User, Role, Permission, Empresa, AuthState } from '../domain/auth.types';
import { Moneda, TipoCambio, SerieDocumental } from '../domain/configuracion.types';
import { Persona, Direccion, CuentaBancaria } from '../domain/terceros.types';
import { 
  Producto, UnidadMedida, TipoArticulo, TipoIva, CategoriaProducto, ComponenteBOM 
} from '../domain/productos.types';

// Configurar faker para seed determinista
faker.seed(12345);

export interface MockDatabase {
  empresas: Empresa[];
  usuarios: User[];
  roles: Role[];
  permisos: Permission[];
  monedas: Moneda[];
  tiposCambio: TipoCambio[];
  seriesDocumentales: SerieDocumental[];
  personas: Persona[];
  direcciones: Direccion[];
  cuentasBancarias: CuentaBancaria[];
  productos: Producto[];
  unidadesMedida: UnidadMedida[];
  tiposArticulo: TipoArticulo[];
  tiposIva: TipoIva[];
  categoriasProducto: CategoriaProducto[];
  componentesBOM: ComponenteBOM[];
  authState: AuthState | null;
}

export class MockDb {
  private db: MockDatabase;

  constructor() {
    this.db = this.generateSeedData();
  }

  private generateSeedData(): MockDatabase {
    // Generar permisos base
    const permisos = this.generatePermisos();
    
    // Generar roles con permisos
    const roles = this.generateRoles(permisos);
    
    // Generar empresas
    const empresas = this.generateEmpresas();
    
    // Generar usuarios con roles
    const usuarios = this.generateUsuarios(roles, empresas);
    
    // Generar personas primero
    const personas = this.generatePersonas();
    
    // Generar datos de productos
    const unidadesMedida = this.generateUnidadesMedida();
    const tiposArticulo = this.generateTiposArticulo();
    const tiposIva = this.generateTiposIva();
    const categoriasProducto = this.generateCategoriasProducto();
    const productos = this.generateProductos(unidadesMedida, tiposArticulo, tiposIva, categoriasProducto);
    const componentesBOM = this.generateComponentesBOM(productos, unidadesMedida);
    
    return {
      empresas,
      usuarios,
      roles,
      permisos,
      monedas: this.generateMonedas(),
      tiposCambio: this.generateTiposCambio(),
      seriesDocumentales: this.generateSeriesDocumentales(),
      personas,
      direcciones: this.generateDirecciones(personas),
      cuentasBancarias: this.generateCuentasBancarias(personas),
      productos,
      unidadesMedida,
      tiposArticulo,
      tiposIva,
      categoriasProducto,
      componentesBOM,
      authState: null
    };
  }

  private generatePermisos(): Permission[] {
    const recursos = [
      'usuarios', 'roles', 'permisos', 'empresas',
      'productos', 'inventario', 'ventas', 'compras',
      'obras', 'presupuestos', 'planificacion',
      'contabilidad', 'rrhh', 'dms', 'auditoria'
    ];

    const acciones = ['read', 'write', 'delete', 'admin'];

    const permisos: Permission[] = [];
    let id = 1;

    recursos.forEach(recurso => {
      acciones.forEach(accion => {
        permisos.push({
          id: id++,
          nombre: `${accion}_${recurso}`,
          recurso,
          accion,
          descripcion: `${accion} ${recurso}`,
          activo: true
        });
      });
    });

    return permisos;
  }

  private generateRoles(permisos: Permission[]): Role[] {
    const roles: Role[] = [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Acceso completo al sistema',
        permisos: permisos.filter(p => p.accion === 'admin'),
        activo: true
      },
      {
        id: 2,
        nombre: 'Editor',
        descripcion: 'Puede leer y escribir en la mayoría de módulos',
        permisos: permisos.filter(p => p.accion === 'read' || p.accion === 'write'),
        activo: true
      },
      {
        id: 3,
        nombre: 'Lector',
        descripcion: 'Solo puede leer datos',
        permisos: permisos.filter(p => p.accion === 'read'),
        activo: true
      },
      {
        id: 4,
        nombre: 'Ventas',
        descripcion: 'Acceso específico a módulo de ventas',
        permisos: permisos.filter(p => p.recurso === 'ventas' || p.recurso === 'productos'),
        activo: true
      },
      {
        id: 5,
        nombre: 'Compras',
        descripcion: 'Acceso específico a módulo de compras',
        permisos: permisos.filter(p => p.recurso === 'compras' || p.recurso === 'productos'),
        activo: true
      }
    ];

    return roles;
  }

  private generateEmpresas(): Empresa[] {
    const empresas: Empresa[] = [
      {
        id: 1,
        nombre: 'Constructora Demo S.A.',
        nif: 'B12345678',
        razonSocial: 'Constructora Demo Sociedad Anónima',
        cif: 'B12345678',
        direccion: faker.location.streetAddress(),
        telefono: faker.phone.number(),
        email: 'info@constructora-demo.com',
        activa: true
      },
      {
        id: 2,
        nombre: 'Inmobiliaria Ejemplo S.L.',
        nif: 'B87654321',
        razonSocial: 'Inmobiliaria Ejemplo Sociedad Limitada',
        cif: 'B87654321',
        direccion: faker.location.streetAddress(),
        telefono: faker.phone.number(),
        email: 'info@inmobiliaria-ejemplo.com',
        activa: true
      },
      {
        id: 3,
        nombre: 'Promociones Test S.A.',
        nif: 'A11223344',
        razonSocial: 'Promociones Test Sociedad Anónima',
        cif: 'A11223344',
        direccion: faker.location.streetAddress(),
        telefono: faker.phone.number(),
        email: 'info@promociones-test.com',
        activa: false
      }
    ];

    return empresas;
  }

  private generateUsuarios(roles: Role[], empresas: Empresa[]): User[] {
    const usuarios: User[] = [];
    let id = 1;

    // Usuario administrador
    usuarios.push({
      id: id++,
      username: 'admin',
      nombre: 'Admin',
      apellidos: 'Sistema',
      email: 'admin@demo.com',
      password: 'admin', // En producción esto estaría hasheado
      activo: true,
      roles: [roles[0]], // Administrador
      permisos: roles[0].permisos,
      empresaId: empresas[0].id,
      ultimoAcceso: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    });

    // Usuario editor
    usuarios.push({
      id: id++,
      nombre: 'Editor',
      apellidos: 'Demo',
      email: 'editor@demo.com',
      password: 'editor123',
      activo: true,
      roles: [roles[1]], // Editor
      permisos: roles[1].permisos,
      empresaId: empresas[0].id,
      ultimoAcceso: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    });

    // Usuario lector
    usuarios.push({
      id: id++,
      nombre: 'Lector',
      apellidos: 'Demo',
      email: 'lector@demo.com',
      password: 'lector123',
      activo: true,
      roles: [roles[2]], // Lector
      empresaId: empresas[0].id,
      ultimoAcceso: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    });

    // Usuario ventas
    usuarios.push({
      id: id++,
      nombre: 'Ventas',
      apellidos: 'Demo',
      email: 'ventas@demo.com',
      password: 'ventas123',
      activo: true,
      roles: [roles[3]], // Ventas
      empresaId: empresas[0].id,
      ultimoAcceso: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    });

    // Usuario compras
    usuarios.push({
      id: id++,
      nombre: 'Compras',
      apellidos: 'Demo',
      email: 'compras@demo.com',
      password: 'compras123',
      activo: true,
      roles: [roles[4]], // Compras
      empresaId: empresas[0].id,
      ultimoAcceso: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    });

    // Generar usuarios adicionales aleatorios
    for (let i = 0; i < 20; i++) {
      const nombre = faker.person.firstName();
      const apellidos = faker.person.lastName();
      const email = faker.internet.email({ firstName: nombre, lastName: apellidos });
      const role = faker.helpers.arrayElement(roles);
      const empresa = faker.helpers.arrayElement(empresas);

      usuarios.push({
        id: id++,
        nombre,
        apellidos,
        email,
        password: 'password123',
        activo: faker.datatype.boolean(0.8), // 80% activos
        roles: [role],
        empresaId: empresa.id,
        ultimoAcceso: faker.date.recent(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }

    return usuarios;
  }

  // Métodos para acceder a los datos
  getEmpresas(): Empresa[] {
    return [...this.db.empresas];
  }

  getUsuarios(): User[] {
    return [...this.db.usuarios];
  }

  getRoles(): Role[] {
    return [...this.db.roles];
  }

  getPermisos(): Permission[] {
    return [...this.db.permisos];
  }

  getMonedas(): Moneda[] {
    return [...this.db.monedas];
  }

  getTiposCambio(): TipoCambio[] {
    return [...this.db.tiposCambio];
  }

  getSeriesDocumentales(): SerieDocumental[] {
    return [...this.db.seriesDocumentales];
  }

  getAuthState(): AuthState | null {
    return this.db.authState;
  }

  setAuthState(authState: AuthState | null): void {
    this.db.authState = authState;
  }

  // Métodos para modificar datos
  addUsuario(usuario: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUsuario: User = {
      ...usuario,
      id: Math.max(...this.db.usuarios.map(u => u.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.usuarios.push(newUsuario);
    return newUsuario;
  }

  updateUsuario(id: number, updates: Partial<User>): User | null {
    const index = this.db.usuarios.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.db.usuarios[index] = {
      ...this.db.usuarios[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.usuarios[index];
  }

  deleteUsuario(id: number): boolean {
    const index = this.db.usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.db.usuarios.splice(index, 1);
    return true;
  }

  addRole(role: Omit<Role, 'id'>): Role {
    const newRole: Role = {
      ...role,
      id: Math.max(...this.db.roles.map(r => r.id)) + 1
    };
    this.db.roles.push(newRole);
    return newRole;
  }

  updateRole(id: number, updates: Partial<Role>): Role | null {
    const index = this.db.roles.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.db.roles[index] = {
      ...this.db.roles[index],
      ...updates
    };
    return this.db.roles[index];
  }

  deleteRole(id: number): boolean {
    const index = this.db.roles.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.db.roles.splice(index, 1);
    return true;
  }

  // Empresas
  updateEmpresa(id: number, updates: Partial<Empresa>): Empresa | null {
    const index = this.db.empresas.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.db.empresas[index] = {
      ...this.db.empresas[index],
      ...updates
    };
    return this.db.empresas[index];
  }

  // Monedas
  addMoneda(moneda: Omit<Moneda, 'id' | 'createdAt' | 'updatedAt'>): Moneda {
    const newMoneda: Moneda = {
      ...moneda,
      id: Math.max(...this.db.monedas.map(m => m.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.monedas.push(newMoneda);
    return newMoneda;
  }

  updateMoneda(id: number, updates: Partial<Moneda>): Moneda | null {
    const index = this.db.monedas.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.db.monedas[index] = {
      ...this.db.monedas[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.monedas[index];
  }

  deleteMoneda(id: number): boolean {
    const index = this.db.monedas.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.db.monedas.splice(index, 1);
    return true;
  }

  // Tipos de Cambio
  addTipoCambio(tipoCambio: Omit<TipoCambio, 'id' | 'createdAt' | 'updatedAt'>): TipoCambio {
    const newTipoCambio: TipoCambio = {
      ...tipoCambio,
      id: Math.max(...this.db.tiposCambio.map(tc => tc.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.tiposCambio.push(newTipoCambio);
    return newTipoCambio;
  }

  updateTipoCambio(id: number, updates: Partial<TipoCambio>): TipoCambio | null {
    const index = this.db.tiposCambio.findIndex(tc => tc.id === id);
    if (index === -1) return null;

    this.db.tiposCambio[index] = {
      ...this.db.tiposCambio[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.tiposCambio[index];
  }

  deleteTipoCambio(id: number): boolean {
    const index = this.db.tiposCambio.findIndex(tc => tc.id === id);
    if (index === -1) return false;

    this.db.tiposCambio.splice(index, 1);
    return true;
  }

  // Series Documentales
  addSerieDocumental(serie: Omit<SerieDocumental, 'id' | 'createdAt' | 'updatedAt'>): SerieDocumental {
    const newSerie: SerieDocumental = {
      ...serie,
      id: Math.max(...this.db.seriesDocumentales.map(s => s.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.seriesDocumentales.push(newSerie);
    return newSerie;
  }

  updateSerieDocumental(id: number, updates: Partial<SerieDocumental>): SerieDocumental | null {
    const index = this.db.seriesDocumentales.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.db.seriesDocumentales[index] = {
      ...this.db.seriesDocumentales[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.seriesDocumentales[index];
  }

  deleteSerieDocumental(id: number): boolean {
    const index = this.db.seriesDocumentales.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.db.seriesDocumentales.splice(index, 1);
    return true;
  }

  // Método para resetear la base de datos
  reset(): void {
    this.db = this.generateSeedData();
  }

  // Método para obtener estadísticas
  getStats() {
    return {
      totalUsuarios: this.db.usuarios.length,
      usuariosActivos: this.db.usuarios.filter(u => u.activo).length,
      totalRoles: this.db.roles.length,
      totalPermisos: this.db.permisos.length,
      totalEmpresas: this.db.empresas.length,
      empresasActivas: this.db.empresas.filter(e => e.activa).length,
      totalMonedas: this.db.monedas.length,
      totalTiposCambio: this.db.tiposCambio.length,
      totalSeriesDocumentales: this.db.seriesDocumentales.length
    };
  }

  // Generar monedas
  private generateMonedas(): Moneda[] {
    const monedas: Moneda[] = [];
    let id = 1;

    // Monedas principales
    const monedasPrincipales = [
      { codigo: 'EUR', nombre: 'Euro', simbolo: '€', precision: 2, esBase: true },
      { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', precision: 2, esBase: false },
      { codigo: 'GBP', nombre: 'Libra Esterlina', simbolo: '£', precision: 2, esBase: false },
      { codigo: 'JPY', nombre: 'Yen Japonés', simbolo: '¥', precision: 0, esBase: false },
      { codigo: 'CHF', nombre: 'Franco Suizo', simbolo: 'CHF', precision: 2, esBase: false },
      { codigo: 'CAD', nombre: 'Dólar Canadiense', simbolo: 'C$', precision: 2, esBase: false },
      { codigo: 'AUD', nombre: 'Dólar Australiano', simbolo: 'A$', precision: 2, esBase: false },
      { codigo: 'CNY', nombre: 'Yuan Chino', simbolo: '¥', precision: 2, esBase: false }
    ];

    monedasPrincipales.forEach(moneda => {
      monedas.push({
        id: id++,
        codigo: moneda.codigo,
        nombre: moneda.nombre,
        simbolo: moneda.simbolo,
        activa: true,
        esBase: moneda.esBase,
        precision: moneda.precision,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      });
    });

    return monedas;
  }

  // Generar tipos de cambio
  private generateTiposCambio(): TipoCambio[] {
    const tiposCambio: TipoCambio[] = [];
    let id = 1;

    // Obtener monedas para generar tipos de cambio
    const monedas = this.generateMonedas();
    const monedaBase = monedas.find(m => m.esBase);
    const monedasNoBase = monedas.filter(m => !m.esBase);

    if (!monedaBase) return tiposCambio;

    // Generar tipos de cambio para los últimos 30 días
    const hoy = new Date();
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);

      monedasNoBase.forEach(moneda => {
        // Generar cambio realista con pequeñas variaciones
        const cambioBase = this.getCambioBase(moneda.codigo);
        const variacion = (Math.random() - 0.5) * 0.02; // ±1% variación
        const cambio = cambioBase * (1 + variacion);

        tiposCambio.push({
          id: id++,
          monedaOrigenId: monedaBase.id,
          monedaDestinoId: moneda.id,
          fecha: new Date(fecha),
          cambio: parseFloat(cambio.toFixed(4)),
          fuente: 'banco_central',
          activo: true,
          createdAt: new Date(fecha),
          updatedAt: new Date(fecha)
        });

        // Tipo de cambio inverso
        tiposCambio.push({
          id: id++,
          monedaOrigenId: moneda.id,
          monedaDestinoId: monedaBase.id,
          fecha: new Date(fecha),
          cambio: parseFloat((1 / cambio).toFixed(4)),
          fuente: 'banco_central',
          activo: true,
          createdAt: new Date(fecha),
          updatedAt: new Date(fecha)
        });
      });
    }

    return tiposCambio;
  }

  // Generar series documentales
  private generateSeriesDocumentales(): SerieDocumental[] {
    const series: SerieDocumental[] = [];
    let id = 1;

    const seriesData = [
      {
        codigo: 'FAC',
        nombre: 'Facturas',
        descripcion: 'Serie para facturas de venta',
        tipo: 'factura' as const,
        formato: '{SERIE}-{AÑO}-{NUMERO}',
        ultimoNumero: 1250
      },
      {
        codigo: 'ALB',
        nombre: 'Albaranes',
        descripcion: 'Serie para albaranes de entrega',
        tipo: 'albaran' as const,
        formato: '{SERIE}-{FECHA}-{SECUENCIAL}',
        ultimoNumero: 890
      },
      {
        codigo: 'PED',
        nombre: 'Pedidos',
        descripcion: 'Serie para pedidos de clientes',
        tipo: 'pedido' as const,
        formato: '{CODIGO}-{AÑO}-{NUMERO}',
        ultimoNumero: 456
      },
      {
        codigo: 'PRE',
        nombre: 'Presupuestos',
        descripcion: 'Serie para presupuestos',
        tipo: 'presupuesto' as const,
        formato: '{SERIE}-{MES}-{AÑO}-{NUMERO}',
        ultimoNumero: 234
      },
      {
        codigo: 'OT',
        nombre: 'Órdenes de Trabajo',
        descripcion: 'Serie para órdenes de trabajo',
        tipo: 'ot' as const,
        formato: '{SERIE}-{AÑO}-{DIA}-{SECUENCIAL}',
        ultimoNumero: 567
      }
    ];

    seriesData.forEach(serie => {
      series.push({
        id: id++,
        codigo: serie.codigo,
        nombre: serie.nombre,
        descripcion: serie.descripcion,
        tipo: serie.tipo,
        formato: serie.formato,
        activa: true,
        ultimoNumero: serie.ultimoNumero,
        empresaId: 1, // Empresa demo
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      });
    });

    return series;
  }

  // Obtener cambio base por moneda (valores aproximados)
  private getCambioBase(codigo: string): number {
    const cambios: { [key: string]: number } = {
      'USD': 1.08,
      'GBP': 0.86,
      'JPY': 160.0,
      'CHF': 0.95,
      'CAD': 1.45,
      'AUD': 1.65,
      'CNY': 7.8
    };
    return cambios[codigo] || 1.0;
  }

  // Generar personas
  private generatePersonas(): Persona[] {
    const personas: Persona[] = [];
    let id = 1;

    const tipos = ['cliente', 'proveedor', 'empleado', 'otro'] as const;
    const nombres = [
      'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Isabel',
      'Miguel', 'Elena', 'Francisco', 'Rosa', 'Javier', 'Pilar', 'Antonio', 'Teresa'
    ];
    const apellidos = [
      'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
      'Gómez', 'Martin', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz'
    ];

    // Generar 30 personas
    for (let i = 0; i < 30; i++) {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const nombre = faker.helpers.arrayElement(nombres);
      const apellido = faker.helpers.arrayElement(apellidos);
      const nif = faker.string.alphanumeric(8).toUpperCase();
      
      personas.push({
        id: id++,
        codigo: `P${String(i + 1).padStart(4, '0')}`,
        nombre,
        apellidos: apellido,
        nif,
        email: faker.internet.email({ firstName: nombre, lastName: apellido }),
        telefono: faker.phone.number(),
        tipo,
        activa: faker.datatype.boolean(0.9), // 90% activas
        empresaId: 1, // Empresa demo
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent({ days: 30 })
      });
    }

    return personas;
  }

  // Generar direcciones
  private generateDirecciones(personas: Persona[]): Direccion[] {
    const direcciones: Direccion[] = [];
    let id = 1;

    // Generar 2-3 direcciones por persona
    personas.forEach(persona => {
      const numDirecciones = faker.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < numDirecciones; i++) {
        const tipo = faker.helpers.arrayElement(['fiscal', 'envio', 'otro'] as const);
        
        direcciones.push({
          id: id++,
          personaId: persona.id,
          tipo,
          calle: faker.location.street(),
          numero: faker.number.int({ min: 1, max: 200 }).toString(),
          piso: faker.number.int({ min: 1, max: 10 }).toString(),
          puerta: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
          codigoPostal: faker.location.zipCode('#####'),
          ciudad: faker.location.city(),
          provincia: faker.location.state(),
          pais: 'España',
          esPrincipal: i === 0, // La primera es principal
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 })
        });
      }
    });

    return direcciones;
  }

  // Generar cuentas bancarias
  private generateCuentasBancarias(personas: Persona[]): CuentaBancaria[] {
    const cuentasBancarias: CuentaBancaria[] = [];
    let id = 1;

    const bancos = [
      'Banco Santander', 'BBVA', 'CaixaBank', 'Bankia', 'Banco Sabadell',
      'Kutxabank', 'Ibercaja', 'Unicaja', 'Bankinter', 'ING Direct'
    ];

    // Generar 1-2 cuentas por persona
    personas.forEach(persona => {
      const numCuentas = faker.number.int({ min: 1, max: 2 });
      
      for (let i = 0; i < numCuentas; i++) {
        const banco = faker.helpers.arrayElement(bancos);
        const dc = faker.number.int({ min: 10, max: 99 }).toString();
        const cuenta = faker.number.int({ min: 10000000000000000000, max: 99999999999999999999 }).toString();
        const iban = `ES${dc}${cuenta}`;
        
        cuentasBancarias.push({
          id: id++,
          personaId: persona.id,
          banco,
          sucursal: faker.location.city(),
          dc,
          cuenta,
          iban,
          swift: faker.string.alphanumeric(8).toUpperCase(),
          esPrincipal: i === 0, // La primera es principal
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 })
        });
      }
    });

    return cuentasBancarias;
  }

  // Métodos CRUD para personas
  getPersonas(): Persona[] {
    return this.db.personas;
  }

  getPersona(id: number): Persona | null {
    return this.db.personas.find(p => p.id === id) || null;
  }

  addPersona(persona: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Persona {
    const newPersona: Persona = {
      ...persona,
      id: Math.max(...this.db.personas.map(p => p.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.personas.push(newPersona);
    return newPersona;
  }

  updatePersona(id: number, updates: Partial<Persona>): Persona | null {
    const index = this.db.personas.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.db.personas[index] = {
      ...this.db.personas[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.personas[index];
  }

  deletePersona(id: number): boolean {
    const index = this.db.personas.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.db.personas.splice(index, 1);
    return true;
  }

  // Métodos CRUD para direcciones
  getDirecciones(personaId?: number): Direccion[] {
    if (personaId) {
      return this.db.direcciones.filter(d => d.personaId === personaId);
    }
    return this.db.direcciones;
  }

  addDireccion(direccion: Omit<Direccion, 'id' | 'createdAt' | 'updatedAt'>): Direccion {
    const newDireccion: Direccion = {
      ...direccion,
      id: Math.max(...this.db.direcciones.map(d => d.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.direcciones.push(newDireccion);
    return newDireccion;
  }

  updateDireccion(id: number, updates: Partial<Direccion>): Direccion | null {
    const index = this.db.direcciones.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    this.db.direcciones[index] = {
      ...this.db.direcciones[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.direcciones[index];
  }

  deleteDireccion(id: number): boolean {
    const index = this.db.direcciones.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.db.direcciones.splice(index, 1);
    return true;
  }

  // Métodos CRUD para cuentas bancarias
  getCuentasBancarias(personaId?: number): CuentaBancaria[] {
    if (personaId) {
      return this.db.cuentasBancarias.filter(c => c.personaId === personaId);
    }
    return this.db.cuentasBancarias;
  }

  addCuentaBancaria(cuenta: Omit<CuentaBancaria, 'id' | 'createdAt' | 'updatedAt'>): CuentaBancaria {
    const newCuenta: CuentaBancaria = {
      ...cuenta,
      id: Math.max(...this.db.cuentasBancarias.map(c => c.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.cuentasBancarias.push(newCuenta);
    return newCuenta;
  }

  updateCuentaBancaria(id: number, updates: Partial<CuentaBancaria>): CuentaBancaria | null {
    const index = this.db.cuentasBancarias.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.db.cuentasBancarias[index] = {
      ...this.db.cuentasBancarias[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.cuentasBancarias[index];
  }

  deleteCuentaBancaria(id: number): boolean {
    const index = this.db.cuentasBancarias.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.db.cuentasBancarias.splice(index, 1);
    return true;
  }

  // ===== GENERACIÓN DE DATOS DE PRODUCTOS =====

  // Generar unidades de medida
  private generateUnidadesMedida(): UnidadMedida[] {
    const unidades: UnidadMedida[] = [
      {
        id: 1,
        codigo: 'UN',
        nombre: 'Unidad',
        simbolo: 'un',
        esBase: true,
        factorConversion: 1,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        esBase: false,
        factorConversion: 1,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        codigo: 'M',
        nombre: 'Metro',
        simbolo: 'm',
        esBase: false,
        factorConversion: 1,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        codigo: 'L',
        nombre: 'Litro',
        simbolo: 'l',
        esBase: false,
        factorConversion: 1,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        codigo: 'H',
        nombre: 'Hora',
        simbolo: 'h',
        esBase: false,
        factorConversion: 1,
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return unidades;
  }

  // Generar tipos de artículo
  private generateTiposArticulo(): TipoArticulo[] {
    const tipos: TipoArticulo[] = [
      {
        id: 1,
        codigo: 'SIMPLE',
        nombre: 'Simple',
        descripcion: 'Producto simple sin componentes',
        stockMinimo: 10,
        stockMaximo: 100,
        puntoReorden: 5,
        notificarStockBajo: true,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        codigo: 'COMPUESTO',
        nombre: 'Compuesto',
        descripcion: 'Producto con lista de materiales',
        stockMinimo: 5,
        stockMaximo: 50,
        puntoReorden: 2,
        notificarStockBajo: true,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        codigo: 'LOTE',
        nombre: 'Lote',
        descripcion: 'Control por lotes',
        stockMinimo: 20,
        stockMaximo: 200,
        puntoReorden: 10,
        notificarStockBajo: true,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        codigo: 'SERIE',
        nombre: 'Serie',
        descripcion: 'Control por series',
        stockMinimo: 1,
        stockMaximo: 10,
        puntoReorden: 1,
        notificarStockBajo: false,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return tipos;
  }

  // Generar tipos de IVA
  private generateTiposIva(): TipoIva[] {
    const tipos: TipoIva[] = [
      {
        id: 1,
        codigo: 'IVA0',
        nombre: 'IVA 0%',
        porcentaje: 0,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        codigo: 'IVA10',
        nombre: 'IVA 10%',
        porcentaje: 10,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        codigo: 'IVA21',
        nombre: 'IVA 21%',
        porcentaje: 21,
        activo: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return tipos;
  }

  // Generar categorías de producto (ahora categorías de partidas)
  private generateCategoriasProducto(): CategoriaProducto[] {
    const categorias: CategoriaProducto[] = [
      {
        id: 1,
        codigo: 'BAR',
        nombre: 'Barandillas',
        descripcion: 'Categoría para barandillas y pasamanos',
        tipoProducto: 'barandilla',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 1,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        codigo: 'PUE',
        nombre: 'Puertas',
        descripcion: 'Categoría para puertas interiores y exteriores',
        tipoProducto: 'puerta',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 2,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        codigo: 'VEN',
        nombre: 'Ventanas',
        descripcion: 'Categoría para ventanas y cerramientos',
        tipoProducto: 'ventana',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 3,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        codigo: 'ESC',
        nombre: 'Escaleras',
        descripcion: 'Categoría para escaleras y rampas',
        tipoProducto: 'escalera',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 4,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        codigo: 'CER',
        nombre: 'Cerramientos',
        descripcion: 'Categoría para cerramientos y estructuras',
        tipoProducto: 'cerramiento',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 5,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        codigo: 'EST',
        nombre: 'Estructuras',
        descripcion: 'Categoría para estructuras metálicas y de hormigón',
        tipoProducto: 'estructura',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 6,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        codigo: 'ACA',
        nombre: 'Acabados',
        descripcion: 'Categoría para acabados y revestimientos',
        tipoProducto: 'acabado',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 7,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        codigo: 'INS',
        nombre: 'Instalaciones',
        descripcion: 'Categoría para instalaciones técnicas',
        tipoProducto: 'instalacion',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: undefined,
        nivel: 0,
        orden: 8,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Subcategorías
      {
        id: 9,
        codigo: 'BAR-AC',
        nombre: 'Barandillas de Acero',
        descripcion: 'Barandillas fabricadas en acero',
        tipoProducto: 'barandilla',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: 1,
        nivel: 1,
        orden: 1,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        codigo: 'BAR-AL',
        nombre: 'Barandillas de Aluminio',
        descripcion: 'Barandillas fabricadas en aluminio',
        tipoProducto: 'barandilla',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: 1,
        nivel: 1,
        orden: 2,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 11,
        codigo: 'PUE-INT',
        nombre: 'Puertas Interiores',
        descripcion: 'Puertas para uso interior',
        tipoProducto: 'puerta',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: 2,
        nivel: 1,
        orden: 1,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 12,
        codigo: 'PUE-EXT',
        nombre: 'Puertas Exteriores',
        descripcion: 'Puertas para uso exterior',
        tipoProducto: 'puerta',
        tipoArticulo: 'simple',
        estado: 'activo',
        unidadMedidaVentaId: 1,
        unidadMedidaCompraId: 1,
        unidadMedidaStockId: 1,
        precioVenta: 0,
        precioCompra: 0,
        costeEstandar: 0,
        tipoIvaId: 1,
        exentoIva: false,
        stockActual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        puntoReorden: 0,
        categoriaPadreId: 2,
        nivel: 1,
        orden: 2,
        esCompuesto: false,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: false,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return categorias;
  }

  // Generar productos
  private generateProductos(
    unidadesMedida: UnidadMedida[], 
    tiposArticulo: TipoArticulo[], 
    tiposIva: TipoIva[], 
    categorias: CategoriaProducto[]
  ): Producto[] {
    const productos: Producto[] = [];
    let id = 1;

    // Productos simples
    for (let i = 1; i <= 20; i++) {
      const tipoProducto = faker.helpers.arrayElement(['producto', 'servicio', 'kit', 'materia_prima']);
      const tipoArticulo = faker.helpers.arrayElement(['simple', 'lote', 'serie', 'compuesto']);
      const esCompuesto = tipoArticulo === 'compuesto';
      
      productos.push({
        id: id++,
        codigo: `P${i.toString().padStart(4, '0')}`,
        nombre: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        tipoProducto: tipoProducto as any,
        tipoArticulo: tipoArticulo as any,
        estado: 'activo',
        unidadMedidaVentaId: faker.helpers.arrayElement(unidadesMedida).id,
        unidadMedidaCompraId: faker.helpers.arrayElement(unidadesMedida).id,
        unidadMedidaStockId: faker.helpers.arrayElement(unidadesMedida).id,
        precioVenta: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        precioCompra: parseFloat(faker.commerce.price({ min: 5, max: 800 })),
        costeEstandar: parseFloat(faker.commerce.price({ min: 8, max: 900 })),
        tipoIvaId: faker.helpers.arrayElement(tiposIva).id,
        exentoIva: false,
        stockActual: faker.number.int({ min: 0, max: 100 }),
        stockMinimo: faker.number.int({ min: 5, max: 20 }),
        stockMaximo: faker.number.int({ min: 50, max: 200 }),
        puntoReorden: faker.number.int({ min: 10, max: 30 }),
        categoriaPadreId: faker.helpers.arrayElement(categorias).id,
        nivel: 0,
        esCompuesto,
        esLote: tipoArticulo === 'lote',
        esSerie: tipoArticulo === 'serie',
        requiereLote: tipoArticulo === 'lote',
        requiereSerie: tipoArticulo === 'serie',
        controlStock: true,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Productos compuestos
    for (let i = 1; i <= 5; i++) {
      productos.push({
        id: id++,
        codigo: `P${(20 + i).toString().padStart(4, '0')}`,
        nombre: `Kit ${faker.commerce.productName()}`,
        descripcion: `Kit compuesto de ${faker.commerce.productName()}`,
        tipoProducto: 'barandilla',
        tipoArticulo: 'compuesto',
        estado: 'activo',
        unidadMedidaVentaId: faker.helpers.arrayElement(unidadesMedida).id,
        unidadMedidaCompraId: faker.helpers.arrayElement(unidadesMedida).id,
        unidadMedidaStockId: faker.helpers.arrayElement(unidadesMedida).id,
        precioVenta: parseFloat(faker.commerce.price({ min: 100, max: 2000 })),
        precioCompra: parseFloat(faker.commerce.price({ min: 80, max: 1600 })),
        costeEstandar: parseFloat(faker.commerce.price({ min: 90, max: 1800 })),
        tipoIvaId: faker.helpers.arrayElement(tiposIva).id,
        exentoIva: false,
        stockActual: faker.number.int({ min: 0, max: 50 }),
        stockMinimo: faker.number.int({ min: 2, max: 10 }),
        stockMaximo: faker.number.int({ min: 20, max: 100 }),
        puntoReorden: faker.number.int({ min: 5, max: 15 }),
        categoriaPadreId: faker.helpers.arrayElement(categorias).id,
        nivel: 0,
        esCompuesto: true,
        esLote: false,
        esSerie: false,
        requiereLote: false,
        requiereSerie: false,
        controlStock: true,
        activa: true,
        empresaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return productos;
  }

  // Generar componentes BOM
  private generateComponentesBOM(productos: Producto[], unidadesMedida: UnidadMedida[]): ComponenteBOM[] {
    const componentes: ComponenteBOM[] = [];
    let id = 1;

    // Solo productos compuestos tienen BOM
    const productosCompuestos = productos.filter(p => p.esCompuesto);
    const productosSimples = productos.filter(p => !p.esCompuesto);

    productosCompuestos.forEach(producto => {
      const numComponentes = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < numComponentes; i++) {
        const componente = faker.helpers.arrayElement(productosSimples);
        
        componentes.push({
          id: id++,
          productoId: producto.id,
          componenteId: componente.id,
          cantidad: faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 }),
          unidadMedidaId: faker.helpers.arrayElement(unidadesMedida).id,
          desperdicio: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
          costeUnitario: componente.costeEstandar || 0,
          costeTotal: 0, // Se calculará
          posicion: i + 1,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    return componentes;
  }

  // ===== MÉTODOS CRUD PARA PRODUCTOS =====

  getProductos(): Producto[] {
    return this.db.productos;
  }

  getProducto(id: number): Producto | undefined {
    return this.db.productos.find(p => p.id === id);
  }

  addProducto(producto: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>): Producto {
    const newProducto: Producto = {
      ...producto,
      id: Math.max(...this.db.productos.map(p => p.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.productos.push(newProducto);
    return newProducto;
  }

  updateProducto(id: number, updates: Partial<Producto>): Producto | null {
    const index = this.db.productos.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.db.productos[index] = {
      ...this.db.productos[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.productos[index];
  }

  deleteProducto(id: number): boolean {
    const index = this.db.productos.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.db.productos.splice(index, 1);
    return true;
  }

  // ===== MÉTODOS CRUD PARA UNIDADES DE MEDIDA =====

  getUnidadesMedida(): UnidadMedida[] {
    return this.db.unidadesMedida;
  }

  getUnidadMedida(id: number): UnidadMedida | undefined {
    return this.db.unidadesMedida.find(um => um.id === id);
  }

  addUnidadMedida(unidadMedida: Omit<UnidadMedida, 'id' | 'createdAt' | 'updatedAt'>): UnidadMedida {
    const newUnidadMedida: UnidadMedida = {
      ...unidadMedida,
      id: Math.max(...this.db.unidadesMedida.map(um => um.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.unidadesMedida.push(newUnidadMedida);
    return newUnidadMedida;
  }

  updateUnidadMedida(id: number, updates: Partial<UnidadMedida>): UnidadMedida | null {
    const index = this.db.unidadesMedida.findIndex(um => um.id === id);
    if (index === -1) return null;
    
    this.db.unidadesMedida[index] = {
      ...this.db.unidadesMedida[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.unidadesMedida[index];
  }

  deleteUnidadMedida(id: number): boolean {
    const index = this.db.unidadesMedida.findIndex(um => um.id === id);
    if (index === -1) return false;
    
    this.db.unidadesMedida.splice(index, 1);
    return true;
  }

  // ===== MÉTODOS CRUD PARA TIPOS DE ARTÍCULO =====

  getTiposArticulo(): TipoArticulo[] {
    return this.db.tiposArticulo;
  }

  getTipoArticulo(id: number): TipoArticulo | undefined {
    return this.db.tiposArticulo.find(ta => ta.id === id);
  }

  addTipoArticulo(tipoArticulo: Omit<TipoArticulo, 'id' | 'createdAt' | 'updatedAt'>): TipoArticulo {
    const newTipoArticulo: TipoArticulo = {
      ...tipoArticulo,
      id: Math.max(...this.db.tiposArticulo.map(ta => ta.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.tiposArticulo.push(newTipoArticulo);
    return newTipoArticulo;
  }

  updateTipoArticulo(id: number, updates: Partial<TipoArticulo>): TipoArticulo | null {
    const index = this.db.tiposArticulo.findIndex(ta => ta.id === id);
    if (index === -1) return null;
    
    this.db.tiposArticulo[index] = {
      ...this.db.tiposArticulo[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.tiposArticulo[index];
  }

  deleteTipoArticulo(id: number): boolean {
    const index = this.db.tiposArticulo.findIndex(ta => ta.id === id);
    if (index === -1) return false;
    
    this.db.tiposArticulo.splice(index, 1);
    return true;
  }

  // ===== MÉTODOS CRUD PARA TIPOS DE IVA =====

  getTiposIva(): TipoIva[] {
    return this.db.tiposIva;
  }

  getTipoIva(id: number): TipoIva | undefined {
    return this.db.tiposIva.find(ti => ti.id === id);
  }

  addTipoIva(tipoIva: Omit<TipoIva, 'id' | 'createdAt' | 'updatedAt'>): TipoIva {
    const newTipoIva: TipoIva = {
      ...tipoIva,
      id: Math.max(...this.db.tiposIva.map(ti => ti.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.tiposIva.push(newTipoIva);
    return newTipoIva;
  }

  updateTipoIva(id: number, updates: Partial<TipoIva>): TipoIva | null {
    const index = this.db.tiposIva.findIndex(ti => ti.id === id);
    if (index === -1) return null;
    
    this.db.tiposIva[index] = {
      ...this.db.tiposIva[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.tiposIva[index];
  }

  deleteTipoIva(id: number): boolean {
    const index = this.db.tiposIva.findIndex(ti => ti.id === id);
    if (index === -1) return false;
    
    this.db.tiposIva.splice(index, 1);
    return true;
  }

  // ===== MÉTODOS CRUD PARA CATEGORÍAS =====

  getCategoriasProducto(): CategoriaProducto[] {
    return this.db.categoriasProducto;
  }

  getCategoriaProducto(id: number): CategoriaProducto | undefined {
    return this.db.categoriasProducto.find(c => c.id === id);
  }

  addCategoriaProducto(categoria: Omit<CategoriaProducto, 'id' | 'createdAt' | 'updatedAt'>): CategoriaProducto {
    const newCategoria: CategoriaProducto = {
      ...categoria,
      id: Math.max(...this.db.categoriasProducto.map(c => c.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.categoriasProducto.push(newCategoria);
    return newCategoria;
  }

  updateCategoriaProducto(id: number, updates: Partial<CategoriaProducto>): CategoriaProducto | null {
    const index = this.db.categoriasProducto.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.db.categoriasProducto[index] = {
      ...this.db.categoriasProducto[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.categoriasProducto[index];
  }

  deleteCategoriaProducto(id: number): boolean {
    const index = this.db.categoriasProducto.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.db.categoriasProducto.splice(index, 1);
    return true;
  }

  // ===== MÉTODOS CRUD PARA COMPONENTES BOM =====

  getComponentesBOM(productoId?: number): ComponenteBOM[] {
    if (productoId) {
      return this.db.componentesBOM.filter(c => c.productoId === productoId);
    }
    return this.db.componentesBOM;
  }

  getComponenteBOM(id: number): ComponenteBOM | undefined {
    return this.db.componentesBOM.find(c => c.id === id);
  }

  addComponenteBOM(componente: Omit<ComponenteBOM, 'id' | 'createdAt' | 'updatedAt'>): ComponenteBOM {
    const newComponente: ComponenteBOM = {
      ...componente,
      id: Math.max(...this.db.componentesBOM.map(c => c.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.componentesBOM.push(newComponente);
    return newComponente;
  }

  updateComponenteBOM(id: number, updates: Partial<ComponenteBOM>): ComponenteBOM | null {
    const index = this.db.componentesBOM.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.db.componentesBOM[index] = {
      ...this.db.componentesBOM[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.db.componentesBOM[index];
  }

  deleteComponenteBOM(id: number): boolean {
    const index = this.db.componentesBOM.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.db.componentesBOM.splice(index, 1);
    return true;
  }
}

// Instancia singleton
export const mockDb = new MockDb();
