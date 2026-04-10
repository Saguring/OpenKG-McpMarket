import Database from 'better-sqlite3';
import { Session } from '../domain/models.js';

function mapSession(row: Record<string, unknown>): Session {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    createdAt: String(row.created_at),
  };
}

export interface SessionRepository {
  create(session: Session): void;
  findById(id: string): Session | null;
  deleteById(id: string): void;
}

export function createSessionRepository(db: Database.Database): SessionRepository {
  return {
    create(session) {
      db.prepare(
        `
          INSERT INTO sessions (id, user_id, created_at)
          VALUES (@id, @userId, @createdAt)
        `,
      ).run(session);
    },
    findById(id) {
      const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      return row ? mapSession(row) : null;
    },
    deleteById(id) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    },
  };
}
