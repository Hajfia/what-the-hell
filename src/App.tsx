import { useEffect, useState } from "react";
import { MAX_INPUT_CHARS, type Report } from "./report.ts";
import { SAMPLE_FILES } from "./sample.ts";
import { Window } from "./components/Window.tsx";
import { CaseFile } from "./components/CaseFile.tsx";
import { Dropzone, type EvidenceFile } from "./components/Dropzone.tsx";
import { WavyLogo } from "./components/WavyLogo.tsx";

type Status = "idle" | "loading" | "done" | "error";

export default function App() {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [pasted, setPasted] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  const input = [
    ...files.map((f) => `--- ${f.name} ---\n${f.content}`),
    ...(pasted.trim() ? [`--- pasted text ---\n${pasted}`] : []),
  ].join("\n\n");
  const tooLong = input.length > MAX_INPUT_CHARS;
  const loading = status === "loading";

  // A file dropped outside the dropzone would otherwise open in the tab and lose the page.
  useEffect(() => {
    const block = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  function addFiles(added: EvidenceFile[]) {
    // A re-dropped file replaces the earlier copy with the same name.
    setFiles((prev) => [...prev.filter((f) => !added.some((a) => a.name === f.name)), ...added]);
  }

  async function handleInvestigate() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The investigation hit a wall. Try again.");
      setReport(data as Report);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>
          <WavyLogo />
        </h1>
        <p className="tagline">
          Just opened an unfamiliar project? Drop in its <code>package.json</code>, <code>composer.json</code>,
          README or a few source files. Let's investigate.
        </p>
      </header>

      <Window title="evidence/">
        <Dropzone
          files={files}
          onAdd={addFiles}
          onRemove={(name) => setFiles((prev) => prev.filter((f) => f.name !== name))}
          disabled={loading}
        />

        {showPaste ? (
          <textarea
            className="input"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste code, config or notes here"
            spellCheck={false}
            autoFocus
          />
        ) : (
          <button type="button" className="link" onClick={() => setShowPaste(true)}>
            or paste text instead
          </button>
        )}

        <div className="actions">
          {input && (
            <span className={`char-count ${tooLong ? "char-count-over" : ""}`}>
              {input.length.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters
            </span>
          )}
          <button className="btn btn-ghost" onClick={() => addFiles(SAMPLE_FILES)} disabled={loading}>
            Load example
          </button>
          <button className="btn btn-primary" onClick={handleInvestigate} disabled={loading || !input || tooLong}>
            Investigate
          </button>
        </div>
      </Window>

      {loading && <Loading />}
      {status === "error" && (
        <Window title="error.log" tone="alert">
          <p className="error">{error}</p>
        </Window>
      )}
      {status === "done" && report && <CaseFile report={report} />}
    </main>
  );
}

function Loading() {
  const [examining, setExamining] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setExamining(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Window title="working...">
      <p className="loading">
        {examining ? "Examining the evidence" : "Collecting evidence"}
        <span className="dots" />
      </p>
    </Window>
  );
}
