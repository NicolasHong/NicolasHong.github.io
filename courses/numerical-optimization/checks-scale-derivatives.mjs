import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),box={window:{}};vm.createContext(box);
for(const f of ['demos.js','advanced-demos.js','curvature-demos.js','scale-derivative-demos.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),box);
const m=box.window.OPT_SCALE_MATH,q=box.window.OPT_CURVATURE_MATH,a=box.window.OPT_ADV_MATH;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=x=>Math.hypot(...x),add=(x,y,c=1)=>x.map((v,i)=>v+c*y[i]),mv=(A,x)=>A.map(r=>dot(r,x)),near=(x,y,t=1e-9)=>assert.ok(Math.abs(x-y)<=t,`${x} != ${y}`);
const vecNear=(x,y,t=1e-9)=>x.forEach((v,i)=>near(v,y[i],t));
const B=[[4,1],[1,2]],g=[-1,-1];
const cg=m.truncatedCG(x=>mv(B,x),g,{eta:1e-12});vecNear(cg.p,[1/7,3/7]);assert.equal(cg.reason,'残差达标');
for(const delta of [.1,.5,1,3])for(const [A,g] of [[B,[-1,2]],[[[-1,0],[0,2]],[-1,-1]],[[[-2,0],[0,3]],[0,1]]]){
 const op=x=>mv(A,x),r=m.truncatedCG(op,g,{eta:1e-12,delta,maxIter:8}),value=p=>dot(g,p)+.5*dot(p,op(p)),gg=dot(g,g),gBg=dot(g,op(g));
 const alpha=gBg>0?Math.min(gg/gBg,delta/norm(g)):delta/norm(g),cauchy=g.map(v=>-alpha*v);
 assert.ok(norm(r.p)<=delta+1e-10);assert.ok(value(r.p)<=value(cauchy)+1e-9,'Steihaug failed Cauchy reduction');
 for(let i=1;i<r.path.length;i++)assert.ok(norm(r.path[i])>=norm(r.path[i-1])-1e-12);
}
const hiddenA=[[-2,0],[0,3]],hidden=m.truncatedCG(x=>mv(hiddenA,x),[0,1],{eta:1e-12,delta:1});
assert.equal(hidden.reason,'残差达标');near(hidden.p[0],0);assert.ok(a.trustExact(hiddenA,[0,1],1).pred>1,'Hidden negative curvature must remain visible in comparison');
const nc=m.truncatedCG(x=>[-x[0],2*x[1]],[1,0]);assert.equal(nc.reason,'非正曲率');assert.ok(dot(nc.p,[1,0])<0);
const forced=['fixed','super','quadratic','tight'].map(mode=>{const r=m.forcingRun(mode);assert.ok(r.done,mode+' did not converge');assert.ok(r.history.every(v=>Number.isFinite(v.g)));return {mode,steps:r.history.length-1,products:r.history.at(-1).ops};});
// Two-loop products versus explicitly rebuilt dense inverse BFGS, with truncated windows.
const A=[[4,1,0],[1,3,.2],[0,.2,2]],ss=[[1,2,-1],[-.5,1,2],[2,0,1],[.1,-2,1]],pairs=ss.map(s=>({s,y:mv(A,s)}));
for(const count of [1,2,4])for(const gamma of [.1,1,2]){
 const pp=pairs.slice(-count);let H=[[gamma,0,0],[0,gamma,0],[0,0,gamma]];
 for(const {s,y} of pp)H=q.inverseUpdate(H,s,y,'bfgs');
 for(const v of [[1,2,3],[-2,0,1]])vecNear(m.twoLoop(v,pp,gamma),mv(H,v),1e-10);
}
const problem=m.largeModel(),limited=[];
for(const memory of [1,3,8]){let state=m.lbfgsInit(problem);for(let i=0;i<500&&!state.done&&!state.failed;i++){const old=state;state=m.lbfgsStep(problem,state,memory);assert.ok(problem.f(state.x)<=problem.f(old.x)+1e-10);assert.ok(state.pairs.length<=memory);assert.ok(state.pairs.every(({s,y})=>dot(s,y)>0));}assert.ok(state.done,`L-BFGS m=${memory}, ${state.reason}, g=${norm(problem.g(state.x))}`);limited.push({memory,steps:state.k,gradient:norm(problem.g(state.x))});}
// Independent analytic and finite-difference oracles for graph-level first and second AD.
for(const x of [[.7,-.4,1.1],[-.8,1.5,.2],[1.5,1.5,2],[0,0,1]])for(const v of [[1,0,0],[0,1,0],[1,-1,.5]]){
 const ad=m.adGraph(x,v),H=m.exampleHessian(x);near(ad.value,m.exampleValue(x));vecNear(ad.g,m.exampleGradient(x));vecNear(ad.hv,mv(H,v),1e-9);near(ad.directional,dot(ad.g,v));
 const h=1e-5,fd=add(m.exampleGradient(add(x,v,h)),m.exampleGradient(add(x,v,-h)),-1).map(t=>t/(2*h));vecNear(ad.hv,fd,2e-7);
 const scalar=(m.exampleValue(add(x,v,h))-m.exampleValue(add(x,v,-h)))/(2*h);near(ad.directional,scalar,2e-7);
 const w=[.3,2,-1],hw=m.adGraph(x,w).hv;near(dot(w,ad.hv),dot(v,hw),1e-9);
}
for(const n of [6,12,24]){const x=Array.from({length:n},(_,i)=>.2+.03*(i+1)),J=m.sparseJacobian(x),r=m.coloredJacobian(x,3);assert.equal(r.conflicts,0);assert.equal(r.calls,4);assert.ok(Math.max(...J.flatMap((row,i)=>row.map((v,j)=>Math.abs(v-r.J[i][j]))))<1e-6);const bad=m.coloredJacobian(x,2);assert.ok(bad.conflicts>0);assert.ok(Math.max(...J.flatMap((row,i)=>row.map((v,j)=>Math.abs(v-bad.J[i][j]))))>.5);}
const f1=m.fdValue(.01),f2=m.fdValue(.005);near(Math.abs(f1.forward-Math.E)/Math.abs(f2.forward-Math.E),2,.02);near(Math.abs(f1.central-Math.E)/Math.abs(f2.central-Math.E),4,.001);
console.log(JSON.stringify({status:'PASS',forced,limited,verified:['truncated CG solution, descent and nonpositive curvature','Steihaug feasibility, norm growth, Cauchy decrease and hidden curvature','L-BFGS two-loop versus dense BFGS, memory limits and convergence','forward/reverse AD and HVP analytic and finite-difference checks','sparse coloring valid and intentionally invalid groups','finite-difference truncation orders']},null,2));
