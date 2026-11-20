export type Network = 'in_network' | 'out_of_network' | 'unknown';
export type Provider = { id: string; name: string; network: Network };
export type Member = {id:string; name:string; mrn:string; dob:string; phone:string; email:string; preference:string};
export const CONTACTS = ['No answer','Message left','Invalid contact information','Callback requested','Discussion completed','Member declined discussion','Communication assistance needed','Other / interrupted'] as const;
export const FINDINGS = ['Current PCP confirmed','Member unsure of current PCP','Historical PCP identified; current relationship unconfirmed','Member reports no current PCP','Member declined to identify PCP','Not assessed'] as const;
export const PREFERENCES = ['Retain confirmed PCP','Wants a different PCP','Undecided','Not assessed'] as const;
export const NEXT_STEPS = ['Member plans to contact payer','PCP-change assistance requested','Member plans to schedule','Scheduling assistance requested','Appointment already scheduled','Appointment scheduled during outreach','Follow-up discussion needed','Internal review needed','No action requested','No next step established'] as const;
export const CLOSURE_REASONS = ['Member declines further assistance','Unable to reach — manual closure','No longer eligible','Record corrected or duplicate'] as const;
export const STAFF = ['Preview coordinator','Morgan Ellis','Sam Rivera','Jamie Chen'];
export type Attempt = {id:string; at:string; recordedAt:string; staff:string; method:string; reached:boolean; contact:string; finding:string; pcp:string; preference:string; historicalTiming:string; nextSteps:string[]; notes:string; committed:boolean};
export type Evidence = {reference:string; provider:string; effectiveDate:string; verifiedAt:string; staff:string; kind:string};
export type Event = {id:string; at:string; staff:string; title:string; detail:string};
export type Case = {
 id:string; memberId:string; payer:string; plan:string; memberNumber:string; contract:string; risk:'yes'|'no'|'unknown';
 payerProvider:Provider; modelProvider:Provider; source:string; flag:string; scope:'payer_relationship'|'unknown';
 claims:number|null; claimsComplete:boolean; inVisits:number|null; outVisits:number|null; lastIn:string|null; lastOut:string|null;
 payerAsOf:string; modelAsOf:string; received:string; modelRun:string; windowStart:string; windowEnd:string;
 owner:string|null; status:'new'|'action'|'waiting'|'closed_confirmed'|'closed_unresolved'; due:string|null; nextAction:string;
 requestDate:string|null; requestEvidence:string; requestBasis:string; attempts:Attempt[]; events:Event[];
 closureReason:string; closureNotes:string; evidence:Evidence|null; revision:number;
 milestones:{outreachedAt:string|null; engagedAt:string|null; committedAt:string|null; convertedAt:string|null; recognizedAt:string|null};
};
export function eligibility(c:Case):{state:'eligible'|'review'|'excluded';priority:1|2|null;reason:string}{
 if(c.risk==='no') return {state:'excluded',priority:null,reason:'Not in the eligible ACO risk arrangement.'};
 if(c.claimsComplete && c.claims===0) return {state:'excluded',priority:null,reason:'Verified zero qualifying claims; excluded under the MVP rule.'};
 if(c.risk==='unknown'||c.scope==='unknown'||!c.claimsComplete||c.claims===null) return {state:'review',priority:null,reason:'Eligibility needs review: claims, accountability, or model scope is incomplete.'};
 if(!c.payerProvider.id||!c.modelProvider.id) return {state:'review',priority:null,reason:'Provider identity is missing; the comparison needs review.'};
 if(c.payerProvider.id===c.modelProvider.id) return {state:'excluded',priority:null,reason:'Payer and model provider assignments agree; no attribution mismatch.'};
 if(c.modelProvider.network==='out_of_network') return {state:'eligible',priority:1,reason:'Payer and model PCP assignments differ; model-selected PCP is OON.'};
 if(c.modelProvider.network==='in_network'&&c.payerProvider.network==='in_network') return {state:'eligible',priority:2,reason:'Payer and model select different in-network PCPs.'};
 return {state:'review',priority:null,reason:'Provider network status or this mismatch pattern needs priority review.'};
}
export const isClosed=(c:Case)=>c.status.startsWith('closed');
export function dayOffset(days:number, base=new Date()){const d=new Date(base);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
export function isOverdue(c:Case,today=new Date().toISOString().slice(0,10)){return !isClosed(c)&&!!c.due&&c.due<today}
export const STATUS_LABELS:Record<Case['status'],string>={new:'Not yet outreached',action:'Action needed',waiting:'Awaiting payer update',closed_confirmed:'Closed — payer confirmed',closed_unresolved:'Closed — unresolved'};
export function totalAttempts(cases:Case[],memberId:string){return cases.filter(c=>c.memberId===memberId).reduce((n,c)=>n+c.attempts.length,0)}
export class ValidationError extends Error{}
function requireText(v:unknown,label:string){if(typeof v!=='string'||!v.trim())throw new ValidationError(`${label} is required.`);return v.trim()}
function validDate(v:unknown,label:string){const s=requireText(v,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw new ValidationError(`${label} must be a valid date.`);return s}
function allowed(v:unknown,options:readonly string[],label:string){const s=requireText(v,label);if(!options.includes(s))throw new ValidationError(`Choose a valid ${label.toLowerCase()}.`);return s}
export type Mutation={action:string;[key:string]:any};
export function mutateCase(original:Case,input:Mutation,staff:string,now=new Date().toISOString()):Case{
 const c=structuredClone(original);const date=now.slice(0,10);
 const event=(title:string,detail:string)=>c.events.unshift({id:crypto.randomUUID(),at:now,staff,title,detail});
 if(input.action==='assign'){
  if(isClosed(c))throw new ValidationError('Reopen the case before changing ownership.');
  c.owner=allowed(input.owner,STAFF,'owner');event('Ownership updated',`Assigned to ${c.owner}.`);
 }else if(input.action==='outreach'){
  if(isClosed(c))throw new ValidationError('Reopen the case before recording a new attempt.');
  if(eligibility(c).state!=='eligible')throw new ValidationError('Resolve eligibility review before recording prototype outreach.');
  const contact=allowed(input.contact,CONTACTS,'contact result');const finding=allowed(input.finding,FINDINGS,'PCP finding');
  const preference=allowed(input.preference,PREFERENCES,'PCP preference');const reached=input.reached===true;
  if(['No answer','Message left','Invalid contact information'].includes(contact)&&reached)throw new ValidationError('This contact result cannot also indicate the member was reached.');
  if(['Callback requested','Discussion completed','Member declined discussion'].includes(contact)&&!reached)throw new ValidationError('This result requires member contact.');
  if(!reached&&(finding!=='Not assessed'||preference!=='Not assessed'))throw new ValidationError('Use Not assessed when the member was not reached.');
  const steps=input.nextSteps;if(!Array.isArray(steps)||!steps.length||steps.some((s:any)=>!NEXT_STEPS.includes(s)))throw new ValidationError('Choose at least one valid next step.');
  if(steps.includes('No next step established')&&steps.length>1)throw new ValidationError('No next step established cannot be combined with another choice.');
  if(steps.includes('No action requested')&&steps.some((s:string)=>s!=='No action requested'&&s!=='Internal review needed'))throw new ValidationError('No action requested conflicts with a member action or assistance request.');
  if(!reached&&steps.some((s:string)=>!['No next step established','Internal review needed','Follow-up discussion needed'].includes(s)))throw new ValidationError('Do not record member plans or requests without reaching the member.');
  const pcp=String(input.pcp||'').trim();if(['Current PCP confirmed','Historical PCP identified; current relationship unconfirmed'].includes(finding)&&!pcp)throw new ValidationError('Record the provider identified by the member.');
  if(preference==='Retain confirmed PCP'&&finding!=='Current PCP confirmed')throw new ValidationError('Retain confirmed PCP requires a confirmed current PCP.');
  const notes=String(input.notes||'').trim();if(contact==='Other / interrupted'&&!notes)throw new ValidationError('Add a brief note for Other / interrupted.');
  const at=requireText(input.at,'Attempt date/time');if(Number.isNaN(Date.parse(at))||Date.parse(at)>Date.parse(now)+60000)throw new ValidationError('Attempt date/time must be valid and cannot be in the future.');
  const method=allowed(input.method,['Phone','Email','Portal','Other'],'contact method');
  const committed=input.committed===true;if(committed&&(!reached||!steps.some((s:string)=>['Member plans to contact payer','Member plans to schedule'].includes(s))))throw new ValidationError('A verbal commitment requires member contact and an explicit payer-contact or scheduling plan.');
  const historicalTiming=finding.startsWith('Historical')?allowed(input.historicalTiming,['Yes','No','Unknown'],'historical care timing'):'Unknown';
  c.attempts.unshift({id:crypto.randomUUID(),at:new Date(at).toISOString(),recordedAt:now,staff,method,reached,contact,finding,pcp,preference,historicalTiming,nextSteps:steps,notes,committed});
  const earliest=(old:string|null,v:string)=>!old||v<old?v:old;
  c.milestones.outreachedAt=earliest(c.milestones.outreachedAt,at);
  if(reached)c.milestones.engagedAt=earliest(c.milestones.engagedAt,at);
  if(committed)c.milestones.committedAt=earliest(c.milestones.committedAt,at);
  if(!c.owner)c.owner=staff;
  c.status='action';c.due=c.due||dayOffset(7,new Date(now));c.nextAction=c.nextAction||'Review outreach outcome and agree next action.';
  event('Outreach recorded',`${contact}. ${steps.join('; ')}.`);
 }else if(input.action==='followup'){
  if(isClosed(c))throw new ValidationError('Reopen the case before editing follow-up.');
  c.owner=allowed(input.owner,STAFF,'owner');c.due=validDate(input.due,'Review date');c.nextAction=requireText(input.nextAction,'Next action');
  c.status=allowed(input.status,['action','waiting'],'follow-up category') as Case['status'];
  if(c.status==='waiting'){
   c.requestDate=validDate(input.requestDate,'Request date');if(c.requestDate>date)throw new ValidationError('Request date cannot be in the future.');
   c.requestEvidence=requireText(input.requestEvidence,'Submission evidence/reference');c.requestBasis=allowed(input.requestBasis,['Member-reported','Independently confirmed'],'submission evidence basis');
   if(input.actionsComplete!==true)throw new ValidationError('Confirm required actions are documented as completed before waiting.');
  }
  event('Follow-up updated',`${STATUS_LABELS[c.status]}; review ${c.due}; ${c.nextAction}`);
 }else if(input.action==='close_unresolved'){
  if(isClosed(c))throw new ValidationError('This case is already closed.');
  c.closureReason=allowed(input.reason,CLOSURE_REASONS,'closure reason');c.closureNotes=requireText(input.notes,'Supporting closure context');
  c.status='closed_unresolved';event('Closed — unresolved',`${c.closureReason}. ${c.closureNotes}`);
 }else if(input.action==='close_confirmed'){
  if(isClosed(c))throw new ValidationError('This case is already closed.');
  const reference=requireText(input.reference,'Payer evidence/reference');const provider=requireText(input.provider,'Confirmed provider');
  const effectiveDate=validDate(input.effectiveDate,'Assignment effective date');if(effectiveDate>date)throw new ValidationError('A future effective assignment remains awaiting payer update.');
  if(input.verified!==true)throw new ValidationError('Confirm the authoritative payer evidence matches this member, payer relationship, and intended provider.');
  c.evidence={reference,provider,effectiveDate,verifiedAt:now,staff,kind:'Authoritative payer assignment'};
  c.status='closed_confirmed';c.milestones.recognizedAt=c.milestones.recognizedAt||now;
  if(input.payerFileChange===true)c.milestones.convertedAt=c.milestones.convertedAt||now;
  event('Closed — payer confirmed',`${provider}, effective ${effectiveDate}. Evidence: ${reference}.`);
 }else if(input.action==='reopen'){
  if(!isClosed(c))throw new ValidationError('Only closed cases can be reopened.');
  const reason=requireText(input.reason,'Reopening reason');c.owner=allowed(input.owner,STAFF,'owner');c.due=validDate(input.due,'Review date');c.nextAction=requireText(input.nextAction,'Next action');c.status='action';
  event('Case manually reopened',`${reason}. Prior closure and member requests remain in history; reopening is not permission to contact.`);
 }else throw new ValidationError('Unknown action.');
 c.revision++;return c;
}
