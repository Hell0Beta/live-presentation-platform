import { getAllPresentations } from './dataStore';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
const CODE_LENGTH = 6;

export function generatePresentationCode(): string {
  const existingCodes = new Set(getAllPresentations().map((p) => p.code));
  
  let code = '';
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    
    if (!existingCodes.has(code)) {
      return code;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate unique presentation code');
}

export function validatePresentationCode(code: string): boolean {
  const codeRegex = new RegExp(`^[${CHARACTERS}]{${CODE_LENGTH}}$`);
  return codeRegex.test(code);
}
