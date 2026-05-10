export type DeploymentChecklistStatus = 'Complete' | 'Mock' | 'Pending';

export type DeploymentChecklistCategory =
  | 'App'
  | 'Web'
  | 'Mobile'
  | 'Backend'
  | 'Auth'
  | 'AI'
  | 'Payments'
  | 'Legal'
  | 'Store Release';

export interface DeploymentChecklistItem {
  id: string;
  title: string;
  category: DeploymentChecklistCategory;
  status: DeploymentChecklistStatus;
  explanation: string;
  nextAction: string;
}

export const deploymentChecklist: DeploymentChecklistItem[] = [
  {
    id: 'app-structure',
    title: 'App structure complete',
    category: 'App',
    status: 'Complete',
    explanation: 'Expo Router, shared state, typed models, reusable components, and core workflows are in place.',
    nextAction: 'Keep future work behind services and typed interfaces.',
  },
  {
    id: 'app-demo-mode',
    title: 'Demo mode clearly labelled',
    category: 'App',
    status: 'Complete',
    explanation: 'Key screens now show a banner explaining that external services are not connected.',
    nextAction: 'Keep demo warnings visible until production services are live.',
  },
  {
    id: 'web-support',
    title: 'Web support working',
    category: 'Web',
    status: 'Complete',
    explanation: 'Expo Web uses static output and responsive layouts for browser preview and export.',
    nextAction: 'Run web export and browser QA before hosting.',
  },
  {
    id: 'web-production-build',
    title: 'Web production build pending',
    category: 'Web',
    status: 'Pending',
    explanation: 'A production web export has not been shipped to hosting yet.',
    nextAction: 'Run npx expo export and deploy the generated web output to a hosting target.',
  },
  {
    id: 'mobile-support',
    title: 'Mobile support working',
    category: 'Mobile',
    status: 'Complete',
    explanation: 'The shared React Native screens support iOS and Android through Expo.',
    nextAction: 'Run simulator/device QA before release builds.',
  },
  {
    id: 'eas-config',
    title: 'EAS build profiles prepared',
    category: 'Mobile',
    status: 'Complete',
    explanation: 'Development, preview, and production EAS profiles are defined with safe defaults.',
    nextAction: 'Connect Apple and Google credentials only when ready for real store builds.',
  },
  {
    id: 'mock-data',
    title: 'Mock data layer active',
    category: 'Backend',
    status: 'Mock',
    explanation: 'Grant, recommendation, user, workspace, and activity data are local demo records.',
    nextAction: 'Replace mock internals with authenticated backend queries.',
  },
  {
    id: 'saved-grants-supabase',
    title: 'Saved grants sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Supabase users can sync saved grant IDs to the saved_grants table with AsyncStorage fallback.',
    nextAction: 'Test save/unsave after running the updated schema in Supabase.',
  },
  {
    id: 'proposal-drafts-supabase',
    title: 'Proposal drafts sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Supabase users can load and save proposal drafts with section content stored as JSONB.',
    nextAction: 'Test draft creation, editing, improving, and status changes after running the updated schema.',
  },
  {
    id: 'tracked-applications-supabase',
    title: 'Tracked applications sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Supabase users can load, create, update, and link tracked applications while demo mode keeps AsyncStorage fallback.',
    nextAction: 'Test status changes, notes, and proposal linking after running the updated schema.',
  },
  {
    id: 'application-checklists-supabase',
    title: 'Application checklists sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Checklist items are stored per user and application with local external IDs for mock grant compatibility.',
    nextAction: 'Test checklist toggles across refreshes after running the updated schema.',
  },
  {
    id: 'review-comments-supabase',
    title: 'Review comments sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Supabase users can persist review comments against tracked applications with commenter metadata.',
    nextAction: 'Test comments on Tracker cards after running the updated schema.',
  },
  {
    id: 'activity-log-supabase',
    title: 'Activity log sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Important workspace actions write activity records to Supabase while local mode remains optimistic.',
    nextAction: 'Test Dashboard and Workspace activity after refreshing a Supabase session.',
  },
  {
    id: 'workspace-members-supabase',
    title: 'Workspace members sync added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Workspace owners and mock team members can be stored in workspace_members for authenticated Supabase users.',
    nextAction: 'Test Add Mock Member after running the updated schema.',
  },
  {
    id: 'local-persistence',
    title: 'Local persistence active',
    category: 'Backend',
    status: 'Mock',
    explanation: 'AsyncStorage persists state on this device or browser only.',
    nextAction: 'Move durable records to backend tables before team production use.',
  },
  {
    id: 'service-layer',
    title: 'Backend service layer created',
    category: 'Backend',
    status: 'Complete',
    explanation: 'Typed service files isolate auth, user, grant, proposal, application, workspace, and AI boundaries.',
    nextAction: 'Swap service implementations for real API calls after backend schema exists.',
  },
  {
    id: 'api-client',
    title: 'API client placeholder created',
    category: 'Backend',
    status: 'Complete',
    explanation: 'A typed request helper reads the environment config and safely reports mock-mode backend absence.',
    nextAction: 'Add token handling and endpoint calls after real auth is connected.',
  },
  {
    id: 'supabase-client',
    title: 'Supabase client added',
    category: 'Backend',
    status: 'Complete',
    explanation: 'The app has a nullable Supabase client that reads Expo public environment variables safely.',
    nextAction: 'Add real project URL and anon key to a local .env file when ready.',
  },
  {
    id: 'supabase-schema',
    title: 'Database schema draft available',
    category: 'Backend',
    status: 'Complete',
    explanation: 'A Supabase SQL schema draft exists with tables, indexes, timestamps, and RLS placeholders.',
    nextAction: 'Review and run supabase/schema.sql in a Supabase project before table integration.',
  },
  {
    id: 'env-template',
    title: 'Environment template created',
    category: 'Backend',
    status: 'Complete',
    explanation: '.env.example documents placeholder public configuration names without real secrets.',
    nextAction: 'Create environment-specific values during deployment setup.',
  },
  {
    id: 'real-backend',
    title: 'Real backend pending',
    category: 'Backend',
    status: 'Pending',
    explanation: 'No production database, API, or server persistence is connected.',
    nextAction: 'Choose Supabase, Firebase, or a custom backend and migrate local state.',
  },
  {
    id: 'mock-auth',
    title: 'Mock auth active',
    category: 'Auth',
    status: 'Mock',
    explanation: 'Login, register, demo login, logout, and route protection use local mock session state.',
    nextAction: 'Replace mock sessions with a real auth provider.',
  },
  {
    id: 'real-auth',
    title: 'Real auth pending',
    category: 'Auth',
    status: 'Pending',
    explanation: 'No external identity provider or backend session verification is connected.',
    nextAction: 'Add real authentication and protected backend rules.',
  },
  {
    id: 'ai-proposal',
    title: 'Real AI API pending',
    category: 'AI',
    status: 'Pending',
    explanation: 'Proposal generation and improvement are mock/local text transformations.',
    nextAction: 'Add secure server-side AI endpoints after auth and rate limits exist.',
  },
  {
    id: 'payments',
    title: 'Payment integration pending',
    category: 'Payments',
    status: 'Pending',
    explanation: 'Subscription plan labels are mock-only and do not enforce billing limits.',
    nextAction: 'Add payment provider integration and subscription entitlements.',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy placeholder added',
    category: 'Legal',
    status: 'Mock',
    explanation: 'A draft placeholder screen exists for production planning.',
    nextAction: 'Replace with reviewed legal content before public launch.',
  },
  {
    id: 'terms',
    title: 'Terms of Service placeholder added',
    category: 'Legal',
    status: 'Mock',
    explanation: 'A draft placeholder screen exists for production planning.',
    nextAction: 'Replace with reviewed legal content before public launch.',
  },
  {
    id: 'store-assets',
    title: 'App icons and splash need review',
    category: 'Store Release',
    status: 'Pending',
    explanation: 'Current assets are placeholders and have not been audited for store requirements.',
    nextAction: 'Review icons, splash, adaptive icons, screenshots, and store metadata.',
  },
  {
    id: 'store-release',
    title: 'Store deployment pending',
    category: 'Store Release',
    status: 'Pending',
    explanation: 'Production iOS and Android builds have not been submitted.',
    nextAction: 'Use EAS after credentials, metadata, privacy forms, and QA are ready.',
  },
];
