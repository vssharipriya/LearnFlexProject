'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const CHROME=process.env.CHROME_BIN||'/usr/bin/chromium';
const PORT=3317, DEBUG_PORT=9339, ROOT=path.resolve(__dirname,'..');
const BASE=`http://localhost:${PORT}`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function poll(fn,desc,timeout=12000){const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await wait(120)}throw new Error(`Timed out: ${desc}`)}
async function evaluate(cdp,expression){const r=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||'Browser evaluation failed');return r.result?.value}
class DevTools {
 constructor(ws){this.ws=ws;this.id=0;this.pending=new Map();ws.addEventListener('message',ev=>{const msg=JSON.parse(ev.data);if(msg.id&&this.pending.has(msg.id)){const p=this.pending.get(msg.id);this.pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result)}})}
 static async connect(url){const ws=new WebSocket(url);await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});return new DevTools(ws)}
 send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
 close(){this.ws.close()}
}
(async()=>{
 assert.ok(fs.existsSync(CHROME),`Chromium not found at ${CHROME}; set CHROME_BIN to your Chromium/Chrome executable.`);
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'learnflex-browser-'));
 const server=spawn(process.execPath,['server.js'],{cwd:ROOT,env:{...process.env,HOST:'0.0.0.0',PORT:String(PORT),LEARNFLEX_DATA_DIR:dataDir,LEARNFLEX_RETENTION_DAYS:'0'},stdio:'ignore'});
 const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-proxy-server','--proxy-server=direct://','--proxy-bypass-list=*',`--remote-debugging-port=${DEBUG_PORT}`,`--user-data-dir=${path.join(dataDir,'chrome')}`,'about:blank'],{stdio:'ignore'});
 let cdp;
 try {
  await poll(async()=>{try{const r=await fetch(BASE+'/api/health');return r.ok}catch(_){return false}},'app server startup');
  const version=await poll(async()=>{try{const r=await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);return r.ok?r.json():false}catch(_){return false}},'Chromium remote debugging startup');
  const targetResponse=await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${BASE}/`,{method:'PUT'});
  const target=await targetResponse.json();
  cdp=await DevTools.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('Page.navigate',{url:BASE+'/'});await wait(900);const pageDiagnostic=await evaluate(cdp,"({href:location.href,title:document.title,body:document.body?.innerText?.slice(0,180)})");if(pageDiagnostic.href.startsWith('chrome-error:')&&/blocked|organization/i.test(pageDiagnostic.body||'')){const e=new Error('Chromium policy blocks all URLs in this environment.');e.code='BROWSER_URL_BLOCKED';throw e;}
  async function pageReady(){return await poll(async()=>evaluate(cdp,"document.readyState==='complete' && !!document.querySelector('#chooseStudent')"),'LearnFlex page load')}
  async function signIn(id,password,role='student'){
    await evaluate(cdp,`document.querySelector('#${role==='student'?'chooseStudent':'chooseTeacher'}').click()`);
    await evaluate(cdp,`document.querySelector('#loginId').value=${JSON.stringify(id)};document.querySelector('#loginPassword').value=${JSON.stringify(password)};document.querySelector('#loginForm').requestSubmit()`);
    await poll(async()=>evaluate(cdp,"!document.querySelector('#appView').classList.contains('hidden')"),'login to app');
  }
  async function signOut(){await evaluate(cdp,"document.querySelector('#topProfile').click()");await poll(async()=>evaluate(cdp,"!document.querySelector('#roleView').classList.contains('hidden')"),'sign out')}
  async function openFractionQuiz(){
    await evaluate(cdp,"[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Continue learning'))?.click()");
    await poll(async()=>evaluate(cdp,"document.querySelectorAll('#topicGrid .lesson-card').length>0"),'topic list');
    await evaluate(cdp,"[...document.querySelectorAll('#topicGrid .lesson-card')].find(x=>x.textContent.includes('Fractions'))?.querySelector('button')?.click()");
    await poll(async()=>evaluate(cdp,"!!document.querySelector('#modalRoot button.btn.primary')"),'fractions lesson modal');
    await evaluate(cdp,"[...document.querySelectorAll('#modalRoot button.btn.primary')].find(x=>x.textContent.includes('Start practice'))?.click()");
    await poll(async()=>evaluate(cdp,"!!document.querySelector('.question-title')"),'quiz start');
  }
  await pageReady();
  // Student A: correct and confident history sends them to the challenge bank.
  await signIn('LF6001','learn123');await openFractionQuiz();
  const aTier=await evaluate(cdp,"document.querySelector('.question-count').textContent");
  assert.match(aTier,/challenge/i,`A should get challenge questions, got: ${aTier}`);
  assert.ok(await evaluate(cdp,"!!document.querySelector('#learnflexHintButton')"),'progressive hint control should be visible before answering');
  await evaluate(cdp,"document.querySelector('#learnflexHintButton').click()");
  assert.ok((await evaluate(cdp,"document.querySelector('.learnflex-progressive-hints').innerText")).includes('Hint 1'),'first progressive hint should be revealed');
  await signOut();
  // Student C: correct but low confidence receives the distinct reinforcement bank.
  await signOut();
  await signIn('LF6003','learn123');await openFractionQuiz();
  const cTier=await evaluate(cdp,"document.querySelector('.question-count').textContent");
  assert.match(cTier,/reinforcement/i,`C should get a distinct reinforcement bank, got: ${cTier}`);
  const cQuestion=await evaluate(cdp,"document.querySelector('.question-title').textContent");
  await signOut();
  // Student B: confident wrong answer triggers the mapped intervention and different follow-up item.
  await signIn('LF6002','learn123');await openFractionQuiz();
  const bTier=await evaluate(cdp,"document.querySelector('.question-count').textContent");
  assert.match(bTier,/foundation/i,`B should get foundation questions, got: ${bTier}`);
  const bQuestion=await evaluate(cdp,"document.querySelector('.question-title').textContent");
  assert.notEqual(bQuestion,cQuestion,'B and C should see different first questions');
  await evaluate(cdp,"document.querySelector('[onclick=\"chooseConfidence(\\'high\\')\"]').click()");
  await evaluate(cdp,"document.querySelector('[onclick=\"selectQuizOption(0)\"]').click()");
  await evaluate(cdp,"document.querySelector('[onclick=\"submitQuizAnswer()\"]').click()");
  await poll(async()=>evaluate(cdp,"!!document.querySelector('.intervention-card')"),'misconception intervention');
  const diagnostic=await evaluate(cdp,"document.querySelector('.intervention-card').innerText");
  for(const text of ['What you selected','Why this mistake can happen','A clearer explanation','What your teacher can do next'])assert.ok(diagnostic.includes(text),`missing diagnostic section ${text}`);
  await evaluate(cdp,"document.querySelector('[onclick=\"startTargetedCheck()\"]').click()");
  await poll(async()=>evaluate(cdp,"!!document.querySelector('.question-title')"),'targeted follow-up');
  const followupTier=await evaluate(cdp,"document.querySelector('.question-count').textContent");assert.match(followupTier,/verification/i);
  await evaluate(cdp,"document.querySelector('[onclick=\"chooseConfidence(\\'high\\')\"]').click()");
  await evaluate(cdp,"selectQuizOption(activeQuiz.questions[activeQuestion].answer)");
  await evaluate(cdp,"document.querySelector('[onclick=\"submitQuizAnswer()\"]').click()");
  await evaluate(cdp,"document.querySelector('[onclick=\"nextQuestion()\"]').click()");
  await poll(async()=>evaluate(cdp,"document.querySelector('#pageContent').innerText.includes('Improvement signal')"),'follow-up improvement signal');
  await signOut();
  // Teacher view shows only the assigned roster.
  await signIn('TEACH06','teach123','teacher');
  await evaluate(cdp,"document.querySelector('[data-page=\"students\"]').click()");
  await poll(async()=>evaluate(cdp,"document.querySelector('#pageContent').innerText.includes('Asha Demo')"),'Class 6 student page');
  const roster=await evaluate(cdp,"document.querySelector('#pageContent').innerText");
  assert.ok(!roster.includes('Aarav Sharma'),'Class 6 teacher must not see a Class 8 learner');
  console.log('✓ Chromium end-to-end: A challenge bank, B foundation intervention + follow-up, C distinct reinforcement bank, teacher roster isolation');
 } finally {
  if(cdp)cdp.close();chrome.kill('SIGTERM');server.kill('SIGTERM');
  await wait(300);fs.rmSync(dataDir,{recursive:true,force:true});
 }
 console.log('\nALL BROWSER SMOKE TESTS PASSED');
})().catch(e=>{if(e.code==='BROWSER_URL_BLOCKED'){console.warn('SKIPPED browser UI run: the container Chromium has a managed URLBlocklist=* policy. The browser test remains in the package and can run on a normal developer machine.');process.exitCode=0;}else{console.error(e);process.exitCode=1;}});
