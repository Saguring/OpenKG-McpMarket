import { describe, expect, it } from 'vitest';
import { AuthenticationError, ValidationError } from '../src/domain/errors.js';
import { createTempAppContext } from './helpers.js';

describe('认证流程', () => {
  it('可以注册并登录', async () => {
    const { context } = createTempAppContext();

    const user = await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    const session = await context.authService.login({
      email: 'alice@example.com',
      password: 'password123',
    });

    const currentUser = context.authService.getUserBySession(session.id);

    expect(user.email).toBe('alice@example.com');
    expect(currentUser?.id).toBe(user.id);
    expect('passwordHash' in user).toBe(false);
  });

  it('重复邮箱不能注册', async () => {
    const { context } = createTempAppContext();

    await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    await expect(
      context.authService.register({
        email: 'alice@example.com',
        password: 'password123',
        displayName: 'Alice 2',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('错误密码不能登录', async () => {
    const { context } = createTempAppContext();

    await context.authService.register({
      email: 'alice@example.com',
      password: 'password123',
      displayName: 'Alice',
    });

    await expect(
      context.authService.login({
        email: 'alice@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
