import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartConfig {
  type: ChartType;
  data: any;
  options?: any;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
    }
    
    canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() config!: ChartConfig;
  @Input() height: string = '300px';
  @Input() responsive: boolean = true;
  @Input() maintainAspectRatio: boolean = false;
  
  private chart?: Chart;

  ngOnInit(): void {
    if (!this.config) {
      console.error('Chart config is required');
      return;
    }
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement || !this.config) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Configuración por defecto
    const defaultOptions = {
      responsive: this.responsive,
      maintainAspectRatio: this.maintainAspectRatio,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        },
        tooltip: {
          enabled: true,
          mode: 'index' as const,
          intersect: false
        }
      },
      scales: this.getDefaultScales()
    };

    // Combinar opciones por defecto con las personalizadas
    const mergedOptions = this.mergeDeep(defaultOptions, this.config.options || {});

    const chartConfig: ChartConfiguration = {
      type: this.config.type,
      data: this.config.data,
      options: mergedOptions
    };

    try {
      this.chart = new Chart(ctx, chartConfig);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  private getDefaultScales(): any {
    if (this.config.type === 'pie' || this.config.type === 'doughnut') {
      return {};
    }

    return {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    };
  }

  private mergeDeep(target: any, source: any): any {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Método público para actualizar los datos del gráfico
  updateChart(newData: any): void {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }

  // Método público para actualizar la configuración completa
  updateConfig(newConfig: ChartConfig): void {
    this.config = newConfig;
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }
}