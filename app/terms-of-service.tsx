import { StyleSheet, Text } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';

export default function TermsOfServiceScreen() {
  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow="Legal placeholder"
        title="Terms of Service"
        subtitle="Draft placeholder for GrantMatch AI production planning."
      />

      <AppCard style={styles.card}>
        <Text style={styles.warning}>
          These Terms of Service are draft placeholders and must be reviewed by qualified counsel
          before real users, payments, institution accounts, or production data are added.
        </Text>
        <Text style={styles.body}>
          The current app is a mock/local prototype. Grant recommendations, proposal drafting,
          workspace actions, export summaries, authentication, subscription status, and deployment
          health indicators are provided for product validation only.
        </Text>
        <Text style={styles.body}>
          Before production, these terms should cover account responsibilities, acceptable use,
          subscription terms, refunds, grant data sources, AI-generated content disclaimers,
          institution administration, service availability, liability limits, termination, and
          governing law.
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  warning: {
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 14,
    color: brand.colors.warning,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
    padding: 14,
  },
  body: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
});
