import { InjectionToken } from '@angular/core';
import { ApiClient } from './api-client.interface';

export const API_CLIENT = new InjectionToken<ApiClient>('API_CLIENT');
