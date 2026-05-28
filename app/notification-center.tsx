import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  buildNotificationQueue,
  fetchNotificationQueue,
  markNotificationRead,
  upsertNotificationQueue,
} from '@/services/notificationService';
import { NotificationEvent } from '@/types';

export default function NotificationCenterScreen() {
  const {
    activityLog,
    authMode,
    currentWorkspace,
    notificationPreferences,
    proposalDrafts,
    sessionUser,
    trackedApplications,
  } = useGrantMatch();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date().toISOString());

  const derivedQueue = useMemo(
    () =>
      buildNotificationQueue({
        applications: trackedApplications,
        proposalDrafts,
        activityLog,
        preferences: notificationPreferences,
      }),
    [activityLog, notificationPreferences, proposalDrafts, trackedApplications]
  );
  const unreadCount = notifications.filter((item) => item.status !== 'read').length;
  const queuedCount = notifications.filter((item) => item.status === 'queued').length;

  async function refreshNotifications() {
    setIsRefreshing(true);

    try {
      if (sessionUser?.authMode === 'supabase') {
        await upsertNotificationQueue(sessionUser.id, currentWorkspace.id, derivedQueue);
        const syncedNotifications = await fetchNotificationQueue(sessionUser.id, currentWorkspace.id);
        setNotifications(syncedNotifications ?? derivedQueue);
      } else {
        setNotifications(derivedQueue);
      }

      setLastRefreshedAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }

  async function markRead(notification: NotificationEvent) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, status: 'read' } : item
      )
    );

    if (sessionUser?.authMode === 'supabase') {
      markNotificationRead(sessionUser.id, notification.id).catch((error) => {
        console.warn('Unable to mark notification as read.', error);
      });
    }
  }

  useEffect(() => {
    refreshNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace.id, derivedQueue.length]);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Notifications"
        title="Notification Center"
        subtitle="In-app notification queue for deadline, review, digest, and team activity readiness."
      />

      <InfoBanner
        tone="warning"
        text="Email and push delivery are not connected. This screen prepares and stores in-app notification events only."
      />

      <View style={styles.summaryGrid}>
        <SummaryCard label="Mode" value={authMode === 'supabase' ? 'Supabase' : 'Local'} />
        <SummaryCard label="Unread" value={String(unreadCount)} />
        <SummaryCard label="Queued" value={String(queuedCount)} />
        <SummaryCard label="Generated" value={String(notifications.length)} />
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.title}>Delivery readiness</Text>
        <Text style={styles.meta}>Workspace: {currentWorkspace.name}</Text>
        <Text style={styles.meta}>Channel: in-app only</Text>
        <Text style={styles.meta}>Last refreshed: {new Date(lastRefreshedAt).toLocaleString()}</Text>
        <Text style={styles.meta}>
          Active preferences:{' '}
          {Object.entries(notificationPreferences)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key)
            .join(', ') || 'None'}
        </Text>
        <AppButton
          disabled={isRefreshing}
          title={isRefreshing ? 'Refreshing Notifications...' : 'Refresh Notification Queue'}
          variant="secondary"
          onPress={refreshNotifications}
        />
      </AppCard>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications queued" message="Track applications, mark drafts ready for review, or enable notification preferences to generate queue items." />
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => (
            <AppCard key={notification.id} style={styles.notification}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitleGroup}>
                  <Text style={styles.type}>{formatType(notification.type)}</Text>
                  <Text style={styles.itemTitle}>{notification.title}</Text>
                </View>
                <Text style={[styles.status, notification.status === 'read' && styles.readStatus]}>
                  {notification.status}
                </Text>
              </View>
              <Text style={styles.meta}>{notification.message}</Text>
              <Text style={styles.timestamp}>
                Scheduled: {notification.scheduledFor ? formatDate(notification.scheduledFor) : 'Now'}
              </Text>
              {notification.status !== 'read' ? (
                <AppButton title="Mark Read" variant="secondary" onPress={() => markRead(notification)} />
              ) : null}
            </AppCard>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </AppCard>
  );
}

function formatType(type: NotificationEvent['type']) {
  return type.replace(/_/g, ' ');
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  summaryCard: { flexBasis: 150, flexGrow: 1, gap: 4 },
  summaryValue: { color: brand.colors.ink, fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: brand.colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  card: { gap: 8, marginBottom: 16 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 13, lineHeight: 19 },
  list: { gap: 12 },
  notification: { gap: 8 },
  notificationHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  notificationTitleGroup: { flex: 1, gap: 4 },
  type: { color: brand.colors.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  itemTitle: { color: brand.colors.ink, fontSize: 17, fontWeight: '900' },
  status: { backgroundColor: brand.colors.warningSoft, borderRadius: 999, color: brand.colors.warning, fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, textTransform: 'uppercase' },
  readStatus: { backgroundColor: brand.colors.successSoft, color: brand.colors.success },
  timestamp: { color: brand.colors.muted, fontSize: 12, fontWeight: '700' },
});
