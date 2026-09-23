# PRVT OS MCP

Remote Streamable HTTP MCP server for PRVT . SORC. Designed to be connected to Claude via a custom remote MCP connector and later to other MCP-capable clients.

## Endpoints

- `GET /health` — service health check
- `POST /mcp` — MCP Streamable HTTP endpoint

## Deploy on Render

- Runtime: Docker
- Root Directory: `prvt-os-mcp` (because this repository currently contains the project in that subdirectory)
- Branch: `main`
- The container listens on `0.0.0.0:$PORT`.

## Important security note

This MVP is intentionally an authless prototype. Do not put confidential PRVT data into it until authentication is added. Claude supports authless and OAuth remote MCP servers; production PRVT deployment should use OAuth or another supported authenticated architecture.
