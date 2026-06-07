// All AI calls are proxied through the backend server.
// Empty string = relative URL = works on both Render (same-origin) and Vercel (api/ functions)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function generateViaServer(prompt: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/gemini/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  return data.text || '';
}

// ===================== STREAMING CHAT =====================

export async function streamBiomedicalChat(
  question: string,
  context: string,
  onChunk: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const systemPrompt = `You are BioMedAI, an expert AI research assistant specializing in:
- Biomedical research and drug discovery
- Protein structure and function analysis
- Disease mechanisms and pathways
- Drug repurposing and pharmacology
- Clinical trials and medical research
- Molecular biology and biochemistry

Provide accurate, evidence-based, scientifically rigorous answers. 
Format your responses with clear sections, use markdown for structure.
Cite relevant biological mechanisms and pathways.
Be precise with scientific terminology but explain complex concepts clearly.`;

  const fullPrompt = context
    ? `${systemPrompt}\n\nContext: ${context}\n\nQuestion: ${question}`
    : `${systemPrompt}\n\n${question}`;

  const res = await fetch(`${API_BASE}/api/gemini/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: fullPrompt }),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: 'Stream failed' }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) onChunk(parsed.text);
          if (parsed.error) throw new Error(parsed.error);
        } catch {
          // ignore parse errors for incomplete chunks
        }
      }
    }
  }
  onDone();
}

// ===================== ONE-SHOT ANALYSIS =====================

export async function generateDrugExplanation(
  sequence: string,
  disease: string,
  drugs: Array<{ name: string; score: number }>
): Promise<string> {
  const prompt = `As a biomedical AI expert, provide a detailed analysis of the following drug repurposing candidates for ${disease || 'the target condition'}:

Protein Sequence (first 80 aa): ${sequence.substring(0, 80)}...
Top Drug Candidates: ${drugs.map(d => `${d.name} (${(d.score * 100).toFixed(0)}% confidence)`).join(', ')}

Provide:
1. **Binding Mechanism**: How these drugs interact with the target protein
2. **Therapeutic Rationale**: Why repurposing makes scientific sense
3. **Key Considerations**: Safety, selectivity, and next steps
4. **Research Hypothesis**: A clear hypothesis for further investigation

Keep it scientifically precise, medically informative, and formatted with markdown headers.`;

  return generateViaServer(prompt);
}

export async function analyzePaperAbstract(abstract: string): Promise<{
  summary: string;
  keyFindings: string[];
  relevance: string;
}> {
  const prompt = `Analyze this biomedical research paper abstract and extract structured insights:

Abstract: "${abstract}"

Respond in this exact JSON format:
{
  "summary": "2-3 sentence plain-language summary",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "relevance": "Brief statement on clinical/research relevance"
}`;

  try {
    const text = await generateViaServer(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fallback
  }
  return {
    summary: abstract.substring(0, 200) + '...',
    keyFindings: ['Key findings extraction failed', 'Please try again'],
    relevance: 'Relevance analysis unavailable',
  };
}

export async function generateResearchReport(
  query: string,
  type: 'research' | 'hypothesis' | 'literature' | 'abstract'
): Promise<string> {
  const templates = {
    research: `Generate a comprehensive biomedical research report on: "${query}"
Structure: Executive Summary, Background, Current Research Landscape, Key Findings, Molecular Mechanisms, Clinical Implications, Future Directions, References (cite real papers if known).`,
    hypothesis: `Generate a scientific research hypothesis for: "${query}"
Structure: Hypothesis Statement, Scientific Rationale, Experimental Approach, Expected Outcomes, Potential Impact, Risk Analysis.`,
    literature: `Generate a literature review on: "${query}"
Structure: Introduction, Thematic Analysis (3-4 themes), Key Studies, Gaps in Literature, Conclusion.`,
    abstract: `Generate a scientific abstract for a study on: "${query}"
Format: Background, Objectives, Methods, Results, Conclusions. Max 300 words.`,
  };

  return generateViaServer(templates[type]);
}

export async function generateDiseaseInsight(disease: string): Promise<string> {
  const prompt = `Provide a comprehensive biomedical overview of ${disease} including:
- Pathophysiology and molecular mechanisms
- Key protein targets and genetic factors
- Current treatment landscape
- Emerging research directions
- Drug repurposing opportunities

Use scientific language with markdown formatting. Be concise but comprehensive.`;

  return generateViaServer(prompt);
}

export async function suggestDrugRepurposing(
  disease: string,
  proteins: string[]
): Promise<string> {
  const prompt = `As a computational pharmacology expert, analyze drug repurposing opportunities for ${disease}.

Key protein targets: ${proteins.join(', ')}

Provide:
1. Top 5 existing FDA-approved drugs that could be repurposed
2. Molecular rationale for each candidate  
3. Similar disease models supporting repurposing
4. Confidence assessment (high/medium/low)
5. Clinical trial feasibility

Format as structured markdown with tables where appropriate.`;

  return generateViaServer(prompt);
}
