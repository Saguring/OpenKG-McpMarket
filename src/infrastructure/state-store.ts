import fs from 'node:fs';
import path from 'node:path';
import { CliState } from '../domain/models.js';

export interface CliStateStore {
  read(): CliState;
  write(state: CliState): void;
  clear(): void;
}

export function createCliStateStore(filePath: string): CliStateStore {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  return {
    read() {
      if (!fs.existsSync(filePath)) {
        return { currentSessionId: null };
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as CliState;
    },
    write(state) {
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
    },
    clear() {
      this.write({ currentSessionId: null });
    },
  };
}
