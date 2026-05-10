import { StyleSheet, Text } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';

export default function PrivacyPolicyScreen() {
  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow="Legal placeholder"
        title="Privacy Policy"
        subtitle="Draft placeholder for GrantMatch AI production planning."
      />

      <AppCard style={styles.card}>
        <Text style={styles.warning}>
          This Privacy Policy is a draft placeholder and must be reviewed by qualified counsel before
          any real production launch.
        </Text>
        <Text style={styles.body}>
          GrantMatch AI currently stores demo profile, grant, proposal, tracker, workspace, and
          settings data locally on the device or browser through AsyncStorage. The prototype does not
          connect to real authentication, backend databases, AI APIs, payment providers, email
          services, push notifications, or analytics services.
        </Text>
        <Text style={styles.body}>
          Before production, this policy should describe the real data controller, data categories,
          lawful basis, retention periods, third-party processors, international transfers, user
          rights, support contacts, deletion workflows, and security practices.
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
