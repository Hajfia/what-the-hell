import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { investigate, InvestigationError } from "./server/investigate.ts";

// Mounts POST /api/investigate on the Vite dev server so the API key stays
// server-side and the whole app runs from `npm run dev`.
function apiPlugin(): Plugin {
  return {
    name: "investigate-api",
    configureServer(server) {
      server.middlewares.use("/api/investigate", async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        if (req.method !== "POST") return send(405, { error: "POST only" });

        try {
          let raw = "";
          for await (const chunk of req) raw += chunk;
          const { input } = JSON.parse(raw) as { input?: unknown };
          send(200, await investigate(typeof input === "string" ? input : ""));
        } catch (err) {
          if (err instanceof InvestigationError) return send(400, { error: err.message });
          console.error(err);
          send(500, { error: "The investigation hit a wall. Try again." });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* vars to the browser; load the rest for the API route.
  const key = loadEnv(mode, process.cwd(), "").GEMINI_API_KEY;
  if (key) process.env.GEMINI_API_KEY = key;
  return { plugins: [react(), apiPlugin()] };
});
