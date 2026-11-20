import {api,type Database} from './api.ts';
import html from '../.local/page.html';
export default {async fetch(request:Request,env:{DB:Database}){
 if(new URL(request.url).pathname.startsWith('/api/'))return api(request,env.DB);
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':'no-store'}});
}};
