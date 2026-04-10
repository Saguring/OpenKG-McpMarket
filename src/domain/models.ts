export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
}

export interface McpListing {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  version: string;
  transport: string;
  authType: string;
  sourceType: 'endpoint' | 'package';
  endpointUrl: string | null;
  packageName: string | null;
  packageRegistry: string | null;
  sourceUrl: string | null;
  homepageUrl: string | null;
  tags: string[];
  taskTypes: string[];
  isDeleted: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateMcpListingInput {
  title: string;
  summary: string;
  version: string;
  transport: string;
  authType: string;
  sourceType: 'endpoint' | 'package';
  endpointUrl?: string;
  packageName?: string;
  packageRegistry?: string;
  sourceUrl?: string;
  homepageUrl?: string;
  tags?: string[];
  taskTypes?: string[];
}

export interface SearchMcpListingsInput {
  query?: string;
  taskType?: string;
  transport?: string;
}

export interface CliState {
  currentSessionId: string | null;
}
