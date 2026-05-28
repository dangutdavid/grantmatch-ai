import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { pricingPlans } from '@/data/pricingPlans';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  buildWorkspaceSubscriptionState,
  fetchSubscriptionState,
  getSubscriptionReadinessMessage,
  maskProviderId,
} from '@/services/subscriptionService';
import { SubscriptionState } from '@/types';
import { buildUsageSummary } from '@/utils/subscriptions';

export default function SubscriptionScreen() {
  const { currentWorkspace, savedGrantIds, proposalDrafts, workspaceMembers } = useGrantMatch();
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(() =>
    buildWorkspaceSubscriptionState(currentWorkspace)
  );
  const [isLoading, setIsLoading] = useState(false);
  const effectivePlan = subscriptionState.plan;
  const usage = buildUsageSummary({
    tier: effectivePlan,
    savedGrantCount: savedGrantIds.length,
    proposalDraftCount: proposalDrafts.length,
    workspaceMemberCount: workspaceMembers.length,
  });
  const selectedPlan = useMemo(
    () => pricingPlans.find((plan) => plan.tier === effectivePlan) ?? pricingPlans[0],
    [effectivePlan]
  );

  async function loadSubscriptionState() {
    setIsLoading(true);

    try {
      setSubscriptionState(await fetchSubscriptionState(currentWorkspace));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace.id, currentWorkspace.subscriptionTier]);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Billing"
        title="Subscription"
        subtitle="Plan usage, subscription state, and entitlement readiness for future payments."
      />
      <InfoBanner tone="warning" text="Payments are not connected. Subscription rows are read-only until payment webhooks are configured." />
      <AppCard style={styles.card}>
        <Text style={styles.title}>Current plan: {effectivePlan}</Text>
        <Text style={styles.meta}>Subscription source: {subscriptionState.source}</Text>
        <Text style={styles.meta}>Billing status: {subscriptionState.status}</Text>
        <Text style={styles.meta}>Provider customer: {maskProviderId(subscriptionState.providerCustomerId)}</Text>
        <Text style={styles.meta}>Provider subscription: {maskProviderId(subscriptionState.providerSubscriptionId)}</Text>
        <Text style={styles.meta}>
          Current period end:{' '}
          {subscriptionState.currentPeriodEnd
            ? new Date(subscriptionState.currentPeriodEnd).toLocaleDateString()
            : 'Not configured'}
        </Text>
        <Text style={styles.readiness}>{getSubscriptionReadinessMessage(subscriptionState)}</Text>
        <AppButton
          disabled={isLoading}
          title={isLoading ? 'Refreshing Subscription...' : 'Refresh Subscription State'}
          variant="secondary"
          onPress={loadSubscriptionState}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.title}>Usage limits</Text>
        <Text style={styles.meta}>Plan basis: {selectedPlan.name}</Text>
        {usage.limits.map((limit) => (
          <View key={limit.entity} style={styles.limitRow}>
            <Text style={styles.meta}>{limit.entity}</Text>
            <Text style={styles.limitValue}>{limit.used} / {limit.limit}</Text>
          </View>
        ))}
        {usage.warnings.map((warning) => <Text key={warning} style={styles.warning}>{warning}</Text>)}
      </AppCard>

      <View style={styles.grid}>
        {pricingPlans.map((plan) => (
          <AppCard
            key={plan.tier}
            style={[styles.plan, plan.tier === effectivePlan && styles.activePlan]}>
            <Text style={styles.title}>{plan.name}</Text>
            <Text style={styles.price}>{plan.priceLabel}</Text>
            {plan.features.map((feature) => <Text key={feature.id} style={styles.meta}>{feature.included ? 'Included' : 'Not included'}: {feature.label}</Text>)}
            <AppButton
              disabled
              title={plan.tier === effectivePlan ? 'Current Plan' : 'Connect Payments First'}
              variant="secondary"
              onPress={() => {}}
            />
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
  activePlan: { borderColor: brand.colors.primary, borderWidth: 2 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  price: { color: brand.colors.primary, fontSize: 20, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 14, lineHeight: 20 },
  readiness: { color: brand.colors.ink, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  limitRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  limitValue: { color: brand.colors.ink, fontSize: 14, fontWeight: '900' },
  warning: { color: brand.colors.warning, fontSize: 14, fontWeight: '800' },
});
