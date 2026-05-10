import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { UserProfile, UserType } from '@/types';

const userTypes: UserType[] = ['Researcher', 'NGO', 'Startup', 'Institution'];

export default function ProfileScreen() {
  const { currentUser, onboardingAnswers, updateProfile: saveProfileToState } = useGrantMatch();
  const [profile, setProfile] = useState<UserProfile>(currentUser);
  const [successMessage, setSuccessMessage] = useState('');

  function updateProfileField(field: keyof UserProfile, value: string) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: field === 'researchInterests' ? value.split(',').map((item) => item.trim()) : value,
    }));
  }

  function saveProfile() {
    saveProfileToState(profile);
    setSuccessMessage('Profile saved locally. Dashboard completeness has been updated.');
  }

  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow="Applicant profile"
        title="Profile"
        subtitle="Edit the mock profile used by the recommendation and proposal flows."
      />

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      {onboardingAnswers ? (
        <AppCard style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>Onboarding answers applied</Text>
          <Text style={styles.onboardingText}>
            {onboardingAnswers.userType} • {onboardingAnswers.countryRegion} •{' '}
            {onboardingAnswers.preferredFundingSize} • {onboardingAnswers.deadlineReadiness}
          </Text>
          <Text style={styles.onboardingText}>
            Interests: {onboardingAnswers.fundingInterests || 'No interests added yet'}
          </Text>
        </AppCard>
      ) : null}

      <AppCard style={styles.form}>
        <ProfileInput label="Name" value={profile.fullName} onChangeText={(value) => updateProfileField('fullName', value)} />
        <ProfileInput
          label="Organisation"
          value={profile.organisation}
          onChangeText={(value) => updateProfileField('organisation', value)}
        />

        <View style={styles.field}>
          <Text style={styles.label}>User type</Text>
          <View style={styles.optionGrid}>
            {userTypes.map((userType) => {
              const selected = profile.userType === userType;

              return (
                <Pressable
                  key={userType}
                  style={[styles.option, selected && styles.selectedOption]}
                  onPress={() => updateProfileField('userType', userType)}>
                  <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{userType}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ProfileInput label="Country" value={profile.country} onChangeText={(value) => updateProfileField('country', value)} />
        <ProfileInput
          label="Research interests / keywords"
          value={profile.researchInterests.join(', ')}
          onChangeText={(value) => updateProfileField('researchInterests', value)}
          multiline
        />
        <ProfileInput label="Sector" value={profile.sector} onChangeText={(value) => updateProfileField('sector', value)} />
        <ProfileInput
          label="Funding needs"
          value={profile.fundingNeeds}
          onChangeText={(value) => updateProfileField('fundingNeeds', value)}
          multiline
        />
        <ProfileInput
          label="Collaboration interests"
          value={profile.collaborationInterests}
          onChangeText={(value) => updateProfileField('collaborationInterests', value)}
          multiline
        />

        <AppButton title="Save Profile" onPress={saveProfile} />
      </AppCard>
    </ScreenContainer>
  );
}

interface ProfileInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}

function ProfileInput({ label, value, onChangeText, multiline = false }: ProfileInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  success: {
    backgroundColor: brand.colors.successSoft,
    borderRadius: 14,
    color: brand.colors.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 16,
    padding: 14,
  },
  form: {
    gap: 16,
  },
  onboardingCard: {
    gap: 8,
    marginBottom: 16,
  },
  onboardingTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  onboardingText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedOption: {
    backgroundColor: brand.colors.accentSoft,
    borderColor: brand.colors.accent,
  },
  optionText: {
    color: brand.colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedOptionText: {
    color: brand.colors.accent,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
});
