import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthHeadersService {
  private _token = signal<string | null>(null);
  private _empresaId = signal<number | null>(null);

  setToken(token: string | null): void {
    this._token.set(token);
  }

  setEmpresaId(empresaId: number | null): void {
    this._empresaId.set(empresaId);
  }

  getToken(): string | null {
    return this._token();
  }

  getEmpresaId(): number | null {
    return this._empresaId();
  }

  getHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    // Añadir token de autenticación
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Añadir empresa ID
    const empresaId = this.getEmpresaId();
    if (empresaId) {
      headers['x-empresa-id'] = empresaId.toString();
    }

    return headers;
  }
}
