import { TestBed } from '@angular/core/testing';
import { PdfViewerService } from './pdf-viewer.service';
import { BehaviorSubject } from 'rxjs';

// Mock para pdf.js
const mockPdfJs = {
  getDocument: jasmine.createSpy('getDocument').and.returnValue({
    promise: Promise.resolve({
      numPages: 3,
      getPage: jasmine.createSpy('getPage').and.returnValue(Promise.resolve({
        getViewport: jasmine.createSpy('getViewport').and.returnValue({
          width: 595,
          height: 842,
          transform: [1, 0, 0, 1, 0, 0]
        }),
        render: jasmine.createSpy('render').and.returnValue({
          promise: Promise.resolve()
        }),
        getTextContent: jasmine.createSpy('getTextContent').and.returnValue(Promise.resolve({
          items: [
            { str: 'Sample text', transform: [12, 0, 0, 12, 100, 700] },
            { str: 'More text', transform: [12, 0, 0, 12, 200, 650] }
          ]
        })),
        getAnnotations: jasmine.createSpy('getAnnotations').and.returnValue(Promise.resolve([
          {
            id: 'field1',
            fieldName: 'nombre',
            fieldType: 'Tx',
            rect: [100, 700, 250, 720],
            fieldValue: ''
          },
          {
            id: 'field2',
            fieldName: 'fecha',
            fieldType: 'Tx',
            rect: [300, 650, 450, 670],
            fieldValue: ''
          }
        ]))
      }))
    })
  })
};

// Mock global para pdfjsLib
(global as any).pdfjsLib = mockPdfJs;

