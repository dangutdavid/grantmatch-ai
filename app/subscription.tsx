import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { pricingPlans } from '@/data/pricingPlans';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { buildUsageSummary } from '@/utils/subscriptions';

export default function SubscriptionScreen() {
  const { currentWorkspace, savedGrantIds, proposalDrafts, workspaceMembers } = useGrantMatch();
  const usage = buildUsageSummary({
    tier: currentWorkspace.subscriptionTier,
    savedGrantCount: savedGrantIds.length,
    proposalDraftCount: proposalDrafts.length,
    workspaceMemberCount: workspaceMembers.length,
  });

  return (
    <ScreenContainer>
      <PageHeader eyebrow="Billing" title="Subscription" subtitle="Mock pricing and usage readiness for future payments." />
      <InfoBanner tone="warning" text="Payments are not connected. Upgrade buttons are mock-only." />
      <AppCard style={styles.card}>
        <Text style={styles.title}>Current plan: {currentWorkspace.subscriptionTier}</Text>
        {usage.limits.map((limit) => <Text key={limit.entity} style={styles.meta}>{limit.entity}: {limit.used} / {limit.limit}</Text>)}
        {usage.warnings.map((warning) => <Text key={warning} style={styles.warning}>{warning}</Text>)}
      </AppCard>
      <View style={styles.grid}>
        {pricingPlans.map((plan) => (
          <AppCard key={plan.tier} style={styles.plan}>
            <Text style={styles.title}>{plan.name}</Text>
            <Text style={styles.price}>{plan.priceLabel}</Text>
            {plan.features.map((feature) => <Text key={feature.id} style={styles.meta}>{feature.included ? 'Included' : 'Not included'}: {feature.label}</Text>)}
            <AppButton title="Mock Upgrade" variant="secondary" onPress={() => {}} />
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  plan: { flexBasis: 240, flexGrow: 1, gap: 8 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  price: { color: brand.colors.primary, fontSize: 20, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 14, lineHeight: 20 },
  warning: { color: brand.colors.warning, fontSize: 14, fontWeight: '800' },
});
