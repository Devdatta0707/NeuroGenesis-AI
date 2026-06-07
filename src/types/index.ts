// ===================== CORE TYPES =====================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'researcher' | 'student' | 'admin';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: string[];
}

export interface DrugCandidate {
  name: string;
  score: number;
  mechanism: string;
  toxicity: 'low' | 'medium' | 'high';
  phase?: string;
  pubchemCid?: string;
  smiles?: string;
  mw?: number;
  indication?: string;
  similarity?: number;
}

export interface ProteinInfo {
  id: string;
  name: string;
  gene?: string;
  organism?: string;
  sequence: string;
  length: number;
  pdbId?: string;
  function?: string;
  disease?: string[];
}

export interface DiseaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  proteins: string[];
  drugs: DrugCandidate[];
  trials?: ClinicalTrial[];
  prevalence?: string;
  icd10?: string;
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  phase?: string;
  conditions: string[];
  interventions: string[];
  startDate?: string;
  primaryCompletion?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal?: string;
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
  relevanceScore?: number;
  keyFindings?: string[];
  summary?: string;
}

export interface AnalysisResult {
  pdb: string;
  sequence: string;
  drugs: DrugCandidate[];
  explanation: string;
  proteinInfo?: ProteinInfo;
  confidence?: number;
}

export interface MolecularDockingResult {
  proteinId: string;
  ligandName: string;
  dockingScore: number;
  bindingEnergy: number;
  interactions: string[];
  heatmap?: number[][];
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface AIReport {
  id: string;
  title: string;
  type: 'research' | 'hypothesis' | 'literature' | 'abstract';
  sections: ReportSection[];
  createdAt: string;
  query: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ExperimentSave {
  id: string;
  name: string;
  type: 'drug_repurposing' | 'protein' | 'disease' | 'chat';
  data: Record<string, unknown>;
  createdAt: string;
  userId?: string;
}

export type NavPage =
  | 'home'
  | 'dashboard'
  | 'copilot'
  | 'drug-repurposing'
  | 'protein-explorer'
  | 'disease-intelligence'
  | 'paper-analyzer'
  | 'molecular-docking'
  | 'report-generator'
  | 'workspace'
  | 'admin';
