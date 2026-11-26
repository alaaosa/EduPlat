type BadgeEntityRow = {
  id: number;
  targetNumToUnlock: number;
  'userBadges.progress': number | null;
  'userBadges.badgeId': number | null;
  'userBadges.lock': boolean | null;
  'userBadges.userId': number | null;
};

export type UserBadgeProperties = {
  userId: number;
  progress: number;
  lock: boolean;
  badgeId: number;
};

export class BadgeEntity {
  constructor(readonly badgeEntityData: BadgeEntityRow[]) {}

  applyBadgeLogic(userId: number) {
    const hasBadges: UserBadgeProperties[] = [];
    const newBadges: UserBadgeProperties[] = [];

    for (const badge of this.badgeEntityData) {
      const currentProgress = badge['userBadges.progress'];

      if (badge['userBadges.badgeId'] == null) {
        newBadges.push(
          this.buildProperties(userId, badge.id, 1, badge.targetNumToUnlock),
        );
        continue;
      }

      if (badge['userBadges.lock'] === false) continue;

      hasBadges.push(
        this.buildProperties(
          badge['userBadges.userId']!,
          badge['userBadges.badgeId']!,
          Math.min((currentProgress ?? 0) + 1, badge.targetNumToUnlock),
          badge.targetNumToUnlock,
        ),
      );
    }

    return { hasBadges, newBadges };
  }

  private buildProperties(
    userId: number,
    badgeId: number,
    progress: number,
    target: number,
  ): UserBadgeProperties {
    return { userId, badgeId, progress, lock: progress < target };
  }
}
