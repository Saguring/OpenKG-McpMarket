from src.domain.errors import AuthorizationError, NotFoundError
from src.domain.models import CreateMcpListingInput, McpListing, SearchMcpListingsInput
from src.domain.validators import validate_create_listing_input, validate_search_input
from src.infrastructure.clock import now_iso
from src.infrastructure.ids import create_id
from src.repositories.mcp_listing_repository import McpListingRepository


class McpService:
    def __init__(self, listings: McpListingRepository) -> None:
        self._listings = listings

    def create_listing(self, owner_id: str, input_data: CreateMcpListingInput) -> McpListing:
        validated = validate_create_listing_input(input_data)
        listing = McpListing(
            id=create_id(),
            owner_id=owner_id,
            title=validated.title,
            summary=validated.summary,
            version=validated.version,
            transport=validated.transport,
            auth_type=validated.auth_type,
            source_type=validated.source_type,
            endpoint_url=validated.endpoint_url,
            package_name=validated.package_name,
            package_registry=validated.package_registry,
            source_url=validated.source_url,
            homepage_url=validated.homepage_url,
            tags=validated.tags,
            task_types=validated.task_types,
            is_deleted=False,
            created_at=now_iso(),
            deleted_at=None,
        )
        self._listings.create(listing)
        created = self._listings.find_by_id(listing.id)
        if not created:
            raise NotFoundError("创建后的 MCP 记录未找到")
        return created

    def delete_listing(self, request_user_id: str, listing_id: str) -> None:
        listing = self._listings.find_by_id(listing_id)
        if not listing or listing.is_deleted:
            raise NotFoundError("未找到对应的 MCP")

        if listing.owner_id != request_user_id:
            raise AuthorizationError("只能删除自己上传的 MCP")

        self._listings.soft_delete(listing_id, now_iso())

    def search_public(self, input_data: SearchMcpListingsInput) -> list[McpListing]:
        return self._listings.search_public(validate_search_input(input_data))

    def list_owned_by_user(self, user_id: str) -> list[McpListing]:
        return self._listings.find_owned_by_user(user_id)
