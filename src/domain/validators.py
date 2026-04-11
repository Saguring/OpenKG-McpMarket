from src.domain.errors import ValidationError
from src.domain.models import (
    CreateMcpListingInput,
    LoginInput,
    RegisterUserInput,
    SearchMcpListingsInput,
)


def _require_text(value: str, field_name: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        raise ValidationError(f"{field_name} 不能为空")
    return trimmed


def _normalize_list(values: list[str] | None) -> list[str]:
    if not values:
        return []

    normalized: list[str] = []
    for item in values:
        lowered = item.strip().lower()
        if lowered and lowered not in normalized:
            normalized.append(lowered)
    return normalized


def validate_register_input(input_data: RegisterUserInput) -> RegisterUserInput:
    email = _require_text(input_data.email, "邮箱").lower()
    display_name = _require_text(input_data.display_name, "显示名")
    password = input_data.password.strip()

    if "@" not in email:
        raise ValidationError("邮箱格式不正确")

    if len(password) < 8:
        raise ValidationError("密码长度不能少于 8 位")

    return RegisterUserInput(email=email, password=password, display_name=display_name)


def validate_login_input(input_data: LoginInput) -> LoginInput:
    return LoginInput(
        email=_require_text(input_data.email, "邮箱").lower(),
        password=_require_text(input_data.password, "密码"),
    )


def validate_create_listing_input(input_data: CreateMcpListingInput) -> CreateMcpListingInput:
    title = _require_text(input_data.title, "标题")
    summary = _require_text(input_data.summary, "简介")
    version = _require_text(input_data.version, "版本")
    transport = _require_text(input_data.transport, "传输方式").lower()
    auth_type = _require_text(input_data.auth_type, "认证方式").lower()
    source_type = input_data.source_type.strip().lower()

    if source_type not in {"endpoint", "package"}:
        raise ValidationError("来源类型必须是 endpoint 或 package")

    endpoint_url = None
    package_name = None
    package_registry = None

    if source_type == "endpoint":
        endpoint_url = _require_text(input_data.endpoint_url or "", "Endpoint 地址")

    if source_type == "package":
        package_name = _require_text(input_data.package_name or "", "包名")
        package_registry = _require_text(input_data.package_registry or "", "包仓库")

    return CreateMcpListingInput(
        title=title,
        summary=summary,
        version=version,
        transport=transport,
        auth_type=auth_type,
        source_type=source_type,
        endpoint_url=endpoint_url,
        package_name=package_name,
        package_registry=package_registry,
        source_url=input_data.source_url.strip() if input_data.source_url else None,
        homepage_url=input_data.homepage_url.strip() if input_data.homepage_url else None,
        tags=_normalize_list(input_data.tags),
        task_types=_normalize_list(input_data.task_types),
    )


def validate_search_input(input_data: SearchMcpListingsInput) -> SearchMcpListingsInput:
    return SearchMcpListingsInput(
        query=input_data.query.strip().lower() if input_data.query else None,
        task_type=input_data.task_type.strip().lower() if input_data.task_type else None,
        transport=input_data.transport.strip().lower() if input_data.transport else None,
    )
