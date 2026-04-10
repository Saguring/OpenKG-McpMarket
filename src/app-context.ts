import os from 'node:os';
import path from 'node:path';
import { systemClock } from './infrastructure/clock.js';
import { createDatabaseProvider } from './infrastructure/database.js';
import { createCliStateStore } from './infrastructure/state-store.js';
import { createMcpListingRepository } from './repositories/mcp-listing-repository.js';
import { createSessionRepository } from './repositories/session-repository.js';
import { createUserRepository } from './repositories/user-repository.js';
import { createAuthService } from './services/auth-service.js';
import { createMcpService } from './services/mcp-service.js';

export interface AppContext {
  authService: ReturnType<typeof createAuthService>;
  mcpService: ReturnType<typeof createMcpService>;
  cliStateStore: ReturnType<typeof createCliStateStore>;
}

export function resolveAppDataDirectory(baseDir?: string): string {
  if (baseDir) {
    return path.join(baseDir, '.local');
  }

  const xdgDataHome = process.env.XDG_DATA_HOME?.trim();
  if (xdgDataHome) {
    return path.join(xdgDataHome, 'mcp-marketplace');
  }

  return path.join(os.homedir(), '.local', 'share', 'mcp-marketplace');
}

export function createAppContext(baseDir?: string): AppContext {
  const dataDir = resolveAppDataDirectory(baseDir);
  const database = createDatabaseProvider(path.join(dataDir, 'marketplace.db'));
  database.runMigrations();

  const users = createUserRepository(database.db);
  const sessions = createSessionRepository(database.db);
  const listings = createMcpListingRepository(database.db);

  return {
    authService: createAuthService({ users, sessions, clock: systemClock }),
    mcpService: createMcpService({ listings, clock: systemClock }),
    cliStateStore: createCliStateStore(path.join(dataDir, 'cli-state.json')),
  };
}
