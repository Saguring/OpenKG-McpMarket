import json
from pathlib import Path

from src.domain.models import CliState


class CliStateStore:
    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path
        self._file_path.parent.mkdir(parents=True, exist_ok=True)

    def read(self) -> CliState:
        if not self._file_path.exists():
            return CliState(current_session_id=None)

        data = json.loads(self._file_path.read_text(encoding="utf-8"))
        return CliState(current_session_id=data.get("current_session_id"))

    def write(self, state: CliState) -> None:
        self._file_path.write_text(
            json.dumps({"current_session_id": state.current_session_id}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def clear(self) -> None:
        self.write(CliState(current_session_id=None))
