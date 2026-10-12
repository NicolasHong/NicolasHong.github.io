// Numerical checks: independent finite differences and exhaustive transport enumeration.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const box={window:{}};vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(root,'demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'advanced-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'notes-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'curvature-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'scale-derivative-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'remaining-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'taylor-demos.js'),'utf8'),box);
vm.runInContext(fs.readFileSync(path.join(root,'minima-demos.js'),'utf8'),box);
const m=box.window.OPT_MATH,near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
for(const x of [[-1.2,1],[0,1],[1,1],[1.5,-.5]]){
 const eps=1e-5,g=m.rg(x),H=m.rh(x);
 for(let i=0;i<2;i++){const plus=[...x],minus=[...x];plus[i]+=eps;minus[i]-=eps;
  near((m.rf(plus)-m.rf(minus))/(2*eps),g[i],2e-6);
  for(let j=0;j<2;j++)near((m.rg(plus)[j]-m.rg(minus)[j])/(2*eps),H[j][i],2e-6);
 }
}
for(const start of [[-1.2,1],[0,1],[1.5,-.5]]){
 let x=start;for(let i=0;i<100;i++){if(Math.hypot(...m.rg(x))<1e-7)break;const result=m.rosenStep(x,'newton');assert.ok(m.rf(result.x)<=m.rf(x)+1e-12);x=result.x;}
 assert.ok(Math.hypot(x[0]-1,x[1]-1)<1e-7,'Newton failed convergence');
}
for(const k of [1,2,10,50]){let x=[2,2/k];for(let i=0;i<30;i++){const y=m.quadStep(k,x,'sd');assert.ok(m.quadratic(k,y)<=m.quadratic(k,x)+1e-14);x=y;}for(const type of ['newton','scaled'])near(m.quadratic(k,m.quadStep(k,[2,2/k],type)),0);}
// Exhaustive integer enumeration is exact for these integer-capacity transportation LPs.
for(const [a,b] of [[0,100],[100,0],[60,60],[15,100],[80,25],[40,40],[120,120],[25,75]]){
 let best=Infinity;
 for(let x=0;x<=35;x++)for(let y=0;y<=40;y++)for(let z=0;z<=25;z++)if(x+y+z<=a&&100-x-y-z<=b)best=Math.min(best,2*x+6*y+4*z+5*(35-x)+3*(40-y)+5*(25-z));
 const result=m.transport(a,b);if(best===Infinity)assert.equal(result,null);else near(result.cost,best);
}
for(const d of [.1,.5,1,1.8]){const r=m.trustStep(d);near(Math.hypot(...r.p),d);assert.ok(r.model<11);}
const best=m.fitBest();for(let k=.05;k<=1.5;k+=.001)assert.ok(m.fitObjective(best)<=m.fitObjective(k)+1e-12);
const a=box.window.OPT_ADV_MATH,dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0),norm=x=>Math.hypot(...x);
for(const initial of [.001,.2,1,4,32]){
 const r=a.strongWolfe(t=>(t-1)**2,t=>2*(t-1),{initial,c1:.1,c2:.8});
 assert.ok(r.ok);assert.ok(r.f<=1-.2*r.alpha);assert.ok(Math.abs(r.d)<=1.6);
}
assert.equal(a.strongWolfe(t=>-t,()=>-1).ok,false,'Unbounded linear ray must not report Wolfe success');
assert.equal(a.strongWolfe(t=>t,()=>1).ok,false,'Uphill direction must fail');
for(const start of [[-1.2,1],[0,1],[1.5,-.5]]){
 let x=start,H=[[1,0],[0,1]],count=0;
 for(;count<150&&norm(m.rg(x))>=1e-7;count++){
  const g=m.rg(x),f=m.rf(x),r=a.bfgsStep(x,H);assert.ok(r.ok,r.reason);
  assert.ok(m.rf(r.x)<=f+1e-4*r.ls.alpha*dot(g,r.p)+1e-13);
  assert.ok(Math.abs(dot(m.rg(r.x),r.p))<=.9*Math.abs(dot(g,r.p))+1e-12);
  assert.ok(r.ys>0,'Wolfe must yield positive curvature');assert.ok(a.eigen2(r.H).d[0]>0,'BFGS lost positive definiteness');
  x=r.x;H=r.H;
 }
 assert.ok(norm(m.rg(x))<1e-7,'BFGS failed convergence');
}
// Independent KKT certificates and angular/radial sampling, including singular and hard cases.
const trustCases=[
 [[[1,0],[0,8]],[-2,-2]],[[[-1,0],[0,2]],[0,1]],[[[-2,0],[0,3]],[0,0]],
 [[[0,0],[0,2]],[0,1]],[[[0,0],[0,0]],[1,2]],[[[-2,0],[0,-2]],[0,0]],
 [[[3,1],[1,2]],[-1,3]],[[[-1,2],[2,1]],[1,-2]],[[[1,0],[0,2]],[0,0]],
 [[[-1,0],[0,2]],[1e-8,1]]
];
for(const [B,g] of trustCases)for(const delta of [.1,1/3,.7,1,3]){
 const r=a.trustExact(B,g,delta),p=r.p;
 assert.ok(norm(p)<=delta+1e-10);assert.ok(r.lambda>=0);
 assert.ok(a.eigen2(B).d[0]+r.lambda>=-1e-10);
 near(r.lambda*(delta-norm(p)),0,2e-7);
 for(let i=0;i<2;i++)near(dot(B[i],p)+r.lambda*p[i]+g[i],0,2e-7);
 for(const radius of [0,delta/4,delta/2,delta])for(let i=0;i<720;i++){
  const t=i*Math.PI/360,q=[radius*Math.cos(t),radius*Math.sin(t)];
  assert.ok(a.model(B,g,p)<=a.model(B,g,q)+1e-9,'TR solution worse than independent sample');
 }
}
for(const delta of [.1,.3,.7,1,2,3]){
 const B=[[1,0],[0,8]],g=[-2,-2],pc=a.cauchy(B,g,delta),pd=a.dogleg(B,g,delta),pe=a.trustExact(B,g,delta).p;
 assert.ok(norm(pd)<=delta+1e-12);assert.ok(a.model(B,g,pe)<=a.model(B,g,pd)+1e-12);assert.ok(a.model(B,g,pd)<=a.model(B,g,pc)+1e-12);
}
assert.throws(()=>a.dogleg([[-1,0],[0,2]],[0,1],1));
let rejections=0;
for(const start of [[-1.2,1],[0,1],[1.5,-.5]])for(const initial of [.1,1,3]){
 let x=start,delta=initial;
 for(let k=0;k<200;k++){
  const r=a.trustTrial(x,delta);assert.ok(!r.failed,r.reason);if(r.stop)break;
  if(r.accepted)assert.ok(m.rf(r.x)<m.rf(x));else{near(norm(r.x.map((v,i)=>v-x[i])),0);rejections++;}
  assert.ok(r.delta>0&&r.delta<=4);x=r.x;delta=r.delta;
 }
 assert.ok(norm(m.rg(x))<1e-7,'Adaptive TR failed convergence');
}
assert.ok(rejections>0,'Tests must exercise rejected trials');
vm.runInContext(fs.readFileSync(path.join(root,'chapters.js'),'utf8'),box);
for(const h of [.1,.2,.5,1,1.5,2]){const r=box.window.OPT_TAYLOR_MATH.mvtPoint(h);assert.ok(r.tau>0&&r.tau<1);near(h*Math.exp(h*r.tau),Math.exp(h)-1,1e-12);}
// Check marked minima against independent values on both sides, for both powers.
const minima=box.window.OPT_MINIMA_MATH;
for(const q of [4,6])for(const k of [2,3,10,30,100]){
 const r=minima.minimum(q,k),eps=(r.hi-r.lo)*1e-4;
 assert.ok(r.x>r.lo&&r.x<r.hi);
 const f=x=>x**q*(2+Math.cos(1/x));
 assert.ok(f(r.x-eps)>f(r.x)&&f(r.x+eps)>f(r.x),'Marker must be a local minimum');
 assert.ok(f(r.x)>0&&minima.value(0,q)===0);
 assert.ok(Math.abs(q*(2+Math.cos(1/r.x))+Math.sin(1/r.x)/r.x)<1e-9);
 if(k>2)assert.ok(r.x<minima.minimum(q,k-1).x);
}
// Validate the new model overlay against independent finite differences.
const notes=box.window.OPT_NOTE_MATH,h=1e-4,zero=[0,0];
for(let i=0;i<2;i++){
 const plus=[0,0],minus=[0,0];plus[i]=h;minus[i]=-h;
 near((notes.overlayValue(plus)-notes.overlayValue(minus))/(2*h),notes.g[i],1e-7);
 near((notes.overlayValue(plus)-2*notes.overlayValue(zero)+notes.overlayValue(minus))/(h*h),notes.B[i][i],1e-6);
}
const mixed=(notes.overlayValue([h,h])-notes.overlayValue([h,-h])-notes.overlayValue([-h,h])+notes.overlayValue([-h,-h]))/(4*h*h);near(mixed,1,1e-7);
for(const k of [2,.4,-1,0]){
 const p=box.window.OPT_ADV_MATH.cauchy([[k,0],[0,1]],[1,0],1.2),t=-p[0];
 assert.ok(t>=0&&t<=1.2);for(let j=0;j<=2400;j++)assert.ok(notes.cauchySlice(k,t)<=notes.cauchySlice(k,j/2000)+1e-12);
}
const small=box.window.OPT_ADV_MATH.trustExact(notes.B,notes.g,.05),full=box.window.OPT_ADV_MATH.trustExact(notes.B,notes.g,1.2);
assert.ok(-notes.overlayValue(small.p)/small.pred>.99);near(full.p[0],1);near(full.p[1],0);near(-notes.overlayValue(full.p)/full.pred,-1);

