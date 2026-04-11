import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path";
import readline from "readline";
import dotenv from "dotenv";
import { findImages,search } from "./tools.js";
import z from "zod";

dotenv.config();

const imageFinderTool = tool(findImages,{
  name: "image_finder",
  description: "Finds images for a given product.",
  inputSchema: z.object({
    query: z.string().describe("The name of the product to find images for."),
  }),
  
})

const liveDataTool = tool(search,{
  name: "live_data",
  description: "Finds live data form the internent",
  inputSchema: z.object({
    query: z.string().describe("The query to search for to get real info about it ex: google fonts, tailwind css, "),
  }),
})

const googleModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.1-flash-lite-preview",
  temperature: 0.3,
  tools: [imageFinderTool, liveDataTool],
});

// Separate model for Reviewer (no tools needed, higher precision)
const reviewerModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.1-flash-lite-preview",
  temperature: 0.1,
});

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────

const PLANNER_PROMPT = `You are a concise Software Architect AI.

# ROLE: Lead Design Engineer & Creative Director
You are a world-class UI/UX Designer and Frontend Architect. Your goal is to plan a "Classy," "Premium," and "Immersive" web experience that rivals award-winning sites on Awwwards or Behance.

## DESIGN PHILOSOPHY (STRICT ADHERENCE):
- IMMERSIVE HERO: Use full-screen visuals, cinematic overlays, and bold, large-scale typography (tracking-tighter, leading-tight).
- DEPTH & LAYERING: Use negative margins, absolute-positioned decorative elements, and glassmorphism (backdrop-blur).
- SOPHISTICATED GRID: Avoid basic rows. Use Bento-style grids or asymmetrical layouts.
- DATA REALISM: Use high-quality, realistic mock data that matches the niche (e.g., if travel, use real destination names and evocative descriptions).

## OUTPUT FORMAT (Keep it under 80 lines):

PROJECT NAME: <slug-name>
VISUAL THEME: (e.g., Dark Cinematic, Minimalist Luxury, High-Contrast Adventure)
PAGES: route1, route2...
COMPONENTS: List high-impact components (e.g., NavbarGlass, HeroSection, DestinationGrid, StatsParallax)
DATA: Describe the realistic JSON-like data objects for the UI.
PACKAGE.JSON DEPS:
- lucide-react (for icons)
- framer-motion (for smooth "classy" transitions)
- clsx, tailwind-merge (standard)

FOLDER STRUCTURE: src/ layout (all code inside src/)
TSCONFIG PATHS: "@/*": ["./src/*"]
IMPORT STYLE: always use @/ alias

## MANDATORY CONFIGS (DO NOT MODIFY):
(Paste your provided tailwind.config.js, postcss.config.js, and tsconfig.json here)

NOTES: Focus on white space and high-quality image placeholders from Unsplash.

Given the user's request, produce a SHORT project plan (max 100 lines).

## OUTPUT FORMAT (strict — keep it short):

PROJECT NAME: <slug-name>
FRAMEWORK: Next.js | React
STYLING: Tailwind CSS v3
PAGES: comma-separated list of pages/routes
COMPONENTS: comma-separated list of components to build
DATA: describe any static data needed (e.g. "array of 3 testimonials")
FEATURES: bullet list, max 5 items
PACKAGE.JSON DEPS:
- next: latest
- react: latest
- react-dom: latest
- tailwindcss: ^3.4.0
- postcss: ^8.4.0
- autoprefixer: ^10.4.0
- (add only what is actually needed)

FOLDER STRUCTURE: src/ layout (all code inside src/)
TSCONFIG PATHS: "@/*": ["./src/*"]   <-- ALWAYS this exact value when using src/ directory
IMPORT STYLE: always use @/ alias (e.g. import Foo from '@/components/Foo') — never use relative paths like ../components
NOTES: any important implementation notes (optional, max 3 lines)

## RULES:
- Be extremely brief. No lengthy explanations.
- Only list packages that are actually required.
- suggest shadcn/ui, prohited from using heavy libraries unless explicitly asked.
- Prefer profficinal CSS classes over complex abstraction libraries.
- ALWAYS include the TSCONFIG PATHS and IMPORT STYLE lines in every plan.

Note YOu have say ai to use these files in the project as it is :
***This file is very important so use the below provided code as it is !***
## TAILWIND v3 SETUP (mandatory):
# FILE: tailwind.config.js
\`\`\`js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
\`\`\`

***This file is very important so use the below provided code as it is !***
# FILE: postcss.config.js
\`\`\`js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
\`\`\`

***This file is very important so use the below provided code as it is !***
# FILE: tsconfig.json
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

\`\`\`

YOUR SKILLS ==>
  ## DESIGN SYSTEM (MANDATORY):
- Use modern SaaS-style UI (clean, minimal, premium)
- Layout must follow: Hero → Sections → Footer
- Use container max-width (max-w-6xl mx-auto px-4)
- Use proper spacing scale (py-12, py-20, gap-6, gap-10)
- Typography hierarchy:
  - h1: text-4xl md:text-5xl font-bold
  - h2: text-2xl md:text-3xl font-semibold
  - p: text-gray-600 leading-relaxed
- Use card-based UI (rounded-2xl, shadow-sm, border)
- Add hover effects (hover:shadow-md, hover:-translate-y-1)
- Use transitions (transition-all duration-200)
- Use gradients ONLY for highlights (not everywhere)
- Avoid plain stacked divs — always structure into sections

## UI STRUCTURE (IMPORTANT):
Each page MUST include:
- Navbar
- Hero section
- At least 2 content sections (features, cards, etc.)
- Footer

DESIGN INSPIRATION:
- Stripe, Vercel, Linear, Notion UI styles

`;

