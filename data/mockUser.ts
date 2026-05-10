import { UserProfile } from '@/types';

export const mockUser: UserProfile = {
  id: 'user-001',
  fullName: 'Dr. Maya Chen',
  organisation: 'Global Health Innovation Lab',
  userType: 'Researcher',
  country: 'United Kingdom',
  researchInterests: ['public health', 'AI diagnostics', 'health equity', 'implementation science'],
  sector: 'Health technology',
  fundingNeeds: 'Seed funding for applied AI research and field validation.',
  collaborationInterests: 'Universities, NGOs, hospital networks, and public sector health teams.',
  profileCompleteness: 78,
  savedGrantIds: ['grant-002'],
  subscriptionTier: 'Free',
};

// TODO: Replace this mock profile with Firebase/Supabase auth-linked user records.
// TODO: Store sensitive profile fields in a protected PostgreSQL table with row-level access rules.
