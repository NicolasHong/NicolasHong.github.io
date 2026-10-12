import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),box={window:{}};vm.createContext(box);
for(const name of ['demos.js','advanced-demos.js','curvature-demos.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),box);
const m=box.window.OPT_CURVATURE_MATH,{rf,rg}=box.window.OPT_MATH,{eigen2}=box.window.OPT_ADV_MATH;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=x=>Math.hypot(...x),mv=(A,x)=>A.map(r=>dot(r,x)),add=(a,b)=>a.map((v,i)=>v-b[i]);
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`),eye=[[1,0],[0,1]];
const inverse=A=>{const d=A[0][0]*A[1][1]-A[0][1]*A[1][0];return [[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]];};
let totals={};
// Independent known solution; test both orthogonality notions, not just a final residual.
for(const pre of [false,true]){
 const A=[[4,1],[1,2]],b=[1,1],run=m.linearRun(A,b,[-1.5,1.5],pre);
 assert.ok(run.last.done);assert.ok(run.last.k<=2);near(run.last.x[0],1/7);near(run.last.x[1],3/7);
 const p=run.last.directions;near(dot(p[0],mv(A,p[1])),0);
 const r0=run.states[0].r,r1=run.states[1].r;near(dot(r0,r1.map((v,i)=>v/(pre?A[i][i]:1))),0);
}
assert.ok(m.linearStep(m.linearInit([[-1,0],[0,1]],[1,0],[0,0])).failed);
// Three distinct eigenvalues suffice regardless of dimension in this well-resolved example.
const vals=Array.from({length:18},(_,i)=>[1,10,100][i%3]),A=vals.map((v,i)=>vals.map((_,j)=>i===j?v:0));
const clustered=m.linearRun(A,Array(18).fill(0),Array(18).fill(1));assert.ok(clustered.last.done);assert.ok(clustered.last.k<=5);
const pRun=m.linearRun(A,Array(18).fill(0),Array(18).fill(1),true);assert.equal(pRun.last.k,1);
// Check secant, symmetry, positive definiteness and direct/inverse consistency.
for(const s of [[1,.5],[-.7,1],[.2,1.3]]){
 const B=[[2,.3],[.3,1]],Q=[[4,1],[1,3]],y=mv(Q,s);
 for(const kind of ['bfgs','dfp']){
  const next=kind==='bfgs'?m.bfgsB(B,s,y):m.dfpB(B,s,y),H=m.inverseUpdate(inverse(B),s,y,kind),directInverse=inverse(next);
  near(norm(add(mv(next,s),y)),0);near(norm(add(mv(H,y),s)),0);assert.ok(eigen2(next).d[0]>0);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){near(next[i][j],next[j][i]);near(H[i][j],directInverse[i][j]);}
 }
 const sr=m.sr1Update(B,s,y);assert.ok(sr.updated);near(norm(add(mv(sr.B,s),y)),0);
}
assert.equal(m.bfgsB(eye,[1,0],[-2,0]),null);
assert.equal(m.sr1Update(eye,[1,0],[1,1]).updated,false,'Orthogonal secant mismatch must be skipped');
assert.equal(m.sr1Update(eye,[1,0],[1,0]).updated,false,'Already satisfied secant must not divide by zero');
assert.equal(m.sr1Update(eye,[1,0],[1+1e-12,1]).updated,false,'Near-orthogonal mismatch needs protection');
const neg=m.sr1Update(eye,[1,0],[-2,0]);assert.ok(neg.updated);near(neg.B[0][0],-2);
// Secant learning retains earlier independent observations on a quadratic, even without a line search.
let B=eye;const Q=[[3,1],[1,4]],steps=[[1,0],[0,1]];
for(const s of steps)B=m.sr1Update(B,s,mv(Q,s)).B;
for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(B[i][j],Q[i][j]);
// Nonlinear CG: shared strong Wolfe and explicit periodic restart.
totals.ncg=[];
for(const kind of ['fr','prplus','frpr'])for(const start of [[-1.2,1],[0,1],[1.5,-.5]]){
 let s=m.nonlinearInit(start);
 for(let k=0;k<2000&&!s.done&&!s.failed;k++){
  const prev=s;s=m.nonlinearStep(s,kind,2);assert.ok(!s.failed,s.reason);assert.ok(rf(s.x)<=rf(prev.x)+1e-11);
  if(s.ls){assert.ok(s.ls.history.at(-1).armijo);assert.ok(s.ls.history.at(-1).curvature);}
  if(!s.done)assert.ok(dot(s.g,s.p)<0,'Protected CG lost descent');
 }
 assert.ok(norm(rg(s.x))<1e-6,`${kind} failed at ${start}; gradient ${norm(rg(s.x))}`);totals.ncg.push({kind,start,steps:s.k});
}
totals.qn=[];
for(const kind of ['bfgs','dfp'])for(const start of [[-1.2,1],[0,1],[1.5,-.5]]){
 let s=m.qnInit(start);for(let k=0;k<500&&!s.done&&!s.failed;k++){const f=rf(s.x);s=m.qnStep(s,kind);assert.ok(!s.failed,s.reason);assert.ok(rf(s.x)<=f+1e-12);assert.ok(eigen2(s.H).d[0]>0);}
 const converged=norm(rg(s.x))<1e-7;
 if(kind==='dfp'&&start[0]===1.5){assert.ok(converged||s.k===500);assert.ok(rf(s.x)<rf(start));}
 else assert.ok(converged,`${kind} failed convergence`);
 totals.qn.push({kind,start,steps:s.k,status:converged?'converged':'iteration budget reached',gradient:norm(rg(s.x))});
}
let rejectedUpdates=0;totals.sr1=[];
for(const start of [[-1.2,1],[0,1],[1.5,-.5]]){
 let s=m.sr1Init(start);for(let k=0;k<400&&!s.done&&!s.failed;k++){
  const prev=s;s=m.sr1Trial(s);assert.ok(!s.failed,s.reason);if(s.done)break;
  assert.ok(norm(s.step)<=prev.delta+1e-9);if(s.accepted)assert.ok(rf(s.x)<rf(prev.x));else near(norm(add(s.x,prev.x)),0);
  if(s.updated){near(norm(add(mv(s.B,s.step),s.y)),0,1e-6);if(!s.accepted)rejectedUpdates++;}
 }
 assert.ok(norm(rg(s.x))<1e-7,`SR1 failed from ${start}`);totals.sr1.push({start,trials:s.k});
}
assert.ok(rejectedUpdates>0,'Must test updating after a rejected trial');
console.log(JSON.stringify({result:'PASS',checks:'CG/PCG invariants; spectrum; secant and inverse identities; SR1 safeguards; nonlinear convergence and rejected-step learning',rejectedUpdates,...totals},null,2));
