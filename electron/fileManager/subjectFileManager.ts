import fs from 'fs';
import path from 'path';
import { BASE_DIR } from '../pathManager.js';

const SUBJECTS_FILE = path.join(BASE_DIR, 'subjects.json');

export function ensureDirectories() {
  const dir = path.dirname(SUBJECTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(SUBJECTS_FILE)) fs.writeFileSync(SUBJECTS_FILE, '[]', 'utf-8');
}

export function loadSubjects(): string[] {
  ensureDirectories();
  const raw = fs.readFileSync(SUBJECTS_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function saveSubjects(subjects: string[]): void {
  ensureDirectories();
  fs.writeFileSync(SUBJECTS_FILE, JSON.stringify(subjects, null, 2), 'utf-8');
}
