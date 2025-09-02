import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LatencyService {
  private _isLoading = signal(false);
  private _currentLatency = signal(0);

  readonly isLoading = this._isLoading.asReadonly();
  readonly currentLatency = this._currentLatency.asReadonly();

  showLatency(latency: number): void {
    this._currentLatency.set(latency);
    this._isLoading.set(true);
  }

  hideLatency(): void {
    this._isLoading.set(false);
  }
}
