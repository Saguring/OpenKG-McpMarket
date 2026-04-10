import {
  CreateMcpListingInput,
  LoginInput,
  RegisterUserInput,
  SearchMcpListingsInput,
} from './models.js';
import { ValidationError } from './errors.js';

function requireText(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${fieldName} 不能为空`);
  }
  return trimmed;
}

function normalizeList(values: string[] | undefined): string[] {
  if (!values) {
    return [];
  }

  return [...new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export function validateRegisterInput(input: RegisterUserInput): RegisterUserInput {
  const email = requireText(input.email, '邮箱').toLowerCase();
  const displayName = requireText(input.displayName, '显示名');
  const password = input.password.trim();

  if (!email.includes('@')) {
    throw new ValidationError('邮箱格式不正确');
  }

  if (password.length < 8) {
    throw new ValidationError('密码长度不能少于 8 位');
  }

  return {
    email,
    displayName,
    password,
  };
}

export function validateLoginInput(input: LoginInput): LoginInput {
  return {
    email: requireText(input.email, '邮箱').toLowerCase(),
    password: requireText(input.password, '密码'),
  };
}

export function validateCreateListingInput(input: CreateMcpListingInput): CreateMcpListingInput {
  const title = requireText(input.title, '标题');
  const summary = requireText(input.summary, '简介');
  const version = requireText(input.version, '版本');
  const transport = requireText(input.transport, '传输方式').toLowerCase();
  const authType = requireText(input.authType, '认证方式').toLowerCase();

  if (input.sourceType !== 'endpoint' && input.sourceType !== 'package') {
    throw new ValidationError('来源类型必须是 endpoint 或 package');
  }

  let endpointUrl: string | undefined;
  let packageName: string | undefined;
  let packageRegistry: string | undefined;

  if (input.sourceType === 'endpoint') {
    endpointUrl = requireText(input.endpointUrl ?? '', 'Endpoint 地址');
  }

  if (input.sourceType === 'package') {
    packageName = requireText(input.packageName ?? '', '包名');
    packageRegistry = requireText(input.packageRegistry ?? '', '包仓库');
  }

  return {
    title,
    summary,
    version,
    transport,
    authType,
    sourceType: input.sourceType,
    endpointUrl,
    packageName,
    packageRegistry,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    homepageUrl: input.homepageUrl?.trim() || undefined,
    tags: normalizeList(input.tags),
    taskTypes: normalizeList(input.taskTypes),
  };
}

export function validateSearchInput(input: SearchMcpListingsInput): SearchMcpListingsInput {
  return {
    query: input.query?.trim().toLowerCase() || undefined,
    taskType: input.taskType?.trim().toLowerCase() || undefined,
    transport: input.transport?.trim().toLowerCase() || undefined,
  };
}
