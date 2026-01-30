# Plugin Arena

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000)](https://vercel.com/)

<div align="center">

### Discover the best Claude Code extensions through community-driven rankings.

**[View Rankings](https://plugin-arena.vercel.app)** | **[Start Voting](https://plugin-arena.vercel.app/vote)** | **[How It Works](https://plugin-arena.vercel.app/how-it-works)**

</div>

---

Plugin Arena is a ranking platform for [Claude Code](https://claude.ai/code) extensions — MCP servers, skills, hooks, and commands. Inspired by [LMArena](https://lmarena.ai/)'s pairwise comparison approach, it combines community votes with GitHub metrics to surface the most useful tools for AI-assisted development.

> **What is Claude Code?** Claude Code is Anthropic's official CLI tool that brings Claude AI directly into your terminal. It supports extensions through MCP servers, skills, hooks, and commands to customize and enhance your development experience.

---

## The Problem

The Claude Code ecosystem is growing fast. Every week brings new MCP servers, skills, and hooks — but finding the good ones is hard:

- **GitHub stars don't tell the whole story** — A repo can have thousands of stars but be outdated or poorly maintained
- **"Awesome" lists get stale** — Curated lists can't keep up with the pace of new releases
- **No way to compare alternatives** — When 5 different MCP servers do similar things, which one should you use?

## The Solution

Plugin Arena asks a simple question: **"Which plugin do you prefer?"**

By aggregating thousands of pairwise comparisons from developers who've actually used these tools, we build rankings that reflect real-world utility — not just marketing or initial hype.

---

## Quick Look

```
+----------------------------------------------------------------+
|  Plugin Rankings                                                |
|                                                                 |
|  Now | Trend | Classic                    [MCP v] [All v]      |
|  ----------------------------------------------------------------|
|  #1  mcp-server-fetch         * 2,847   ELO: 1687   ^ +12      |
|  #2  mcp-server-filesystem    * 1,923   ELO: 1654   ^ +8       |
|  #3  mcp-server-github        * 1,456   ELO: 1621   v -3       |
|  ...                                                            |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
|  Vote: Which plugin do you prefer?                              |
|                                                                 |
|  +------------------+    VS    +------------------+             |
|  | mcp-server-fetch |          | mcp-server-brave |             |
|  | * 2,847          |          | * 1,234          |             |
|  | Web fetching     |          | Brave Search API |             |
|  | [Vote for this]  |          | [Vote for this]  |             |
|  +------------------+          +------------------+             |
|                                                                 |
|                        [Skip ->]                                |
+----------------------------------------------------------------+
```

---

## Use Cases

### "I'm setting up Claude Code for the first time"
Check the **Classic** ranking for battle-tested, stable plugins that most developers rely on.

### "I want to know what's hot right now"
Check the **Trend** ranking to see what's gaining traction in the last 60 days.

### "I'm choosing between similar plugins"
Search for both in the rankings and compare their ELO scores, or vote on them directly.

### "I built a Claude Code extension"
If it's on GitHub with Claude Code-related keywords, it'll be automatically discovered and ranked.

---

## Features

### Three Ranking Views

| View | Question It Answers | Based On |
|------|---------------------|----------|
| **Now** | What should I adopt today? | ELO (60%) + GitHub stars (40%) |
| **Trend** | What's gaining momentum? | 60-day star growth + recent votes |
| **Classic** | What's stood the test of time? | All-time GitHub stars |

### Pairwise Voting

- **Simple A/B choices** — Pick the plugin you prefer, or skip if unsure
- **No account required** — Just vote and go
- **Smart matchmaking** — We pair plugins at similar skill levels for meaningful comparisons
- **Keyboard shortcuts** — `1`/`2` or Arrow keys for quick voting

### Four Plugin Categories

| Category | What It Is | Examples |
|----------|------------|----------|
| **MCP Servers** | Model Context Protocol integrations | Database connectors, API wrappers |
| **Skills** | Specialized agent behaviors | Code review, documentation generators |
| **Hooks** | Workflow automation | Pre-commit checks, auto-formatting |
| **Commands** | Slash commands | Project scaffolding, deployment tools |

### Transparent Scoring

- ELO scores update in real-time after each vote
- GitHub metrics sync daily
- Low-confidence warnings for plugins with few votes
- All formulas are open source

---

## How Rankings Work

```
GitHub Discovery          Community Votes           Combined Rankings
      |                         |                         |
      v                         v                         v
+-----------+            +-----------+            +-----------+
| Stars     |            | Pairwise  |            | Now       | <- Best overall
| Metadata  |------+---->| ELO       |------+---->| Trend     | <- Rising stars
| Topics    |      |     | Scores    |      |     | Classic   | <- All-time best
+-----------+      |     +-----------+      |     +-----------+
                   |                        |
              Daily Sync              Real-time
```

### ELO System

We use the [Bradley-Terry model](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) — the same statistical approach used in chess ratings and LMArena:

- **Initial rating**: 1500
- **K-factor**: 32
- When a higher-rated plugin wins, small score change; when an underdog wins, bigger change

### Hybrid Scoring

For the "Now" ranking, we combine signals:

```
Score = (Normalized ELO x 0.6) + (Normalized Stars x 0.4)
```

New plugins with few votes rely more on GitHub stars until they accumulate enough community data.

---

## FAQ

<details>
<summary><strong>How are plugins discovered?</strong></summary>

Plugins are automatically found via GitHub Search API using Claude Code-related keywords (`claude mcp`, `claude-code`, `mcp-server`, etc.) and topic tags. Manual submission may be added in the future.
</details>

<details>
<summary><strong>Can I vote multiple times?</strong></summary>

You can vote on unlimited different pairs. However, voting on the same pair is limited to once per 24 hours (tracked via browser fingerprint, not personal data).
</details>

<details>
<summary><strong>How often are rankings updated?</strong></summary>

ELO scores update immediately after each vote. GitHub stars sync once daily.
</details>

<details>
<summary><strong>Is voting anonymous?</strong></summary>

Yes. We store only a hashed fingerprint for deduplication — no personal information.
</details>

<details>
<summary><strong>My plugin isn't listed. How do I add it?</strong></summary>

Make sure your GitHub repo has Claude Code-related keywords in the description or topics. It should be discovered within 24 hours. For manual addition requests, open an issue.
</details>

---

## Self-Hosting

Want to run your own instance? Here's a quick overview:

```bash
git clone https://github.com/cawa102/PluginArena.git
cd PluginArena
npm install
cp .env.example .env.local  # Configure your environment
npm run dev
```

**Requirements:** Node.js 20+, Supabase account, optional GitHub token.

### Environment Variables

Create `.env.local` with:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
ADMIN_TOKEN=your-secure-admin-token

# Optional
GITHUB_TOKEN=ghp_xxx  # Increases API rate limits
```

### Database Setup

1. Create a new Supabase project
2. Run the migration in SQL Editor: `supabase/migrations/001_initial_schema.sql`

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| i18n | next-intl |

---

## Contributing

Contributions are welcome! Whether it's:

- Bug reports
- Feature suggestions
- Documentation improvements
- Code contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- [ ] GitHub OAuth authentication
- [ ] Manual plugin submission
- [ ] Individual plugin detail pages
- [ ] X/Twitter mention tracking for trends
- [ ] Public API for rankings
- [ ] Browser extension for inline GitHub recommendations

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Stop guessing. Start discovering.**

Built for the Claude Code community.

[View Rankings](https://plugin-arena.vercel.app) | [Report Issue](https://github.com/cawa102/PluginArena/issues)

</div>
