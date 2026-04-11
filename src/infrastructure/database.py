import sqlite3
from pathlib import Path


SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
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
    """,
]


def create_connection(database_file_path: Path) -> sqlite3.Connection:
    database_file_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database_file_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def run_migrations(connection: sqlite3.Connection) -> None:
    for statement in SCHEMA_STATEMENTS:
        connection.execute(statement)
    connection.commit()
