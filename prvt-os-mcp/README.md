# PRVT OS MCP

A shared source-of-truth layer for PRVT . SORC that can be used by Claude and, where supported, ChatGPT through MCP.

## What this solves

Instead of copying context between AI platforms, both platforms can read/write the same PRVT OS database through MCP tools.

### Initial record types

- `business` — business model, positioning, revenue model
- `project` — active client/event/project records
- `lead` — brand/talent/event/partner prospects
- `partner` — current relationships
- `sop` — operating procedures
- `decision` — approved decisions and rationale
- `task` — work requiring action/approval
- `template` — outreach/decks/contracts/copy
- `financial` — approved financial facts and terms

## Safety model

The server is intentionally not connected to email, CRM sending, payments, or social accounts yet. It is a knowledge + workflow layer first. Greg remains final approver for consequential actions.

## Run locally

1. Install Node 20+.
2. `npm install`
3. `npm run dev`

The MCP server uses stdio for local clients. For ChatGPT's custom app or Claude API, deploy an HTTPS Streamable HTTP MCP endpoint and add authentication. OpenAI's current documentation says ChatGPT full MCP write support is available to Business/Enterprise/Edu workspaces; Pro supports custom MCP read/fetch in developer mode. Anthropic documents remote MCP connections for Claude/API.

## Recommended next production step

Move persistence from SQLite to a hosted Postgres/Supabase database and expose a secure `/mcp` Streamable HTTP endpoint with OAuth. Keep the same four core tools and add dedicated CRM/outreach tools only after approval rules are tested.
