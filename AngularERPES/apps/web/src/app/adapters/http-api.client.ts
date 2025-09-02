import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiClient } from '../ports/api-client.interface';
import { AppConfigService } from '../core/app-config.service';
import { AuthHeadersService } from '../core/services/auth-headers.service';

@Injectable()
export class HttpApiClient implements ApiClient {
  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authHeadersService: AuthHeadersService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.authHeadersService.getHeaders());
  }

  async get<T>(url: string, opts?: any): Promise<T> {
    const fullUrl = `${this.configService.apiBaseUrl}${url}`;
    return firstValueFrom(this.http.get<T>(fullUrl, { headers: this.getHeaders(), ...opts })) as Promise<T>;
  }

  async post<T>(url: string, body: any, opts?: any): Promise<T> {
    const fullUrl = `${this.configService.apiBaseUrl}${url}`;
    return firstValueFrom(this.http.post<T>(fullUrl, body, { headers: this.getHeaders(), ...opts })) as Promise<T>;
  }

  async patch<T>(url: string, body: any, opts?: any): Promise<T> {
    const fullUrl = `${this.configService.apiBaseUrl}${url}`;
    return firstValueFrom(this.http.patch<T>(fullUrl, body, { headers: this.getHeaders(), ...opts })) as Promise<T>;
  }

  async delete<T>(url: string, opts?: any): Promise<T> {
    const fullUrl = `${this.configService.apiBaseUrl}${url}`;
    return firstValueFrom(this.http.delete<T>(fullUrl, { headers: this.getHeaders(), ...opts })) as Promise<T>;
  }
}
