// ===== ENUMS Y TIPOS PARA TRANSFORMACIONES =====

export enum TransformationType {
  UPPERCASE = 'UPPERCASE',
  LOWERCASE = 'LOWERCASE',
  CAPITALIZE = 'CAPITALIZE',
  TRIM = 'TRIM',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  REGEX = 'REGEX',
  CUSTOM = 'CUSTOM',
  CONCATENATE = 'CONCATENATE',
  EXTRACT = 'EXTRACT',
  REPLACE = 'REPLACE',
  CONDITIONAL = 'CONDITIONAL'
}

// ===== ENUMS PARA TIPOS DE CAMPO =====

export enum TipoCampo {
  TEXTO = 'TEXTO',
  NUMERO = 'NUMERO',
  EMAIL = 'EMAIL',
  FECHA = 'FECHA',
  TELEFONO = 'TELEFONO',
  CHECKBOX = 'CHECKBOX',
  LISTA = 'LISTA',
  FIRMA = 'FIRMA',
  IMAGEN = 'IMAGEN'
}

// ===== INTERFACES PARA TRANSFORMACIONES =====

export interface Transformation {
  type: TransformationType;
  parameters: { [key: string]: any };
}

// ===== RE-EXPORTS DESDE DOCUMENTOS.TYPES =====

export {
  FieldMapping,
  TransformPreset,
  TemplateField,
  ValidationResult
} from '../../../../domain/documentos.types';

// ===== INTERFACES ADICIONALES =====

export interface ERPField {
  path: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
  validation?: any;
}