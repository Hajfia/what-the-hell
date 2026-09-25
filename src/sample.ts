import type { EvidenceFile } from "./components/Dropzone.tsx";

// Demo files for the "Load example" button: a WordPress backend with a SolidJS frontend.
const SAMPLE_TEXT = `--- package.json ---
{
  "name": "harbor-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build && node scripts/copy-to-theme.js"
  },
  "dependencies": {
    "solid-js": "^1.9.3",
    "@solidjs/router": "^0.15.1"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vite-plugin-solid": "^2.11.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0"
  }
}

--- composer.json ---
{
  "name": "harbor/site",
  "type": "project",
  "require": {
    "php": ">=8.2",
    "johnpbloch/wordpress": "^6.6",
    "wpackagist-plugin/advanced-custom-fields": "^6.3",
    "wpackagist-plugin/wp-graphql": "^1.28",
    "vlucas/phpdotenv": "^5.6"
  },
  "repositories": [
    { "type": "composer", "url": "https://wpackagist.org" }
  ],
  "extra": {
    "wordpress-install-dir": "wp"
  }
}

--- README.md ---
# Harbor site

Marketing site for Harbor. Content is edited in WordPress; the public
frontend is a SolidJS app built with Vite.

## Local setup

1. composer install
2. npm install
3. Copy .env.example to .env and fill in the database details
4. npm run dev

The frontend fetches pages from the WordPress backend. Built assets are
copied into the theme folder on deploy.
`;

// Split "--- name ---" sections into separate files: ["", name, content, name, content, ...]
const parts = SAMPLE_TEXT.split(/^--- (.+) ---$/m);
export const SAMPLE_FILES: EvidenceFile[] = [];
for (let i = 1; i < parts.length; i += 2) {
  SAMPLE_FILES.push({ name: parts[i], content: parts[i + 1].trim() + "\n" });
}
