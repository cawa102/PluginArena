# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plugin Arena is a ranking/voting site for Claude Code plugins (MCP servers, skills, hooks, commands). It uses LMArena-style pairwise voting with ELO scoring combined with GitHub stars metrics.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── plugins/       # GET: ranking list
│   │   ├── vote/          # GET: random pair, POST: submit vote
│   │   ├── comments/      # GET/POST: comments
│   │   └── admin/         # Admin APIs (token auth)
│   ├── vote/              # Pairwise voting page
│   └── admin/             # Admin dashboard
├── components/            # React components
├── lib/                   # Utilities
│   ├── supabase.ts       # DB client
│   ├── elo.ts            # ELO calculation
│   ├── matchmaking.ts    # Smart vote pair matching
│   ├── github.ts         # GitHub API
│   └── fingerprint.ts    # Vote deduplication
└── types/                 # TypeScript types
```

### Data Model

Four tables: `plugins`, `votes`, `comments`, `github_metrics_history`

- **plugins**: Core entity with name, github_url, category (mcp/skill/hook/command), elo_score, github_stars
- **votes**: Pairwise voting records (winner_id, loser_id, voter_fingerprint)
- **comments**: Anonymous comments per plugin

### Scoring System

Three ranking types:
- **Now**: ELO (60%) + GitHub stars (40%) hybrid
- **Trend**: 60-day stars growth weighted
- **Classic**: All-time GitHub stars weighted

ELO updates on each vote using Bradley-Terry model (K=32, initial=1500).

### Vote Deduplication

Uses Cookie + IP hash (`voter_fingerprint`) to prevent duplicate votes on same pair within 24h. Different pairs can be voted freely.

### Smart Matchmaking

Vote pairs are selected using a tier-based matching algorithm for more reliable rankings:
- Plugins are divided into tiers based on ELO score
- Top-tier plugins are prioritized for pairing (topTierBias)
- Pairs are selected from same/adjacent tiers (85% default)
- ELO difference is limited (max 300 by default)
- Low-vote plugins get selection boost for faster ranking convergence

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_TOKEN              # For /admin access
GITHUB_TOKEN             # Optional: GitHub API rate limits
```

### Matchmaking Settings (Optional)

Smart matching pairs plugins with similar ELO scores for more reliable rankings:
```
MATCHMAKING_TIER_COUNT=5          # Number of tiers (default: 5)
MATCHMAKING_SAME_TIER_PROB=0.85   # Same/adjacent tier selection rate (default: 0.85)
MATCHMAKING_TOP_TIER_BIAS=1.5     # Top tier selection bias (default: 1.5)
MATCHMAKING_MAX_ELO_DIFF=300      # Max ELO difference between pairs (default: 300)
MATCHMAKING_LOW_VOTE_THRESHOLD=10 # Low vote count threshold (default: 10)
MATCHMAKING_LOW_VOTE_BOOST=2.0    # Selection boost for low-vote plugins (default: 2.0)
```

## Documentation

**作業前に必ず `docs/` 配下のドキュメントを参照すること。**

- `docs/requirement.md` - 要件定義書（機能仕様、スコアリング要件）
- `docs/tickets/` - 開発チケット（並行開発用タスク管理）

## Additional Requirements

ユーザーから追加要件の開発依頼を受け取った場合は、以下の手順で対応すること：

1. **要件の記録**: `docs/additional.md` に追加要件を追記する
2. **チケット作成**: `docs/tickets/` 配下に新しいチケットファイルを作成する（PA-XXX形式）
3. **ユーザ認証**: 開発を開始する前にユーザに開発を進めても良いか確認する

## Development Tickets

See `docs/tickets/` for parallel development tasks:
- PA-001: Database setup
- PA-002: Collection batch (GitHub discovery)
- PA-003: Score update batch
- PA-004: Frontend improvements
- PA-005: Admin completion
- PA-006: Test data seeding
- PA-007: E2E tests
- PA-008: Vercel deploy

**タスク完了時**: 該当チケットファイルのチェックボックスを更新し、ステータスを「Done」に変更すること。

## Database Migration

Apply schema via Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
```
