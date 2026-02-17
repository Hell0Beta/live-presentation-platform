import { writeFile, mkdir } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createCanvas } from 'canvas';

// Set up PDF.js worker
const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ProcessedFile {
  slideCount: number;
  fileName: string;
  fileType: "application/pdf" | "pptx" | "ppt" | "unknown" | undefined;
}

export async function processUploadedFile(
  file: File,
  uploadPath: string
): Promise<ProcessedFile> {
  const fileName = file.name;
  const fileExt = path.extname(fileName).toLowerCase();

  // Only accept PDF files
  if (fileExt !== '.pdf') {
    throw new Error('Only PDF files are supported');
  }

  // Create upload and slides directories
  await mkdir(uploadPath, { recursive: true });
  const slidesDir = path.join(uploadPath, 'slides');
  await mkdir(slidesDir, { recursive: true });

  // Save the file
  const bytes = await file.arrayBuffer();
  const filePath = path.join(uploadPath, fileName);
  await writeFile(filePath, Buffer.from(bytes));

  let slideCount = 0;

  try {
    // Read PDF file as Buffer
    const pdfBuffer = await fs.promises.readFile(filePath);

    // Convert Buffer to Uint8Array (this is the fix!)
    const pdfData = new Uint8Array(pdfBuffer);

    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      verbosity: 0
    });
    const pdfDocument = await loadingTask.promise;

    slideCount = pdfDocument.numPages;
    console.log(`[PDF] Converting ${slideCount} pages...`);

    // Create a factory for PDF.js to use for canvas/image creation in Node.js
    class NodeCanvasFactory {
      create(width: number, height: number) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        return {
          canvas,
          context,
        };
      }

      reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
      }

      destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
      }
    }

    const canvasFactory = new NodeCanvasFactory();

    // Convert each page to PNG
    for (let pageNum = 1; pageNum <= slideCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);

      // Set scale for better quality
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      // Create canvas for rendering
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

      // Render PDF page to canvas
      await page.render({
        canvasContext: canvasAndContext.context as any,
        viewport: viewport,
        canvasFactory: canvasFactory as any, // Tell PDF.js to use our factory
      }).promise;

      // Save as PNG
      const imagePath = path.join(slidesDir, `slide-${pageNum}.png`);
      const buffer = (canvasAndContext.canvas as any).toBuffer('image/png');
      await fs.promises.writeFile(imagePath, buffer);

      // Clean up
      canvasFactory.destroy(canvasAndContext);

      console.log(`[PDF] Converted page ${pageNum}/${slideCount}`);
    }

    console.log(`[PDF] Successfully converted ${slideCount} slides from ${fileName}`);
  } catch (error) {
    console.error('[PDF] Conversion error:', error);
    throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    slideCount,
    fileName,
    fileType: "application/pdf",
  };
}