import { useRef, useState, type DragEvent } from "react";

export interface EvidenceFile {
  name: string;
  content: string;
}

const MAX_FILE_BYTES = 500_000;

// Reads dropped/picked files as text, skipping binaries and very large files.
async function readFiles(list: FileList) {
  const added: EvidenceFile[] = [];
  const skipped: string[] = [];
  for (const file of Array.from(list)) {
    if (file.size > MAX_FILE_BYTES) {
      skipped.push(`${file.name} (too large)`);
      continue;
    }
    const content = await file.text();
    if (content.includes("\u0000")) {
      skipped.push(`${file.name} (not a text file)`);
      continue;
    }
    added.push({ name: file.name, content });
  }
  return { added, skipped };
}

export function Dropzone({
  files,
  onAdd,
  onRemove,
  disabled,
}: {
  files: EvidenceFile[];
  onAdd: (files: EvidenceFile[]) => void;
  onRemove: (name: string) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);

  async function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    const { added, skipped } = await readFiles(list);
    setSkipped(skipped);
    if (added.length) onAdd(added);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handle(e.dataTransfer.files);
  }

  return (
    <div>
      <button
        type="button"
        className={`dropzone ${dragging ? "dropzone-active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={handleDrop}
        disabled={disabled}
      >
        <span className="dropzone-title">{dragging ? "Drop it. Let's see." : "Drop project files here"}</span>
        <span className="dropzone-hint">
          package.json, composer.json, README.md, config or source files. Or click to choose.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />

      {skipped.length > 0 && <p className="skipped">Skipped: {skipped.join(", ")}</p>}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.name} className="file-chip">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{file.content.split("\n").length} lines</span>
              <button
                type="button"
                className="file-remove"
                onClick={() => onRemove(file.name)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
