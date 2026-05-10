import { UserProfile } from '@/types';

const profileFields: (keyof UserProfile)[] = [
  'fullName',
  'organisation',
  'userType',
  'country',
  'researchInterests',
  'sector',
  'fundingNeeds',
  'collaborationInterests',
];

export function calculateProfileCompleteness(profile: UserProfile) {
  const completedFields = profileFields.filter((field) => {
    const value = profile[field];

    if (Array.isArray(value)) {
      return value.length > 0 && value.some((item) => item.trim().length > 0);
    }

    return String(value).trim().length > 0;
  }).length;

  return Math.round((completedFields / profileFields.length) * 100);
}