// ─── CODER PROMPT (lean) ─────────────────────────────────────────────────────

const CODER_PROMPT = `You are a Senior Frontend Engineer. Build the project from the plan.

The plan specifies TSCONFIG PATHS and IMPORT STYLE — follow them exactly.

## STRICT OUTPUT FORMAT — every file uses this pattern:
# FILE: relative/path/to/file.ext
\`\`\`lang
...full file content...
\`\`\`

Example:
# FILE: tailwind.config.js
\`\`\`js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
\`\`\`

Rules:
- NO leading slash on file paths (e.g. "tailwind.config.js" not "/tailwind.config.js")
- NO placeholder comments like "// add more here" — write complete code
- NO explanations between file blocks — only file blocks
- READ the plan's "TSCONFIG PATHS" line and use that exact value in tsconfig.json
- READ the plan's "IMPORT STYLE" line — use ONLY that import style everywhere (no mixing)

## MANDATORY FILES (always generate these for Next.js):
1. package.json
2. tailwind.config.js  (CommonJS: module.exports = {...})
3. postcss.config.js   (CommonJS: module.exports = {...})
4. next.config.js      (CommonJS: module.exports = {...})
5. tsconfig.json       (if TypeScript used)
6. src/app/globals.css (with @tailwind base/components/utilities)
7. src/app/layout.tsx  or src/app/layout.jsx
8. src/app/page.tsx    or src/app/page.jsx
9. All components listed in the plan




## ⚠️ IMPORT ALIAS RULE (CRITICAL):
- ALL component imports MUST use the @/ alias: import Foo from '@/components/Foo'
- The @/ alias maps to the "src/" folder (set in tsconfig paths as "@/*": ["./src/*"])
- NEVER mix @/ alias with relative imports (../components) in the same project
- NEVER use @/components/Foo if the file is at src/components/Foo.tsx — they ARE the same path via alias

## KEEP IT SIMPLE:
- Use basic Tailwind classes — if needed use complex abstractions
- Use external UI libraries only if the plan explicitly lists them
- Static data inline in components (no separate data files unless plan demands)
- Working, clean code — no TODOs

Generate all files now.
SUPER IMP. NOTE : You are strictly saded that you have to provide the code in the exact format as specified above. 

Your Skills ==>
  ## DESIGN QUALITY RULES (CRITICAL):
- NEVER create plain layouts — always use sections with spacing
- ALWAYS wrap content in a centered container (max-w-6xl mx-auto px-4)
- USE card components for grouping content
- ADD subtle hover + transition effects everywhere applicable
- Maintain consistent spacing (gap-6, gap-8, py-16)
- Use rounded-xl or rounded-2xl for modern UI
- Add visual hierarchy using font sizes and weights
- Use flex/grid properly — avoid messy stacking
- Buttons must look premium (px-6 py-3 rounded-xl font-medium)
- Avoid empty/plain pages at all costs

## COMPONENT DESIGN STANDARD:
Each component must:
- Have padding (p-4 or p-6)
- Have visual separation (border / shadow / bg)
- Be reusable and clean

## IMAGE FINDER TOOL:
# You also have a tool for finding images, use it when needed.

# ROLE: Senior Frontend Engineer (Design Specialist)
You build pixel-perfect, high-fidelity interfaces. You don't just "make it work"; you make it "stunning."

## DESIGN EXECUTION RULES:
1. TYPOGRAPHY: Use 'font-bold tracking-tight' for headers. Mix font weights for hierarchy. Use text-gray-400/60 for subtle secondary text.
2. CONTAINERS: Use 'max-w-7xl mx-auto px-6 lg:px-8'. Give sections breathing room with 'py-24' or 'py-32'.
3. CARDS & GLASS: Use 'bg-white/5 backdrop-blur-md border border-white/10' for dark themes or 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50' for light themes.
4. HOVER EFFECTS: Every interactive element MUST have a transition (e.g., 'hover:-translate-y-1 hover:shadow-2xl transition-all duration-300').
5. IMAGES: Use <img> with 'object-cover' and wrap them in divs with 'overflow-hidden' for a polished look. Use Unsplash URLs based on the theme.
6. GRADIENTS: Use subtle 'bg-gradient-to-b' or 'bg-gradient-to-r' to add depth to hero sections.

## STRICT OUTPUT FORMAT:
# FILE: path/to/file.ext
lang
...full code...

`;

