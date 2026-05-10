import { mockGrantSources } from '@/data/mockGrantSources';
import { GrantIngestionRun, GrantSource, NormalisedGrant } from '@/types';

const mockRuns: GrantIngestionRun[] = [];

export async function fetchGrantSources(): Promise<GrantSource[]> {
  return mockGrantSources;
}

export async function startMockIngestionRun(sourceId: string): Promise<GrantIngestionRun> {
  const source = mockGrantSources.find((item) => item.id === sourceId);
  const run: GrantIngestionRun = {
    id: `ingestion-${sourceId}-${Date.now()}`,
    sourceId,
    status: source ? 'Completed' : 'Failed',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    importedCount: source?.importedCount ?? 0,
    notes: source ? `Mock sync completed for ${source.name}.` : 'Source not found.',
  };

  mockRuns.unshift(run);
  return run;
}

export async function getIngestionRuns(): Promise<GrantIngestionRun[]> {
  return mockRuns;
}

export function normaliseGrantPayload(payload: Partial<NormalisedGrant>): NormalisedGrant {
  return {
    externalId: payload.externalId ?? `grant-source-${Date.now()}`,
    sourceId: payload.sourceId ?? 'manual',
    title: payload.title?.trim() || 'Untitled grant opportunity',
    funder: payload.funder?.trim() || 'Unknown funder',
    description: payload.description?.trim() || 'No description provided yet.',
    deadline: payload.deadline,
    fundingAmount: payload.fundingAmount,
    regionEligibility: payload.regionEligibility ?? 'Global',
    topics: payload.topics ?? [],
    requiredDocuments: payload.requiredDocuments ?? [],
  };
}

export function validateGrantRecord(grant: NormalisedGrant) {
  const errors: string[] = [];

  if (!grant.externalId) errors.push('External ID is required.');
  if (!grant.title) errors.push('Title is required.');
  if (!grant.funder) errors.push('Funder is required.');
  if (!grant.description) errors.push('Description is required.');

  return {
    valid: errors.length === 0,
    errors,
  };
}
