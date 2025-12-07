import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import type { ExtractedText, FileType } from '../types';
import { getPDFParsingErrorMessage, getOCRErrorMessage } from './errorHandling';

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract text from a PDF file
 * Handles multi-page PDFs and errors for corrupted or password-protected files
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const textParts: string[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      textParts.push(pageText);
    }
    
    return textParts.join('\n\n');
  } catch (error) {
    throw new Error(getPDFParsingErrorMessage(file.name));
  }
}

/**
 * Extract text from an image file using OCR
 * Supports both printed and handwritten text
 * Returns confidence score
 */
export async function extractTextFromImage(file: File): Promise<{ text: string; confidence: number }> {
  try {
    const worker = await createWorker('eng');
    
    // Configure for both printed and handwritten text
    await worker.setParameters({
      tessedit_pageseg_mode: '3', // Fully automatic page segmentation
    });
    
    const { data } = await worker.recognize(file);
    await worker.terminate();
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error(getOCRErrorMessage(file.name));
    }
    
    return {
      text: data.text,
      confidence: data.confidence,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not read text')) {
      throw error;
    }
    throw new Error(getOCRErrorMessage(file.name));
  }
}

/**
 * Read text directly from text files (.txt, .md)
 * Handles different text encodings
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    throw new Error(`Could not read text from '${file.name}'. The file may be corrupted.`);
  }
}

/**
 * Determine file type from file extension
 */
export function getFileType(file: File): FileType {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  
  if (['.pdf'].includes(extension)) return 'pdf';
  if (['.jpg', '.jpeg', '.png'].includes(extension)) return 'image';
  if (['.txt', '.md'].includes(extension)) return 'text';
  
  throw new Error(`Unsupported file type: ${extension}`);
}

/**
 * Main extraction function that routes to appropriate extractor
 * Returns ExtractedText object with metadata
 */
export async function extractText(file: File, fileId: string): Promise<ExtractedText> {
  const fileType = getFileType(file);
  let content: string;
  let confidence: number | undefined;
  let extractionMethod: ExtractedText['extractionMethod'];
  
  switch (fileType) {
    case 'pdf':
      content = await extractTextFromPDF(file);
      extractionMethod = 'pdf-parser';
      break;
    case 'image':
      const result = await extractTextFromImage(file);
      content = result.text;
      confidence = result.confidence;
      extractionMethod = 'ocr';
      break;
    case 'text':
      content = await extractTextFromTextFile(file);
      extractionMethod = 'direct';
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
  
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return {
    fileId,
    fileName: file.name,
    content,
    wordCount,
    extractionMethod,
    confidence,
  };
}
