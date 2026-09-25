// Shape of the case file Claude returns. Shared by the server and the UI.
export interface Report {
  verdict: string;
  technologies: { name: string; role: string; confidence: number; evidence: string[] }[];
  summary: string;
  relationships: { from: string; to: string; relationship: string }[];
  evidence: { source: string; finding: string }[];
  uncertainties: { text: string; confidence: number }[];
}

export const MAX_INPUT_CHARS = 200_000;
