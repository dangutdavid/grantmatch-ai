import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';

const features = [
  {
    title: 'Smart Grant Matching',
    description: 'Rank funding opportunities using profile fit, eligibility, urgency, and funding needs.',
  },
  {
    title: 'Researcher & Organisation Profiles',
    description: 'Capture expertise, sectors, geography, collaborators, and funding preferences.',
  },
  {
    title: 'AI Proposal Drafting',
    description: 'Generate structured proposal sections from grant requirements and profile context.',
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { loginMock } = useGrantMatch();

  async function openDemo() {
    await loginMock();
    router.push('/dashboard');
  }

  return (
    <ScreenContainer maxWidth="medium">
      <View style={styles.hero}>
        <Text style={styles.badge}>AI grant matchmaking platform</Text>
        <Text style={styles.title}>{brand.appName}</Text>
        <Text style={styles.subtitle}>{brand.tagline}</Text>
        <Text style={styles.description}>
          Build richer applicant profiles, discover relevant funding, understand why each
          opportunity matches, and turn promising grants into structured proposal drafts.
        </Text>
      </View>

      <View style={styles.featureList}>
        {features.map((feature) => (
          <AppCard key={feature.title}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardText}>{feature.description}</Text>
          </AppCard>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton title="Get Started" onPress={() => router.push('/login')} />
        <AppButton title="View Demo" variant="secondary" onPress={openDemo} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 24,
    paddingTop: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 999,
    color: brand.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitle: {
    color: brand.colors.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 14,
  },
  description: {
    color: brand.colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  featureList: {
    gap: 14,
    marginBottom: 22,
  },
  cardTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});
