import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import https from "node:https";
import ipaddr from "ipaddr.js";
import { db } from "./db";

export type McpServerRecord = { id: string; companyId: string; name: string; endpoint: string; status: string; health: string; createdAt: string; updatedAt: string; lastHealthCheck: string | null; tools: McpToolRecord[] };
type McpToolRecord = { id: string; name: string; description: string; inputSchema: unknown; risk: string; enabled: boolean; discoveredAt: string };
let storageReady: Promise<void> | undefined;
function ensureMcpStorage() {
  storageReady ??= (async()=>{
    // Existing development processes can retain their database handle across hot reloads.
    await db().query("CREATE TABLE IF NOT EXISTS mcp_servers (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, endpoint TEXT NOT NULL, status TEXT NOT NULL, health TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, last_health_check TEXT)");
    await db().query("CREATE TABLE IF NOT EXISTS mcp_tools (id TEXT PRIMARY KEY, server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT NOT NULL, input_schema TEXT NOT NULL, risk TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0, discovered TEXT NOT NULL, UNIQUE(server_id,name))");
    await db().query("CREATE TABLE IF NOT EXISTS mcp_events (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE, type TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL)");
    await db().query("CREATE INDEX IF NOT EXISTS mcp_servers_company ON mcp_servers(company_id)");
    await db().query("CREATE INDEX IF NOT EXISTS mcp_events_company ON mcp_events(company_id,at)");
  })();
  return storageReady;
}
export function validateMcpEndpoint(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.port || url.username || url.password || url.hash) throw new Error("Use a public HTTPS MCP endpoint on port 443 without embedded credentials.");
  if (!url.hostname.includes(".") || /(^|\.)(localhost|local|internal|test)$/i.test(url.hostname)) throw new Error("The MCP endpoint must be a public host.");
  if (ipaddr.isValid(url.hostname) && !publicIp(url.hostname)) throw new Error("Private and reserved IP addresses are not allowed.");
  return url;
}
function publicIp(address: string) { try { return ipaddr.process(address).range() === "unicast"; } catch { return false; } }
function parseMessage(body: string, contentType: string) {
  if (contentType.includes("text/event-stream")) {
    const values = body.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trim());
    const message = values.map(value => { try { return JSON.parse(value); } catch { return null; } }).find(value => value?.result || value?.error);
    if (!message) throw new Error("MCP server did not return a JSON-RPC result.");
    return message;
  }
  try { return JSON.parse(body); } catch { throw new Error("MCP server returned invalid JSON."); }
}
export async function rpc(endpoint: string, message: object, sessionId?: string, expectResult = true, version = "2025-06-18", token?: string) {
  const url = validateMcpEndpoint(endpoint);
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(address => !publicIp(address.address))) throw new Error("MCP endpoint resolves to a private or reserved address.");
  const address = addresses[0];
  const payload = JSON.stringify(message);
  return new Promise<{ message: Record<string, unknown>; sessionId?: string }>((resolve, reject) => {
    const request = https.request(url, { method: "POST", family: address.family, lookup: (_host, _options, callback) => callback(null, address.address, address.family),
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": version, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}), "Content-Length": Buffer.byteLength(payload) }, timeout: 8000 }, response => {
      if ((response.statusCode || 500) < 200 || (response.statusCode || 500) >= 300) { response.resume(); reject(new Error(`MCP endpoint returned HTTP ${response.statusCode}.`)); return; }
      const chunks: Buffer[] = []; let size = 0;
      response.on("data", (chunk: Buffer) => { size += chunk.length; if (size > 128_000) response.destroy(new Error("MCP response exceeded 128 KB.")); else chunks.push(chunk); });
      response.on("error", reject);
      response.on("end", () => { try { const body=Buffer.concat(chunks).toString("utf8"); resolve({ message: !expectResult && !body.trim() ? {} : parseMessage(body, String(response.headers["content-type"] || "")), sessionId: String(response.headers["mcp-session-id"] || sessionId || "") || undefined }); } catch (error) { reject(error); } });
    });
    request.on("timeout", () => request.destroy(new Error("MCP endpoint timed out.")));
    request.on("error", reject); request.end(payload);
  });
}
async function discoverMcpTools(endpoint: string): Promise<{ name: string; description: string; inputSchema: unknown }[]> {
  const init = await rpc(endpoint, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "AI Pod", version: "0.1.0" } } });
  if (init.message.error || !init.message.result) throw new Error("MCP initialization failed.");
  const version = String((init.message.result as { protocolVersion?: string }).protocolVersion || "2025-06-18");
  await rpc(endpoint, { jsonrpc: "2.0", method: "notifications/initialized" }, init.sessionId, false, version);
  const result = await rpc(endpoint, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, init.sessionId, true, version);
  if (result.message.error) throw new Error("MCP tool discovery failed.");
  const tools = (result.message.result as { tools?: unknown[] } | undefined)?.tools;
  if (!Array.isArray(tools)) throw new Error("MCP server returned no valid tools list.");
  return tools.slice(0, 100).filter((tool): tool is { name: string; description?: string; inputSchema?: unknown } => !!tool && typeof tool === "object" && typeof (tool as { name?: unknown }).name === "string").map(tool => ({ name: tool.name.slice(0,120), description: String(tool.description || "").slice(0,1000), inputSchema: tool.inputSchema || {} }));
}
export async function listMcpServers(companyId: string): Promise<McpServerRecord[]> {
  await ensureMcpStorage();
  const rows = await db().all("SELECT * FROM mcp_servers WHERE company_id=? ORDER BY created DESC", [companyId]);
  const result: McpServerRecord[] = [];
  for (const row of rows) {
    const tools = await db().all("SELECT * FROM mcp_tools WHERE server_id=? ORDER BY name", [String(row.id)]);
    result.push({ id: String(row.id), companyId, name: String(row.name), endpoint: String(row.endpoint), status: String(row.status), health: String(row.health), createdAt: String(row.created), updatedAt: String(row.updated), lastHealthCheck: row.last_health_check ? String(row.last_health_check) : null,
      tools: tools.map(tool => ({ id: String(tool.id), name: String(tool.name), description: String(tool.description), inputSchema: JSON.parse(String(tool.input_schema)), risk: String(tool.risk), enabled: Number(tool.enabled) === 1, discoveredAt: String(tool.discovered) })) });
  }
  return result;
}
export async function addMcpServer(companyId: string, name: string, endpoint: string) {
  await ensureMcpStorage();
  const url = validateMcpEndpoint(endpoint); const id = randomUUID(); const now = new Date().toISOString();
  await db().query("INSERT INTO mcp_servers(id,company_id,name,endpoint,status,health,created,updated,last_health_check) VALUES(?,?,?,?,?,?,?,?,NULL)", [id,companyId,name,url.href,"DISCONNECTED","Not checked",now,now]);
  await mcpEvent(companyId,id,"SERVER_ADDED","Public HTTPS endpoint registered; no tools have been enabled.");
  return id;
}
async function mcpEvent(companyId: string, serverId: string, type: string, detail: string) {
  await ensureMcpStorage();
  await db().query("INSERT INTO mcp_events(id,company_id,server_id,type,detail,at) VALUES(?,?,?,?,?,?)", [randomUUID(),companyId,serverId,type,detail,new Date().toISOString()]);
}
export async function refreshMcpServer(companyId: string, serverId: string, endpoint: string) {
  await ensureMcpStorage();
  const now = new Date().toISOString();
  try {
    const tools = await discoverMcpTools(endpoint);
    await db().query("DELETE FROM mcp_tools WHERE server_id=?", [serverId]);
    for (const tool of tools) await db().query("INSERT INTO mcp_tools(id,server_id,name,description,input_schema,risk,enabled,discovered) VALUES(?,?,?,?,?,'Unreviewed',0,?)", [randomUUID(),serverId,tool.name,tool.description,JSON.stringify(tool.inputSchema),now]);
    await db().query("UPDATE mcp_servers SET status='MCP_READY',health=?,updated=?,last_health_check=? WHERE id=? AND company_id=?", [`${tools.length} tools discovered · execution disabled`,now,now,serverId,companyId]);
    await mcpEvent(companyId,serverId,"TOOLS_DISCOVERED",`${tools.length} tools discovered; none authorized for execution.`);
  } catch (error) {
    const detail = (error as Error).message.slice(0,240);
    await db().query("UPDATE mcp_servers SET status='MCP_UNAVAILABLE',health=?,updated=?,last_health_check=? WHERE id=? AND company_id=?", [detail,now,now,serverId,companyId]);
    await mcpEvent(companyId,serverId,"DISCOVERY_FAILED",detail);
  }
}
