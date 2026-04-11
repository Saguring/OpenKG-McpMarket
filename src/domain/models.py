from dataclasses import dataclass, field


@dataclass(slots=True)
class StoredUser:
    id: str
    email: str
    password_hash: str
    display_name: str
    created_at: str


@dataclass(slots=True)
class SafeUser:
    id: str
    email: str
    display_name: str
    created_at: str


@dataclass(slots=True)
class Session:
    id: str
    user_id: str
    created_at: str


@dataclass(slots=True)
class McpListing:
    id: str
    owner_id: str
    title: str
    summary: str
    version: str
    transport: str
    auth_type: str
    source_type: str
    endpoint_url: str | None
    package_name: str | None
    package_registry: str | None
    source_url: str | None
    homepage_url: str | None
    tags: list[str] = field(default_factory=list)
    task_types: list[str] = field(default_factory=list)
    is_deleted: bool = False
    created_at: str = ""
    deleted_at: str | None = None


@dataclass(slots=True)
class RegisterUserInput:
    email: str
    password: str
    display_name: str


@dataclass(slots=True)
class LoginInput:
    email: str
    password: str


@dataclass(slots=True)
class CreateMcpListingInput:
    title: str
    summary: str
    version: str
    transport: str
    auth_type: str
    source_type: str
    endpoint_url: str | None = None
    package_name: str | None = None
    package_registry: str | None = None
    source_url: str | None = None
    homepage_url: str | None = None
    tags: list[str] = field(default_factory=list)
    task_types: list[str] = field(default_factory=list)


@dataclass(slots=True)
class SearchMcpListingsInput:
    query: str | None = None
    task_type: str | None = None
    transport: str | None = None


@dataclass(slots=True)
class CliState:
    current_session_id: str | None
