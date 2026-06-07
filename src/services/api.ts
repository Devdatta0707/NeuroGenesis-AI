import axios from 'axios';
import type {
  AnalysisResult,
  DrugCandidate,
  ProteinInfo,
  DiseaseInfo,
  ResearchPaper,
  ClinicalTrial,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ===================== PROTEIN / ANALYSIS =====================

export async function analyzeTarget(payload: {
  disease?: string;
  proteinSequence?: string;
}): Promise<AnalysisResult> {
  const { data } = await api.post('/api/analyze', payload);
  return data;
}

export async function fetchProteinFromUniprot(query: string): Promise<ProteinInfo | null> {
  try {
    const { data } = await axios.get(
      `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=1`
    );
    const entry = data.results?.[0];
    if (!entry) return null;
    return {
      id: entry.primaryAccession,
      name: entry.proteinDescription?.recommendedName?.fullName?.value || query,
      gene: entry.genes?.[0]?.geneName?.value,
      organism: entry.organism?.scientificName,
      sequence: entry.sequence?.value || '',
      length: entry.sequence?.length || 0,
      function: entry.comments?.find((c: Record<string, unknown>) => c.commentType === 'FUNCTION')?.texts?.[0]?.value,
    };
  } catch {
    return null;
  }
}

export async function fetchPDBStructure(pdbId: string): Promise<string> {
  try {
    const { data } = await axios.get(
      `https://files.rcsb.org/download/${pdbId}.pdb`,
      { responseType: 'text' }
    );
    return data;
  } catch {
    return '';
  }
}

// ===================== DRUGS / PUBCHEM =====================

export async function searchDrugs(query: string): Promise<DrugCandidate[]> {
  try {
    const { data } = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,IsomericSMILES,IUPACName/JSON`
    );
    const compounds = data.PropertyTable?.Properties || [];
    return compounds.slice(0, 6).map((c: Record<string, unknown>) => ({
      name: String(c.IUPACName || query),
      score: Math.random() * 0.3 + 0.65,
      mechanism: 'Target binding via active site interaction',
      toxicity: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 2)],
      pubchemCid: String(c.CID),
      smiles: String(c.IsomericSMILES || ''),
      mw: Number(c.MolecularWeight) || 0,
    }));
  } catch {
    return getDefaultDrugs(query);
  }
}

export async function getDrugDetails(cid: string): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/JSON`
    );
    return data;
  } catch {
    return null;
  }
}

// ===================== DISEASE =====================

export async function getDiseaseInfo(disease: string): Promise<DiseaseInfo> {
  const [trials] = await Promise.all([
    fetchClinicalTrials(disease),
  ]);
  return buildDiseaseInfo(disease, trials);
}

async function fetchClinicalTrials(query: string): Promise<ClinicalTrial[]> {
  try {
    const { data } = await axios.get(
      `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(query)}&pageSize=5&format=json`
    );
    const studies = data.studies || [];
    return studies.map((s: Record<string, unknown>) => {
      const proto = (s.protocolSection || {}) as Record<string, unknown>;
      const id = (proto.identificationModule || {}) as Record<string, unknown>;
      const status = (proto.statusModule || {}) as Record<string, unknown>;
      const design = (proto.designModule || {}) as Record<string, unknown>;
      const conds = (proto.conditionsModule || {}) as Record<string, unknown>;
      const interv = (proto.armsInterventionsModule || {}) as Record<string, unknown>;
      return {
        nctId: String(id.nctId || ''),
        title: String(id.briefTitle || ''),
        status: String(status.overallStatus || ''),
        phase: Array.isArray(design.phases) ? design.phases[0] : undefined,
        conditions: Array.isArray(conds.conditions) ? conds.conditions : [],
        interventions: ((interv.interventions || []) as Record<string, unknown>[]).map((i) => String(i.name || '')).slice(0, 3),
        startDate: String(status.startDateStruct || ''),
      } as ClinicalTrial;
    });
  } catch {
    return [];
  }
}

