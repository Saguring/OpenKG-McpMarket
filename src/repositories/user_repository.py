import sqlite3

from src.domain.models import StoredUser


def _map_user(row: sqlite3.Row) -> StoredUser:
    return StoredUser(
        id=str(row["id"]),
        email=str(row["email"]),
        password_hash=str(row["password_hash"]),
        display_name=str(row["display_name"]),
        created_at=str(row["created_at"]),
    )


class UserRepository:
    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def create(self, user: StoredUser) -> None:
        self._connection.execute(
            """
            INSERT INTO users (id, email, password_hash, display_name, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user.id, user.email, user.password_hash, user.display_name, user.created_at),
        )
        self._connection.commit()

    def find_by_email(self, email: str) -> StoredUser | None:
        row = self._connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return _map_user(row) if row else None

    def find_by_id(self, user_id: str) -> StoredUser | None:
        row = self._connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return _map_user(row) if row else None
