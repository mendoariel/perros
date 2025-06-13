import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export function getSsrApiUrl(): string {
  try {
    const configPath = join(process.cwd(), 'dist/config.json');
    if (existsSync(configPath)) {
      const raw = readFileSync(configPath, 'utf-8');
      const json = JSON.parse(raw);
      return json.perrosQrApi || 'http://peludosclick_backend:3333/';
    }
  } catch (e) {
    // fallback
  }
  return 'http://peludosclick_backend:3333/';
} 