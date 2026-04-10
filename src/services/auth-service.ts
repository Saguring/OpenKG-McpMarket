import argon2 from 'argon2';
import { AuthenticationError, ValidationError } from '../domain/errors.js';
import { toSafeUser } from '../domain/mappers.js';
import { LoginInput, RegisterUserInput, SafeUser, Session, StoredUser } from '../domain/models.js';
import { validateLoginInput, validateRegisterInput } from '../domain/validators.js';
import { Clock } from '../infrastructure/clock.js';
import { createId } from '../infrastructure/ids.js';
import { SessionRepository } from '../repositories/session-repository.js';
import { UserRepository } from '../repositories/user-repository.js';

export interface AuthService {
  register(input: RegisterUserInput): Promise<SafeUser>;
  login(input: LoginInput): Promise<Session>;
  logout(sessionId: string): void;
  getUserBySession(sessionId: string | null): SafeUser | null;
}

export function createAuthService(deps: {
  users: UserRepository;
  sessions: SessionRepository;
  clock: Clock;
}): AuthService {
  return {
    async register(input) {
      const validated = validateRegisterInput(input);
      const existingUser = deps.users.findByEmail(validated.email);
      if (existingUser) {
        throw new ValidationError('该邮箱已被注册');
      }

      const user: StoredUser = {
        id: createId(),
        email: validated.email,
        passwordHash: await argon2.hash(validated.password),
        displayName: validated.displayName,
        createdAt: deps.clock.nowIso(),
      };

      deps.users.create(user);
      return toSafeUser(user);
    },
    async login(input) {
      const validated = validateLoginInput(input);
      const user = deps.users.findByEmail(validated.email);

      if (!user) {
        throw new AuthenticationError('邮箱或密码错误');
      }

      const verified = await argon2.verify(user.passwordHash, validated.password);
      if (!verified) {
        throw new AuthenticationError('邮箱或密码错误');
      }

      const session: Session = {
        id: createId(),
        userId: user.id,
        createdAt: deps.clock.nowIso(),
      };

      deps.sessions.create(session);
      return session;
    },
    logout(sessionId) {
      deps.sessions.deleteById(sessionId);
    },
    getUserBySession(sessionId) {
      if (!sessionId) {
        return null;
      }

      const session = deps.sessions.findById(sessionId);
      if (!session) {
        return null;
      }

      const user = deps.users.findById(session.userId);
      return user ? toSafeUser(user) : null;
    },
  };
}
