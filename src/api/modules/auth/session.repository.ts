import { db } from '../../db/index.ts';
import type { DbExecutor } from '../../shared/types.ts';
import type { Session } from './types.ts';

export class SessionRepository {
  async create(
    token: string,
    userId: string,
    expiresAt: number,
    executor: DbExecutor = db
  ): Promise<void> {
    await executor
      .insertInto('sessions')
      .values({ token, user_id: userId, expires_at: expiresAt })
      .execute();
  }

  async findValidByToken(
    token: string,
    now: number,
    executor: DbExecutor = db
  ): Promise<Session | undefined> {
    return executor
      .selectFrom('sessions')
      .select(['token', 'user_id', 'expires_at'])
      .where('token', '=', token)
      .where('expires_at', '>', now)
      .executeTakeFirst();
  }

  async deleteByToken(token: string, executor: DbExecutor = db): Promise<void> {
    await executor.deleteFrom('sessions').where('token', '=', token).execute();
  }

  async deleteExpired(now: number, executor: DbExecutor = db): Promise<void> {
    await executor.deleteFrom('sessions').where('expires_at', '<=', now).execute();
  }
}

export const sessionRepository = new SessionRepository();
