import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface DatabaseProvider {
  db: Database.Database;
  runMigrations(): void;
}

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS mcp_listings (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      version TEXT NOT NULL,
      transport TEXT NOT NULL,
      auth_type TEXT NOT NULL,
      source_type TEXT NOT NULL,
      endpoint_url TEXT,
      package_name TEXT,
      package_registry TEXT,
      source_url TEXT,
      homepage_url TEXT,
      tags_json TEXT NOT NULL,
      task_types_json TEXT NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `,
];

export function createDatabaseProvider(databaseFilePath: string): DatabaseProvider {
  const directory = path.dirname(databaseFilePath);
  fs.mkdirSync(directory, { recursive: true });

  const db = new Database(databaseFilePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return {
    db,
    runMigrations() {
      for (const statement of schemaStatements) {
        db.prepare(statement).run();
      }
    },
  };
}
