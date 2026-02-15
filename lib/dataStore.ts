import fs from 'fs';
import path from 'path';
import { Presentation, PresentationsData } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRESENTATIONS_FILE = path.join(DATA_DIR, 'presentations.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
export function initializeDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRESENTATIONS_FILE)) {
    fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify({ presentations: [] }, null, 2));
  }
}

export function loadPresentations(): PresentationsData {
  try {
    const data = fs.readFileSync(PRESENTATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { presentations: [] };
  }
}

export function savePresentations(data: PresentationsData) {
  fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify(data, null, 2));
}

export function addPresentation(presentation: Presentation): Presentation {
  const data = loadPresentations();
  data.presentations.push(presentation);
  savePresentations(data);
  return presentation;
}

export function updatePresentation(code: string, updates: Partial<Presentation>): Presentation | null {
  const data = loadPresentations();
  const presentation = data.presentations.find((p) => p.code === code);
  if (!presentation) return null;
  
  Object.assign(presentation, updates);
  savePresentations(data);
  return presentation;
}

export function getPresentation(code: string): Presentation | null {
  const data = loadPresentations();
  return data.presentations.find((p) => p.code === code) || null;
}

export function getAllPresentations(): Presentation[] {
  const data = loadPresentations();
  return data.presentations;
}

export function getPresentationDirectory(code: string): string {
  return path.join(UPLOADS_DIR, code);
}

export function getSlidesDirectory(code: string): string {
  return path.join(UPLOADS_DIR, code, 'slides');
}

export function getUploadPath(code: string, filename: string): string {
  return path.join(UPLOADS_DIR, code, filename);
}

export function cleanupExpiredSessions() {
  const data = loadPresentations();
  const now = new Date();
  data.presentations = data.presentations.filter((p) => {
    const expiresAt = new Date(p.expiresAt);
    return expiresAt > now;
  });
  savePresentations(data);
}
