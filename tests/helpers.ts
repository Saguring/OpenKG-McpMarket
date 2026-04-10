import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAppContext } from '../src/app-context.js';

export function createTempAppContext() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-marketplace-'));
  return {
    tempDir,
    context: createAppContext(tempDir),
  };
}
