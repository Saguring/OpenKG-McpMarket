import { describe, expect, it } from 'vitest';
import { AuthorizationError, NotFoundError } from '../src/domain/errors.js';
import { createTempAppContext } from './helpers.js';

describe('MCP 列表流程', () => {
  it('登录用户可以上传并查询 MCP', async () => {
    const { context } = createTempAppContext();

    const user = await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    const listing = context.mcpService.createListing(user.id, {
      title: 'DeepKE NER MCP',
      summary: '用于 NER 任务的 MCP',
      version: '1.0.0',
      transport: 'streamable-http',
      authType: 'none',
      sourceType: 'endpoint',
      endpointUrl: 'https://example.com/mcp',
      tags: ['DeepKE', 'NER'],
      taskTypes: ['NER'],
    });

    const results = context.mcpService.searchPublic({ query: 'ner' });

    expect(listing.title).toBe('DeepKE NER MCP');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe(listing.id);
  });

  it('用户只能删除自己上传的 MCP', async () => {
    const { context } = createTempAppContext();

    const alice = await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    const bob = await context.authService.register({
      email: 'bob@example.com',
      password: 'password123',
      displayName: 'Bob',
    });

    const listing = context.mcpService.createListing(alice.id, {
      title: 'DeepKE NER MCP',
      summary: '用于 NER 任务的 MCP',
      version: '1.0.0',
      transport: 'streamable-http',
      authType: 'none',
      sourceType: 'endpoint',
      endpointUrl: 'https://example.com/mcp',
      taskTypes: ['ner'],
    });

    expect(() => context.mcpService.deleteListing(bob.id, listing.id)).toThrow(AuthorizationError);
  });

  it('删除后不会出现在公开搜索中', async () => {
    const { context } = createTempAppContext();

    const alice = await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    const listing = context.mcpService.createListing(alice.id, {
      title: 'DeepKE NER MCP',
      summary: '用于 NER 任务的 MCP',
      version: '1.0.0',
      transport: 'streamable-http',
      authType: 'none',
      sourceType: 'endpoint',
      endpointUrl: 'https://example.com/mcp',
    });

    context.mcpService.deleteListing(alice.id, listing.id);

    const results = context.mcpService.searchPublic({ query: 'deepke' });

    expect(results).toHaveLength(0);
  });

  it('删除不存在的 MCP 会报错', async () => {
    const { context } = createTempAppContext();

    const alice = await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    expect(() => context.mcpService.deleteListing(alice.id, 'not-exists')).toThrow(NotFoundError);
  });
});
