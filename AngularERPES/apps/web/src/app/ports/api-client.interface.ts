export interface ApiClient {
  get<T>(url: string, opts?: any): Promise<T>;
  post<T>(url: string, body: any, opts?: any): Promise<T>;
  patch<T>(url: string, body: any, opts?: any): Promise<T>;
  delete<T>(url: string, opts?: any): Promise<T>;
}
