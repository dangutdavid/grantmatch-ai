import type { Grant, Recommendation } from '@/types';

export const mockGrants: Grant[] = [
  {
    id: 'grant-001',
    title: 'Global Health AI Innovation Fund',
    funder: 'Wellcome Applied Research Programme',
    description:
      'Supports responsible AI projects that improve health outcomes in underserved communities through applied research, validation, and implementation partnerships.',
    eligibility:
      'Open to universities, research institutes, NGOs, and health technology startups with a named research lead and an implementation partner.',
    deadline: '2026-08-15',
    fundingAmount: '$250,000 - $750,000',
    regionEligibility: 'Global, with priority for LMIC implementation sites',
    requiredDocuments: ['Concept note', 'Budget', 'Team CVs', 'Ethics plan', 'Implementation partner letter'],
    topics: ['public health', 'AI diagnostics', 'health equity', 'implementation science'],
    sectors: ['Health technology', 'Research', 'NGO'],
    sourceUrl: 'https://wellcome.org/grant-funding/schemes/health-ai-innovation',
  },
  {
    id: 'grant-002',
    title: 'Climate Resilience Community Grants',
    funder: 'Green Futures Foundation',
    description:
      'Funds community-led climate adaptation, resilience planning, and digital tools that help vulnerable regions prepare for environmental risk.',
    eligibility:
      'Open to NGOs, local governments, universities, and social enterprises working with community stakeholders.',
    deadline: '2026-07-02',
    fundingAmount: '$50,000 - $300,000',
    regionEligibility: 'Africa, South Asia, Latin America, and small island states',
    requiredDocuments: ['Project plan', 'Community engagement strategy', 'Budget', 'Risk assessment'],
    topics: ['climate resilience', 'community data', 'adaptation', 'policy'],
    sectors: ['Climate', 'NGO', 'Public policy'],
    sourceUrl: 'https://greenfutures.org/grants/community-resilience',
  },
  {
    id: 'grant-003',
    title: 'Digital Inclusion Research Challenge',
    funder: 'Open Society Technology Initiative',
    description:
      'Backs research and pilot programmes that expand access to digital services, reduce exclusion, and strengthen equitable technology adoption.',
    eligibility:
      'Open to research teams, nonprofits, and startups with a measurable inclusion outcome and clear user research plan.',
    deadline: '2026-09-30',
    fundingAmount: '$100,000 - $500,000',
    regionEligibility: 'United States, Europe, and partner countries',
    requiredDocuments: ['Research summary', 'Impact metrics', 'Budget', 'Data protection statement'],
    topics: ['digital inclusion', 'equity', 'AI governance', 'user research'],
    sectors: ['Technology', 'Research', 'Social impact'],
    sourceUrl: 'https://osf.org/grants/digital-inclusion',
  },
  {
    id: 'grant-004',
    title: 'Women-Led Startup Science Fund',
    funder: 'Catalyst Ventures Philanthropy',
    description:
      'Provides non-dilutive funding for women-led startups translating scientific research into scalable products with public benefit.',
    eligibility:
      'Open to early-stage startups with at least one woman founder in a scientific or technical leadership role.',
    deadline: '2026-06-20',
    fundingAmount: '$75,000 - $200,000',
    regionEligibility: 'United States, Canada, United Kingdom, and European Union',
    requiredDocuments: ['Pitch deck', 'Use of funds', 'Founder bios', 'Market validation summary'],
    topics: ['commercialisation', 'startup', 'science translation', 'impact'],
    sectors: ['Startup', 'Science', 'Technology'],
    sourceUrl: 'https://catalystventures.org/women-science-fund',
  },
  {
    id: 'grant-005',
    title: 'STEM Education Access Initiative',
    funder: 'Bill & Melinda Gates Foundation',
    description:
      'Funds programmes that increase access to quality STEM education for learners from low-income and marginalised communities, with an emphasis on evidence-based pedagogy and teacher capacity.',
    eligibility:
      'Open to schools, universities, nonprofits, and edtech companies with demonstrated reach into underserved communities.',
    deadline: '2026-10-01',
    fundingAmount: '$200,000 - $1,000,000',
    regionEligibility: 'Sub-Saharan Africa, South Asia, Latin America, and the United States',
    requiredDocuments: ['Programme design', 'Learner outcome data', 'Budget narrative', 'Evaluation plan'],
    topics: ['education', 'STEM access', 'teacher training', 'edtech'],
    sectors: ['Education', 'NGO', 'Technology'],
    sourceUrl: 'https://gatesfoundation.org/ideas/articles/stem-education',
  },
  {
    id: 'grant-006',
    title: 'Ocean Health and Marine Conservation Fund',
    funder: 'Blue Planet Foundation',
    description:
      'Supports scientific research, community stewardship, and technology projects that protect marine ecosystems, combat ocean plastics, and restore coastal biodiversity.',
    eligibility:
      'Open to research institutes, conservation NGOs, and social enterprises with active marine field programmes.',
    deadline: '2026-07-31',
    fundingAmount: '$80,000 - $400,000',
    regionEligibility: 'Pacific Islands, Indian Ocean, Caribbean, and Southeast Asia',
    requiredDocuments: ['Field work plan', 'Species impact report', 'Budget', 'Partner letters'],
    topics: ['marine conservation', 'ocean plastics', 'biodiversity', 'climate science'],
    sectors: ['Environment', 'Research', 'NGO'],
    sourceUrl: 'https://blueplanet.org/grants/ocean-health',
  },
  {
    id: 'grant-007',
    title: 'Mental Health Technology Innovation Award',
    funder: 'Wellcome Mental Health',
    description:
      'Funds the development, testing, and scaling of digital mental health tools that improve access to evidence-based care for adolescents and young adults in under-resourced settings.',
    eligibility:
      'Open to researchers, clinicians, startups, and NGOs with a clinical or community mental health component and a named mental health professional on the team.',
    deadline: '2026-11-14',
    fundingAmount: '$150,000 - $600,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Clinical rationale', 'User testing plan', 'Ethics approval', 'Budget'],
    topics: ['mental health', 'digital therapeutics', 'youth', 'access to care'],
    sectors: ['Health technology', 'Research', 'Startup'],
    sourceUrl: 'https://wellcome.org/grant-funding/mental-health-innovation',
  },
  {
    id: 'grant-008',
    title: 'Food Systems Transformation Grant',
    funder: 'FAO Innovation Fund',
    description:
      'Funds projects that redesign food production, distribution, and consumption systems to reduce hunger, cut emissions, and improve resilience for smallholder farmers.',
    eligibility:
      'Open to NGOs, research institutes, cooperatives, and agri-tech startups with direct engagement with smallholder or subsistence farming communities.',
    deadline: '2026-08-31',
    fundingAmount: '$100,000 - $500,000',
    regionEligibility: 'Sub-Saharan Africa, South and Southeast Asia',
    requiredDocuments: ['Farmer engagement plan', 'Environmental impact assessment', 'Budget', 'Sustainability model'],
    topics: ['food security', 'agriculture', 'climate', 'smallholder farmers'],
    sectors: ['Agriculture', 'Climate', 'NGO'],
    sourceUrl: 'https://fao.org/innovation-fund/food-systems',
  },
  {
    id: 'grant-009',
    title: 'AI Ethics and Governance Research Fund',
    funder: 'Mozilla Foundation',
    description:
      'Supports independent research, policy analysis, and public advocacy that shapes responsible AI governance, accountability frameworks, and bias mitigation in deployed systems.',
    eligibility:
      'Open to academic researchers, civil society organisations, and investigative journalists with a strong track record in technology policy.',
    deadline: '2026-09-15',
    fundingAmount: '$50,000 - $250,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Research proposal', 'Dissemination strategy', 'Conflict of interest declaration', 'Budget'],
    topics: ['AI ethics', 'algorithmic accountability', 'governance', 'civil rights'],
    sectors: ['Technology', 'Research', 'Public policy'],
    sourceUrl: 'https://foundation.mozilla.org/grants/ai-ethics',
  },
  {
    id: 'grant-010',
    title: 'Urban Climate Adaptation Challenge',
    funder: 'European Climate Foundation',
    description:
      'Funds city-level projects that reduce urban heat, improve water management, retrofit building stock, and build community climate resilience in rapidly urbanising regions.',
    eligibility:
      'Open to municipal authorities, urban planning institutes, research organisations, and NGOs with a city-government partnership.',
    deadline: '2026-06-30',
    fundingAmount: '$200,000 - $800,000',
    regionEligibility: 'European Union, South and Southeast Asia, Middle East and North Africa',
    requiredDocuments: ['City partnership letter', 'Climate risk assessment', 'Budget', 'Monitoring plan'],
    topics: ['urban planning', 'climate adaptation', 'infrastructure', 'heat resilience'],
    sectors: ['Climate', 'Public policy', 'Research'],
    sourceUrl: 'https://europeanclimate.org/grants/urban-adaptation',
  },
  {
    id: 'grant-011',
    title: 'Social Enterprise Scale-Up Fund',
    funder: 'Omidyar Network',
    description:
      'Provides growth capital and technical assistance to social enterprises with proven models ready to expand impact across multiple geographies or demographic groups.',
    eligibility:
      'Open to registered social enterprises or impact-focused startups with at least two years of operations and evidence of measurable social outcomes.',
    deadline: '2026-07-15',
    fundingAmount: '$300,000 - $1,500,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Impact report', 'Financial statements', 'Scale plan', 'Theory of change'],
    topics: ['social enterprise', 'impact investing', 'scale', 'economic development'],
    sectors: ['Social impact', 'Startup', 'NGO'],
    sourceUrl: 'https://omidyar.com/grants/social-enterprise-scale',
  },
  {
    id: 'grant-012',
    title: 'Global Journalism and Press Freedom Grant',
    funder: 'Press Freedom Foundation',
    description:
      'Funds investigative journalism, media safety tools, and press freedom advocacy that expose corruption, protect journalists, and strengthen public interest reporting in constrained environments.',
    eligibility:
      'Open to registered media outlets, journalism schools, and press freedom NGOs with active publishing programmes.',
    deadline: '2026-10-31',
    fundingAmount: '$20,000 - $150,000',
    regionEligibility: 'Global, with priority for restricted media environments',
    requiredDocuments: ['Editorial plan', 'Safety risk assessment', 'Budget', 'Journalist bios'],
    topics: ['journalism', 'press freedom', 'transparency', 'accountability'],
    sectors: ['Media', 'NGO', 'Public policy'],
    sourceUrl: 'https://pressfreedom.org/grants/journalism',
  },
  {
    id: 'grant-013',
    title: 'Biodiversity Data and Conservation Science Grant',
    funder: 'Global Biodiversity Information Facility',
    description:
      'Supports open-data projects and field research that improve species monitoring, habitat mapping, and conservation planning for threatened ecosystems.',
    eligibility:
      'Open to research institutes, natural history museums, and conservation NGOs that commit to open data publication.',
    deadline: '2026-08-01',
    fundingAmount: '$30,000 - $200,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Data management plan', 'Species list', 'Methodology', 'Budget'],
    topics: ['biodiversity', 'open data', 'species monitoring', 'conservation science'],
    sectors: ['Environment', 'Research', 'NGO'],
    sourceUrl: 'https://gbif.org/grants/biodiversity-data',
  },
  {
    id: 'grant-014',
    title: 'Financial Inclusion and Economic Equity Fund',
    funder: 'Bill & Melinda Gates Foundation',
    description:
      'Funds fintech, savings, credit, and payment innovation that extends formal financial services to populations excluded from traditional banking systems.',
    eligibility:
      'Open to fintech startups, cooperatives, microfinance institutions, and research organisations with a verified underserved-population user base.',
    deadline: '2026-09-01',
    fundingAmount: '$150,000 - $750,000',
    regionEligibility: 'Sub-Saharan Africa, South Asia, Latin America',
    requiredDocuments: ['Product overview', 'User impact data', 'Financial model', 'Regulatory compliance statement'],
    topics: ['fintech', 'financial inclusion', 'microfinance', 'economic equity'],
    sectors: ['Fintech', 'Social impact', 'Startup'],
    sourceUrl: 'https://gatesfoundation.org/ideas/articles/financial-inclusion',
  },
  {
    id: 'grant-015',
    title: 'Indigenous Community Technology Sovereignty Grant',
    funder: 'First Nations Technology Council',
    description:
      'Funds digital infrastructure, data sovereignty tools, and technology programmes designed by and for Indigenous communities to strengthen cultural continuity and self-determination.',
    eligibility:
      'Open exclusively to Indigenous-led organisations, tribal councils, and Nation-owned enterprises.',
    deadline: '2026-11-30',
    fundingAmount: '$50,000 - $300,000',
    regionEligibility: 'Canada, United States, Australia, New Zealand, and Pacific Islands',
    requiredDocuments: ['Community mandate letter', 'Technology plan', 'Budget', 'Data sovereignty policy'],
    topics: ['Indigenous rights', 'digital sovereignty', 'cultural preservation', 'community data'],
    sectors: ['Technology', 'NGO', 'Public policy'],
    sourceUrl: 'https://fntc.info/grants/technology-sovereignty',
  },
  {
    id: 'grant-016',
    title: 'Renewable Energy Access Programme',
    funder: 'Rockefeller Foundation',
    description:
      'Funds projects that accelerate last-mile renewable energy access for off-grid communities, including solar microgrids, clean cooking solutions, and energy-efficient infrastructure.',
    eligibility:
      'Open to energy NGOs, cooperatives, and impact startups with operational experience in off-grid energy delivery.',
    deadline: '2026-07-20',
    fundingAmount: '$200,000 - $1,000,000',
    regionEligibility: 'Sub-Saharan Africa and South Asia',
    requiredDocuments: ['Energy access plan', 'Community agreements', 'Technical specs', 'Budget'],
    topics: ['renewable energy', 'energy access', 'solar', 'clean cooking'],
    sectors: ['Energy', 'Climate', 'NGO'],
    sourceUrl: 'https://rockefellerfoundation.org/grants/renewable-energy',
  },
  {
    id: 'grant-017',
    title: 'Early Childhood Development and Nutrition Research',
    funder: 'UNICEF Innovation Fund',
    description:
      'Supports applied research and technology pilots that improve nutrition, cognitive development, and caregiving quality for children aged 0–5 in humanitarian and low-resource settings.',
    eligibility:
      'Open to research institutes, health NGOs, and child development organisations with in-country field presence.',
    deadline: '2026-10-15',
    fundingAmount: '$100,000 - $500,000',
    regionEligibility: 'Humanitarian settings globally, low- and middle-income countries',
    requiredDocuments: ['Research protocol', 'Ethics approval', 'Field site agreement', 'Budget'],
    topics: ['early childhood', 'nutrition', 'child development', 'humanitarian'],
    sectors: ['Health', 'NGO', 'Research'],
    sourceUrl: 'https://unicef.org/innovation/grants/early-childhood',
  },
  {
    id: 'grant-018',
    title: 'Cybersecurity for Civil Society',
    funder: 'Ford Foundation',
    description:
      'Funds organisations that build digital security capacity, develop open-source defensive tools, and conduct research on threats targeting journalists, human rights defenders, and NGOs.',
    eligibility:
      'Open to digital security nonprofits, academic security labs, and civil society organisations with a training or tools delivery track record.',
    deadline: '2026-12-01',
    fundingAmount: '$50,000 - $400,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Threat model', 'Programme design', 'Beneficiary list', 'Budget'],
    topics: ['cybersecurity', 'civil society', 'digital rights', 'open source'],
    sectors: ['Technology', 'NGO', 'Research'],
    sourceUrl: 'https://fordfoundation.org/grants/cybersecurity',
  },
  {
    id: 'grant-019',
    title: 'Antimicrobial Resistance Research Initiative',
    funder: 'Wellcome Infectious Disease Programme',
    description:
      'Funds discovery research, surveillance systems, and implementation science addressing antimicrobial resistance — one of the most urgent global health threats.',
    eligibility:
      'Open to universities, research institutes, and clinical networks with licensed laboratory facilities and IRB-approved protocols.',
    deadline: '2026-08-20',
    fundingAmount: '$300,000 - $1,500,000',
    regionEligibility: 'Global, with priority for endemic burden settings',
    requiredDocuments: ['Scientific proposal', 'Lab certification', 'Ethics approval', 'Budget justification'],
    topics: ['antimicrobial resistance', 'infectious disease', 'global health', 'surveillance'],
    sectors: ['Health', 'Research', 'NGO'],
    sourceUrl: 'https://wellcome.org/grant-funding/infectious-disease/amr',
  },
  {
    id: 'grant-020',
    title: 'Disability Inclusion Technology Fund',
    funder: 'Disability Rights Advocacy Fund',
    description:
      'Supports assistive technology development, accessible design research, and advocacy that enables people with disabilities to fully participate in digital, civic, and economic life.',
    eligibility:
      'Open to technology organisations, accessibility researchers, and disability-led NGOs. Applications must demonstrate meaningful co-design with disabled people.',
    deadline: '2026-09-20',
    fundingAmount: '$40,000 - $250,000',
    regionEligibility: 'Global',
    requiredDocuments: ['Co-design evidence', 'Accessibility audit', 'User testing plan', 'Budget'],
    topics: ['disability inclusion', 'assistive technology', 'accessible design', 'digital equity'],
    sectors: ['Technology', 'Social impact', 'Research'],
    sourceUrl: 'https://draf.org/grants/disability-inclusion-tech',
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    grantId: 'grant-001',
    matchScore: {
      relevanceScore: 94,
      eligibilityScore: 88,
      urgencyScore: 74,
      fundingFitScore: 91,
      overallConfidence: 87,
    },
    matchExplanation:
      'Strong alignment with AI diagnostics, public health implementation, and health equity interests.',
    saved: false,
  },
  {
    id: 'rec-002',
    grantId: 'grant-003',
    matchScore: {
      relevanceScore: 82,
      eligibilityScore: 79,
      urgencyScore: 69,
      fundingFitScore: 84,
      overallConfidence: 79,
    },
    matchExplanation:
      'Good fit for equitable AI adoption and user research, with moderate sector overlap.',
    saved: false,
  },
  {
    id: 'rec-003',
    grantId: 'grant-002',
    matchScore: {
      relevanceScore: 68,
      eligibilityScore: 76,
      urgencyScore: 86,
      fundingFitScore: 72,
      overallConfidence: 75,
    },
    matchExplanation:
      'Relevant if the project includes community health resilience or climate-health outcomes.',
    saved: true,
  },
  {
    id: 'rec-004',
    grantId: 'grant-004',
    matchScore: {
      relevanceScore: 58,
      eligibilityScore: 61,
      urgencyScore: 93,
      fundingFitScore: 63,
      overallConfidence: 69,
    },
    matchExplanation:
      'Potential commercialisation fit, but eligibility depends on startup structure and founder criteria.',
    saved: false,
  },
  {
    id: 'rec-005',
    grantId: 'grant-007',
    matchScore: {
      relevanceScore: 85,
      eligibilityScore: 80,
      urgencyScore: 62,
      fundingFitScore: 88,
      overallConfidence: 83,
    },
    matchExplanation:
      'Strong match for teams building digital mental health tools with clinical evidence components.',
    saved: false,
  },
  {
    id: 'rec-006',
    grantId: 'grant-009',
    matchScore: {
      relevanceScore: 90,
      eligibilityScore: 83,
      urgencyScore: 71,
      fundingFitScore: 78,
      overallConfidence: 85,
    },
    matchExplanation:
      'Excellent fit for AI ethics research and governance work — aligns directly with responsible AI interests.',
    saved: false,
  },
  {
    id: 'rec-007',
    grantId: 'grant-018',
    matchScore: {
      relevanceScore: 72,
      eligibilityScore: 74,
      urgencyScore: 55,
      fundingFitScore: 68,
      overallConfidence: 70,
    },
    matchExplanation:
      'Good fit if the project has a civil society security or open-source defensive tools angle.',
    saved: false,
  },
  {
    id: 'rec-008',
    grantId: 'grant-011',
    matchScore: {
      relevanceScore: 64,
      eligibilityScore: 70,
      urgencyScore: 80,
      fundingFitScore: 74,
      overallConfidence: 72,
    },
    matchExplanation:
      'Relevant for impact-driven startups with two or more years of proven operations and scale ambitions.',
    saved: false,
  },
];
