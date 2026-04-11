from src.domain.errors import AuthorizationError, NotFoundError
from src.domain.models import CreateMcpListingInput, RegisterUserInput, SearchMcpListingsInput
from tests.helpers import create_temp_app_context


def test_logged_in_user_can_upload_and_search_mcp() -> None:
    _, context = create_temp_app_context()

    user = context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )

    listing = context.mcp_service.create_listing(
        user.id,
        CreateMcpListingInput(
            title="DeepKE NER MCP",
            summary="用于 NER 任务的 MCP",
            version="1.0.0",
            transport="streamable-http",
            auth_type="none",
            source_type="endpoint",
            endpoint_url="https://example.com/mcp",
            tags=["DeepKE", "NER"],
            task_types=["NER"],
        ),
    )

    results = context.mcp_service.search_public(SearchMcpListingsInput(query="ner"))

    assert listing.title == "DeepKE NER MCP"
    assert len(results) == 1
    assert results[0].id == listing.id


def test_user_can_only_delete_owned_mcp() -> None:
    _, context = create_temp_app_context()

    alice = context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )
    bob = context.auth_service.register(
        RegisterUserInput(email="bob@example.com", password="password123", display_name="Bob")
    )

    listing = context.mcp_service.create_listing(
        alice.id,
        CreateMcpListingInput(
            title="DeepKE NER MCP",
            summary="用于 NER 任务的 MCP",
            version="1.0.0",
            transport="streamable-http",
            auth_type="none",
            source_type="endpoint",
            endpoint_url="https://example.com/mcp",
            task_types=["ner"],
        ),
    )

    try:
        context.mcp_service.delete_listing(bob.id, listing.id)
    except AuthorizationError:
        return

    raise AssertionError("应该抛出 AuthorizationError")


def test_deleted_listing_disappears_from_public_search() -> None:
    _, context = create_temp_app_context()

    alice = context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )

    listing = context.mcp_service.create_listing(
        alice.id,
        CreateMcpListingInput(
            title="DeepKE NER MCP",
            summary="用于 NER 任务的 MCP",
            version="1.0.0",
            transport="streamable-http",
            auth_type="none",
            source_type="endpoint",
            endpoint_url="https://example.com/mcp",
        ),
    )

    context.mcp_service.delete_listing(alice.id, listing.id)
    results = context.mcp_service.search_public(SearchMcpListingsInput(query="deepke"))

    assert results == []


def test_delete_missing_mcp_raises_not_found() -> None:
    _, context = create_temp_app_context()

    alice = context.auth_service.register(
        RegisterUserInput(email="alice@example.com", password="password123", display_name="Alice")
    )

    try:
        context.mcp_service.delete_listing(alice.id, "not-exists")
    except NotFoundError:
        return

    raise AssertionError("应该抛出 NotFoundError")
