const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const f of ['a1','a2']){const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/'+f+'.html');
const r=await p.evaluate(()=>{document.querySelectorAll('.inp[data-answer]').forEach(i=>{i.value=i.dataset.answer.split('|')[0]});
document.querySelectorAll('.mc').forEach(m=>{const c=m.dataset.correct;[...m.querySelectorAll('.opt')].find(o=>o.textContent.trim()===c)?.click()});
const bt=[...document.querySelectorAll('.check-btn[data-group]')];bt.forEach(x=>x.click());
const bad=[];document.querySelectorAll('.check-row').forEach(r=>{const t=(r.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);if(t&&t[1]!==t[2])bad.push(t[0])});
return {g:bt.length,bad,st:document.querySelectorAll('.st').length}});
// audio lookups
const miss=await p.evaluate(async()=>{const j=await (await fetch('audio/index.json')).json();let m=0;document.querySelectorAll('.lat-word, .bubble').forEach(el=>{var c=el.cloneNode(true);[].forEach.call(c.querySelectorAll('.ru'),n=>n.remove());var t=(c.textContent||'').replace(/\s+/g,' ').trim();if(t&&!j[t])m++});return m});
console.log(f,JSON.stringify(r),'missingAudio',miss,errs)}
await b.close()})()
