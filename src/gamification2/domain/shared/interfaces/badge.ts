import { BadgeEventType } from '../enum/badge.enums';

export interface IBadge {
  addBadgeJob(
    userId: number,
    eventType: BadgeEventType,
    idempotency_key?: string,
  ): Promise<void>;
}
