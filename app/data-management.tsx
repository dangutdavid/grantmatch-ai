import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  buildLocalDataExportSummary,
  exportApplicationsSummaryMock,
  exportProposalDraftsSummaryMock,
  exportWorkspaceSummaryMock,
  importLocalDataMock,
} from '@/services/exportService';

export default function DataManagementScreen() {
  const state = useGrantMatch();
  const [result, setResult] = useState('No export generated yet.');

  function show(value: unknown) {
    setResult(JSON.stringify(value, null, 2));
  }

  return (
    <ScreenContainer>
      <PageHeader eyebrow="Data" title="Data Management" subtitle="Mock export/import foundation for future production data controls." />
      <InfoBanner tone="warning" text="Exports are mock summaries only. No files are downloaded and no imports change app data." />
      <View style={styles.actions}>
        <AppButton title="Export Local Summary" onPress={() => show(buildLocalDataExportSummary(state))} />
        <AppButton title="Export Workspace Summary" variant="secondary" onPress={() => show(exportWorkspaceSummaryMock(state.currentWorkspace, state.workspaceMembers))} />
        <AppButton title="Export Applications Summary" variant="secondary" onPress={() => show(exportApplicationsSummaryMock(state.trackedApplications))} />
        <AppButton title="Export Proposal Drafts Summary" variant="secondary" onPress={() => show(exportProposalDraftsSummaryMock(state.proposalDrafts))} />
        <AppButton title="Import Data Placeholder" variant="secondary" onPress={() => show(importLocalDataMock())} />
      </View>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Result</Text>
        <Text style={styles.result}>{result}</Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10, marginBottom: 16 },
  card: { gap: 8 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  result: { color: brand.colors.muted, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
});
