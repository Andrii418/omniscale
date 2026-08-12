# OmniScale — AI-Powered Cloud Infrastructure Orchestrator

🔗 **Live Demo**: [omniscale-cloud.vercel.app](https://omniscale-cloud.vercel.app)

OmniScale is a luxury, dark-themed cloud infrastructure orchestration dashboard combining
the visual mapping of Terraform, the observability of Datadog, and an AI-powered SRE agent
built on Google Gemini.

## Features

- 🗺️ **Interactive infrastructure topology** — a live node graph (React Flow) visualizing
  cloud resources, their status, and relationships
- 🤖 **AI SRE Agent** — real-time infrastructure analysis powered by Gemini, using
  structured JSON output to detect issues and suggest concrete remediation steps
- 🚀 **Deployment simulator** — a streamed, terminal-style log of a simulated
  `terraform apply` run using Server-Sent Events
- 📊 **Live telemetry dashboard** — real-time CPU/RAM charts, cumulative cost tracking,
  and an alert feed, built with Recharts
- 🌍 **Bilingual UI** (English / Polish) with a custom, lightweight i18n system
- 🎨 **Premium dark UI** — glassmorphism, cyan glow accents, and Framer Motion animations

## Tech Stack

**Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion,
React Flow, Recharts

**Backend**: Next.js Route Handlers, Server-Sent Events (streaming)

**AI**: Google Gemini API (structured output / responseSchema)

**Deployment**: Vercel

## Running Locally

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/omniscale.git
cd omniscale
npm install
# Create a .env.local file with:
# GEMINI_API_KEY=your_key_here
npm run dev
\`\`\`

## Architecture Notes

- The Gemini API key never reaches the client — all AI requests are proxied through a
  server-side Next.js Route Handler (`/api/sre-agent`)
- Deployment logs are streamed to the client via Server-Sent Events instead of polling,
  the same underlying mechanism used by streaming LLM chat interfaces
- The Gemini prompt enforces a JSON `responseSchema`, guaranteeing predictable,
  type-safe AI output instead of free-form text