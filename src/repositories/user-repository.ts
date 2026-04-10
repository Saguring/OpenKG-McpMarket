import Database from 'better-sqlite3';
import { StoredUser } from '../domain/models.js';

function mapUser(row: Record<string, unknown>): StoredUser {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    displayName: String(row.display_name),
    createdAt: String(row.created_at),
  };
}

export interface UserRepository {
  create(user: StoredUser): void;
  findByEmail(email: string): StoredUser | null;
  findById(id: string): StoredUser | null;
}

export function createUserRepository(db: Database.Database): UserRepository {
  return {
    create(user) {
      db.prepare(
        `
          INSERT INTO users (id, email, password_hash, display_name, created_at)
          VALUES (@id, @email, @passwordHash, @displayName, @createdAt)
        `,
      ).run(user);
    },
    findByEmail(email) {
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
      return row ? mapUser(row) : null;
    },
    findById(id) {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      return row ? mapUser(row) : null;
    },
  };
}
