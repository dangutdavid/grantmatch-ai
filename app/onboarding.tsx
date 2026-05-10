import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  DeadlineReadiness,
  OnboardingAnswers,
  PreferredFundingSize,
  UserType,
} from '@/types';

const userTypes: UserType[] = ['Researcher', 'NGO', 'Startup', 'Institution'];
const fundingSizes: PreferredFundingSize[] = ['Under $50k', '$50k - $250k', '$250k - $1m', '$1m+'];
const readinessOptions: DeadlineReadiness[] = [
  'Ready now',
  'Ready in 1 month',
  'Ready in 3 months',
  'Exploring only',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, onboardingAnswers, currentUser } = useGrantMatch();
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    userType: onboardingAnswers?.userType ?? currentUser.userType,
    organisationName: onboardingAnswers?.organisationName ?? currentUser.organisation,
    countryRegion: onboardingAnswers?.countryRegion ?? currentUser.country,
    fundingInterests:
      onboardingAnswers?.fundingInterests ?? currentUser.researchInterests.join(', '),
    preferredFundingSize: onboardingAnswers?.preferredFundingSize ?? 'Under $50k',
    deadlineReadiness: onboardingAnswers?.deadlineReadiness ?? 'Ready in 1 month',
  });
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        title: 'What best describes you?',
        helper: 'This shapes the mock profile and workspace defaults.',
        content: (
          <OptionGrid
            options={userTypes}
            selectedValue={answers.userType}
            onSelect={(userType) => setAnswers((current) => ({ ...current, userType }))}
          />
        ),
      },
      {
        title: 'Organisation or institution name',
        helper: 'Used as the workspace name across the local demo.',
        content: (
          <OnboardingInput
            value={answers.organisationName}
            onChangeText={(organisationName) =>
              setAnswers((current) => ({ ...current, organisationName }))
            }
            placeholder="Example: Horizon Research Lab"
          />
        ),
      },
      {
        title: 'Country or region',
        helper: 'Used to prefill profile geography and funding region preferences.',
        content: (
          <OnboardingInput
            value={answers.countryRegion}
            onChangeText={(countryRegion) => setAnswers((current) => ({ ...current, countryRegion }))}
            placeholder="Example: United Kingdom"
          />
        ),
      },
      {
        title: 'Research and funding interests',
        helper: 'Separate topics with commas so the profile can use them as matching keywords.',
        content: (
          <OnboardingInput
            multiline
            value={answers.fundingInterests}
            onChangeText={(fundingInterests) =>
              setAnswers((current) => ({ ...current, fundingInterests }))
            }
            placeholder="Climate adaptation, public health, AI safety"
          />
        ),
      },
      {
        title: 'Preferred funding size',
        helper: 'Stored locally as a planning signal for later matching improvements.',
        content: (
          <OptionGrid
            options={fundingSizes}
            selectedValue={answers.preferredFundingSize}
            onSelect={(preferredFundingSize) =>
              setAnswers((current) => ({ ...current, preferredFundingSize }))
            }
          />
        ),
      },
      {
        title: 'Deadline readiness',
        helper: 'Helps frame deadline risk guidance in this SaaS foundation.',
        content: (
          <OptionGrid
            options={readinessOptions}
            selectedValue={answers.deadlineReadiness}
            onSelect={(deadlineReadiness) =>
              setAnswers((current) => ({ ...current, deadlineReadiness }))
            }
          />
        ),
      },
    ],
    [answers]
  );

  const activeStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const progress = `${step + 1} of ${steps.length}`;

  async function finishOnboarding() {
    await completeOnboarding(answers);
    router.replace('/dashboard');
  }

  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow="First-time setup"
        title="Set up GrantMatch AI"
        subtitle="A short local onboarding flow that prepares your profile, workspace, and mock recommendations."
      />

      <AppCard style={styles.card}>
        <Text style={styles.progress}>{progress}</Text>
        <Text style={styles.title}>{activeStep.title}</Text>
        <Text style={styles.helper}>{activeStep.helper}</Text>
        <View style={styles.content}>{activeStep.content}</View>

        <View style={styles.actions}>
          <AppButton
            title="Back"
            variant="secondary"
            disabled={step === 0}
            onPress={() => setStep((current) => Math.max(0, current - 1))}
            style={styles.actionButton}
          />
          <AppButton
            title={isLastStep ? 'Finish Onboarding' : 'Continue'}
            onPress={isLastStep ? finishOnboarding : () => setStep((current) => current + 1)}
            style={styles.actionButton}
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

function OptionGrid<T extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const selected = selectedValue === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.option, selected && styles.selectedOption]}>
            <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OnboardingInput({
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <TextInput
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  progress: {
    color: brand.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: brand.colors.ink,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  helper: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    minHeight: 150,
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
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: brand.colors.primary,
    borderColor: brand.colors.primary,
  },
  optionText: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flexBasis: 180,
    flexGrow: 1,
  },
});