const ids=new Set(),demoNames=new Set();let maths=0;
for(const c of box.window.OPT_CHAPTERS)for(const s of c.sections){assert.ok(!ids.has(c.id+'/'+s.id));ids.add(c.id+'/'+s.id);maths+=(s.body.match(/<math[ >]/g)||[]).length;assert.ok(!/katex-error/.test(s.body));for(const v of s.body.matchAll(/data-demo="([^"]+)"/g)){assert.ok(box.window.OPT_DEMOS[v[1]]);demoNames.add(v[1]);}}
assert.equal(box.window.OPT_CHAPTERS.length,19);assert.equal(ids.size,192);assert.equal(demoNames.size,44);
for(const c of box.window.OPT_CHAPTERS)for(const s of c.sections)for(const match of s.body.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(match[1]),'Broken chapter link '+match[1]);
console.log(JSON.stringify({result:'PASS',sections:ids.size,maths,demos:demoNames.size,fitK:best,trustRejections:rejections,checks:['Rosenbrock derivatives','Newton convergence from all three starts','quadratic descent','transport exhaustive optimum','trust step feasibility','fitting objective','strong Wolfe acceptance and failure paths','BFGS curvature, SPD and convergence','TR KKT and independent grid comparison including hard cases','Dogleg feasibility and model decrease','adaptive TR convergence and rejected trials','chapter/demo registrations and cross-links']},null,2));
