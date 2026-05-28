import { supabase } from '@/services/supabaseClient';
import {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionTier,
  Workspace,
} from '@/types';

interface SubscriptionRow {
  workspace_id: string;
  plan: string;
  status: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export async function fetchSubscriptionState(
  workspace: Workspace
): Promise<SubscriptionState> {
  if (!supabase) {
    return buildWorkspaceSubscriptionState(workspace, 'Local fallback');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'workspace_id,plan,status,provider_customer_id,provider_subscription_id,current_period_end,updated_at'
    )
    .eq('workspace_id', workspace.id)
    .maybeSingle<SubscriptionRow>();

  if (error || !data) {
    return buildWorkspaceSubscriptionState(workspace, 'Workspace');
  }

  return {
    workspaceId: data.workspace_id,
    plan: normalizeTier(data.plan),
    status: normalizeStatus(data.status),
    providerCustomerId: data.provider_customer_id ?? undefined,
    providerSubscriptionId: data.provider_subscription_id ?? undefined,
    currentPeriodEnd: data.current_period_end ?? undefined,
    source: 'Supabase',
    updatedAt: data.updated_at,
  };
}

export function buildWorkspaceSubscriptionState(
  workspace: Workspace,
  source: SubscriptionState['source'] = 'Workspace'
): SubscriptionState {
  return {
    workspaceId: workspace.id,
    plan: workspace.subscriptionTier,
    status: workspace.subscriptionTier === 'Free' ? 'inactive' : 'unconfigured',
    source,
  };
}

export function maskProviderId(value?: string) {
  if (!value) {
    return 'Not configured';
  }

  if (value.length <= 8) {
    return 'Configured';
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function getSubscriptionReadinessMessage(state: SubscriptionState) {
  if (state.source !== 'Supabase') {
    return 'No subscription row was loaded. The app is using workspace plan fallback.';
  }

  if (state.status === 'active' || state.status === 'trialing') {
    return 'Subscription state is active in Supabase. Payment webhook verification is still required before production enforcement.';
  }

  if (state.status === 'past_due') {
    return 'Subscription is past due. Production should restrict paid entitlements after a grace period.';
  }

  return 'Subscription row exists, but payment entitlements are not active.';
}

function normalizeTier(value: string): SubscriptionTier {
  if (value === 'Pro' || value === 'Institutional') {
    return value;
  }

  return 'Free';
}

function normalizeStatus(value: string): SubscriptionStatus {
  if (
    value === 'inactive' ||
    value === 'trialing' ||
    value === 'active' ||
    value === 'past_due' ||
    value === 'canceled'
  ) {
    return value;
  }

  return 'unconfigured';
}
