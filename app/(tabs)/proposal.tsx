import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { createGeneralProposalDraft } from '@/utils/proposalDrafts';
import { ProposalDraft } from '@/types';

type ProposalSectionKey =
  | 'proposalTitle'
  | 'abstract'
  | 'problemStatement'
  | 'methodology'
  | 'expectedImpact'
  | 'budgetJustification'
  | 'timeline'
  | 'teamCapability';

const draftSectionLabels: [ProposalSectionKey, string][] = [
  ['proposalTitle', 'Proposal Title'],
  ['abstract', 'Abstract'],
  ['problemStatement', 'Problem Statement'],
  ['methodology', 'Methodology'],
  ['expectedImpact', 'Expected Impact'],
  ['budgetJustification', 'Budget Justification'],
  ['timeline', 'Timeline'],
  ['teamCapability', 'Team Capability'],
];

export default function ProposalBuilderScreen() {
  const router = useRouter();
  const { grantId } = useLocalSearchParams<{ grantId?: string }>();
  const {
    currentUser,
    proposalDrafts,
    isLoaded,
    selectedGrantId,
    getGrantById,
    getRecommendationByGrantId,
    createDraftFromGrant,
    createGeneralDraft,
    saveDraft: saveDraftToState,
    createTrackedApplication,
    linkDraftToApplication,
    getApplicationByGrantId,
  } = useGrantMatch();
  const activeGrantId = grantId ?? selectedGrantId;
  const selectedGrant = activeGrantId ? getGrantById(activeGrantId) : undefined;
  const selectedRecommendation = selectedGrant ? getRecommendationByGrantId(selectedGrant.id) : undefined;
  const existingDraft = selectedGrant
    ? proposalDrafts.find((proposalDraft) => proposalDraft.grantId === selectedGrant.id)
    : proposalDrafts[0];
  const [draft, setDraft] = useState<ProposalDraft>(
    existingDraft ?? createGeneralProposalDraft(currentUser)
  );
  const [statusMessage, setStatusMessage] = useState('Draft loaded from local state.');

  useEffect(() => {
    if (selectedGrant) {
      const grantDraft =
        proposalDrafts.find((proposalDraft) => proposalDraft.grantId === selectedGrant.id) ??
        createDraftFromGrant(selectedGrant.id);

      if (grantDraft) {
        setDraft(grantDraft);
      }

      setStatusMessage('Grant-specific draft loaded. Edits are saved locally.');
      return;
    }

    const generalDraft = proposalDrafts[0] ?? createGeneralDraft();
    setDraft(generalDraft);
    setStatusMessage('General proposal draft loaded. Edits are saved locally.');
    // Draft creation should run when the selected route context changes, not after every persisted draft update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGrantId]);

  if (!isLoaded) {
    return (
      <ScreenContainer maxWidth="medium">
        <PageHeader eyebrow="Proposal builder" title="Loading Proposal Builder" subtitle="Preparing local draft state." />
        <AppCard>
          <Text style={styles.emptyDraftText}>Loading proposal drafts...</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  function updateDraftField(field: ProposalSectionKey, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
      status: 'Draft',
    }));
  }

  function generateDraft() {
    if (selectedGrant) {
      const generatedDraft = createDraftFromGrant(selectedGrant.id);

      if (generatedDraft) {
        setDraft(generatedDraft);
      }

      setStatusMessage(`Generated a mock draft for ${selectedGrant.title}.`);
      return;
    }

    setDraft(createGeneralDraft());
    setStatusMessage('Generated a general mock structured proposal draft.');
  }

  function createNewGeneralDraft() {
    const newDraft = createGeneralDraft();
    setDraft(newDraft);
    setStatusMessage('Created a new general proposal draft.');
  }

  function selectDraft(nextDraft: ProposalDraft) {
    setDraft(nextDraft);
    setStatusMessage('Draft selected for editing.');
  }

  function improveDraft() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      abstract: `${currentDraft.abstract} The improved version will add clearer outcomes, measurable milestones, and funder-aligned language.`,
      status: 'Improved',
    }));
    setStatusMessage('Improved the abstract with mock AI refinement.');
  }

  function saveDraft() {
    const readyDraft: ProposalDraft = {
      ...draft,
      status: 'Ready for Review',
      updatedAt: new Date().toISOString(),
    };
    setDraft(readyDraft);
    saveDraftToState(readyDraft);
    setStatusMessage(`Draft saved locally at ${new Date().toLocaleTimeString()}.`);
  }

  function setDraftStatus(status: ProposalDraft['status']) {
    const updatedDraft: ProposalDraft = {
      ...draft,
      status,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updatedDraft);
    saveDraftToState(updatedDraft);
    setStatusMessage(`Draft status changed to ${status}.`);
  }

  function trackThisApplication() {
    if (!selectedGrant) {
      return;
    }

    const application = createTrackedApplication(selectedGrant.id, draft.id);

    if (application) {
      linkDraftToApplication(application.id, draft.id);
      setStatusMessage('Application tracking started and linked to this draft.');
      router.push('/tracker');
    }
  }

  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow={selectedGrant ? 'Grant-specific proposal' : 'Proposal builder'}
        title="Proposal builder"
        subtitle={
          selectedGrant
            ? 'This draft is prefilled with the selected grant context. Text is mock-generated for now.'
            : 'Start a general AI-assisted proposal draft using mock generated text.'
        }
      />

      <DemoModeBanner />

      <View style={styles.reviewActions}>
        <AppButton title="Open Proposal Review Assistant" variant="secondary" onPress={() => router.push('/proposal-review')} />
      </View>

      {selectedGrant ? (
        <AppCard style={styles.contextCard}>
          <Text style={styles.contextLabel}>Selected grant</Text>
          <Text style={styles.contextTitle}>{selectedGrant.title}</Text>
          <Text style={styles.contextMeta}>{selectedGrant.funder}</Text>
          <Text style={styles.contextMeta}>Deadline: {selectedGrant.deadline}</Text>
          {selectedRecommendation ? (
            <ScoreBadge score={selectedRecommendation.matchScore.overallConfidence} />
          ) : null}
          <AppButton
            title={getApplicationByGrantId(selectedGrant.id) ? 'Open Application Tracker' : 'Track This Application'}
            variant="secondary"
            onPress={trackThisApplication}
          />
        </AppCard>
      ) : (
        <Text style={styles.placeholder}>
          General mode: choose a grant from Matches and tap Generate Proposal Draft to open this
          screen with grant-specific context.
        </Text>
      )}

      <AppCard style={styles.draftManagerCard}>
        <Text style={styles.managerTitle}>Saved proposal drafts</Text>
        <Text style={styles.managerHelp}>
          Select a draft to edit. Drafts are stored locally until a backend is added.
        </Text>
        {proposalDrafts.length === 0 ? (
          <View style={styles.emptyDraftState}>
            <Text style={styles.emptyDraftTitle}>No saved drafts yet</Text>
            <Text style={styles.emptyDraftText}>
              Create a general draft or generate one from a saved grant.
            </Text>
          </View>
        ) : (
          <View style={styles.draftList}>
            {proposalDrafts.map((proposalDraft) => {
              const linkedGrant = getGrantById(proposalDraft.grantId);
              const selected = proposalDraft.id === draft.id;

              return (
                <AppCard key={proposalDraft.id} style={[styles.draftListCard, selected && styles.selectedDraftCard]}>
                  <Text style={styles.draftListTitle}>{proposalDraft.proposalTitle}</Text>
                  <Text style={styles.draftListMeta}>
                    {linkedGrant ? `${linkedGrant.funder} • ${linkedGrant.deadline}` : 'General draft'}
                  </Text>
                  <Text style={styles.draftListMeta}>
                    Last updated: {proposalDraft.updatedAt ? new Date(proposalDraft.updatedAt).toLocaleString() : 'Not saved yet'}
                  </Text>
                  <Text style={styles.draftListStatus}>Status: {proposalDraft.status}</Text>
                  <AppButton title={selected ? 'Editing This Draft' : 'Edit Draft'} variant="secondary" onPress={() => selectDraft(proposalDraft)} />
                </AppCard>
              );
            })}
          </View>
        )}
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="Generate Draft" onPress={generateDraft} />
        <AppButton title="New General Draft" variant="secondary" onPress={createNewGeneralDraft} />
        <AppButton title="Improve Draft" variant="secondary" onPress={improveDraft} />
        <AppButton title="Save Draft" variant="secondary" onPress={saveDraft} />
      </View>

      <Text style={styles.status}>{statusMessage}</Text>

      <View style={styles.statusActions}>
        <AppButton title="Mark Draft" variant="secondary" onPress={() => setDraftStatus('Draft')} style={styles.statusButton} />
        <AppButton title="Mark Improved" variant="secondary" onPress={() => setDraftStatus('Improved')} style={styles.statusButton} />
        <AppButton title="Ready for Review" onPress={() => setDraftStatus('Ready for Review')} style={styles.statusButton} />
      </View>

      <View style={styles.sections}>
        {draftSectionLabels.map(([key, label]) => (
          <AppCard key={key}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <TextInput
              style={[styles.sectionInput, key !== 'proposalTitle' && styles.multilineInput]}
              value={String(draft[key])}
              onChangeText={(value) => updateDraftField(key, value)}
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contextCard: {
    gap: 8,
    marginBottom: 16,
  },
  contextLabel: {
    color: brand.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  contextTitle: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  contextMeta: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 14,
    color: brand.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 16,
    padding: 14,
  },
  actions: {
    gap: 10,
    marginBottom: 16,
  },
  reviewActions: {
    gap: 10,
    marginBottom: 16,
  },
  draftManagerCard: {
    gap: 12,
    marginBottom: 16,
  },
  managerTitle: {
    color: brand.colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  managerHelp: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  draftList: {
    gap: 10,
  },
  draftListCard: {
    gap: 8,
  },
  selectedDraftCard: {
    borderColor: brand.colors.primary,
  },
  draftListTitle: {
    color: brand.colors.ink,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  draftListMeta: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  draftListStatus: {
    color: brand.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyDraftState: {
    backgroundColor: brand.colors.background,
    borderRadius: 14,
    padding: 14,
  },
  emptyDraftTitle: {
    color: brand.colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  emptyDraftText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statusButton: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  status: {
    backgroundColor: brand.colors.successSoft,
    borderRadius: 14,
    color: brand.colors.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 16,
    padding: 14,
  },
  sections: {
    gap: 14,
  },
  sectionLabel: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  sectionInput: {
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 15,
    lineHeight: 22,
    padding: 12,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