describe('PdfViewerService', () => {
  let service: PdfViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfViewerService]
    });
    service = TestBed.inject(PdfViewerService);
  });

  afterEach(() => {
    // Limpiar mocks
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadPdf', () => {
    it('should load PDF from URL successfully', async () => {
      const pdfUrl = 'http://example.com/test.pdf';
      
      const result = await service.loadPdf(pdfUrl);
      
      expect(result).toBeTruthy();
      expect(result.numPages).toBe(3);
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(pdfUrl);
    });

    it('should load PDF from File successfully', async () => {
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await service.loadPdf(file);
      
      expect(result).toBeTruthy();
      expect(result.numPages).toBe(3);
      expect(mockPdfJs.getDocument).toHaveBeenCalled();
    });

    it('should load PDF from ArrayBuffer successfully', async () => {
      const arrayBuffer = new ArrayBuffer(1024);
      
      const result = await service.loadPdf(arrayBuffer);
      
      expect(result).toBeTruthy();
      expect(result.numPages).toBe(3);
      expect(mockPdfJs.getDocument).toHaveBeenCalledWith(arrayBuffer);
    });

    it('should handle PDF loading errors', async () => {
      mockPdfJs.getDocument.and.returnValue({
        promise: Promise.reject(new Error('Failed to load PDF'))
      });

      try {
        await service.loadPdf('invalid-url');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Failed to load PDF');
      }
    });
  });

  describe('renderPage', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;

    beforeEach(async () => {
      mockCanvas = document.createElement('canvas');
      mockContext = mockCanvas.getContext('2d')!;
      spyOn(mockCanvas, 'getContext').and.returnValue(mockContext);
      
      // Cargar PDF primero
      await service.loadPdf('test.pdf');
    });

    it('should render page to canvas successfully', async () => {
      const pageNumber = 1;
      const scale = 1.5;
      
      await service.renderPage(pageNumber, mockCanvas, scale);
      
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should use default scale if not provided', async () => {
      const pageNumber = 1;
      
      await service.renderPage(pageNumber, mockCanvas);
      
      // Verificar que se usó escala por defecto
      expect(mockCanvas.getContext).toHaveBeenCalled();
    });

    it('should handle invalid page numbers', async () => {
      try {
        await service.renderPage(999, mockCanvas);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle rendering errors', async () => {
      // Mock error en render
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.render = jasmine.createSpy('render').and.returnValue({
        promise: Promise.reject(new Error('Render failed'))
      });

      try {
        await service.renderPage(1, mockCanvas);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('extractTextFromPage', () => {
    beforeEach(async () => {
      await service.loadPdf('test.pdf');
    });

    it('should extract text content from page', async () => {
      const pageNumber = 1;
      
      const textContent = await service.extractTextFromPage(pageNumber);
      
      expect(textContent).toEqual([
        { text: 'Sample text', x: 100, y: 700, fontSize: 12 },
        { text: 'More text', x: 200, y: 650, fontSize: 12 }
      ]);
    });

    it('should handle pages without text', async () => {
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.getTextContent = jasmine.createSpy('getTextContent').and.returnValue(Promise.resolve({
        items: []
      }));

      const textContent = await service.extractTextFromPage(1);
      
      expect(textContent).toEqual([]);
    });

    it('should handle text extraction errors', async () => {
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.getTextContent = jasmine.createSpy('getTextContent').and.returnValue(
        Promise.reject(new Error('Text extraction failed'))
      );

      try {
        await service.extractTextFromPage(1);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('extractFormFields', () => {
    beforeEach(async () => {
      await service.loadPdf('test.pdf');
    });

    it('should extract form fields from page', async () => {
      const pageNumber = 1;
      
      const fields = await service.extractFormFields(pageNumber);
      
      expect(fields).toEqual([
        {
          id: 'field1',
          name: 'nombre',
          type: 'text',
          x: 100,
          y: 700,
          width: 150,
          height: 20,
          value: '',
          page: 1
        },
        {
          id: 'field2',
          name: 'fecha',
          type: 'text',
          x: 300,
          y: 650,
          width: 150,
          height: 20,
          value: '',
          page: 1
        }
      ]);
    });

    it('should handle pages without form fields', async () => {
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.getAnnotations = jasmine.createSpy('getAnnotations').and.returnValue(Promise.resolve([]));

      const fields = await service.extractFormFields(1);
      
      expect(fields).toEqual([]);
    });

    it('should map different field types correctly', async () => {
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.getAnnotations = jasmine.createSpy('getAnnotations').and.returnValue(Promise.resolve([
        {
          id: 'checkbox1',
          fieldName: 'acepta_terminos',
          fieldType: 'Btn',
          rect: [100, 600, 120, 620],
          fieldValue: 'Off'
        },
        {
          id: 'dropdown1',
          fieldName: 'tipo_documento',
          fieldType: 'Ch',
          rect: [200, 550, 350, 570],
          fieldValue: ''
        }
      ]));

      const fields = await service.extractFormFields(1);
      
      expect(fields[0].type).toBe('checkbox');
      expect(fields[1].type).toBe('select');
    });
  });

  describe('getPageDimensions', () => {
    beforeEach(async () => {
      await service.loadPdf('test.pdf');
    });

    it('should return page dimensions', async () => {
      const pageNumber = 1;
      const scale = 1.0;
      
      const dimensions = await service.getPageDimensions(pageNumber, scale);
      
      expect(dimensions).toEqual({
        width: 595,
        height: 842
      });
    });

    it('should apply scale to dimensions', async () => {
      const pageNumber = 1;
      const scale = 2.0;
      
      const mockPage = await (await service.loadPdf('test.pdf')).getPage(1);
      mockPage.getViewport = jasmine.createSpy('getViewport').and.returnValue({
        width: 1190, // 595 * 2
        height: 1684, // 842 * 2
        transform: [2, 0, 0, 2, 0, 0]
      });
      
      const dimensions = await service.getPageDimensions(pageNumber, scale);
      
      expect(dimensions.width).toBe(1190);
      expect(dimensions.height).toBe(1684);
    });
  });

  describe('getCurrentPdf', () => {
    it('should return null when no PDF is loaded', () => {
      const pdf = service.getCurrentPdf();
      expect(pdf).toBeNull();
    });

    it('should return loaded PDF document', async () => {
      await service.loadPdf('test.pdf');
      
      const pdf = service.getCurrentPdf();
      expect(pdf).toBeTruthy();
      expect(pdf!.numPages).toBe(3);
    });
  });

  describe('isLoaded', () => {
    it('should return false when no PDF is loaded', () => {
      expect(service.isLoaded()).toBeFalse();
    });

    it('should return true when PDF is loaded', async () => {
      await service.loadPdf('test.pdf');
      expect(service.isLoaded()).toBeTrue();
    });
  });

  describe('getPageCount', () => {
    it('should return 0 when no PDF is loaded', () => {
      expect(service.getPageCount()).toBe(0);
    });

    it('should return correct page count when PDF is loaded', async () => {
      await service.loadPdf('test.pdf');
      expect(service.getPageCount()).toBe(3);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', async () => {
      await service.loadPdf('test.pdf');
      expect(service.isLoaded()).toBeTrue();
      
      service.dispose();
      expect(service.isLoaded()).toBeFalse();
      expect(service.getCurrentPdf()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle operations when no PDF is loaded', async () => {
      try {
        await service.renderPage(1, document.createElement('canvas'));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('No PDF loaded');
      }
    });

    it('should handle invalid page numbers gracefully', async () => {
      await service.loadPdf('test.pdf');
      
      try {
        await service.extractTextFromPage(0);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      try {
        await service.extractFormFields(999);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});