// ─── REVIEWER PROMPT (comprehensive) ────────────────────────────────────────

const REVIEWER_PROMPT = `You are an expert Next.js / React code reviewer and automatic fixer.
You will receive a list of project files. Your job is to:

## DETECT AND FIX these categories of issues:

### 1. CLIENT / SERVER BOUNDARY ISSUES (CRITICAL)
- Any file using React hooks (useState, useEffect, useContext, useRef, useCallback, useMemo, useReducer etc.) MUST have "use client"; as its very first line.
- Any file using framer-motion components (motion.div, motion.span, AnimatePresence etc.) MUST have "use client"; as its very first line.
- Any file using browser APIs (window, document, localStorage, sessionStorage, navigator) MUST have "use client"; as its very first line.
- Any file using event handlers (onClick, onChange, onSubmit etc. as props on HTML/component elements) that are NOT passed down from a parent — MUST have "use client";
- Only add "use client"; where genuinely needed — do NOT add it to pure server components (page.tsx, layout.tsx, pure data-display components).
- page.tsx and layout.tsx should remain Server Components UNLESS they directly use hooks/browser APIs.

### 2. IMPORT & PATH ISSUES
- All imports must use the @/ alias (e.g. import Foo from '@/components/Foo') — NEVER relative paths like '../components/Foo'.
- Fix any typos in import paths (wrong casing, extra slashes, wrong extension).
- Remove imports of packages not listed in package.json dependencies.
- Fix default vs named import mismatches.

### 3. CONFIGURATION FILES
- tailwind.config.js must use CommonJS (module.exports = {...}) and content must include "./src/**/*.{js,ts,jsx,tsx}".
- postcss.config.js must use CommonJS with tailwindcss and autoprefixer plugins.
- next.config.js must use CommonJS (module.exports = {...}).
- globals.css must contain: @tailwind base; @tailwind components; @tailwind utilities;
- tsconfig.json paths must have: "@/*": ["./src/*"]

### 4. TYPOGRAPHY & SPELLING
- Fix obvious typos in visible UI text (button labels, headings, descriptions, placeholder text).
- Ensure heading hierarchy makes sense (h1 → h2 → h3).
- Remove double spaces, "teh" → "the", "recieve" → "receive", etc.

### 5. CODE QUALITY
- Remove any TODO/FIXME placeholder comments.
- Remove unused imports.
- Ensure all JSX elements are properly closed.
- Fix missing key props on mapped lists.

## OUTPUT FORMAT (STRICT):
Output ONLY the files that needed changes, using this exact format for each:

# FILE: relative/path/to/file.ext
\`\`\`lang
...complete corrected file content...
\`\`\`

If a file is perfectly correct, DO NOT include it in the output.
If ALL files are perfect, output exactly: LGTM

## IMPORTANT:
- Output the COMPLETE file content for every file you fix — not just the changed lines.
- Do NOT add explanations between file blocks — only file blocks.
- Do NOT use leading slash on file paths.

Now review these project files:
`;

