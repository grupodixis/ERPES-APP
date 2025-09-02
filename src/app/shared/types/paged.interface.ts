export interface Paged<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}
