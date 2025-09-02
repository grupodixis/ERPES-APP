// DBML — ERP corregido + multiempresa + multimoneda (SQL Server-friendly)
// Modificaciones aplicadas:
// - IdMoneda NOT NULL en documentos (y nuevos índices por Fecha/Estado donde aplica).
// - Índices adicionales: Token de recuperación, fechas en documentos, compuestos en MarcasReloj, etc.
// - Unicidad por empresa de CodigoSKU en Productos.
// - Notas de checks de dominio (porcentajes, cantidades/importe >= 0, factores > 0, horas coherentes).
// - Evitado ciclo contable: quitadas FKs de LineasAsiento a Facturas/FacturasCompra (se mantiene referencia informativa).
// - Notas para restricciones no representables en DBML (índices filtrados p.ej. UM principal/UM base por magnitud).

// Convenciones
// - nvarchar(longitud) para textos visibles; varchar para códigos.
// - bit NOT NULL DEFAULT(0) para booleanos.
// - Cantidades/Precios: decimal(18,4); Totales: decimal(18,2).
// - Evitado "text" -> nvarchar(max).
// - Unicidades de negocio en columnas cuando aplique; índices mínimos no redundantes.
// - Campos transversales: IdEmpresa, auditoría (Creado/Modificado), y documentos con Serie/Numero/Moneda.

// =============================
// Maestros de Organización / Catálogos
// =============================
Table Empresas {
  IdEmpresa int [pk]
  Nombre nvarchar(200) [not null]
  CIF varchar(20) [not null]
  Email nvarchar(320)
  Telefono nvarchar(30)
  Web nvarchar(200)
  Activa bit [not null, default: 1]
  IdMonedaBase int [ref: > Monedas.IdMoneda, not null]
  indexes { (CIF) [unique] }
}

Table Monedas {
  IdMoneda int [pk]
  CodigoISO char(3) [not null, unique] // Ej: EUR
  Nombre nvarchar(100) [not null]
  Simbolo nvarchar(10)
  Decimales int [not null, default: 2]
}

Table TiposCambio {
  IdTipoCambio int [pk]
  IdMoneda int [not null, ref: > Monedas.IdMoneda]
  Fecha date [not null]
  Tasa decimal(18,6) [not null] // unidades de moneda por 1 unidad base
  // Nota: Tipo de cambio global; si se desea por empresa, añadir IdEmpresa.
  indexes { (IdMoneda, Fecha) [unique] }
}

Table SeriesDocumentales {
  IdSerie int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Documento nvarchar(50) [not null] // Factura, Albaran, PedidoCliente, etc.
  Serie varchar(10) [not null]
  Prefijo varchar(10)
  Sufijo varchar(10)
  SiguienteNumero int [not null, default: 1]
  FormatoNumero nvarchar(50) // ej: 000000
  Activa bit [not null, default: 1]
  indexes {
    (IdEmpresa)
    (Documento)
    (IdEmpresa, Documento, Serie) [unique]
  }
}

Table FormasPago {
  IdFormaPago int [pk]
  Nombre nvarchar(100) [not null, unique]
  Descripcion nvarchar(255)
}

Table CondicionesPago {
  IdCondicionPago int [pk]
  Nombre nvarchar(100) [not null, unique]
  Dias int [not null, default: 0] // dias estándar
  DiaFijo int // opcional 1..31
  FinDeMes bit [not null, default: 0]
}

Table CentrosCoste {
  IdCentroCoste int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Codigo varchar(20) [not null]
  Nombre nvarchar(100) [not null]
  IdCentroPadre int [ref: > CentrosCoste.IdCentroCoste, null]
  indexes { (IdEmpresa, Codigo) [unique] }
}

Table UnidadesMedida {
  IdUM int [pk]
  Codigo varchar(10) [not null, unique] // m, m2, ud, h, kg
  Nombre nvarchar(100) [not null]
  Simbolo nvarchar(10) // m, m², u, h, kg
  Magnitud nvarchar(20) // Longitud, Area, Volumen, Masa, Tiempo, Cantidad
  EsBase bit [not null, default: 0]
  FactorAUnidadBase decimal(18,6) [not null, default: 1] // ej: cm -> 0.01 m
  DecimalesSugeridos int [not null, default: 2]
  Activa bit [not null, default: 1]
  // Nota: Deseada unicidad filtrada (Magnitud WHERE EsBase=1).
}

Table Direcciones {
  IdDireccion int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdPersona int [ref: > Personas.IdPersona, null]
  CodigoDireccion varchar(30) // DIR - IdPersona
  Calle nvarchar(255)
  CP varchar(10)
  Localidad nvarchar(100)
  Provincia nvarchar(100)
  Pais nvarchar(100)
  Tipo nvarchar(30) // Fiscal, Envio, Obra
}

Table CuentasBancarias {
  IdCuenta int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdPersona int [ref: > Personas.IdPersona, null]
  CodigoCuenta varchar(30) // CTA - IdPersona
  IBAN varchar(34)
  SWIFT varchar(11)
  Titular nvarchar(200)
  Activa bit [not null, default: 1]
  indexes { (IBAN) [unique] }
}

// =============================
// Tablas de Sistema
// =============================
Table Usuarios {
  IdUsuario int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Email nvarchar(320) [not null]
  Nombre nvarchar(100)
  ClaveHash varbinary(256) [not null]
  Salt varbinary(256) [not null]
  TokenRecuperacion nvarchar(200)
  FechaExpiracionToken datetime
  EstaActivo bit [not null, default: 1]
  FechaCreacion datetime [not null]
  indexes { 
    (IdEmpresa, Email) [unique]
    (TokenRecuperacion)
  }
}

Table Roles {
  IdRol int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  Descripcion nvarchar(255)
  indexes { (IdEmpresa, Nombre) [unique] }
}

Table UsuariosRoles {
  IdUsuario int [not null, ref: > Usuarios.IdUsuario]
  IdRol int [not null, ref: > Roles.IdRol]
  primary key (IdUsuario, IdRol)
  indexes { (IdUsuario) (IdRol) }
}

Table Permisos {
  IdPermiso int [pk]
  Recurso nvarchar(100) [not null]
  Metodo nvarchar(20) [not null]
  Descripcion nvarchar(255)
}

Table RolesPermisos {
  IdRol int [not null, ref: > Roles.IdRol]
  IdPermiso int [not null, ref: > Permisos.IdPermiso]
  primary key (IdRol, IdPermiso)
  indexes { (IdRol) (IdPermiso) }
}

// =============================
// ERP — Personas / Terceros
// =============================
Table Personas {
  IdPersona int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100)
  Apellido1 nvarchar(100)
  Apellido2 nvarchar(100)
  RazonSocial nvarchar(200)
  FormaJuridica char(2) [not null, note: 'PF/PJ']
  TipoIdFiscal varchar(5) [not null]
  IdFiscal varchar(20) [not null]
  Telefono nvarchar(30)
  Email nvarchar(320)
  Web nvarchar(200)
  Idioma nvarchar(10)
  NotificarEmail bit [not null, default: 1]
  EsProvisional bit [not null, default: 0]
  Estado nvarchar(50)
  Notas nvarchar(max)
  CreadoEl datetime
  CreadoPor int [ref: > Usuarios.IdUsuario, null]
  ModificadoEl datetime
  ModificadoPor int [ref: > Usuarios.IdUsuario, null]
  indexes {
    (IdEmpresa, TipoIdFiscal, IdFiscal) [unique]
    (Nombre, Apellido1, Apellido2, RazonSocial) 
  }
}

