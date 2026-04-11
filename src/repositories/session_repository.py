import sqlite3

from src.domain.models import Session


def _map_session(row: sqlite3.Row) -> Session:
    return Session(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        created_at=str(row["created_at"]),
    )


class SessionRepository:
    def __init__(self, connection: sqlite3.Connection) -> None:
        self._connection = connection

    def create(self, session: Session) -> None:
        self._connection.execute(
            "INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)",
            (session.id, session.user_id, session.created_at),
        )
        self._connection.commit()

    def find_by_id(self, session_id: str) -> Session | None:
        row = self._connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        return _map_session(row) if row else None

    def delete_by_id(self, session_id: str) -> None:
        self._connection.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        self._connection.commit()
