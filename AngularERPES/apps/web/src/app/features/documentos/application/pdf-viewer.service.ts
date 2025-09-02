import { Injectable } from '@angular/core';

// Interfaces para tipos de PDF.js
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  destroy(): void;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): PageViewport;
  render(params: RenderParameters): RenderTask;
  getTextContent(): Promise<TextContent>;
  getAnnotations(): Promise<Annotation[]>;
}

interface PageViewport {
  width: number;
  height: number;
  transform: number[];
}

interface RenderParameters {
  canvasContext: CanvasRenderingContext2D;
  viewport: PageViewport;
}

interface RenderTask {
  promise: Promise<void>;
}

interface TextContent {
  items: TextItem[];
}

interface TextItem {
  str: string;
  transform: number[];
}

interface Annotation {
  id: string;
  fieldName?: string;
  fieldType?: string;
  rect: number[];
  fieldValue?: string;
}

// Interfaces para los datos extraídos
export interface ExtractedText {
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

export interface ExtractedField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  page: number;
}

export interface PageDimensions {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfViewerService {
  private currentPdf: PDFDocumentProxy | null = null;
  private pdfjsLib: any;

  constructor() {
    this.initializePdfJs();
  }

  /**
   * Inicializa PDF.js
   */
  private async initializePdfJs(): Promise<void> {
    try {
      // En un entorno real, esto se cargaría desde CDN o npm
      if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
        this.pdfjsLib = (window as any).pdfjsLib;
      } else if ((global as any).pdfjsLib) {
        // Para tests
        this.pdfjsLib = (global as any).pdfjsLib;
      } else {
        // Fallback para desarrollo - en producción se debe cargar desde CDN
        console.warn('PDF.js not loaded. Please include PDF.js library.');
      }
    } catch (error) {
      console.error('Error initializing PDF.js:', error);
      throw new Error('Failed to initialize PDF.js');
    }
  }

  /**
   * Carga un PDF desde diferentes fuentes
   */
  async loadPdf(source: string | File | ArrayBuffer): Promise<PDFDocumentProxy> {
    if (!this.pdfjsLib) {
      throw new Error('PDF.js not initialized');
    }

    try {
      let loadingTask;

      if (typeof source === 'string') {
        // URL
        loadingTask = this.pdfjsLib.getDocument(source);
      } else if (source instanceof File) {
        // File object
        const arrayBuffer = await this.fileToArrayBuffer(source);
        loadingTask = this.pdfjsLib.getDocument(arrayBuffer);
      } else {
        // ArrayBuffer
        loadingTask = this.pdfjsLib.getDocument(source);
      }

      this.currentPdf = await loadingTask.promise;
      return this.currentPdf;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  }

  /**
   * Convierte un File a ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Renderiza una página en un canvas
   */
  async renderPage(
    pageNumber: number, 
    canvas: HTMLCanvasElement, 
    scale: number = 1.0
  ): Promise<void> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    if (pageNumber < 1 || pageNumber > this.currentPdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    try {
      const page = await this.currentPdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      // Configurar canvas
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Renderizar página
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      throw error;
    }
  }

  /**
   * Extrae el texto de una página
   */
  async extractTextFromPage(pageNumber: number): Promise<ExtractedText[]> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    if (pageNumber < 1 || pageNumber > this.currentPdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    try {
      const page = await this.currentPdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      return textContent.items.map((item: TextItem) => ({
        text: item.str,
        x: item.transform[4], // posición X
        y: item.transform[5], // posición Y
        fontSize: item.transform[0] // tamaño de fuente
      }));
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  /**
   * Extrae los campos de formulario de una página
   */
  async extractFormFields(pageNumber: number): Promise<ExtractedField[]> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    if (pageNumber < 1 || pageNumber > this.currentPdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    try {
      const page = await this.currentPdf.getPage(pageNumber);
      const annotations = await page.getAnnotations();
      
      return annotations
        .filter(annotation => annotation.fieldName) // Solo campos de formulario
        .map(annotation => ({
          id: annotation.id,
          name: annotation.fieldName!,
          type: this.mapFieldType(annotation.fieldType),
          x: annotation.rect[0],
          y: annotation.rect[1],
          width: annotation.rect[2] - annotation.rect[0],
          height: annotation.rect[3] - annotation.rect[1],
          value: annotation.fieldValue || '',
          page: pageNumber
        }));
    } catch (error) {
      console.error('Error extracting form fields:', error);
      throw error;
    }
  }

  /**
   * Mapea los tipos de campo de PDF.js a nuestros tipos
   */
  private mapFieldType(pdfFieldType?: string): ExtractedField['type'] {
    switch (pdfFieldType) {
      case 'Tx': return 'text';
      case 'Btn': return 'checkbox';
      case 'Ch': return 'select';
      case 'Sig': return 'signature';
      default: return 'text';
    }
  }

  /**
   * Obtiene las dimensiones de una página
   */
  async getPageDimensions(pageNumber: number, scale: number = 1.0): Promise<PageDimensions> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    if (pageNumber < 1 || pageNumber > this.currentPdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    try {
      const page = await this.currentPdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      return {
        width: viewport.width,
        height: viewport.height
      };
    } catch (error) {
      console.error('Error getting page dimensions:', error);
      throw error;
    }
  }

  /**
   * Obtiene el documento PDF actual
   */
  getCurrentPdf(): PDFDocumentProxy | null {
    return this.currentPdf;
  }

  /**
   * Verifica si hay un PDF cargado
   */
  isLoaded(): boolean {
    return this.currentPdf !== null;
  }

  /**
   * Obtiene el número total de páginas
   */
  getPageCount(): number {
    return this.currentPdf?.numPages || 0;
  }

  /**
   * Libera los recursos del PDF actual
   */
  dispose(): void {
    if (this.currentPdf) {
      this.currentPdf.destroy();
      this.currentPdf = null;
    }
  }

  /**
   * Busca texto en todas las páginas del PDF
   */
  async searchText(searchTerm: string): Promise<{
    page: number;
    matches: { text: string; x: number; y: number }[];
  }[]> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    const results = [];
    const searchTermLower = searchTerm.toLowerCase();

    for (let pageNum = 1; pageNum <= this.currentPdf.numPages; pageNum++) {
      try {
        const textItems = await this.extractTextFromPage(pageNum);
        const matches = textItems.filter(item => 
          item.text.toLowerCase().includes(searchTermLower)
        ).map(item => ({
          text: item.text,
          x: item.x,
          y: item.y
        }));

        if (matches.length > 0) {
          results.push({ page: pageNum, matches });
        }
      } catch (error) {
        console.warn(`Error searching in page ${pageNum}:`, error);
      }
    }

    return results;
  }

  /**
   * Extrae todos los campos de formulario del PDF
   */
  async extractAllFormFields(): Promise<ExtractedField[]> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    const allFields: ExtractedField[] = [];

    for (let pageNum = 1; pageNum <= this.currentPdf.numPages; pageNum++) {
      try {
        const pageFields = await this.extractFormFields(pageNum);
        allFields.push(...pageFields);
      } catch (error) {
        console.warn(`Error extracting fields from page ${pageNum}:`, error);
      }
    }

    return allFields;
  }

  /**
   * Obtiene metadatos del PDF
   */
  async getPdfMetadata(): Promise<{
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  }> {
    if (!this.currentPdf) {
      throw new Error('No PDF loaded');
    }

    try {
      const metadata = await (this.currentPdf as any).getMetadata();
      return {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
        modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined
      };
    } catch (error) {
      console.warn('Error getting PDF metadata:', error);
      return {};
    }
  }
}