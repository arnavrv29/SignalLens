export function validateCSV(content: string): { valid: boolean; error?: string; rows?: any[] } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'File content is empty or invalid.' };
  }

  // 1. Basic splitting (very simplistic CSV parsing for MVP)
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    return { valid: false, error: 'File must contain a header row and at least one data row.' };
  }
  
  if (lines.length > 5001) {
    return { valid: false, error: 'File exceeds maximum allowed rows (5000).' };
  }

  // 2. Header validation
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const requiredCols = ['date', 'rating', 'review_text'];
  
  const missingCols = requiredCols.filter(col => !headers.includes(col));
  if (missingCols.length > 0) {
    return { valid: false, error: `Missing required columns: ${missingCols.join(', ')}` };
  }
  
  // Return early if we just want basic validation, 
  // but let's parse it somewhat so we can pass data down if needed
  return { valid: true };
}

export function safeJsonParse(jsonString: string): { success: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to parse JSON' };
  }
}
