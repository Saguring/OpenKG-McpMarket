import { AuthorizationError, NotFoundError } from '../domain/errors.js';
import {
  CreateMcpListingInput,
  McpListing,
  SearchMcpListingsInput,
} from '../domain/models.js';
import { validateCreateListingInput, validateSearchInput } from '../domain/validators.js';
import { Clock } from '../infrastructure/clock.js';
import { createId } from '../infrastructure/ids.js';
import {
  CreateListingRecord,
  McpListingRepository,
} from '../repositories/mcp-listing-repository.js';

export interface McpService {
  createListing(ownerId: string, input: CreateMcpListingInput): McpListing;
  deleteListing(requestUserId: string, listingId: string): void;
  searchPublic(input: SearchMcpListingsInput): McpListing[];
  listOwnedByUser(userId: string): McpListing[];
}

export function createMcpService(deps: {
  listings: McpListingRepository;
  clock: Clock;
}): McpService {
  return {
    createListing(ownerId, input) {
      const validated = validateCreateListingInput(input);
      const createdAt = deps.clock.nowIso();

      const record: CreateListingRecord = {
        id: createId(),
        ownerId,
        title: validated.title,
        summary: validated.summary,
        version: validated.version,
        transport: validated.transport,
        authType: validated.authType,
        sourceType: validated.sourceType,
        endpointUrl: validated.endpointUrl ?? null,
        packageName: validated.packageName ?? null,
        packageRegistry: validated.packageRegistry ?? null,
        sourceUrl: validated.sourceUrl ?? null,
        homepageUrl: validated.homepageUrl ?? null,
        tagsJson: JSON.stringify(validated.tags ?? []),
        taskTypesJson: JSON.stringify(validated.taskTypes ?? []),
        isDeleted: 0,
        createdAt,
        deletedAt: null,
      };

      deps.listings.create(record);
      const created = deps.listings.findById(record.id);
      if (!created) {
        throw new NotFoundError('创建后的 MCP 记录未找到');
      }

      return created;
    },
    deleteListing(requestUserId, listingId) {
      const listing = deps.listings.findById(listingId);
      if (!listing || listing.isDeleted) {
        throw new NotFoundError('未找到对应的 MCP');
      }

      if (listing.ownerId !== requestUserId) {
        throw new AuthorizationError('只能删除自己上传的 MCP');
      }

      deps.listings.softDelete(listingId, deps.clock.nowIso());
    },
    searchPublic(input) {
      const validated = validateSearchInput(input);
      return deps.listings.searchPublic(validated);
    },
    listOwnedByUser(userId) {
      return deps.listings.findOwnedByUser(userId);
    },
  };
}
