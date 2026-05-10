import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { AuditEventType } from '@/types';
import { mapActivityToAuditEvent } from '@/utils/audit';

type AuditFilter = 'All' | 'Auth' | 'Grants' | 'Proposals' | 'Applications' | 'Workspace' | 'Settings';
const filters: AuditFilter[] = ['All', 'Auth', 'Grants', 'Proposals', 'Applications', 'Workspace', 'Settings'];

export default function AuditLogScreen() {
  const { activityLog, sessionUser } = useGrantMatch();
  const [filter, setFilter] = useState<AuditFilter>('All');
  const events = useMemo(
    () => activityLog.map((item) => mapActivityToAuditEvent(item, sessionUser?.fullName)),
    [activityLog, sessionUser?.fullName]
  );
  const visible = filter === 'All' ? events : events.filter((event) => event.type === mapFilter(filter));

  return (
    <ScreenContainer>
      <PageHeader eyebrow="Audit" title="Audit Log" subtitle="Mock audit view derived from workspace activity." />
      <InfoBanner text="Audit events are currently derived from local/Supabase activity records. Compliance-grade audit retention is not connected yet." tone="warning" />
      <View style={styles.filters}>
        {filters.map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.chip, filter === item && styles.activeChip]}>
            <Text style={[styles.chipText, filter === item && styles.activeChipText]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {visible.length === 0 ? (
        <EmptyState title="No audit events" message="Activity-driven audit events will appear here." />
      ) : (
        <View style={styles.list}>
          {visible.map((event) => (
            <AppCard key={event.id} style={styles.card}>
              <Text style={styles.title}>{event.description}</Text>
              <Text style={styles.meta}>{event.type} • {event.actor} • {new Date(event.createdAt).toLocaleString()}</Text>
              {event.entity ? <Text style={styles.meta}>Entity: {event.entity}</Text> : null}
            </AppCard>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function mapFilter(filter: AuditFilter): AuditEventType {
  return filter.toLowerCase() as AuditEventType;
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: '#FFFFFF', borderColor: brand.colors.subtle, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  activeChip: { backgroundColor: brand.colors.primary },
  chipText: { color: brand.colors.muted, fontSize: 13, fontWeight: '800' },
  activeChipText: { color: '#FFFFFF' },
  list: { gap: 12 },
  card: { gap: 6 },
  title: { color: brand.colors.ink, fontSize: 16, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 13, lineHeight: 19 },
});
