// JSON schema sent to Claude via structured outputs. Keep it in sync with the
// Report interface in src/report.ts.

const str = (description?: string) => ({ type: "string", ...(description && { description }) });
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const list = (items: unknown) => ({ type: "array", items });

export const reportSchema = obj({
  verdict: str(
    "One short sentence answering: what is this project? e.g. 'A WordPress site with a SolidJS frontend.'",
  ),
  technologies: list(
    obj({
      name: str(),
      role: str("What it appears to be used for, 2-5 words"),
      confidence: { type: "integer", description: "0-100" },
      evidence: list(str("Name of a supplied source that supports this")),
    }),
  ),
  summary: str("2-4 plain sentences on how the pieces fit together"),
  relationships: list(
    obj({
      from: str(),
      to: str(),
      relationship: str("Short verb phrase, e.g. 'provides content via REST API'"),
    }),
  ),
  evidence: list(
    obj({
      source: str("File name, or a short description if the fragment is unlabeled"),
      finding: str("What this source revealed, one short line"),
    }),
  ),
  uncertainties: list(
    obj({
      text: str(),
      confidence: { type: "integer", description: "0-100: how confident the stated guess is" },
    }),
  ),
});
