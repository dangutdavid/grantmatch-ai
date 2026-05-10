import { mockUser } from '@/data/mockUser';
import { supabase } from '@/services/supabaseClient';
import { ProfileUpsertInput, SessionUser, UserProfile, UserType } from '@/types';
import { calculateProfileCompleteness } from '@/utils/profile';

interface ProfileRow {
  user_id: string;
  email: string;
  full_name: string;
  user_type: string;
  organisation: string | null;
  country: string | null;
  sector: string | null;
  funding_needs: string | null;
  collaboration_interests: string | null;
  research_interests: string[] | null;
  profile_completeness: number | null;
  subscription_tier: string | null;
}

export function mapSessionToProfileInput(sessionUser: SessionUser): ProfileUpsertInput {
  return {
    userId: sessionUser.id,
    email: sessionUser.email,
    fullName: sessionUser.fullName,
    organisation: sessionUser.organisation,
    userType: sessionUser.userType,
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  return {
    ...mockUser,
    profileCompleteness: calculateProfileCompleteness(mockUser),
  };
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  return {
    ...profile,
    profileCompleteness: calculateProfileCompleteness(profile),
  };
}

export async function getProfile(userId: string): Promise<UserProfile | undefined> {
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    return undefined;
  }

  return mapProfileRowToUserProfile(data);
}

export async function upsertProfile(input: ProfileUpsertInput): Promise<UserProfile> {
  const profile: UserProfile = {
    ...mockUser,
    id: input.userId,
    fullName: input.fullName,
    organisation: input.organisation,
    userType: input.userType,
    country: input.country ?? mockUser.country,
    sector: input.sector ?? mockUser.sector,
    fundingNeeds: input.fundingNeeds ?? mockUser.fundingNeeds,
    collaborationInterests: input.collaborationInterests ?? mockUser.collaborationInterests,
    researchInterests: input.researchInterests ?? mockUser.researchInterests,
    subscriptionTier: input.subscriptionTier ?? mockUser.subscriptionTier,
  };
  const profileCompleteness = calculateProfileCompleteness(profile);
  const nextProfile = {
    ...profile,
    profileCompleteness,
  };

  if (!supabase) {
    return nextProfile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: input.userId,
        email: input.email,
        full_name: input.fullName,
        user_type: input.userType,
        organisation: input.organisation,
        country: nextProfile.country,
        sector: nextProfile.sector,
        funding_needs: nextProfile.fundingNeeds,
        collaboration_interests: nextProfile.collaborationInterests,
        research_interests: nextProfile.researchInterests,
        profile_completeness: profileCompleteness,
        subscription_tier: nextProfile.subscriptionTier,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single<ProfileRow>();

  if (error || !data) {
    return nextProfile;
  }

  return mapProfileRowToUserProfile(data);
}

function mapProfileRowToUserProfile(row: ProfileRow): UserProfile {
  const profile: UserProfile = {
    ...mockUser,
    id: row.user_id,
    fullName: row.full_name,
    organisation: row.organisation ?? mockUser.organisation,
    userType: isUserType(row.user_type) ? row.user_type : mockUser.userType,
    country: row.country ?? mockUser.country,
    sector: row.sector ?? mockUser.sector,
    fundingNeeds: row.funding_needs ?? mockUser.fundingNeeds,
    collaborationInterests: row.collaboration_interests ?? mockUser.collaborationInterests,
    researchInterests: row.research_interests ?? mockUser.researchInterests,
    profileCompleteness: row.profile_completeness ?? mockUser.profileCompleteness,
    subscriptionTier:
      row.subscription_tier === 'Pro' || row.subscription_tier === 'Institutional'
        ? row.subscription_tier
        : 'Free',
  };

  return {
    ...profile,
    profileCompleteness: calculateProfileCompleteness(profile),
  };
}

function isUserType(value: string): value is UserType {
  return ['Researcher', 'NGO', 'Startup', 'Institution'].includes(value);
}
