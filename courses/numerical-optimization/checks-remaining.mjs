import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),box={window:{}};vm.createContext(box);
for(const file of ['demos.js','remaining-demos.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});
const M=box.window.OPT_REMAINING_MATH,dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=x=>Math.hypot(...x),near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
const p=M.solve([[0,2,1],[3,1,-1],[1,1,1]],[4,2,3]);for(const [i,row] of [[0,[0,2,1]],[1,[3,1,-1]],[2,[1,1,1]]])near(dot(row,p),[4,2,3][i]);assert.throws(()=>M.solve([[1,1],[2,2]],[1,2]));
for(const delta of [.1,.5,1,2]){const r=M.poll({delta,budget:1200});assert.ok(norm(r.x.map((v,i)=>v-[1,-.5][i]))<.002);assert.ok(r.evals<=1200);for(let i=1;i<r.history.length;i++)assert.ok(r.history[i].f<=r.history[i-1].f+1e-12);}
const budget=M.poll({budget:9});assert.ok(budget.evals<=9);assert.match(budget.reason,/预算/);
for(const x of [[0,-.3],[.5,-1],[-.2,.4]]){const m=M.fitModel(x),h=1e-6;for(let j=0;j<2;j++){const xp=[...x],xm=[...x];xp[j]+=h;xm[j]-=h;near((M.fitModel(xp).f-M.fitModel(xm).f)/(2*h),m.g[j],1e-5);}}
for(const method of ['gn','lm'])for(const A of [.2,.4,1.8,4])for(const k of [.1,.65,1.5,2]){const r=M.fitRun(A,k,method),last=r.history.at(-1);assert.ok(norm(last.g)<1e-7,`fit ${method} ${A} ${k}: ${r.reason}`);assert.ok(last.f<.002);for(let i=1;i<r.history.length;i++)assert.ok(r.history[i].f<=r.history[i-1].f+1e-12);}
const cycle=M.rootRun(0,'plain');for(let i=0;i<6;i++)near(cycle.history[i].x,i%2);assert.ok(Math.abs(M.rootF(cycle.x))>1);
for(const x of [-3,-2,-1,0,2]){const r=M.rootRun(x,'bracket');assert.ok(Math.abs(M.rootF(r.x))<1e-9);}
const trap=M.rootRun(0,'merit');assert.ok(Math.abs(M.rootF(trap.x))>.8);assert.doesNotMatch(trap.reason,/残差达标/);
for(const a of [[-1,-1],[.2,.8],[2,3]])for(const b of [0,.5,1.5]){const r=M.kktProjection(a,b);assert.ok(r.x[0]>=b&&r.x[1]>=0);assert.ok(r.lambda.every(v=>v>=0));near(r.lambda[0]*(r.x[0]-b),0);near(r.lambda[1]*r.x[1],0);near(r.residual,0);const h=1e-6;near((M.kktProjection(a,b+h).f-M.kktProjection(a,b-h).f)/(2*h),r.lambda[0],2e-6);}
let interiorIterations=0;
for(const cap of [3,3.5,4,4.5,5]){const {A,b,c}=M.lpData(cap),r=M.simplex(cap);assert.match(r.reason,/最优/);for(let i=0;i<3;i++)near(dot(A[i],r.x),b[i]);assert.ok(r.x.every(v=>v>=-1e-9)&&r.s.every(v=>v>=-1e-9));near(dot(r.x,r.s),0);near(r.f,-6-2*(cap-2));near(r.f,dot(b,r.lambda));for(const eta of [.5,.95,.995]){const ip=M.lpInterior(cap,eta);interiorIterations+=ip.history.length;assert.ok(ip.error<1e-8,`IP cap ${cap}, eta ${eta}: ${ip.reason}, ${ip.error}`);near(ip.f,r.f,2e-7);for(const e of ip.history)assert.ok(e.x.every(v=>v>0)&&e.s.every(v=>v>0));}}
const filter=[[.3,3],[.7,1.8],[1.2,.8]];assert.ok(M.filterAccept(filter,.1,4));assert.ok(M.filterAccept(filter,1.5,.5));assert.ok(!M.filterAccept(filter,1.3,3.5));assert.ok(!M.filterAccept([[0,1]],0,2));assert.ok(!M.filterAccept([[0,1]],0,1));assert.ok(M.filterAccept([[0,1]],0,.9));const inserted=M.filterInsert(filter,.2,1);assert.equal(inserted.length,2);
let qpAdds=0,qpDrops=0;
for(const a of [[2,1.4],[-.5,2],[3,-.5],[0,0],[.1,.2],[3,3]])for(const cap of [.5,1.5,3]){const r=M.qpActive(a,cap);assert.match(r.reason,/达标/);assert.ok(norm(r.rd)<1e-8);assert.ok(r.slack.every(v=>v>=-1e-9));assert.ok(r.lambda.every(v=>v>=-1e-9));for(let i=0;i<3;i++)near(r.slack[i]*r.lambda[i],0);for(let i=0;i<=50;i++)for(let j=0;j<=50-i;j++){const q=[cap*i/50,cap*j/50];assert.ok(r.q(r.x)<=r.q(q)+1e-9);}for(const e of r.history){if(e.action.startsWith('加入'))qpAdds++;if(e.action.startsWith('删除'))qpDrops++;}}
assert.ok(qpAdds>0&&qpDrops>0);
for(const rho of [.316227766,1,10,1e4]){const r=M.penaltyAL(rho,20);near(r.penaltyX,2/(1+rho));for(const e of r.history){near(e.stationarity,0,1e-10);near(e.x,2/(1+rho)**e.k,1e-10);}assert.ok(Math.abs(r.history.at(-1).x)<r.penaltyX);}
let corrections=0,backtracks=0;
for(const radius of [.4,1,1.5,2.5])for(const angle of [-150,-50,0,100,150])for(const soc of [false,true]){const r=M.sqpCircle(radius,angle,soc);assert.ok(Math.max(Math.abs(r.c),r.rd)<1e-7,`SQP ${radius} ${angle} ${soc}: ${r.reason}`);assert.ok(norm(r.x.map((v,i)=>v-r.solution[i]))<1e-7);for(const e of r.history){if(e.action==='二阶校正')corrections++;if(e.action==='回溯')backtracks++;}}
assert.ok(corrections>0&&backtracks>0);
for(const a of [.2,1,3])for(const mu of [1e-10,1e-6,.1,10]){const r=M.barrierPoint(a,mu);assert.ok(r.x>0&&r.z>0);near(r.stationarity,0);near(r.complementarity,mu,1e-10);near(r.x+a-mu/r.x,0,1e-8);}
console.log(JSON.stringify({result:'PASS',checks:['pivoted solve and singular failure','DFO descent, known optimum and budget','least-squares gradient and GN/LM convergence across starts','Newton cycle, merit non-root trap and safeguarded root','KKT signs, complementarity and finite-difference sensitivity','simplex and PD-IP independent analytic LP certificate','filter dominance and margin','QP KKT plus independent feasible grid','AL multiplier recursion and finite penalty bias','SQP feasibility, stationarity, known sphere optimum, SOC and backtracking','stable barrier path and perturbed KKT'],interiorIterations,qpAdds,qpDrops,corrections,backtracks},null,2));
