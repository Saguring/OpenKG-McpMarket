import tempfile

from src.app_context import AppContext


def create_temp_app_context() -> tuple[str, AppContext]:
    temp_dir = tempfile.mkdtemp(prefix="OpenKG-McpMarket-")
    return temp_dir, AppContext(temp_dir)
