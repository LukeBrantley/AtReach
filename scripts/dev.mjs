import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync} from 'node:fs';
import {api} from '../.local/api.mjs';
mkdirSync('.local',{recursive:true});
const sql=new DatabaseSync('.local/atreach.sqlite');sql.exec('PRAGMA foreign_keys = ON');
if(!sql.prepare("SELECT name FROM sqlite_master WHERE name='members'").get())sql.exec(readFileSync('drizzle/0000_fearless_champions.sql','utf8'));
function prepare(query){let values=[];return {bind(...v){values=v;return this},async all(){return {results:sql.prepare(query).all(...values)}},async first(){return sql.prepare(query).get(...values)||null},async run(){const r=sql.prepare(query).run(...values);return {meta:{changes:r.changes}}}}}
const db={prepare,async batch(items){sql.exec('BEGIN');try{const r=[];for(const s of items)r.push(await s.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}};
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{try{const host=req.headers.host||`localhost:${port}`;const url=`http://${host}${req.url}`;const chunks=[];for await(const c of req)chunks.push(c);const method=req.method||'GET';const request=new Request(url,{method,headers:req.headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(chunks)});let result;if(new URL(url).pathname.startsWith('/api/'))result=await api(request,db);else result=new Response(readFileSync('.local/page.html'),{headers:{'Content-Type':'text/html; charset=utf-8'}});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()))}catch(e){res.writeHead(500);res.end('Preview server error')}}).listen(port,'0.0.0.0',()=>console.log(`AtReach server on port ${port}`));
