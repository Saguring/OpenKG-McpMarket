import { SafeUser, StoredUser } from './models.js';

export function toSafeUser(user: StoredUser): SafeUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}