Table Clientes {
  IdCliente int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdPersona int [not null, ref: > Personas.IdPersona]
  CodigoCliente varchar(30) // CLT - IdPersona
  IdFormaPago int [ref: > FormasPago.IdFormaPago, null]
  IdCondicionPago int [ref: > CondicionesPago.IdCondicionPago, null]
  LimiteCredito decimal(18,2) [not null, default: 0]
  DescuentoComercialPct decimal(9,4) [not null, default: 0]
  RecargoEquivalencia bit [not null, default: 0]
  ExentoIVA bit [not null, default: 0]
  IdVendedor int [ref: > Personas.IdPersona, null]

  Activo bit [not null, default: 1]
  CreadoEl datetime
  ModificadoEl datetime
  indexes { (IdEmpresa, IdPersona) [unique]  }
}

Table Proveedores {
  IdProveedor int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdPersona int [not null, ref: > Personas.IdPersona]
  CodigoProveedor varchar(30) // PRV - IdPersona
  IdFormaPago int [ref: > FormasPago.IdFormaPago, null]
  IdCondicionPago int [ref: > CondicionesPago.IdCondicionPago, null]
  IBAN varchar(34)
  SWIFT varchar(11)
  RetencionIRPFPct decimal(5,2)
  ContactoComercial nvarchar(200)
  EmailFacturas nvarchar(320)
  Activo bit [not null, default: 1]
  CreadoEl datetime
  ModificadoEl datetime
  indexes { (IdEmpresa, IdPersona) [unique] }
}

Table Operarios {
  IdOperario int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdPersona int [not null, ref: > Personas.IdPersona]
  CodigoOperario varchar(30) // OPR - IdPersona
  IdCategoriaOperario int [ref: > CategoriasOperario.IdCategoriaOperario, null]
  FechaAlta date [not null]
  NSS nvarchar(20)
  FechaNacimiento date
  GrupoCotizacion nvarchar(10)
  CentroTrabajo nvarchar(100)
  IBANNomina varchar(34)
  EmailCorporativo nvarchar(320)
  TelefonoEmpresa nvarchar(30)
  CosteHoraBase decimal(18,4) [not null, default: 0]
  Activo bit [not null, default: 1]
  indexes { (IdPersona) (IdEmpresa) }
}

Table CategoriasOperario {
  IdCategoriaOperario int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Codigo varchar(20)
  Nombre nvarchar(100) [not null]
  CosteHoraBase decimal(18,4) [not null, default: 0]
  Activa bit [not null, default: 1]
  indexes { (IdEmpresa, Nombre) [unique] }
}

Table TiposMaquinaria {
  IdTipoMaquinaria int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Codigo varchar(20)
  Nombre nvarchar(100) [not null]
  CosteHoraBase decimal(18,4) [not null, default: 0]
  Activa bit [not null, default: 1]
  indexes { (IdEmpresa, Nombre) [unique] }
}


Table TipoVinculo {
  IdTipoVinculo int [pk]
  Nombre nvarchar(100) [not null]
}

Table VinculosObra {
  IdVinculo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdObra int [not null, ref: > Obras.IdObra]
  IdPersona int [not null, ref: > Personas.IdPersona]
  CodigoVinculo varchar(30) // VCL - IdPersona
  IdTipoVinculo int [not null, ref: > TipoVinculo.IdTipoVinculo]
  indexes { (IdObra, IdPersona, IdTipoVinculo) [unique] }
}

// =============================
// ERP — Obras / Estructura
// =============================
Table Obras {
  IdObra int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdCliente int [not null, ref: > Clientes.IdCliente]
  Codigo varchar(50) [not null, note: 'Formato: OB-0001']
  Nombre nvarchar(200)
  Estado nvarchar(50)
  DireccionObraId int [ref: > Direcciones.IdDireccion, null]
  ResponsableId int [ref: > Personas.IdPersona, null]
  FechaInicioPrevista date
  FechaFinPrevista date
  FechaInicioReal date
  FechaFinReal date
  PresupuestoObjetivo decimal(18,2)
  IdCentroCoste int [ref: > CentrosCoste.IdCentroCoste, null]
  EsProvisional bit [not null, default: 0]
  indexes { 
    (IdEmpresa) 
    (IdCliente) 
    (IdEmpresa, Codigo) [unique] 
  }
}

Table Capitulos {
  IdCapitulo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdObra int [not null, ref: > Obras.IdObra]
  IdPadre int [ref: > Capitulos.IdCapitulo, null]
  Codigo varchar(50) [not null, note: 'Formato: OB-0001.01']
  Nombre nvarchar(200)
  Estado nvarchar(50)
  Orden int
  Observaciones nvarchar(max)
  EsProvisional bit [not null, default: 0]
  indexes {
    (Codigo, IdObra) [unique]
    (IdObra)
    (IdPadre)
  }
}

