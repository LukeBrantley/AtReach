import {makeSeed} from '../src/seed.ts';
import {mutateCase,ValidationError,type Case} from '../src/domain.ts';
export type Statement={bind(...args:any[]):Statement;all():Promise<{results:any[]}>;first():Promise<any>;run():Promise<any>};
export type Database={prepare(sql:string):Statement;batch(items:Statement[]):Promise<any[]>};
export async function api(request:Request,db:Database){
 const u=new URL(request.url);const json=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 try{
 if(request.method==='POST'){
 const origin=request.headers.get('origin');if(origin&&origin!==u.origin)return json({error:'Cross-origin writes are not allowed.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON content type required.'},415);
 }
 if(u.pathname==='/api/state'&&request.method==='GET'){
 const [m,c]=await Promise.all([db.prepare('SELECT payload FROM members ORDER BY id').all(),db.prepare('SELECT payload,revision FROM cases ORDER BY id').all()]);
 return json({members:m.results.map(r=>JSON.parse(r.payload)),cases:c.results.map(r=>({...JSON.parse(r.payload),revision:r.revision})),serverTime:new Date().toISOString(),synthetic:true});
 }
 if(u.pathname==='/api/seed'&&request.method==='POST'){
 const {members,cases}=makeSeed();const stmts=[...members.map(m=>db.prepare('INSERT OR IGNORE INTO members (id,payload) VALUES (?,?)').bind(m.id,JSON.stringify(m))),...cases.map(c=>db.prepare('INSERT OR IGNORE INTO cases (id,member_id,payload,revision) VALUES (?,?,?,0)').bind(c.id,c.memberId,JSON.stringify(c)))];
 await db.batch(stmts);return json({ok:true});
 }
 const match=u.pathname.match(/^\/api\/cases\/([A-Za-z0-9-]+)$/);
 if(match&&request.method==='POST'){
 const body=await request.json() as any;
 const row=await db.prepare('SELECT payload,revision FROM cases WHERE id=?').bind(match[1]).first();if(!row)return json({error:'Case not found.'},404);
 if(!Number.isInteger(body.revision)||body.revision!==row.revision)return json({error:'This case changed in another session. Refresh and review the latest record before saving.'},409);
 const c={...JSON.parse(row.payload),revision:row.revision} as Case;
 const next=mutateCase(c,body,'Preview coordinator');
 // Display staff is a synthetic demo operator. Real hosted actor identity is retained separately.
 const newest=next.events[0] as any;if(newest)newest.actorId=request.headers.get('oai-authenticated-user-id')||'local-preview';
 const result=await db.prepare('UPDATE cases SET payload=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(next),c.id,c.revision).run();
 if((result.meta?.changes??result.changes??0)!==1)return json({error:'Concurrent update detected. Refresh the case before saving.'},409);
 return json({ok:true,case:next});
 }
 return json({error:'Route not found.'},404);
 }catch(e){if(e instanceof ValidationError)return json({error:e.message},400);if(e instanceof SyntaxError)return json({error:'Invalid JSON request.'},400);console.error('AtReach API error',e instanceof Error?e.message:'Unknown');return json({error:'The record could not be saved. Please retry or refresh.'},500)}
}
