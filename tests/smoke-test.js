'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const curriculum = require('../curriculum');
global.LEARNFLEX_CURRICULUM = curriculum;
require('../ncert-curriculum');
const engine = require('../adaptive-engine');
const root = path.resolve(__dirname, '..');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() { return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>resolve(p));});}); }
async function request(base,route,{token,method='GET',body}={}) { const response=await fetch(base+route,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await response.json()}catch{data={}}return {status:response.status,data}; }
async function waitForServer(base,child) { for(let i=0;i<60;i++){if(child.exitCode!==null)throw new Error(`Server exited early (${child.exitCode}).`);try{const r=await fetch(base+'/api/health');if(r.ok)return r.json()}catch{}await wait(200)}throw new Error('Server did not become healthy in time.'); }
async function startServer(port,dataDir) { const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),LEARNFLEX_DATA_DIR:dataDir,LEARNFLEX_RETENTION_DAYS:'0'},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);const base=`http://127.0.0.1:${port}`;try{const health=await waitForServer(base,child);return {child,base,health,get logs(){return logs}}}catch(e){child.kill('SIGTERM');throw new Error(`${e.message}\n${logs}`)} }
async function login(base,id,password) { const r=await request(base,'/api/auth/login',{method:'POST',body:{id,password}});assert.equal(r.status,200,`login ${id}: ${JSON.stringify(r.data)}`);return r.data.token; }
function attempt(id,userId,topic,q,date,answer=q.answer){return {id,userId,topicId:topic.id,topicTitle:topic.title,subject:topic.subject,score:0,correct:0,total:1,date,answers:[answer],confidence:['high'],questionIds:[q.id],kind:'assessment'};}
(async()=>{
  const topics=curriculum.topics;
  assert.equal(topics.length,528,'full CBSE chapter/activity catalogue expected');
  assert.ok(topics.length>500,'full chapter catalogue should be materially larger than the starter set');
  assert.ok(curriculum.subjects.includes('Sanskrit'));
  assert.ok(curriculum.subjects.includes('Arts Education'));
  assert.ok(curriculum.subjects.includes('Physical Education and Well-being'));
  assert.ok(curriculum.subjects.includes('Vocational Education'));
  assert.ok(!curriculum.subjects.includes('Computational Thinking and AI'));
  assert.ok(curriculum.subjects.includes('Individuals in Society'));
  assert.equal(curriculum.board,'CBSE (NCERT-aligned)');
  assert.ok(!curriculum.subjects.includes('Telugu'),'no state-board Telugu syllabus may be included');
  const count=(grade,subject)=>topics.filter(t=>t.grade===grade&&t.subject===subject).length;
  assert.equal(count(6,'Mathematics'),10); assert.equal(count(6,'Science'),12); assert.equal(count(6,'Social Studies'),14);
  assert.equal(count(7,'Mathematics'),8); assert.equal(count(7,'Science'),12); assert.equal(count(7,'Social Studies'),20);
  assert.equal(count(8,'Mathematics'),14); assert.equal(count(8,'Science'),13); assert.equal(count(8,'Social Studies'),15);
  assert.equal(count(9,'Mathematics'),14); assert.equal(count(9,'Science'),13); assert.equal(count(9,'Social Studies'),15);
  assert.equal(count(10,'Mathematics'),14); assert.equal(count(10,'Science'),16); assert.equal(count(10,'Social Studies'),22);
  for(const row of curriculum.subjectClassCoverage){
    assert.equal(count(row.grade,row.subject),row.chapters,`${row.className} ${row.subject} chapter/module count should match catalogue`);
  }
  for(const topic of topics){
    assert.ok(topic.lesson&&topic.example,`${topic.id} needs lesson and example`);
    assert.equal(topic.questionCount,20,`${topic.id} should have 20 questions across adaptive tiers`);
    for(const tier of ['foundation','reinforcement','standard','challenge']) assert.equal(topic.questionSets[tier].length,5,`${topic.id} ${tier} bank should have 5 questions`);
    assert.equal(topic.questions.length,5,'assessment fallback keeps the standard bank; adaptive banks hold 20');
  }
  for(const topic of topics) assert.deepEqual(engine.validateTopic(topic),[],`${topic.id} has invalid question mappings`);
  assert.notEqual(topics.find(t=>t.id==='ncert6-hindi-01').lesson,topics.find(t=>t.id==='ncert6-hindi-02').lesson,'Hindi lessons should have chapter-specific notes');
  const adaptiveTopic=topics.find(t=>t.id==='ncert6-science-01');
  const used=[];
  const wrongNext=engine.chooseAdaptiveNext(adaptiveTopic,used,[{correct:false,confidence:'high',tier:'foundation'}]);
  assert.equal(wrongNext.tier,'foundation','one incorrect answer should trigger foundation support');
  const repeatedWrong=engine.chooseAdaptiveNext(adaptiveTopic,[wrongNext.question.id],[{correct:false,confidence:'high'},{correct:false,confidence:'medium'}]);
  assert.equal(repeatedWrong.tier,'reinforcement','repeated errors should route to reinforcement');
  const unsureCorrect=engine.chooseAdaptiveNext(adaptiveTopic,[],[{correct:true,confidence:'medium'}]);
  assert.equal(unsureCorrect.tier,'reinforcement','correct but unsure answers should reinforce');
  const challengeNext=engine.chooseAdaptiveNext(adaptiveTopic,[],[{correct:true,confidence:'high'},{correct:true,confidence:'high'}]);
  assert.equal(challengeNext.tier,'challenge','repeated correct high-confidence answers should increase challenge');
  const users=JSON.parse(fs.readFileSync(path.join(root,'data/seed.json'),'utf8')).users;
  assert.equal(users.filter(u=>u.role==='student').length,25);
  assert.equal(users.filter(u=>u.role==='teacher').length,5);
  for(let grade=6;grade<=10;grade++){assert.equal(users.filter(u=>u.role==='student'&&u.className===`Class ${grade}`).length,5);assert.equal(users.filter(u=>u.role==='teacher'&&u.className===`Class ${grade}`).length,1);}
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),serverSource=fs.readFileSync(path.join(root,'server.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(!/startLiveSession|startLiveSession|joinLiveClassroom|function classroomPage|function projectorPage|api\/classroom\/sessions/.test(app),'live-room UI/handlers must be removed');
  assert.ok(!/api\/classroom\/sessions|classroom_sessions|persistRoom|roomMap/.test(serverSource),'live-room backend must be removed');
  assert.ok(!/Join classroom|Start \/ share live room|Start Live Room/i.test(html),'live-room navigation and buttons must be removed');
  assert.ok(/engine\.chooseAdaptiveNext/.test(fs.readFileSync(path.join(root,'app-enhancements.js'),'utf8')),'guided practice must use tested adaptive next-question selection');
  assert.ok(/Pilot evidence & learning impact/.test(fs.readFileSync(path.join(root,'app-enhancements.js'),'utf8')),'pilot evidence workflow must be present');
  const quality=fs.readFileSync(path.join(root,'quality-upgrades.js'),'utf8'), sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.ok(/learnflexRevealHint/.test(quality)&&/Hint 1/.test(quality)&&/Hint 3/.test(quality),'progressive three-step hints must be present');
  assert.ok(/Evidence quality & next actions/.test(quality),'teacher evidence-quality insights must be present');
  assert.ok(sw.includes('quality-upgrades.js'),'offline shell cache must include quality upgrades');
  assert.ok(!/fetch\([^)]*(openai|chatgpt)|api\/(ai|chat)/i.test(quality),'quality upgrades must not call a generative-AI service');
  assert.ok(/teacherStudents = function \(\)[\s\S]*?u.className === currentUser.className && u.school === currentUser.school/.test(fs.readFileSync(path.join(root,'app-enhancements.js'),'utf8')),'teacher UI roster must be class-scoped');
  console.log(`✓ ${topics.length} CBSE chapter/activity modules; ${topics.reduce((n,t)=>n+t.questionCount,0)} practice questions; 25 students and 5 teachers; adaptive routing and pilot evidence hooks`);

  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'learnflex-test-'));
  const server=await startServer(await freePort(),tmp);let {base,child}=server;
  try {
    assert.ok(server.health.ok);assert.equal(server.health.topicCount,528);assert.equal(server.health.studentCount,25);assert.equal(server.health.teacherCount,5);
    assert.equal((await request(base,'/api/state')).status,401,'shared state requires authentication');
    const studentToken=await login(base,'LF6001','learn123');
    const class6Teacher=await login(base,'TEACH06','teach123');
    const class7Teacher=await login(base,'TEACH07','teach123');
    const class8Teacher=await login(base,'TEACH08','teach123');
    const class9Teacher=await login(base,'TEACH09','teach123');
    const class10Teacher=await login(base,'TEACH10','teach123');
    const state=(await request(base,'/api/state',{token:studentToken})).data.state;
    assert.deepEqual(state.users.map(u=>u.id),['LF6001'],'student should only receive own account record');
    assert.equal(state.topics.length,0,'static curriculum should not be duplicated in API payload');
    const teacherState=(await request(base,'/api/state',{token:class6Teacher})).data.state;
    assert.equal(teacherState.users.filter(u=>u.role==='student').length,5);
    assert.ok(teacherState.users.every(u=>u.className==='Class 6'));
    const crossState=(await request(base,'/api/state',{token:class7Teacher})).data.state;
    assert.ok(crossState.users.every(u=>u.className==='Class 7'));
    assert.equal((await request(base,'/api/classroom/sessions',{token:class6Teacher,method:'POST',body:{}})).status,404,'removed live-room endpoint must not exist');

    const topic=topics.find(t=>t.id==='ncert6-science-01');const q=topic.questionSets.standard[0];
    const baseAttempt=attempt('attempt-base','LF6001',topic,q,'2026-10-30T10:00:00.000Z',q.answer);
    const postQ=topic.questionSets.challenge[0];
    const postAttempt=attempt('attempt-post','LF6001',topic,postQ,'2026-10-31T10:00:00.000Z',postQ.answer);
    const sync1=await request(base,'/api/sync',{token:studentToken,method:'POST',body:{state:{results:[baseAttempt],recoveries:[],progress:{},preferences:{}}}});
    assert.equal(sync1.status,200,`baseline attempt should validate: ${JSON.stringify(sync1.data)}`);
    const sync2=await request(base,'/api/sync',{token:studentToken,method:'POST',body:{state:{results:[baseAttempt,postAttempt],recoveries:[],progress:{},preferences:{}}}});
    assert.equal(sync2.status,200,`post attempt should validate: ${JSON.stringify(sync2.data)}`);
    const syncDuplicate=await request(base,'/api/sync',{token:studentToken,method:'POST',body:{state:{results:[baseAttempt,postAttempt],recoveries:[],progress:{},preferences:{}}}});
    assert.equal(syncDuplicate.status,200,'replaying an offline sync should be accepted idempotently');
    const afterDuplicate=(await request(base,'/api/state',{token:studentToken})).data.state;
    assert.equal(afterDuplicate.results.filter(r=>r.id==='attempt-base').length,1,'replayed attempt IDs must not create duplicate attempts');
    const consent=await request(base,'/api/consent',{token:class6Teacher,method:'POST',body:{studentId:'LF6001',status:'granted',evidenceRef:'DEMO-CONSENT-01'}});
    assert.equal(consent.status,201);
    const pilot=await request(base,'/api/pilot-evidence',{token:class6Teacher,method:'POST',body:{studentId:'LF6001',topicId:topic.id,baselineAttemptId:'attempt-base',postAttemptId:'attempt-post',clarity:4,teacherUsefulness:5,misconceptionCorrected:'yes',practiceMinutes:12}});
    assert.equal(pilot.status,201,`paired pilot evidence should save: ${JSON.stringify(pilot.data)}`);
    assert.equal(pilot.data.record.scoreChange,0);
    const pilotState=(await request(base,'/api/state',{token:class6Teacher})).data.state;
    assert.equal(pilotState.pilotEvidence.length,1);
    const noConsent=await request(base,'/api/pilot-evidence',{token:class7Teacher,method:'POST',body:{studentId:'LF6001',topicId:topic.id,baselineAttemptId:'attempt-base',postAttemptId:'attempt-post',clarity:4,teacherUsefulness:4,misconceptionCorrected:'unclear'}});
    assert.equal(noConsent.status,403,'teachers cannot record pilot evidence outside their class');
    console.log('✓ authentication, class isolation, server-validated attempts, consent-gated pilot evidence and removed live-room API');
  } finally {child.kill('SIGTERM');await wait(200);}
})().catch(e=>{console.error(e);process.exitCode=1;});
