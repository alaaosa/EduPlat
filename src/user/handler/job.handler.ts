import { UserJobs } from '../shared/const/user.job';

export function getUserWorkerMessage(
  eventName: string,
  jobName: string,
): string {
  return `${jobName}:${jobs[eventName][jobName]}`;
}

const jobs = {
  completed: {
    [UserJobs.DELETE_PROFILE_PHOTO]: 'deleted successfully',
  },
};
