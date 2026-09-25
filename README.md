# What the hell is this?

Just opened an unfamiliar codebase? Drop in its `package.json`, `composer.json`, README or a few source files, and get a case file explaining what the project contains and how the pieces fit together.

The report lists:

- the technologies found, each with a confidence score
- a short summary of how they work together
- a project map
- the evidence behind each conclusion
- what it couldn't determine

Built with React, TypeScript and Vite. The analysis uses the Gemini API with structured JSON output.

## Run it

```sh
npm install
echo "GEMINI_API_KEY=your-key" > .env   # free key from https://aistudio.google.com
npm run dev
```

Open the local URL Vite prints, click **Load example**, then **Investigate**.

## How it works

- `src/components/Dropzone.tsx` reads the dropped files as text in the browser.
- `vite.config.ts` mounts `POST /api/investigate` on the dev server, so the API key never reaches the browser.
- `server/investigate.ts` sends the files to Gemini with the JSON schema in `server/schema.ts`. If a model is overloaded, it falls back to the next one.
- `src/components/CaseFile.tsx` renders the report.