function buildDiseaseInfo(disease: string, trials: ClinicalTrial[]): DiseaseInfo {
  const diseaseMap: Record<string, Partial<DiseaseInfo>> = {
    alzheimer: {
      description: 'A progressive neurodegenerative disorder causing memory loss, cognitive decline, and behavioral changes.',
      symptoms: ['Memory loss', 'Confusion', 'Personality changes', 'Difficulty speaking', 'Disorientation'],
      proteins: ['APP', 'PSEN1', 'PSEN2', 'APOE', 'BACE1'],
      prevalence: '55 million worldwide',
    },
    diabetes: {
      description: 'A chronic metabolic disease characterized by elevated blood glucose levels from insufficient insulin production or action.',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Fatigue', 'Blurred vision', 'Slow healing'],
      proteins: ['INS', 'INSR', 'IRS1', 'GCK', 'GLUT2'],
      prevalence: '537 million worldwide',
    },
    cancer: {
      description: 'A group of diseases involving abnormal cell growth with potential to invade or spread to other body parts.',
      symptoms: ['Unexplained weight loss', 'Fatigue', 'Skin changes', 'Persistent cough', 'Lumps'],
      proteins: ['TP53', 'BRCA1', 'KRAS', 'EGFR', 'HER2'],
      prevalence: '20 million new cases/year',
    },
    parkinson: {
      description: 'A neurodegenerative disorder affecting movement, characterized by tremors, rigidity, and bradykinesia.',
      symptoms: ['Tremors', 'Rigid muscles', 'Slowed movement', 'Impaired balance', 'Speech changes'],
      proteins: ['SNCA', 'LRRK2', 'PINK1', 'PARK7', 'GBA'],
      prevalence: '10 million worldwide',
    },
  };

  const key = Object.keys(diseaseMap).find(k => disease.toLowerCase().includes(k));
  const info = key ? diseaseMap[key] : {};

  return {
    name: disease,
    description: info.description || `${disease} is a medical condition requiring further research.`,
    symptoms: info.symptoms || ['Symptom data loading...'],
    proteins: info.proteins || ['Unknown proteins'],
    drugs: getDefaultDrugs(disease),
    trials,
    prevalence: info.prevalence || 'Data unavailable',
  };
}

// ===================== PAPERS =====================

export async function searchPubMed(query: string): Promise<ResearchPaper[]> {
  try {
    const searchRes = await axios.get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=8&retmode=json`
    );
    const ids: string[] = searchRes.data.esearchresult?.idlist || [];
    if (!ids.length) return [];

    const fetchRes = await axios.get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    );
    const result = fetchRes.data.result || {};
    return ids.map((id) => {
      const entry = result[id] || {};
      return {
        id,
        title: entry.title || 'Untitled',
        authors: (entry.authors || []).map((a: Record<string, unknown>) => String(a.name || '')).slice(0, 3),
        abstract: entry.source || '',
        journal: entry.source,
        year: parseInt(entry.pubdate?.split(' ')[0]) || undefined,
        pmid: id,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      } as ResearchPaper;
    });
  } catch {
    return [];
  }
}

// ===================== HELPERS =====================

function getDefaultDrugs(query: string): DrugCandidate[] {
  const names = ['Metformin', 'Ibuprofen', 'Aspirin', 'Atorvastatin', 'Losartan', 'Amlodipine'];
  const mechanisms = [
    'AMPK activation pathway',
    'COX-1/COX-2 inhibition',
    'Platelet aggregation inhibitor',
    'HMG-CoA reductase inhibition',
    'Angiotensin II receptor blocker',
    'L-type calcium channel blocker',
  ];
  return names.map((name, i) => ({
    name,
    score: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
    mechanism: mechanisms[i] || 'Molecular target interaction',
    toxicity: (['low', 'medium', 'low', 'low', 'low', 'low'] as const)[i],
    indication: query,
    similarity: parseFloat((Math.random() * 0.3 + 0.55).toFixed(2)),
  }));
}

export { getDefaultDrugs };
