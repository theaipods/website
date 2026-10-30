import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { db } from "./db";
import { ApiError } from "./auth";
import { audit, companyFor } from "./repository";
import { rpc, validateMcpEndpoint } from "./mcp";

export type ProfileTool = { name: string; description: string; inputSchema: unknown; enabled: boolean };
export type ProfileServer = { id: string; name: string; endpoint: string; hasToken: boolean; tools: ProfileTool[] };
function key() {
  const value = process.env.MCP_SECRET_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new ApiError(503, "Set MCP_SECRET_KEY to 32 random bytes encoded as 64 hexadecimal characters, then restart both processes.");
  return Buffer.from(value, "hex");
}
export function sealToken(token: string) {
  if (!token) return "";
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(b => b.toString("base64")).join(".");
}
export function openToken(value: string) {
  if (!value) return "";
  const [iv, tag, data] = value.split(".").map(s => Buffer.from(s, "base64"));
  const cipher = createDecipheriv("aes-256-gcm", key(), iv); cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8");
}
async function record(owner: string, id: string) {
  const row = await db().one("SELECT * FROM profile_mcp WHERE id=? AND owner_id=?", [id, owner]);
  if (!row) throw new ApiError(404, "MCP connection not found in your profile.");
  return row;
}
export async function profileServers(owner: string): Promise<ProfileServer[]> {
  return (await db().all("SELECT id,name,endpoint,secret,tools FROM profile_mcp WHERE owner_id=?", [owner])).map(row => ({ id: String(row.id), name: String(row.name), endpoint: String(row.endpoint), hasToken: !!row.secret, tools: JSON.parse(String(row.tools)) }));
}
export async function addProfileServer(owner: string, name: string, endpoint: string, token: string) {
  try { validateMcpEndpoint(endpoint); } catch (e) { throw new ApiError(400, (e as Error).message); }
  if ((await profileServers(owner)).length >= 20) throw new ApiError(400, "Your profile supports up to 20 MCP servers.");
  const id = randomUUID();
  await db().query("INSERT INTO profile_mcp(id,owner_id,name,endpoint,secret,tools,updated) VALUES(?,?,?,?,?,'[]',?)", [id, owner, name, endpoint, sealToken(token), new Date().toISOString()]);
  await audit(owner, null, `Added profile MCP connection ${name}`); return id;
}
async function connect(endpoint: string, token: string) {
  const init = await rpc(endpoint, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "AI Pods", version: "1.0" } } }, undefined, true, "2025-06-18", token);
  if (init.message.error || !init.message.result) throw new ApiError(502, "MCP initialization failed.");
  const version = String((init.message.result as {protocolVersion?: string}).protocolVersion || "2025-06-18");
  await rpc(endpoint, { jsonrpc: "2.0", method: "notifications/initialized" }, init.sessionId, false, version, token);
  return { sessionId: init.sessionId, version };
}
export async function discoverProfileServer(owner: string, id: string) {
  const row = await record(owner, id); const endpoint = String(row.endpoint); const token = openToken(String(row.secret));
  const session = await connect(endpoint, token); const tools: ProfileTool[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const response = await rpc(endpoint, {jsonrpc:"2.0",id:page+2,method:"tools/list",params:cursor?{cursor}:{}}, session.sessionId, true, session.version, token);
    const result = response.message.result as { tools?: {name:string;description?:string;inputSchema?:unknown}[]; nextCursor?: string } | undefined;
    if (response.message.error || !Array.isArray(result?.tools)) throw new ApiError(502, "MCP discovery failed.");
    for (const tool of result.tools) if (typeof tool.name === "string") tools.push({name:tool.name.slice(0,120),description:String(tool.description || "").slice(0,1000),inputSchema:tool.inputSchema || {},enabled:false});
    cursor = result.nextCursor;
    if (!cursor) break;
  }
  if (cursor || tools.length > 100) throw new ApiError(400, "This endpoint exposes too many tools. Use a scoped server with at most 100 tools.");
  await db().query("UPDATE profile_mcp SET tools=?,updated=? WHERE id=? AND owner_id=?", [JSON.stringify(tools),new Date().toISOString(),id,owner]);
  await audit(owner,null,`Discovered ${tools.length} profile MCP tools; grants reset`);
}
export async function grantProfileTool(owner: string, id: string, name: string, enabled: boolean) {
  const row = await record(owner,id); const tools: ProfileTool[] = JSON.parse(String(row.tools));
  const tool = tools.find(t=>t.name===name); if (!tool) throw new ApiError(404,"Tool not found.");
  tool.enabled=enabled;
  await db().query("UPDATE profile_mcp SET tools=?,updated=? WHERE id=? AND owner_id=?",[JSON.stringify(tools),new Date().toISOString(),id,owner]);
  await audit(owner,null,`${enabled?"Enabled read access":"Disabled"} profile MCP tool ${name}`);
}
export async function removeProfileServer(owner:string,id:string) {
  await record(owner,id); await db().query("DELETE FROM profile_mcp WHERE id=? AND owner_id=?",[id,owner]); await audit(owner,null,"Removed profile MCP connection");
}
export async function importProfileTool(owner:string,companyId:string,id:string,name:string,args:Record<string,unknown>) {
  const company = await companyFor(companyId,owner);
  if (!company.permissions.readKnowledge) throw new ApiError(403,"Company knowledge reading is disabled.");
  const row = await record(owner,id); const tools:ProfileTool[]=JSON.parse(String(row.tools));
  if (!tools.some(t=>t.name===name&&t.enabled)) throw new ApiError(403,"Enable this tool after confirming it only reads data.");
  const token=openToken(String(row.secret)); const endpoint=String(row.endpoint); const session=await connect(endpoint,token);
  await audit(owner,companyId,`Requested MCP read ${row.name}/${name}`);
  const response=await rpc(endpoint,{jsonrpc:"2.0",id:2,method:"tools/call",params:{name,arguments:args}},session.sessionId,true,session.version,token);
  const result=response.message.result as {isError?:boolean;content?:{type:string;text?:string}[];structuredContent?:unknown}|undefined;
  if(response.message.error||!result||result.isError) throw new ApiError(502,"MCP tool failed. No evidence was imported.");
  const output = result.structuredContent ? JSON.stringify(result.structuredContent,null,2) : (result.content || []).filter(c=>c.type==="text").map(c=>c.text||"").join("\n");
  if(!output.trim()) throw new ApiError(400,"This demo imports text or structured results only.");
  const kid=randomUUID(); const now=new Date().toISOString(); const content=`Source: MCP ${row.name}/${name}\nRetrieved: ${now}\n\n${output}`;
  await db().transaction(async query=>{
    await query("INSERT INTO knowledge(id,company_id,name,size,type,category,status,content,blob,created) VALUES(?,?,?,?,?,?,?,?,?,?)",[kid,companyId,`${row.name} - ${name}.txt`,Buffer.byteLength(content),"text/plain","MCP evidence","Text indexed",content,Buffer.from(content).toString("base64"),now]);
    for(let pos=0,ordinal=0;pos<content.length;pos+=1000,ordinal++) await query("INSERT INTO chunks(id,knowledge_id,company_id,content,ordinal) VALUES(?,?,?,?,?)",[`${kid}:${ordinal}`,kid,companyId,content.slice(pos,pos+1200),ordinal]);
  });
  await audit(owner,companyId,`Imported MCP evidence ${kid} from ${row.name}/${name}`);
  return {knowledgeId:kid,characters:content.length};
}
