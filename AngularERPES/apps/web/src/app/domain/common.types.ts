export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  value: string | number | boolean;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export interface DataSourceState<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  sort: SortConfig | null;
  filters: FilterConfig[];
  loading: boolean;
  error: string | null;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => string;
  template?: string;
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
  onClick: (item: T) => void;
}

export interface EntityOption<T = any> {
  id: string | number;
  label: string;
  description?: string;
  data: T;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error';
}

export interface ConfirmDialogResult {
  confirmed: boolean;
}
