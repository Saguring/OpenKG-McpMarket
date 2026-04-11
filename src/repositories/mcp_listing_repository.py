import json
import sqlite3

from src.domain.models import McpListing, SearchMcpListingsInput


def _map_listing(row: sqlite3.Row) -> McpListing:
    return McpListing(
        id=str(row["id"]),
        owner_id=str(row["owner_id"]),
        title=str(row["title"]),
        summary=str(row["summary"]),
        version=str(row["version"]),
        transport=str(row["transport"]),
        auth_type=str(row["auth_type"]),
        source_type=str(row["source_type"]),
        endpoint_url=str(row["endpoint_url"]) if row["endpoint_url"] else None,
        package_name=str(row["package_name"]) if row["package_name"] else None,
        package_registry=str(row["package_registry"]) if row["package_registry"] else None,
        source_url=str(row["source_url"]) if row["source_url"] else None,
        homepage_url=str(row["homepage_url"]) if row["homepage_url"] else None,
        tags=json.loads(str(row["tags_json"])),
        task_types=json.loads(str(row["task_types_json"])),
        is_deleted=int(row["is_deleted"]) == 1,
        created_at=str(row["created_at"]),
        deleted_at=str(row["deleted_at"]) if row["deleted_at"] else None,
    )


class McpListingRepository:
    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def create(self, listing: McpListing) -> None:
        self._connection.execute(
            """
            INSERT INTO mcp_listings (
              id, owner_id, title, summary, version, transport, auth_type, source_type,
              endpoint_url, package_name, package_registry, source_url, homepage_url,
              tags_json, task_types_json, is_deleted, created_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                listing.id,
                listing.owner_id,
                listing.title,
                listing.summary,
                listing.version,
                listing.transport,
                listing.auth_type,
                listing.source_type,
                listing.endpoint_url,
                listing.package_name,
                listing.package_registry,
                listing.source_url,
                listing.homepage_url,
                json.dumps(listing.tags, ensure_ascii=False),
                json.dumps(listing.task_types, ensure_ascii=False),
                1 if listing.is_deleted else 0,
                listing.created_at,
                listing.deleted_at,
            ),
        )
        self._connection.commit()

    def find_by_id(self, listing_id: str) -> McpListing | None:
        row = self._connection.execute("SELECT * FROM mcp_listings WHERE id = ?", (listing_id,)).fetchone()
        return _map_listing(row) if row else None

    def soft_delete(self, listing_id: str, deleted_at: str) -> None:
        self._connection.execute(
            "UPDATE mcp_listings SET is_deleted = 1, deleted_at = ? WHERE id = ?",
            (deleted_at, listing_id),
        )
        self._connection.commit()

    def search_public(self, search_input: SearchMcpListingsInput) -> list[McpListing]:
        conditions = ["is_deleted = 0"]
        params: list[str] = []

        if search_input.query:
            conditions.append(
                "(lower(title) LIKE ? OR lower(summary) LIKE ? OR lower(tags_json) LIKE ? OR lower(task_types_json) LIKE ?)"
            )
            like_value = f"%{search_input.query}%"
            params.extend([like_value, like_value, like_value, like_value])

        if search_input.task_type:
            conditions.append("lower(task_types_json) LIKE ?")
            params.append(f"%{search_input.task_type}%")

        if search_input.transport:
            conditions.append("transport = ?")
            params.append(search_input.transport)

        rows = self._connection.execute(
            f"SELECT * FROM mcp_listings WHERE {' AND '.join(conditions)} ORDER BY created_at DESC",
            tuple(params),
        ).fetchall()
        return [_map_listing(row) for row in rows]

    def find_owned_by_user(self, owner_id: str) -> list[McpListing]:
        rows = self._connection.execute(
            "SELECT * FROM mcp_listings WHERE owner_id = ? AND is_deleted = 0 ORDER BY created_at DESC",
            (owner_id,),
        ).fetchall()
        return [_map_listing(row) for row in rows]
