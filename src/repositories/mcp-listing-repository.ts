import Database from 'better-sqlite3';
import { McpListing, SearchMcpListingsInput } from '../domain/models.js';

function mapListing(row: Record<string, unknown>): McpListing {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    title: String(row.title),
    summary: String(row.summary),
    version: String(row.version),
    transport: String(row.transport),
    authType: String(row.auth_type),
    sourceType: row.source_type === 'endpoint' ? 'endpoint' : 'package',
    endpointUrl: row.endpoint_url ? String(row.endpoint_url) : null,
    packageName: row.package_name ? String(row.package_name) : null,
    packageRegistry: row.package_registry ? String(row.package_registry) : null,
    sourceUrl: row.source_url ? String(row.source_url) : null,
    homepageUrl: row.homepage_url ? String(row.homepage_url) : null,
    tags: JSON.parse(String(row.tags_json)) as string[],
    taskTypes: JSON.parse(String(row.task_types_json)) as string[],
    isDeleted: Number(row.is_deleted) === 1,
    createdAt: String(row.created_at),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  };
}

export interface CreateListingRecord extends Omit<McpListing, 'tags' | 'taskTypes' | 'isDeleted'> {
  tagsJson: string;
  taskTypesJson: string;
  isDeleted: number;
}

export interface McpListingRepository {
  create(listing: CreateListingRecord): void;
  findById(id: string): McpListing | null;
  softDelete(id: string, deletedAt: string): void;
  searchPublic(input: SearchMcpListingsInput): McpListing[];
  findOwnedByUser(ownerId: string): McpListing[];
}

export function createMcpListingRepository(db: Database.Database): McpListingRepository {
  return {
    create(listing) {
      db.prepare(
        `
          INSERT INTO mcp_listings (
            id, owner_id, title, summary, version, transport, auth_type, source_type,
            endpoint_url, package_name, package_registry, source_url, homepage_url,
            tags_json, task_types_json, is_deleted, created_at, deleted_at
          ) VALUES (
            @id, @ownerId, @title, @summary, @version, @transport, @authType, @sourceType,
            @endpointUrl, @packageName, @packageRegistry, @sourceUrl, @homepageUrl,
            @tagsJson, @taskTypesJson, @isDeleted, @createdAt, @deletedAt
          )
        `,
      ).run(listing);
    },
    findById(id) {
      const row = db.prepare('SELECT * FROM mcp_listings WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      return row ? mapListing(row) : null;
    },
    softDelete(id, deletedAt) {
      db.prepare('UPDATE mcp_listings SET is_deleted = 1, deleted_at = ? WHERE id = ?').run(deletedAt, id);
    },
    searchPublic(input) {
      const conditions = ['is_deleted = 0'];
      const params: unknown[] = [];

      if (input.query) {
        conditions.push('(lower(title) LIKE ? OR lower(summary) LIKE ? OR lower(tags_json) LIKE ? OR lower(task_types_json) LIKE ?)');
        const likeValue = `%${input.query}%`;
        params.push(likeValue, likeValue, likeValue, likeValue);
      }

      if (input.taskType) {
        conditions.push('lower(task_types_json) LIKE ?');
        params.push(`%${input.taskType}%`);
      }

      if (input.transport) {
        conditions.push('transport = ?');
        params.push(input.transport);
      }

      const rows = db
        .prepare(`SELECT * FROM mcp_listings WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`)
        .all(...params) as Record<string, unknown>[];

      return rows.map(mapListing);
    },
    findOwnedByUser(ownerId) {
      const rows = db
        .prepare('SELECT * FROM mcp_listings WHERE owner_id = ? AND is_deleted = 0 ORDER BY created_at DESC')
        .all(ownerId) as Record<string, unknown>[];

      return rows.map(mapListing);
    },
  };
}
