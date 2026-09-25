import type { Report } from "../report.ts";
import { Window } from "./Window.tsx";

export function CaseFile({ report }: { report: Report }) {
  return (
    <div className="casefile">
      <h2 className="casefile-heading">Case file</h2>
      <p className="verdict">{report.verdict}</p>

      <Window title="technologies_found">
        {report.technologies.length === 0 ? (
          <p className="muted">No technologies could be identified from this evidence.</p>
        ) : (
          <ul className="tech-grid">
            {report.technologies.map((tech) => (
              <li key={tech.name} className="tech-card">
                <strong>{tech.name}</strong>
                <span className="tech-role">{tech.role}</span>
                <Confidence value={tech.confidence} />
              </li>
            ))}
          </ul>
        )}
      </Window>

      <Window title="whats_going_on">
        <h3>What's going on?</h3>
        <p className="summary">{report.summary}</p>
      </Window>

      {report.relationships.length > 0 && (
        <Window title="project_map">
          <h3>Project map</h3>
          <ul className="map">
            {report.relationships.map((rel, i) => (
              <li key={i} className="map-row">
                <span className="node">{rel.from}</span>
                <span className="edge">
                  <span className="edge-label">{rel.relationship}</span>
                  <span className="edge-line" aria-hidden="true" />
                </span>
                <span className="node">{rel.to}</span>
              </li>
            ))}
          </ul>
        </Window>
      )}

      <Window title="evidence">
        <h3>Evidence</h3>
        <ul className="evidence">
          {report.evidence.map((item, i) => (
            <li key={i}>
              <code>{item.source}</code>
              <span>&rarr; {item.finding}</span>
            </li>
          ))}
        </ul>
      </Window>

      {report.uncertainties.length > 0 && (
        <Window title="open_questions">
          <h3>Not enough evidence</h3>
          <ul className="uncertainties">
            {report.uncertainties.map((item, i) => (
              <li key={i}>
                <p>{item.text}</p>
                <Confidence value={item.confidence} />
              </li>
            ))}
          </ul>
        </Window>
      )}
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span className="confidence">
      <span className="bar" aria-hidden="true">
        <span className="bar-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="confidence-label">{pct}% confidence</span>
    </span>
  );
}
