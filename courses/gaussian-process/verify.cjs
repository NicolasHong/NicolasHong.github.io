const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),G=require('./models.js');
let checks=0;const near=(a,b,tol=1e-7)=>{assert.ok(Number.isFinite(a)&&Math.abs(a-b)<tol,`${a} != ${b}`);checks++;};
// Check one-observation conditioning against an independent scalar formula.
const p=G.gp([0],[2],{sn:.2}).predict(1),k=Math.exp(-.5),den=1+.04+1e-9;
near(p.mu,2*k/den);near(p.variance,1-k*k/den);
const m=G.gp([0,1,2],[1,-1,.5],{ell:.7,sn:0});
for(const [j,x] of [0,1,2].entries()){near(m.predict(x).mu,[1,-1,.5][j],1e-7);assert.ok(m.predict(x).sd<.0001);}
const other=G.gp([0,1,2],[4,2,-3],{ell:.7,sn:0});for(const x of G.grid(-1,3,31))near(m.predict(x).variance,other.predict(x).variance);
const noisy=G.gp([0,1,2],[1,-1,.5],{ell:.7,sn:.5});assert.ok(noisy.predict(1).variance>m.predict(1).variance);
// Verify Cholesky solves a known SPD system, and reconstructs the matrix.
const A=[[4,2,1],[2,5,2],[1,2,3]],L=G.chol(A),b=[1,3,2],sol=G.upper(L,G.lower(L,b));
A.forEach((r,i)=>{near(G.dot(r,sol),b[i]);r.forEach((v,j)=>near(G.dot(L[i],L[j]),v));});
const one=G.gp([0],[0],{sn:0});near(one.lml,-.5*Math.log(2*Math.PI)-.5*Math.log(1+1e-9));
for(let n=4;n<=16;n++){const X=G.lhs(n,2,42);for(let d=0;d<2;d++){assert.equal(new Set(X.map(p=>Math.floor(p[d]*n))).size,n);checks++;}}
for(const type of ['rbf','m12','m32','m52','rq','periodic']){const opts={type,ell:.7};near(G.kernel(1,1,opts),1);near(G.kernel(.3,1.2,opts),G.kernel(1.2,.3,opts));G.samples(G.grid(0,5,85),opts);checks++;}
near(G.cdf(0),.5,1e-8);near(G.cdf(1.96),.9750021,1e-7);
near(G.acquisition(0,1,0,0).ei,1/Math.sqrt(2*Math.PI));near(G.acquisition(0,1,0,0).pi,.5,1e-8);
near(G.acquisition(-1,0,0,0).ei,1);near(G.acquisition(-1,0,0,0).pi,1);near(G.acquisition(1,0,0,0).ei,0);
// Compare EI to direct numerical integration over the standard normal density.
const mu=.3,sd=.8,best=-.2,xi=.01,delta=best-mu-xi,z=delta/sd,dt=(z+9)/30000;
let integral=0;for(let j=0;j<30000;j++){const t=-9+(j+.5)*dt;integral+=(delta-sd*t)*G.pdf(t)*dt;}
near(G.acquisition(mu,sd,best,xi).ei,integral,2e-7);
// Run all three acquisition policies to their budget with only available observations.
for(const method of ['ei','pi','lcb']){const X=[.5,3,7],y=X.map(G.truth),xs=G.grid(0,10,401);
 while(X.length<12){const model=G.gp(X,y),best=Math.min(...y),scores=xs.map(x=>{const p=model.predict(x);return G.acquisition(p.mu,p.sd,best)[method];});let selected=-1;
 xs.forEach((x,j)=>{if(X.some(v=>Math.abs(v-x)<1e-6))return;if(selected<0||(method==='lcb'?scores[j]<scores[selected]:scores[j]>scores[selected]))selected=j;});
 assert.ok(selected>=0);X.push(xs[selected]);y.push(G.truth(xs[selected]));}
 assert.equal(new Set(X).size,12);assert.ok(Math.min(...y)<-.9);checks++;
}
const context={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/content.js','utf8'),context);const sections=context.window.GP_CONTENT;
assert.equal(sections.length,18);assert.equal(new Set(sections.map(s=>s.id)).size,18);assert.equal(sections.filter(s=>s.body.includes('data-lab=')).length,10);
for(const s of sections){assert.ok(s.body.length>200);assert.ok(!s.body.includes('katex-error'));}
console.log(`${checks} numerical checks passed; 18 sections and 10 laboratories verified.`);