Table Partidas {
  IdPartida int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdCapitulo int [not null, ref: > Capitulos.IdCapitulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  Codigo varchar(50) [not null, note: 'Formato: OB-0001.01.001']
  Nombre nvarchar(200)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  Alto decimal(18,4) [not null, default: 0]
  Ancho decimal(18,4) [not null, default: 0]
  Largo decimal(18,4) [not null, default: 0]
  Formula nvarchar(255)
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  CostePrevisto decimal(18,4)
  MargenPct decimal(9,4)
  MermaPct decimal(9,4)
  IdCentroCoste int [ref: > CentrosCoste.IdCentroCoste, null]
  Orden int
  Estado nvarchar(50)
  EsProvisional bit [not null, default: 0]
  indexes {
    (IdCapitulo)
    (IdCapitulo, Codigo) [unique]
    (IdProducto)
    (IdUnidadMedida)
  }
}

Table Presupuestos {
  IdPresupuesto int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdCliente int [not null, ref: > Clientes.IdCliente]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  Nombre nvarchar(200)
  Estado nvarchar(50)
  FechaCreacion date [not null]
  Observaciones nvarchar(max)
  indexes { 
    (IdCliente) (IdEmpresa)
    (FechaCreacion)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table VersionesPresupuesto {
  IdVersionPresupuesto int [pk]
  IdPresupuesto int [not null, ref: > Presupuestos.IdPresupuesto]
  NumeroVersion int [not null]
  Fecha date [not null]
  Estado nvarchar(50)
  Comentarios nvarchar(255)
  indexes {
    (IdPresupuesto, NumeroVersion) [unique]
  }
}



Table VersionesPartidas {
  IdVersionPartida int [pk]
  IdVersionPresupuesto int [not null, ref: > VersionesPresupuesto.IdVersionPresupuesto]
  IdPartida int [not null, ref: > Partidas.IdPartida]
  PrecioVenta decimal(18,4) [not null, default: 0]
  Incluida bit [not null, default: 1]
  indexes { (IdVersionPresupuesto, IdPartida) [unique]  }
}

Table OrdenesTrabajo {
  IdOrden int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdObra int [ref: > Obras.IdObra, null]
  IdPartida int [not null, ref: > Partidas.IdPartida]
  Descripcion nvarchar(255)
  FechaPrevista date
  FechaInicioPrevista date
  FechaFinPrevista date
  Prioridad int
  Estado nvarchar(50)
  AprobadoPor int [ref: > Personas.IdPersona, null]
  FechaAprobacion datetime
  Codigo varchar(50) [not null, note: 'Formato: OB-0001.01.001-OT001']
  indexes {
    (Codigo, IdPartida) [unique]
    (Estado)
    (FechaPrevista)
  }
}

Table Trabajos {
  IdTrabajo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  Tipo nvarchar(50)
  indexes { (IdEmpresa, Nombre) [unique] }
}

Table TrabajosARealizar {
  IdTrabajoRealizar int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdTrabajo int [not null, ref: > Trabajos.IdTrabajo]
  IdOrden int [not null, ref: > OrdenesTrabajo.IdOrden]
  CantidadPrevista decimal(18,4)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  FechaLimite date
  NotasTecnicas nvarchar(max)
  Estado nvarchar(50)
  indexes { (IdTrabajo) (IdOrden) (IdUnidadMedida) (Estado) (FechaLimite) }
}

Table Maquinaria {
  IdMaquinaria int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  IdTipoMaquinaria int [ref: > TiposMaquinaria.IdTipoMaquinaria, null]
  CodigoInterno varchar(50)
  NumeroSerie nvarchar(100)
  Matricula nvarchar(50)
  FechaCompra date
  ProveedorId int [ref: > Proveedores.IdProveedor, null]
  HorasAcumuladas decimal(18,2)
  ProximoMantenimiento date
  PolizaSeguro nvarchar(100)
  ITV date
  UbicacionActualId int [ref: > Ubicaciones.IdUbicacion, null]
  Estado nvarchar(50)
  indexes { (IdEmpresa, CodigoInterno) [unique] }
}

Table MaquinariaUtilizada {
  IdMaquinariaUtilizada int [pk]
  IdTrabajoRealizar int [not null, ref: > TrabajosARealizar.IdTrabajoRealizar]
  IdMaquinaria int [not null, ref: > Maquinaria.IdMaquinaria]
  indexes { (IdTrabajoRealizar, IdMaquinaria) [unique] }
}

Table Asignaciones {
  IdAsignacion int [pk]
  IdOrden int [not null, ref: > OrdenesTrabajo.IdOrden]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  indexes { (IdOrden, IdOperario) [unique] }
}

Table Escandallo {
  IdEscandallo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdOrden int [not null, ref: > OrdenesTrabajo.IdOrden]
  Estado nvarchar(50)
  indexes { (IdOrden) (Estado) }
}

Table LineasEscandallo {
  IdLineaEscandallo int [pk]
  IdEscandallo int [not null, ref: > Escandallo.IdEscandallo]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  FactorPorUMVenta decimal(18,6) [not null, default: 1]
  CantidadPrevista decimal(18,4)
  PrecioPrevisto decimal(18,4)
  Estado nvarchar(50)
  indexes { (IdEscandallo) (IdUnidadMedida) (IdProducto) (Estado) }
}

// =============================
// ERP — Compras / Stock
// =============================
Table Depositos {
  IdDeposito int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  Descripcion nvarchar(255)
  Tipo nvarchar(30) // Central, Movil, Obra
  Activo bit [not null, default: 1]
  indexes { (IdEmpresa, Nombre) [unique] }
}

Table Ubicaciones {
  IdUbicacion int [pk]
  IdDeposito int [not null, ref: > Depositos.IdDeposito]
  Codigo varchar(50) [not null] // Ej: EST-01
  Descripcion nvarchar(255)
  Tipo nvarchar(30) // Estanteria, Cajon, Palet, Zona
  Activa bit [not null, default: 1]
  indexes {
    (IdDeposito, Codigo) [unique]
    (Activa)
  }
}

Table Articulos {
  IdArticulo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Codigo varchar(20)
  Nombre nvarchar(100) [not null]
  CantidadStock decimal(18,4) [not null, default: 0]
  TipoRecurso nvarchar(30) // Material, Herramienta, EPI, etc.
  StockMinimo decimal(18,4) [not null, default: 0]
  NotificarStockCritico bit [not null, default: 0]
  IdTipoIVADefault int [ref: > TiposIVA.IdTipoIVA, null]
  IdUMStock int [not null, ref: > UnidadesMedida.IdUM]
  IdUMVentaDefault int [ref: > UnidadesMedida.IdUM, null]
  FactorCompraAVentaDefault decimal(18,6) [not null, default: 1]
  indexes {
    (IdUMStock)
    (IdEmpresa, Nombre) [unique]
  }
}

Table Entradas {
  IdEntrada int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  Fecha date [not null]
  IdProveedor int [not null, ref: > Proveedores.IdProveedor]
  Estado nvarchar(50)
  IdOrdenTrabajo int [ref: > OrdenesTrabajo.IdOrden, null]
  IdDeposito int [ref: > Depositos.IdDeposito, null]
  IdObra int [ref: > Obras.IdObra, null]
  NumeroAlbaranProveedor nvarchar(50)
  MediaUri nvarchar(500) // URI del albaran
  indexes { 
    (IdProveedor) (IdOrdenTrabajo)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasEntradas {
  IdLineaEntrada int [pk]
  IdEntrada int [not null, ref: > Entradas.IdEntrada]
  IdLineaPedidoProveedor int [ref: > LineasPedidoProveedor.IdLineaPedidoProveedor, null]
  IdTipoArticulo int [not null, ref: > Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  IdUbicacion int [ref: > Ubicaciones.IdUbicacion, null]
  Descripcion nvarchar(255)
  CantidadCompra decimal(18,4) [not null, default: 0]
  CantidadVenta decimal(18,4) [not null, default: 0]
  PrecioCompra decimal(18,4) [not null, default: 0]
  PrecioVenta decimal(18,4) [not null, default: 0]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  IdUMCompra int [ref: > UnidadesMedida.IdUM, null]
  IdUMVenta  int [ref: > UnidadesMedida.IdUM, null]
  FactorCompraAVenta decimal(18,6) [not null, default:1]
  Lote nvarchar(100)
  SerieArticulo nvarchar(100)
  FechaCaducidad date
  ImporteLinea decimal(18,2)
  // Nota: Checks deseados: Cantidades/Precios >= 0.
  indexes { (IdEntrada) (IdTipoArticulo) (IdUbicacion) (IdLineaPedidoProveedor) (IdUMCompra) (IdUMVenta) }
}

Table MovimientosInternos {
  IdMovimiento int [pk]
  IdLineaEntrada int [not null, ref: > LineasEntradas.IdLineaEntrada]
  IdUbicacionOrigen int [not null, ref: > Ubicaciones.IdUbicacion]
  IdUbicacionDestino int [not null, ref: > Ubicaciones.IdUbicacion]
  TipoMovimiento nvarchar(30) // Traspaso, Ajuste, Reserva
  DocumentoOrigen nvarchar(50)
  IdLineaOrigen int
  IdUsuario int [ref: > Usuarios.IdUsuario, null]
  Motivo nvarchar(255)
  Cantidad decimal(18,4) [not null]
  Fecha datetime [not null]
  Observaciones nvarchar(max)
  indexes { (IdLineaEntrada) (IdUbicacionOrigen) (IdUbicacionDestino) (Fecha) }
}

Table PresupuestosProveedor {
  IdPresupuestoProveedor int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdProveedor int [not null, ref: > Proveedores.IdProveedor]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  Fecha date [not null]
  Descripcion nvarchar(255)
  indexes { 
    (IdProveedor)
    (Fecha)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasPresupuestoProveedor {
  IdLineaPresupuestoProveedor int [pk]
  IdPresupuestoProveedor int [not null, ref: > PresupuestosProveedor.IdPresupuestoProveedor]
  IdTipoArticulo int [not null, ref: > Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  ImporteTotal decimal(18,2) [not null, default: 0]
  indexes { (IdPresupuestoProveedor) (IdTipoArticulo) (IdUnidadMedida) }
}

Table PedidosProveedores {
  IdPedidoProveedor int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  IdProveedor int [not null, ref: > Proveedores.IdProveedor]
  Fecha date [not null]
  FechaEntregaPrevista date
  IdDepositoEntrega int [ref: > Depositos.IdDeposito, null]
  IdObraEntrega int [ref: > Obras.IdObra, null]
  CondicionEntrega nvarchar(50)
  Estado nvarchar(50)
  CodigoAutorizacion varchar(50)
  AprobadoPor int [ref: > Personas.IdPersona, null]
  FechaAprobacion datetime
  EsIndirecto bit [not null, default: 0, note: 'TRUE si no proviene de escandallo']
  indexes { 
    (IdProveedor) (AprobadoPor)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasPedidoProveedor {
  IdLineaPedidoProveedor int [pk]
  IdPedidoProveedor int [not null, ref: > PedidosProveedores.IdPedidoProveedor]
  IdTipoArticulo int [not null, ref: > Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  IdLineaEscandallo int [ref: > LineasEscandallo.IdLineaEscandallo, null]
  Descripcion nvarchar(255)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  DescuentoPct decimal(9,4)
  EstadoRecepcion nvarchar(50) // Pendiente, Parcial, Completo, Incidencia
  // Nota: Checks deseados: Cantidad/Precio >= 0; DescuentoPct entre 0 y 100.
  indexes { (IdPedidoProveedor) (IdTipoArticulo) (IdLineaEscandallo) (IdUnidadMedida) }
}

Table RecepcionesPedido {
  IdRecepcionPedido int [pk]
  IdLineaPedidoProveedor int [not null, ref: > LineasPedidoProveedor.IdLineaPedidoProveedor]
  IdUbicacion int [ref: > Ubicaciones.IdUbicacion, null]
  Lote nvarchar(100)
  SerieArticulo nvarchar(100)
  FechaCaducidad date
  CantidadRecibida decimal(18,4) [not null, default: 0]
  Fecha date [not null]
  indexes { (IdLineaPedidoProveedor) (Fecha) }
}

// =============================
// ERP — Producción / Imputaciones
// =============================
Table Imputaciones {
  IdImputacion int [pk]
  IdLineaEscandallo int [not null, ref: > LineasEscandallo.IdLineaEscandallo]
  IdLineaEntrada int [not null, ref: > LineasEntradas.IdLineaEntrada]
  Cantidad decimal(18,4) [not null, default: 0]
  indexes { (IdLineaEscandallo) (IdLineaEntrada) }
}

// =============================
// ERP — Partes / Planificación
// =============================
Table PartesDiarios {
  IdParte int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  IdObra int [ref: > Obras.IdObra, null]
  Fecha date [not null]
  Validado bit [not null, default: 0]
  ValidadoPor int [ref: > Usuarios.IdUsuario, null]
  FechaValidacion datetime
  Observaciones nvarchar(max)
  indexes { (IdOperario, Fecha) [unique] }
}

Table TipoTrabajo {
  IdTipoTrabajo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  indexes { (IdEmpresa, Nombre) [unique] }
}

Table PlanificacionOperarios {
  IdPlanificacion int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdOrden int [not null, ref: > OrdenesTrabajo.IdOrden]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  IdTrabajoRealizar int [not null, ref: > TrabajosARealizar.IdTrabajoRealizar]
  Fecha date [not null]
  HoraInicio time
  HoraFin time
  indexes { (IdOrden) (IdOperario) (IdTrabajoRealizar) (Fecha) }
}

Table LineasDeParte {
  IdLineaParte int [pk]
  IdParte int [not null, ref: > PartesDiarios.IdParte]
  IdOrden int [not null, ref: > OrdenesTrabajo.IdOrden]
  IdTipoTrabajo int [not null, ref: > TipoTrabajo.IdTipoTrabajo]
  TipoHoraId int // Normal/Extra/Nocturna/Festivo (catálogo a definir)
  HoraInicio time
  HoraFinal time
  Horas decimal(9,4)
  CosteHoraAplicado decimal(18,4)
  Aprobado bit [not null, default: 0]
  AprobadoPor int [ref: > Usuarios.IdUsuario, null]
  FechaAprobacion datetime
  IdPlanificacion int [ref: > PlanificacionOperarios.IdPlanificacion, null]
  // Nota: Check deseado: HoraFinal >= HoraInicio cuando ambas no sean NULL.
  indexes { (IdParte) (IdOrden) (IdTipoTrabajo) (IdPlanificacion) }
}

// =============================
// ERP — RRHH
// =============================
Table ContratosLaborales {
  IdContratoLaboral int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  FechaInicio date [not null]
  FechaFin date
  TipoContrato nvarchar(50)
  CategoriaProfesional nvarchar(100)
  GrupoCotizacion nvarchar(10)
  SalarioBase decimal(18,2)
  TipoJornadaHorasSemanal decimal(9,2)
  CentroCosteId int [ref: > CentrosCoste.IdCentroCoste, null]
  Jornada nvarchar(50)
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  indexes { (IdOperario) }
}

Table CursosFormacion {
  IdCurso int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(200) [not null]
  Descripcion nvarchar(max)
  Organizador nvarchar(200)
  FechaInicio date
  FechaFin date
  CertificacionObtenida nvarchar(200)
}

Table FormacionOperarios {
  IdFormacionOperario int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  IdCurso int [not null, ref: > CursosFormacion.IdCurso]
  FechaRealizacion date
  Estado nvarchar(50)
  indexes { (IdOperario) (IdCurso) }
}

Table BajasMedicas {
  IdBaja int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  FechaInicio date [not null]
  FechaFin date
  Motivo nvarchar(200)
  Observaciones nvarchar(max)
  Estado nvarchar(50)
  indexes { (IdOperario) }
}

Table SolicitudesVacaciones {
  IdSolicitud int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  FechaInicio date [not null]
  FechaFin date [not null]
  FechaSolicitud date [not null]
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  indexes { (IdOperario) (Estado) }
}

Table TiposDiaCalendario {
  IdTipoDia int [pk]
  Nombre nvarchar(100) [unique, not null]
  Descripcion nvarchar(255)
}

Table CalendarioLaboral {
  IdCalendario int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  Fecha date [not null]
  IdTipoDia int [not null, ref: > TiposDiaCalendario.IdTipoDia]
  IdHorario int [ref: > Horarios.IdHorario, null]
  indexes {
    (IdOperario, Fecha) [unique]
    (IdTipoDia)
  }
}

Table Horarios {
  IdHorario int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  HoraInicio time [not null]
  HoraFin time [not null]
  Descripcion nvarchar(255)
}

Table HorariosOperarios {
  IdHorarioOperario int [pk]
  IdHorario int [not null, ref: > Horarios.IdHorario]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  indexes { (IdHorario) (IdOperario) }
}

Table ConfiguracionEvaluaciones {
  IdConfiguracionEvaluacion int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(100) [not null]
  Descripcion nvarchar(255)
}

Table ConfiguracionEvaluacionesOperarios {
  IdConfigEvalOperario int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  IdConfiguracionEvaluacion int [not null, ref: > ConfiguracionEvaluaciones.IdConfiguracionEvaluacion]
  ImporteBase decimal(18,2) [not null, default: 0]
  indexes { (IdOperario) (IdConfiguracionEvaluacion) }
}

Table EvaluacionPartesOperario {
  IdEvaluacionParte int [pk]
  IdParte int [not null, ref: > PartesDiarios.IdParte]
  IdConfigEvalOperario int [not null, ref: > ConfiguracionEvaluacionesOperarios.IdConfigEvalOperario]
  Calificacion int
  ValorIncentivo decimal(18,2) [not null, default: 0]
  indexes { (IdParte) (IdConfigEvalOperario) }
}

// =============================
// ERP — Productos / Desglose
// =============================
Table Productos {
  IdProducto int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  CodigoSKU varchar(50)
  CodigoBarras nvarchar(50)
  Nombre nvarchar(200) [not null]
  IdUMVenta  int [ref: > UnidadesMedida.IdUM, null]
  FactorConversion decimal(18,4) [not null, default: 1]
  EsCompuesto bit [not null, default: 0]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  PrecioCosto decimal(18,4)
  CosteEstimado decimal(18,4) [not null, default: 0]
  TiempoProduccion decimal(18,4) [not null, default: 0]
  GestionLote bit [not null, default: 0]
  GestionSerie bit [not null, default: 0]
  Caducidad bit [not null, default: 0]
  // Nota: CK deseado: FactorConversion > 0.
  indexes {
    (IdEmpresa, Nombre) [unique]
    (IdUMVenta)
    (IdEmpresa, CodigoSKU) [unique]
    (CodigoBarras)
  }
}

Table ProductosUM {
  IdProducto int [ref: > Productos.IdProducto]
  IdUM int [ref: > UnidadesMedida.IdUM]
  EsPrincipal bit [not null, default: 0]
  FactorRespectoPrincipal decimal(18,6) [not null, default: 1] // 1 caja = 6 ud
  // Nota: Deseada unicidad filtrada: 1 sola UM con EsPrincipal=1 por IdProducto.
  primary key (IdProducto, IdUM)
}


Table DesgloseProducto {
  IdDesglose int [pk]
  IdProducto int [not null, ref: > Productos.IdProducto]
  // Qué recurso usa esta línea (elige EXACTAMENTE UNO):
  TipoRecurso nvarchar(20) // 'Articulo' | 'CategoriaOperario' | 'TipoMaquinaria' | 'Subcontrata'
  IdArticulo int [ref: > Articulos.IdArticulo, null]                // Material/Subcontrata como artículo
  IdCategoriaOperario int [ref: > CategoriasOperario.IdCategoriaOperario, null]
  IdTipoMaquinaria int [ref: > TiposMaquinaria.IdTipoMaquinaria, null]
  IdProveedor int [ref: > Proveedores.IdProveedor, null]            // opcional si subcontrata directa
  IdLineaPresupuestoProveedor int [ref: > LineasPresupuestoProveedor.IdLineaPresupuestoProveedor, null]
  Descripcion nvarchar(255)
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  FactorPorUMVenta decimal(18,6) [not null, default: 1]
  Cantidad decimal(18,4) [not null, default: 0]     // usa 'h' cuando sea mano/maq
  PrecioUnitario decimal(18,4) [not null, default: 0]
  PrecioTotal decimal(18,2) [not null, default: 0]
  // Nota: Checks deseados: Cantidad/Precio >= 0.
  indexes { 
    (IdProducto)
    (IdArticulo)
    (IdCategoriaOperario)
    (IdTipoMaquinaria)
    (IdProveedor)
    (IdUnidadMedida)
  }
}

// =============================
// ERP — Fichajes / Marcas
// =============================
Table MarcasReloj {
  IdMarca int [pk]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  Fecha date [not null]
  Hora time [not null]
  TipoMarca nvarchar(50)
  Metodo nvarchar(50)
  Lat decimal(9,6)
  Lon decimal(9,6)
  DispositivoId nvarchar(100)
  Origen nvarchar(50) // App/Terminal/NFC
  Valida bit [not null, default: 1]
  Observaciones nvarchar(255)
  indexes { (IdOperario, Fecha, Hora) }
}

// =============================
// ERP — Documentos (DMS)
// =============================
Table Documentos {
  IdDocumento int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Nombre nvarchar(200) [not null]
  Tipo nvarchar(100)
  Fecha date
  Ruta nvarchar(500) // URI/Path
  MimeType varchar(100)
  HashSha256 varchar(64)
  HashMD5 varchar(32)
  TamanoBytes int
  Origen nvarchar(50) // manual/auto
  VersionActual int
  indexes { 
    (IdEmpresa, Nombre, Tipo) [unique]
  }
}

Table VersionadoDocumento {
  IdVersionDocumento int [pk]
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  Fecha datetime [not null]
  Usuario nvarchar(200)
  RutaAnterior nvarchar(500)
  RutaNueva nvarchar(500)
  Observaciones nvarchar(max)
  indexes { (IdDocumento) }
}

// Tablas puente con PK compuesta para evitar duplicados
Table DocumentosPersona {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdPersona int [not null, ref: > Personas.IdPersona]
  primary key (IdDocumento, IdPersona)
  indexes { (IdPersona) }
}

Table DocumentosCliente {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdCliente int [not null, ref: > Clientes.IdCliente]
  primary key (IdDocumento, IdCliente)
  indexes { (IdCliente) }
}

Table DocumentosOperario {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdOperario int [not null, ref: > Operarios.IdOperario]
  primary key (IdDocumento, IdOperario)
  indexes { (IdOperario) }
}

Table DocumentosProveedor {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdProveedor int [not null, ref: > Proveedores.IdProveedor]
  primary key (IdDocumento, IdProveedor)
  indexes { (IdProveedor) }
}

Table DocumentosObra {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdObra int [not null, ref: > Obras.IdObra]
  primary key (IdDocumento, IdObra)
  indexes { (IdObra) }
}

Table DocumentosPresupuesto {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdPresupuesto int [not null, ref: > Presupuestos.IdPresupuesto]
  primary key (IdDocumento, IdPresupuesto)
  indexes { (IdPresupuesto) }
}

Table DocumentosMaquinaria {
  IdDocumento int [not null, ref: > Documentos.IdDocumento]
  IdMaquinaria int [not null, ref: > Maquinaria.IdMaquinaria]
  primary key (IdDocumento, IdMaquinaria)
  indexes { (IdMaquinaria) }
}

// =============================
// ERP — Ventas (Pedidos, Albaranes, Facturas)
// =============================
Table TiposIVA {
  IdTipoIVA int [pk]
  Nombre nvarchar(50) [not null, unique]
  Porcentaje decimal(5,2) [not null, note: '0..100']
  // Nota: CK deseado: Porcentaje entre 0 y 100.
}

Table Descuentos {
  IdDescuento int [pk]
  Nombre nvarchar(50) [not null, unique]
  Tipo varchar(10) [not null, note: 'Porcentaje/Importe']
  Valor decimal(18,4) [not null, default: 0]
  EsDeLinea bit [not null, default: 1]
}

Table PedidosCliente {
  IdPedidoCliente int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  IdCliente int [not null, ref: > Clientes.IdCliente]
  IdContrato int [ref: > ContratosCliente.IdContrato, null]
  IdObra int [ref: > Obras.IdObra, null]
  Fecha date [not null]
  FechaEntregaCompromiso date
  IdVendedor int [ref: > Personas.IdPersona, null]
  DireccionEntregaId int [ref: > Direcciones.IdDireccion, null]
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  CodigoPedidoCliente varchar(50)
  indexes { 
    (IdCliente) (IdContrato)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasPedidoCliente {
  IdLineaPedidoCliente int [pk]
  IdPedidoCliente int [not null, ref: > PedidosCliente.IdPedidoCliente]
  IdPartida int [ref: > Partidas.IdPartida, null]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255) [not null]
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  IdDeposito int [ref: > Depositos.IdDeposito, null]
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  DescuentoPct decimal(9,4)
  EstadoEntrega nvarchar(50)
  // Nota: Checks deseados: Cantidad/Precio >= 0; DescuentoPct entre 0 y 100.
  indexes { (IdPedidoCliente) (IdPartida) (IdTipoIVA) (IdDescuento) (IdUnidadMedida) }
}

Table Albaranes {
  IdAlbaran int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  IdCliente int [not null, ref: > Clientes.IdCliente]
  IdObra int [ref: > Obras.IdObra, null]
  DireccionEntregaId int [ref: > Direcciones.IdDireccion, null]
  IdPedidoCliente int [ref: > PedidosCliente.IdPedidoCliente, null]
  Fecha date [not null]
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  BaseImponible decimal(18,2) [not null, default: 0]
  TotalIVA decimal(18,2) [not null, default: 0]
  TotalDocumento decimal(18,2) [not null, default: 0]
  indexes { 
    (IdCliente)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasAlbaran {
  IdLineaAlbaran int [pk]
  IdAlbaran int [not null, ref: > Albaranes.IdAlbaran]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255) [not null]
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  IdDeposito int [ref: > Depositos.IdDeposito, null]
  IdUbicacion int [ref: > Ubicaciones.IdUbicacion, null]
  Lote nvarchar(100)
  SerieArticulo nvarchar(100)
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  IdPedidoClienteLinea int [ref: > LineasPedidoCliente.IdLineaPedidoCliente, null]
  TotalLinea decimal(18,2) [not null, default: 0]
  indexes { (IdAlbaran) (IdDescuento) (IdTipoIVA) (IdUnidadMedida) }
}

Table AlbaranesCertificaciones {
  IdAlbaran int [not null, ref: > Albaranes.IdAlbaran]
  IdCertificacion int [not null, ref: > Certificaciones.IdCertificacion]
  primary key (IdAlbaran, IdCertificacion)
  indexes { (IdCertificacion) }
}

Table Facturas {
  IdFactura int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  IdCliente int [not null, ref: > Clientes.IdCliente]
  Fecha date [not null]
  TipoFactura nvarchar(20) // Normal/Rectificativa
  FacturaRectificadaId int [ref: > Facturas.IdFactura, null]
  PorcentajeRetencion decimal(5,2)
  ImporteRetencion decimal(18,2)
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  IdFormaPago int [ref: > FormasPago.IdFormaPago, null]
  IdCondicionPago int [ref: > CondicionesPago.IdCondicionPago, null]
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  BaseImponible decimal(18,2) [not null, default: 0]
  TotalIVA decimal(18,2) [not null, default: 0]
  TotalDocumento decimal(18,2) [not null, default: 0]
  IdAsiento int [ref: > AsientosContables.IdAsiento, null]
  indexes { 
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasFactura {
  IdLineaFactura int [pk]
  IdFactura int [not null, ref: > Facturas.IdFactura]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255) [not null]
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  DescuentoPct decimal(9,4)
  TotalLinea decimal(18,2) [not null, default: 0]
  // Nota: Checks deseados: Cantidad/Precio >= 0; DescuentoPct entre 0 y 100.
  indexes { (IdFactura) (IdDescuento) (IdTipoIVA) (IdUnidadMedida) }
}

Table FacturasAlbaranes {
  IdFactura int [not null, ref: > Facturas.IdFactura]
  IdAlbaran int [not null, ref: > Albaranes.IdAlbaran]
  primary key (IdFactura, IdAlbaran)
  indexes { (IdAlbaran) }
}

Table Cobros {
  IdCobro int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdFactura int [ref: > Facturas.IdFactura, null]
  IdObra int [ref: > Obras.IdObra, null]
  Fecha date [not null]
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  Importe decimal(18,2) [not null]
  MetodoPago nvarchar(50)
  NumeroRecibo nvarchar(50)
  Estado nvarchar(20) // Pendiente/Cobrado/Devuelto
  FechaValor date
  CuentaBancariaId int [ref: > CuentasBancarias.IdCuenta, null]
  Observaciones nvarchar(max)
  TipoCobro nvarchar(20) [not null, note: 'Anticipo/Factura/Regular']
  IdAsiento int [ref: > AsientosContables.IdAsiento, null]
  indexes { (IdFactura) (IdObra) (IdAsiento) (Fecha) (Estado) }
}

Table CompensacionesAnticipos {
  IdCompensacion int [pk]
  IdCobroAnticipo int [not null, ref: > Cobros.IdCobro]
  IdFactura int [not null, ref: > Facturas.IdFactura]
  Fecha date
  MontoAplicado decimal(18,2) [not null, default: 0]
  Observaciones nvarchar(max)
  indexes { (IdCobroAnticipo) (IdFactura) }
}

Table ContratosCliente {
  IdContrato int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdCliente int [not null, ref: > Clientes.IdCliente]
  Nombre nvarchar(200)
  FechaInicio date
  FechaFin date
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  ImporteTotalEstimado decimal(18,2) [not null, default: 0]
  indexes { (IdCliente) }
}

// =============================
// ERP — Certificaciones
// =============================
Table Certificaciones {
  IdCertificacion int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdVersionPresupuesto int [not null, ref: > VersionesPresupuesto.IdVersionPresupuesto]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  Fecha date [not null]
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  indexes { 
    (IdVersionPresupuesto)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasCertificacion {
  IdLineaCertificacion int [pk]
  IdCertificacion int [not null, ref: > Certificaciones.IdCertificacion]
  IdVersionPartida int [not null, ref: > VersionesPartidas.IdVersionPartida]
  CantidadCertificada decimal(18,4) [not null, default: 0]
  PorcentajeCertificado decimal(5,2) [not null, default: 0]
  Observaciones nvarchar(max)
  CantidadCertificadaAcumulada decimal(18,4) [not null, default: 0]
  CantidadCertificadaPeriodo decimal(18,4) [not null, default: 0]
  ImporteCertificadoAcumulado decimal(18,2) [not null, default: 0]
  ImporteCertificadoPeriodo decimal(18,2) [not null, default: 0]
  indexes { (IdCertificacion, IdVersionPartida) [unique] }
}

Table RetencionesCertificacion {
  IdRetencion int [pk]
  IdCertificacion int [not null, ref: > Certificaciones.IdCertificacion]
  TipoRetencion nvarchar(50) [not null]
  Porcentaje decimal(5,2) [not null, default: 0]
  Importe decimal(18,2) [not null, default: 0]
  Observaciones nvarchar(max)
  indexes { (IdCertificacion) }
}

// =============================
// ERP — Auditoría
// =============================
Table Auditoria {
  IdAuditoria int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Tabla nvarchar(100) [not null]
  IdRegistro int [not null]
  Operacion nvarchar(10) [not null] // INSERT, UPDATE, DELETE
  Fecha datetime [not null]
  Usuario nvarchar(320)
  Campo nvarchar(100)
  ValorAnterior nvarchar(max)
  ValorNuevo nvarchar(max)
  Observaciones nvarchar(max)
  indexes { (Tabla) (Fecha) }
}

// =============================
// ERP — Compras (Facturas)
// =============================
Table FacturasCompra {
  IdFacturaCompra int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Serie varchar(10)
  Numero int
  IdMoneda int [ref: > Monedas.IdMoneda, not null]
  TipoCambio decimal(18,6)
  IdProveedor int [not null, ref: > Proveedores.IdProveedor]
  Fecha date [not null]
  Estado nvarchar(50)
  Observaciones nvarchar(max)
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [ref: > TiposIVA.IdTipoIVA, null]
  BaseImponible decimal(18,2) [not null, default: 0]
  TotalIVA decimal(18,2) [not null, default: 0]
  TotalDocumento decimal(18,2) [not null, default: 0]
  IdAsiento int [ref: > AsientosContables.IdAsiento, null]
  indexes { 
    (IdProveedor)
    (Fecha)
    (Estado)
    (IdEmpresa, Serie, Numero) [unique]
  }
}

Table LineasFacturaCompra {
  IdLineaFacturaCompra int [pk]
  IdFacturaCompra int [not null, ref: > FacturasCompra.IdFacturaCompra]
  IdProducto int [ref: > Productos.IdProducto, null]
  Descripcion nvarchar(255) [not null]
  IdUnidadMedida int [ref: > UnidadesMedida.IdUM, null]
  Cantidad decimal(18,4) [not null, default: 0]
  PrecioUnitario decimal(18,4) [not null, default: 0]
  IdDescuento int [ref: > Descuentos.IdDescuento, null]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  DescuentoPct decimal(9,4)
  TotalLinea decimal(18,2) [not null, default: 0]
  // Nota: Checks deseados: Cantidad/Precio >= 0; DescuentoPct entre 0 y 100.
  indexes { (IdFacturaCompra) (IdDescuento) (IdTipoIVA) (IdUnidadMedida) }
}

Table FacturasCompraEntradas {
  IdFacturaCompra int [not null, ref: > FacturasCompra.IdFacturaCompra]
  IdEntrada int [not null, ref: > Entradas.IdEntrada]
  primary key (IdFacturaCompra, IdEntrada)
  indexes { (IdEntrada) }
}

// =============================
// ERP — Contabilidad
// =============================
Table EjerciciosContables {
  IdEjercicio int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Anio int [not null]
  FechaInicio date [not null]
  FechaFin date [not null]
  Cerrado bit [not null, default: 0]
  indexes { (IdEmpresa, Anio) [unique]}
}

Table CuentasContables {
  IdCuentaContable int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Codigo varchar(20) [not null]
  Nombre nvarchar(100)
  Tipo varchar(20)
  IdCuentaPadre int [ref: > CuentasContables.IdCuentaContable, null]
  Nivel int
  Naturaleza char(1)
  EsAuxiliar bit [not null, default: 1]
  indexes { (IdEmpresa, Codigo) [unique] }
}

Table AsientosContables {
  IdAsiento int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdEjercicio int [not null, ref: > EjerciciosContables.IdEjercicio]
  Diario nvarchar(20)
  Serie varchar(10)
  NumeroAsiento int [not null]
  Fecha date [not null]
  Concepto nvarchar(255)
  TipoAsiento nvarchar(20) // Manual, FacturaVenta, FacturaCompra, Cobro, Pago, Ajuste
  Origen nvarchar(30)      // FacturaVenta, FacturaCompra, Cobro, Pago, etc.
  IdDocumentoOrigen int    // Id del documento origen (sin FK para evitar ciclos)
  IdUsuario int [ref: > Usuarios.IdUsuario, null]
  Estado nvarchar(20)
  CreadoEl datetime
  ModificadoEl datetime
  indexes {
    (IdEjercicio, NumeroAsiento) [unique] 
    (Fecha)
  }
}

Table LineasAsiento {
  IdLineaAsiento int [pk]
  IdAsiento int [not null, ref: > AsientosContables.IdAsiento]
  IdCuentaContable int [not null, ref: > CuentasContables.IdCuentaContable]
  Descripcion nvarchar(255)
  Debe decimal(18,2) [not null, default: 0]
  Haber decimal(18,2) [not null, default: 0]
  IdObra int [ref: > Obras.IdObra, null]
  IdCentroCoste int [ref: > CentrosCoste.IdCentroCoste, null]
  IdPersona int [ref: > Personas.IdPersona, null]
  IdFactura int // referencia informativa (FK eliminada para evitar ciclo)
  IdFacturaCompra int // referencia informativa (FK eliminada para evitar ciclo)
  ReferenciaDocumento nvarchar(100)
  indexes {
    (IdAsiento)
    (IdCuentaContable)
    (IdObra)
    (IdCentroCoste)
  }
}

// =============================
// ERP — Cobros/Pagos y Vencimientos
// =============================
Table VencimientosVenta {
  IdVencimientoVenta int [pk]
  IdFactura int [not null, ref: > Facturas.IdFactura]
  NumeroCuota int [not null]
  FechaVencimiento date [not null]
  Importe decimal(18,2) [not null]
  ImporteCobrado decimal(18,2) [not null, default: 0]
  Estado nvarchar(20) // Pendiente, Parcial, Cobrado, Anulado
  MetodoPago nvarchar(50)
  CuentaBancariaId int [ref: > CuentasBancarias.IdCuenta, null]
  Observaciones nvarchar(255)
  indexes {
    (IdFactura, NumeroCuota) [unique]
    (FechaVencimiento)
    (Estado)
  }
}

Table VencimientosCompra {
  IdVencimientoCompra int [pk]
  IdFacturaCompra int [not null, ref: > FacturasCompra.IdFacturaCompra]
  NumeroCuota int [not null]
  FechaVencimiento date [not null]
  Importe decimal(18,2) [not null]
  ImportePagado decimal(18,2) [not null, default: 0]
  Estado nvarchar(20) // Pendiente, Parcial, Pagado, Anulado
  MetodoPago nvarchar(50)
  CuentaBancariaId int [ref: > CuentasBancarias.IdCuenta, null]
  Observaciones nvarchar(255)
  indexes {
    (IdFacturaCompra, NumeroCuota) [unique]
    (FechaVencimiento)
    (Estado)
  }
}

Table Pagos {
  IdPago int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdFacturaCompra int [ref: > FacturasCompra.IdFacturaCompra, null]
  IdObra int [ref: > Obras.IdObra, null]
  Fecha date [not null]
  IdMoneda int [not null, ref: > Monedas.IdMoneda]
  TipoCambio decimal(18,6)
  Importe decimal(18,2) [not null]
  MetodoPago nvarchar(50)
  NumeroOrden nvarchar(50)
  Estado nvarchar(20) // Pendiente/Pagado/Devuelto
  FechaValor date
  CuentaBancariaId int [ref: > CuentasBancarias.IdCuenta, null]
  Observaciones nvarchar(max)
  IdAsiento int [ref: > AsientosContables.IdAsiento, null]
  indexes { (IdFacturaCompra) (IdObra) (IdAsiento) (Fecha) (Estado) }
}

Table AplicacionesCobro {
  IdAplicacionCobro int [pk]
  IdCobro int [not null, ref: > Cobros.IdCobro]
  IdVencimientoVenta int [not null, ref: > VencimientosVenta.IdVencimientoVenta]
  Fecha date [not null]
  MontoAplicado decimal(18,2) [not null, default: 0]
  Observaciones nvarchar(255)
  indexes { 
  (IdCobro, IdVencimientoVenta) [unique] 
  (IdVencimientoVenta) }
}

Table AplicacionesPago {
  IdAplicacionPago int [pk]
  IdPago int [not null, ref: > Pagos.IdPago]
  IdVencimientoCompra int [not null, ref: > VencimientosCompra.IdVencimientoCompra]
  Fecha date [not null]
  MontoAplicado decimal(18,2) [not null, default: 0]
  Observaciones nvarchar(255)
  indexes { 
  (IdPago, IdVencimientoCompra) [unique] 
  (IdVencimientoCompra) }
}

// =============================
// ERP — Remesas SEPA y Mandatos
// =============================
Table MandatosSEPA {
  IdMandato int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdCliente int [not null, ref: > Clientes.IdCliente]
  CuentaBancariaId int [not null, ref: > CuentasBancarias.IdCuenta]
  ReferenciaMandato nvarchar(35) [not null] // UMN/UMR
  FechaFirma date [not null]
  Tipo nvarchar(10) // CORE/B2B
  Estado nvarchar(20) // Activo/Baja
  FechaBaja date
  indexes { (IdEmpresa, IdCliente, ReferenciaMandato) [unique] }
}

Table Remesas {
  IdRemesa int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  Tipo nvarchar(20) // SEPA-CORE/SEPA-B2B
  FechaCreacion date [not null]
  FechaPresentacion date
  Estado nvarchar(20) // Borrador/Presentada/Enviada/Confirmada/Anulada
  FicheroRuta nvarchar(500)
  MensajeId nvarchar(70)
  CuentaBancariaEmisorId int [ref: > CuentasBancarias.IdCuenta, null]
  Observaciones nvarchar(max)
  indexes { (IdEmpresa, FechaCreacion) (Estado) }
}

Table RemesasLineas {
  IdRemesaLinea int [pk]
  IdRemesa int [not null, ref: > Remesas.IdRemesa]
  IdVencimientoVenta int [not null, ref: > VencimientosVenta.IdVencimientoVenta]
  IdMandato int [ref: > MandatosSEPA.IdMandato, null]
  Importe decimal(18,2) [not null]
  Estado nvarchar(20) // Incluida/Enviada/Devuelta/Cobrada
  FechaEstado date
  MotivoDevolucion nvarchar(70)
  EndToEndId nvarchar(35)
  indexes { 
  (IdRemesa, IdVencimientoVenta) [unique] 
  (IdVencimientoVenta) }
}

// =============================
// ERP — Inventario (Lotes y Series maestros + Ledger)
// =============================
Table Lotes {
  IdLote int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdTipoArticulo int [not null, ref: >Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  Codigo nvarchar(100) [not null]
  FechaCaducidad date
  Estado nvarchar(20) // Activo/Bloqueado/Agotado
  indexes { (IdEmpresa, IdTipoArticulo, IdProducto, Codigo) [unique] }
}

Table SeriesArticulo {
  IdSerieArticulo int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdTipoArticulo int [not null, ref: >Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  Codigo nvarchar(100) [not null]
  Estado nvarchar(20) // Activo/Bloqueado/Vendido
  indexes { (IdEmpresa, IdTipoArticulo, IdProducto, Codigo) [unique] }
}

Table MovimientosStock {
  IdMovimientoStock int [pk]
  IdEmpresa int [not null, ref: > Empresas.IdEmpresa]
  IdTipoArticulo int [not null, ref: >Articulos.IdArticulo]
  IdProducto int [ref: > Productos.IdProducto, null]
  IdDepositoOrigen int [ref: > Depositos.IdDeposito, null]
  IdUbicacionOrigen int [ref: > Ubicaciones.IdUbicacion, null]
  IdDepositoDestino int [ref: > Depositos.IdDeposito, null]
  IdUbicacionDestino int [ref: > Ubicaciones.IdUbicacion, null]
  IdLote int [ref: > Lotes.IdLote, null]
  IdSerieArticulo int [ref: > SeriesArticulo.IdSerieArticulo, null]
  Tipo nvarchar(20) // Entrada, Salida, Traspaso, Ajuste
  Origen nvarchar(30) // Entradas, Albaranes, MovimientosInternos, Imputaciones, etc.
  IdDocumentoOrigen int
  IdLineaDocumentoOrigen int
  Cantidad decimal(18,4) [not null]
  CosteUnitario decimal(18,4) [not null, default: 0]
  CosteTotal decimal(18,2) [not null, default: 0]
  Fecha datetime [not null]
  Observaciones nvarchar(max)
  indexes {
    (IdEmpresa, IdTipoArticulo, IdUbicacionDestino, IdLote, IdSerieArticulo, Fecha)
    (Origen, IdDocumentoOrigen, IdLineaDocumentoOrigen)
  }
}

// =============================
// ERP — Impuestos (desglose por factura)
// =============================
Table ImpuestosFactura {
  IdImpuestoFactura int [pk]
  IdFactura int [not null, ref: > Facturas.IdFactura]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  BaseImponible decimal(18,2) [not null, default: 0]
  ImporteIVA decimal(18,2) [not null, default: 0]
  RecargoEquivalenciaPct decimal(5,2)
  ImporteRecargo decimal(18,2) [not null, default: 0]
  indexes { (IdFactura, IdTipoIVA) [unique] }
}

Table ImpuestosFacturaCompra {
  IdImpuestoFacturaCompra int [pk]
  IdFacturaCompra int [not null, ref: > FacturasCompra.IdFacturaCompra]
  IdTipoIVA int [not null, ref: > TiposIVA.IdTipoIVA]
  BaseImponible decimal(18,2) [not null, default: 0]
  ImporteIVA decimal(18,2) [not null, default: 0]
  RecargoEquivalenciaPct decimal(5,2)
  ImporteRecargo decimal(18,2) [not null, default: 0]
  indexes { (IdFacturaCompra, IdTipoIVA) [unique] }
}
