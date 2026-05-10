import { GrantSource } from '@/types';

export const mockGrantSources: GrantSource[] = [
  { id: 'ukri', name: 'UKRI', type: 'Research Council', region: 'United Kingdom', status: 'Completed', lastSync: '2026-05-01', importedCount: 42, notes: 'Mock UK research council source.' },
  { id: 'innovate-uk', name: 'Innovate UK', type: 'Government', region: 'United Kingdom', status: 'Completed', lastSync: '2026-05-02', importedCount: 28, notes: 'Mock innovation and commercialisation source.' },
  { id: 'horizon-europe', name: 'Horizon Europe', type: 'Government', region: 'Europe', status: 'Idle', lastSync: '2026-04-27', importedCount: 35, notes: 'Mock EU research programme source.' },
  { id: 'wellcome', name: 'Wellcome Trust', type: 'Foundation', region: 'Global', status: 'Completed', lastSync: '2026-05-03', importedCount: 18, notes: 'Mock health and science foundation source.' },
  { id: 'gates', name: 'Gates Foundation', type: 'Foundation', region: 'Global', status: 'Idle', lastSync: '2026-04-22', importedCount: 20, notes: 'Mock global development foundation source.' },
  { id: 'world-bank', name: 'World Bank', type: 'Multilateral', region: 'Global', status: 'Completed', lastSync: '2026-05-04', importedCount: 31, notes: 'Mock multilateral development source.' },
  { id: 'fcdo', name: 'FCDO', type: 'Government', region: 'United Kingdom / Global', status: 'Idle', lastSync: '2026-04-30', importedCount: 16, notes: 'Mock international development source.' },
  { id: 'afdb', name: 'African Development Bank', type: 'Multilateral', region: 'Africa', status: 'Completed', lastSync: '2026-05-05', importedCount: 24, notes: 'Mock African development finance source.' },
  { id: 'nih', name: 'NIH', type: 'Government', region: 'United States', status: 'Completed', lastSync: '2026-05-06', importedCount: 47, notes: 'Mock biomedical research source.' },
  { id: 'nsf', name: 'NSF', type: 'Government', region: 'United States', status: 'Idle', lastSync: '2026-04-29', importedCount: 33, notes: 'Mock science and engineering research source.' },
];
