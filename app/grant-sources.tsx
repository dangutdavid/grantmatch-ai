import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { fetchGrantSources, startMockIngestionRun } from '@/services/grantIngestionService';
import { GrantSource } from '@/types';

export default function GrantSourcesScreen() {
  const router = useRouter();
  const [sources, setSources] = useState<GrantSource[]>([]);
  const [message, setMessage] = useState('Grant ingestion is mock-only. No external sites or APIs are called.');

  useEffect(() => {
    fetchGrantSources().then(setSources);
  }, []);

  async function runSync(source: GrantSource) {
    const run = await startMockIngestionRun(source.id);
    setMessage(run.notes);
  }

  return (
    <ScreenContainer>
      <PageHeader eyebrow="Ingestion" title="Grant Sources" subtitle="Mock source registry for future grant ingestion pipelines." />
      <InfoBanner text={message} tone="warning" />
      <View style={styles.grid}>
        {sources.map((source) => (
          <AppCard key={source.id} style={styles.card}>
            <Text style={styles.title}>{source.name}</Text>
            <Text style={styles.meta}>{source.type} • {source.region}</Text>
            <Text style={styles.meta}>Status: {source.status}</Text>
            <Text style={styles.meta}>Last sync: {source.lastSync ?? 'Never'}</Text>
            <Text style={styles.meta}>Imported: {source.importedCount}</Text>
            <Text style={styles.notes}>{source.notes}</Text>
            <AppButton title="Run Mock Sync" onPress={() => runSync(source)} />
          </AppCard>
        ))}
      </View>
      <View style={styles.actions}>
        <AppButton title="View Ingestion Notes" variant="secondary" onPress={() => router.push('/deploy-readiness')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexBasis: 260, flexGrow: 1, gap: 8 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 13, lineHeight: 19 },
  notes: { color: brand.colors.ink, fontSize: 14, lineHeight: 20 },
  actions: { marginTop: 18 },
});
