import { ApiError, GoogleGenAI } from "@google/genai";
import { MAX_INPUT_CHARS, type Report } from "../src/report.ts";
import { reportSchema } from "./schema.ts";

// Tried in order: free-tier Flash models get overloaded (503) or rate-limited
// (429) at times, so we fall through to the next one instead of failing.
const MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
const MODEL_TIMEOUT_MS = 25_000;

// Created on first use so GEMINI_API_KEY from .env is loaded by then.
let ai: GoogleGenAI | undefined;

const SYSTEM_PROMPT = `You help developers who just opened an unfamiliar codebase and are asking: "What am I looking at?"

You receive fragments of a project: manifests like package.json or composer.json, READMEs, config files, or source files. Identify the technologies in use, explain how they fit together, and show which fragment led to each conclusion.

Only claim what the supplied text supports. The user will rely on this report to orient themselves, so a confident wrong answer is worse than an honest "I can't tell". Specifically:
- Confidence reflects the evidence: a dependency listed in a manifest is strong evidence (85-98); a passing mention in a README is weaker; a guess from naming conventions is weak. A technology's confidence covers its stated role too, not just its presence. Reserve 99-100 for things stated outright in several places.
- Relationships are often inferred. If a connection isn't directly shown (e.g. a GraphQL plugin is installed but no query is visible), say so in the relationship wording ("likely ...") and add an uncertainty about it.
- Anything inferred rather than directly visible, and anything important that can't be determined from the fragments (where an API is called, how deployment works, what a missing file probably contains), goes in uncertainties.
- Evidence sources must be names that actually appear in the input. If the user didn't label a fragment, describe it (e.g. "pasted PHP code").
- Relationships describe how the main technologies connect. Leave out trivial tooling (linters, formatters) unless it matters for understanding the project. If there is only one meaningful technology, relationships can be empty.
- If the input is too thin to say much, say so in the verdict and summary instead of padding the report.

Write in plain, friendly language for a developer who knows programming but not this project. Keep it concise.`;

export class InvestigationError extends Error {}

export async function investigate(input: string): Promise<Report> {
  const text = input.trim();
  if (!text) throw new InvestigationError("Paste some project files first.");
  if (text.length > MAX_INPUT_CHARS) {
    throw new InvestigationError(
      `That's ${text.length.toLocaleString()} characters; the limit is ${MAX_INPUT_CHARS.toLocaleString()}. Try the manifests, README and a few key files.`,
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new InvestigationError("No API key found. Add GEMINI_API_KEY to .env and restart the dev server.");
  }
  ai ??= new GoogleGenAI({ apiKey });

  const response = await generate(ai, text);

  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || finish === "SAFETY") {
    throw new InvestigationError("The investigator declined to look at this one.");
  }
  const json = response.text;
  if (finish === "MAX_TOKENS" || !json) {
    throw new InvestigationError("The report came back incomplete. Try again with less input.");
  }
  // responseJsonSchema constrains the output to match reportSchema.
  return JSON.parse(json) as Report;
}

async function generate(ai: GoogleGenAI, text: string) {
  for (const [i, model] of MODELS.entries()) {
    try {
      return await ai.models.generateContent({
        model,
        contents: `Here is what I have from the project:\n\n<project_files>\n${text}\n</project_files>`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: reportSchema,
          maxOutputTokens: 16000,
          abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
        },
      });
    } catch (err) {
      const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      const busy = timedOut || (err instanceof ApiError && (err.status === 429 || err.status === 503));
      if (busy && i < MODELS.length - 1) {
        console.warn(`${model} ${timedOut ? "timed out" : "is busy"}, trying ${MODELS[i + 1]}`);
        continue;
      }
      console.error(err);
      if (busy) throw new InvestigationError("Gemini is overloaded right now. Wait a minute and try again.");
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 401 || err.status === 403 || /API key/i.test(err.message)) {
        throw new InvestigationError("The Gemini API key was rejected. Check GEMINI_API_KEY in .env.");
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}