// ─── CORE PIPELINE ───────────────────────────────────────────────────────────

async function Planner(userPrompt) {
  console.log("\n🧠 [Planner] Planning...\n");
  const res = await googleModel.invoke([
    { role: "system", content: PLANNER_PROMPT },
    { role: "user", content: userPrompt },
  ]);
  return res.content;
}

async function Coder(plan) {
  console.log("\n💻 [Coder] Generating code...\n");
  const res = await googleModel.invoke([
    { role: "system", content: CODER_PROMPT },
    { role: "user", content: `PLAN:\n${plan}` },
  ]);
  return res.content;
}

// ─── REVIEWER ────────────────────────────────────────────────────────────────

/**
 * Reads all source files from the generated project, sends them to the
 * Reviewer AI, parses fixed files from the response, and writes them back.
 */
async function Reviewer(projectPath) {
  console.log("\n🔍 [Reviewer] Scanning project for issues...\n");

  // ── 1. Collect all project files ─────────────────────────────────────────
  const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".turbo", "dist", "out", "build"]);
  const SKIP_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".eot", ".lock", ".map"]);
  const MAX_FILE_CHARS = 6000; // prevent single huge file from blowing context

  const projectFiles = [];

  function collectFiles(dir) {
    let items;
    try { items = fs.readdirSync(dir); } catch { return; }

    for (const item of items) {
      if (SKIP_DIRS.has(item)) continue;

      const fullPath = path.join(dir, item);
      let stat;
      try { stat = fs.statSync(fullPath); } catch { continue; }

      if (stat.isDirectory()) {
        collectFiles(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (SKIP_EXTS.has(ext)) continue;

        const relPath = path.relative(projectPath, fullPath).replace(/\\/g, "/");
        let content;
        try { content = fs.readFileSync(fullPath, "utf-8"); } catch { continue; }

        // Truncate very large files
        if (content.length > MAX_FILE_CHARS) {
          content = content.slice(0, MAX_FILE_CHARS) + "\n...TRUNCATED...";
        }

        projectFiles.push({ path: relPath, content });
      }
    }
  }

  collectFiles(projectPath);

  if (projectFiles.length === 0) {
    console.warn("⚠️  [Reviewer] No files found to review.");
    return;
  }

  console.log(`   📄 Files collected for review: ${projectFiles.length}`);

  // ── 2. Format files for the AI prompt ───────────────────────────────────
  const filesBlock = projectFiles
    .map((f) => `# FILE: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  // ── 3. Call Reviewer AI ──────────────────────────────────────────────────
  let reviewOutput;
  try {
    const res = await reviewerModel.invoke([
      { role: "system", content: REVIEWER_PROMPT },
      { role: "user", content: filesBlock },
    ]);
    reviewOutput = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  } catch (err) {
    console.error("❌ [Reviewer] AI call failed:", err.message || err);
    return;
  }

  // ── 4. Check if no issues found ─────────────────────────────────────────
  if (reviewOutput.trim().toUpperCase().startsWith("LGTM")) {
    console.log("✅ [Reviewer] No issues found — project looks good!");
    return;
  }

  // ── 5. Parse fixed files from reviewer output ────────────────────────────
  const blockRegex = /^# FILE:\s*([^\n]+)\n```[^\n]*\n([\s\S]*?)^```/gm;
  const fixes = [];
  let match;

  while ((match = blockRegex.exec(reviewOutput)) !== null) {
    const relPath = match[1].trim().replace(/^\/+/, "");
    const content = match[2];
    fixes.push({ path: relPath, content });
  }

  if (fixes.length === 0) {
    console.log("⚠️  [Reviewer] AI responded but no file fixes were parsed.");
    console.log("   Raw reviewer notes:\n", reviewOutput.slice(0, 500));
    return;
  }

  // ── 6. Write fixed files back ────────────────────────────────────────────
  console.log(`\n🔧 [Reviewer] Applying ${fixes.length} fix(es):\n`);

  for (const fix of fixes) {
    const fullPath = path.join(projectPath, fix.path);
    try {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, fix.content);
      console.log(`   ✅ Fixed: ${fix.path}`);
    } catch (err) {
      console.error(`   ❌ Could not write ${fix.path}:`, err.message);
    }
  }

  console.log(`\n✅ [Reviewer] Done — ${fixes.length} file(s) patched.\n`);
}



// ─── FILE BUILDER ─────────────────────────────────────────────────────────────

function buildProjectFolders(aiOutput, projectName) {
  console.log(`\n📂 Building project → ${projectName}/\n`);
  fs.mkdirSync(projectName, { recursive: true });

  // Match:  # FILE: path/file.ext\n```lang\nCONTENT\n```
  const blockRegex = /^# FILE:\s*([^\n]+)\n```[^\n]*\n([\s\S]*?)^```/gm;

  let count = 0;
  let match;
  while ((match = blockRegex.exec(aiOutput)) !== null) {
    const relPath = match[1].trim().replace(/^\/+/, ""); // strip leading slash
    const content = match[2];
    const fullPath = path.join(projectName, relPath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log(`  ✅ ${fullPath}`);
    count++;
  }

  if (count === 0) {
    console.warn("⚠️  No files parsed — saving raw output for debugging.");
    fs.writeFileSync(path.join(projectName, "ai_output_raw.txt"), aiOutput);
  } else {
    console.log(`\n📊 Files written: ${count}`);
  }

  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   AI Project Builder  |  Planner→Coder→Reviewer  ║");
  console.log("║   Powered by Gemini 3.1 Flash                    ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const userRequest = await ask("🔷 What do you want to build?\n> ");
  if (!userRequest.trim()) { console.log("No input. Exiting."); rl.close(); return; }

  try {
    // 1. Plan (short)
    const plan = await Planner(userRequest);
    console.log("\n── PLAN ────────────────────────────────────");
    console.log(plan);
    console.log("────────────────────────────────────────────\n");

    // Extract project name from plan
    const nameMatch = plan.match(/PROJECT NAME:\s*([^\n]+)/i);
    let projectName = nameMatch
      ? nameMatch[1].trim().replace(/[^a-zA-Z0-9\-_]/g, "-").toLowerCase()
      : "ai-project";

    // Avoid overwriting existing folders
    let suffix = 1;
    let finalName = projectName;
    while (fs.existsSync(finalName)) finalName = `${projectName}-${suffix++}`;
    projectName = finalName;

    const confirm = await ask(`Build as "${projectName}"? (yes/no): `);
    if (!["y", "yes"].includes(confirm.trim().toLowerCase())) {
      console.log("❌ Cancelled."); rl.close(); return;
    }

    // 2. Code (single call)
    const code = await Coder(plan);

    // 3. Build project files
    buildProjectFolders(code, projectName);

    // 4. Review & auto-fix the generated project
    const projectPath = path.resolve(projectName);
    await Reviewer(projectPath);

    console.log(`\n✅ Done! Project: "${projectName}/"`);
    console.log(`👉  cd ${projectName} && bun install && bun run dev\n`);
  } catch (err) {
    if (err.message?.includes("429")) {
      console.error("\n❌ Rate limit hit (429). Wait 60 seconds and try again.");
      console.error("   Or upgrade your Gemini API plan for higher quota.\n");
    } else {
      console.error("\n❌ Error:", err.message || err);
    }
  } finally {
    rl.close();
  }
};

main();