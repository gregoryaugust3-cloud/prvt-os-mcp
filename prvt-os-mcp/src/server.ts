import Database from 'better-sqlite3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const db = new Database(process.env.PRVT_DB || './prvt-os.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 type TEXT NOT NULL,
 title TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active',
 owner TEXT NOT NULL DEFAULT 'Greg',
 priority TEXT NOT NULL DEFAULT 'normal',
 content TEXT NOT NULL DEFAULT '',
 metadata TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_items_type_status ON items(type,status);
CREATE INDEX IF NOT EXISTS idx_items_updated ON items(updated_at);
`);

const server = new McpServer({
  name: 'prvt-os',
  version: '0.1.0'
}, {
  instructions: `PRVT OS is the shared source of truth for PRVT . SORC. Use it before relying on assumptions about PRVT. Read before writing. Write only approved changes. Greg is the final human approver for consequential actions. Do not send outreach, alter contracts, or commit financial decisions without explicit approval.`
});

const json = (x: unknown) => JSON.stringify(x, null, 2);

server.tool('search_prvt', 'Search PRVT OS for projects, leads, partners, SOPs, decisions, or other records.',
  { query: z.string(), type: z.string().optional(), status: z.string().optional(), limit: z.number().int().min(1).max(50).default(20) },
  async ({query,type,status,limit}) => {
    const like = `%${query}%`;
    const rows = db.prepare(`SELECT * FROM items WHERE (title LIKE ? OR content LIKE ?) ${type?'AND type = ?':''} ${status?'AND status = ?':''} ORDER BY updated_at DESC LIMIT ?`)
      .all(...([like,like,...(type?[type]:[]),...(status?[status]:[]),limit] as any[]));
    return {content:[{type:'text',text:json(rows)}]};
  });

server.tool('get_prvt_item', 'Retrieve one PRVT OS record by numeric ID.',
  { id: z.number().int() },
  async ({id}) => {
    const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    return {content:[{type:'text',text:json(row || null)}]};
  });

server.tool('upsert_prvt_item', 'Create or update a PRVT OS record. Use for approved knowledge, decisions, SOPs, pipeline records, and project updates.',
  { id: z.number().int().optional(), type: z.string(), title: z.string(), status: z.string().default('active'), owner: z.string().default('Greg'), priority: z.string().default('normal'), content: z.string(), metadata: z.record(z.string(), z.any()).default({}) },
  async (input) => {
    const metadata = JSON.stringify(input.metadata ?? {});
    if (input.id) {
      db.prepare(`UPDATE items SET type=?,title=?,status=?,owner=?,priority=?,content=?,metadata=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .run(input.type,input.title,input.status,input.owner,input.priority,input.content,metadata,input.id);
      return {content:[{type:'text',text:json(db.prepare('SELECT * FROM items WHERE id=?').get(input.id))}]};
    }
    const r = db.prepare(`INSERT INTO items(type,title,status,owner,priority,content,metadata) VALUES(?,?,?,?,?,?,?)`)
      .run(input.type,input.title,input.status,input.owner,input.priority,input.content,metadata);
    return {content:[{type:'text',text:json(db.prepare('SELECT * FROM items WHERE id=?').get(r.lastInsertRowid))}]};
  });

server.tool('list_prvt', 'List current PRVT OS records by type/status.',
  { type: z.string().optional(), status: z.string().optional(), limit: z.number().int().min(1).max(100).default(50) },
  async ({type,status,limit}) => {
    const rows = db.prepare(`SELECT id,type,title,status,owner,priority,updated_at FROM items WHERE 1=1 ${type?'AND type=?':''} ${status?'AND status=?':''} ORDER BY updated_at DESC LIMIT ?`)
      .all(...([...(type?[type]:[]),...(status?[status]:[]),limit] as any[]));
    return {content:[{type:'text',text:json(rows)}]};
  });

const transport = new StdioServerTransport();
await server.connect(transport);
