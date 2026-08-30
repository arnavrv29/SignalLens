import fs from 'fs/promises';
import path from 'path';
import { AnalysisResult } from '@/types';

// Use a local JSON file to store data
const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure the database file exists
async function initDb() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify({ runs: {} }), 'utf-8');
    }
  } catch (error) {
    console.error('Failed to initialize local database:', error);
  }
}

// Read the database
async function readDb(): Promise<{ runs: Record<string, any> }> {
  await initDb();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read local database:', error);
    return { runs: {} };
  }
}

// Write to the database
async function writeDb(data: any): Promise<void> {
  await initDb();
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to local database:', error);
  }
}

export async function saveAnalysisRun(data: AnalysisResult): Promise<string> {
  const id = crypto.randomUUID();
  const db = await readDb();
  
  db.runs[id] = { 
    ...data, 
    created_at: new Date().toISOString() 
  };
  
  await writeDb(db);
  return id;
}

export async function getAnalysisRun(id: string): Promise<any | null> {
  const db = await readDb();
  return db.runs[id] || null;
}
