import { sessionRepository } from './session.repository.ts';
import type { Session } from './types.ts';

export class SessionService {
  async createSession(token: string, userId: string, expiresAt: number): Promise<void> {
    await sessionRepository.create(token, userId, expiresAt);
  }

  async getSession(token: string): Promise<Session | undefined> {
    return sessionRepository.findValidByToken(token, Date.now());
  }

  async deleteSession(token: string): Promise<void> {
    await sessionRepository.deleteByToken(token);
  }

  async cleanExpiredSessions(): Promise<void> {
    await sessionRepository.deleteExpired(Date.now());
  }
}

export const sessionService = new SessionService();
