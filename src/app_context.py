import os
from pathlib import Path

from src.infrastructure.database import create_connection, run_migrations
from src.infrastructure.state_store import CliStateStore
from src.repositories.mcp_listing_repository import McpListingRepository
from src.repositories.session_repository import SessionRepository
from src.repositories.user_repository import UserRepository
from src.services.auth_service import AuthService
from src.services.mcp_service import McpService


def resolve_app_data_directory(base_dir: str | None = None) -> Path:
    if base_dir:
        return Path(base_dir) / "OpenKG-McpMarket"

    xdg_data_home = os.environ.get("XDG_DATA_HOME", "").strip()
    if xdg_data_home:
        return Path(xdg_data_home) / "OpenKG-McpMarket"

    return Path.home() / ".local" / "share" / "OpenKG-McpMarket"


class AppContext:
    def __init__(self, base_dir: str | None = None) -> None:
        data_dir = resolve_app_data_directory(base_dir)
        connection = create_connection(data_dir / "marketplace.db")
        run_migrations(connection)

        users = UserRepository(connection)
        sessions = SessionRepository(connection)
        listings = McpListingRepository(connection)

        self.auth_service = AuthService(users, sessions)
        self.mcp_service = McpService(listings)
        self.cli_state_store = CliStateStore(data_dir / "cli-state.json")
