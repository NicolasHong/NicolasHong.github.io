/* Independent, deterministic teaching models. No external runtime dependencies. */
(function(root){
'use strict';
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function rng(seed=1){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function normal(r){return Math.sqrt(-2*Math.log(Math.max(r(),1e-15)))*Math.cos(2*Math.PI*r());}
function chol(A){const n=A.length,L=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let v=A[i][j];for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];if(i===j){if(!(v>0))throw Error('协方差矩阵无法稳定分解，请检查参数。');L[i][j]=Math.sqrt(v);}else L[i][j]=v/L[j][j];}return L;}
function lower(L,b){const x=[];for(let i=0;i<b.length;i++){let s=b[i];for(let j=0;j<i;j++)s-=L[i][j]*x[j];x[i]=s/L[i][i];}return x;}
function upper(L,b){const x=Array(b.length);for(let i=b.length-1;i>=0;i--){let s=b[i];for(let j=i+1;j<b.length;j++)s-=L[j][i]*x[j];x[i]=s/L[i][i];}return x;}
function kernel(a,b,{ell=1,sf=1,type='rbf',period=2}={}){a=Array.isArray(a)?a:[a];b=Array.isArray(b)?b:[b];const r2=a.reduce((s,v,i)=>s+((v-b[i])/(Array.isArray(ell)?ell[i]:ell))**2,0),r=Math.sqrt(r2);let v;
 if(type==='m12')v=Math.exp(-r);else if(type==='m32')v=(1+Math.sqrt(3)*r)*Math.exp(-Math.sqrt(3)*r);else if(type==='m52')v=(1+Math.sqrt(5)*r+5*r2/3)*Math.exp(-Math.sqrt(5)*r);else if(type==='rq')v=1/(1+r2/2);else if(type==='periodic')v=Math.exp(-2*Math.sin(Math.PI*(a[0]-b[0])/period)**2/(ell*ell));else v=Math.exp(-r2/2);return sf*sf*v;}
function gp(X,y,opts={}){const sn=opts.sn??0,mean=opts.mean??0,jitter=opts.jitter??1e-9,n=X.length;const K=X.map((a,i)=>X.map((b,j)=>kernel(a,b,opts)+(i===j?sn*sn+jitter:0))),L=chol(K),res=y.map(v=>v-mean),alpha=upper(L,lower(L,res));
 const predict=x=>{const k=X.map(a=>kernel(a,x,opts)),v=lower(L,k),variance=Math.max(0,kernel(x,x,opts)-dot(v,v));return{mu:mean+dot(k,alpha),variance,sd:Math.sqrt(variance),v,k};};
 const lml=-.5*dot(res,alpha)-L.reduce((s,row,i)=>s+Math.log(row[i]),0)-n/2*Math.log(2*Math.PI);
 return{predict,L,K,alpha,lml,posteriorCov:(a,b)=>kernel(a,b,opts)-dot(predict(a).v,predict(b).v)};}
const pdf=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
function cdf(z){const t=1/(1+.2316419*Math.abs(z));const q=pdf(z)*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return z>=0?1-q:q;}
function acquisition(mu,sd,best,xi=.01,kappa=2){const imp=best-mu-xi,z=sd>1e-12?imp/sd:0;return{ei:sd>1e-12?Math.max(0,imp*cdf(z)+sd*pdf(z)):Math.max(0,imp),pi:sd>1e-12?cdf(z):(imp>0?1:0),lcb:mu-kappa*sd};}
function lhs(n,d=2,seed=42){const r=rng(seed),X=Array.from({length:n},()=>[]);for(let j=0;j<d;j++){const perm=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const k=Math.floor(r()*(i+1));[perm[k],perm[i]]=[perm[i],perm[k]];}for(let i=0;i<n;i++)X[i][j]=(perm[i]+r())/n;}return X;}
function samples(xs,opts={},seed=7,model=null,count=3){const L=chol(xs.map((a,i)=>xs.map((b,j)=>(model?model.posteriorCov(a,b):kernel(a,b,opts))+(i===j?1e-8:0)))),r=rng(seed);return Array.from({length:count},()=>{const z=xs.map(()=>normal(r));return xs.map((x,i)=>(model?model.predict(x).mu:opts.mean??0)+dot(L[i],z));});}
const grid=(a,b,n=161)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const truth=x=>Math.sin(x)+.15*Math.sin(2.7*x);
const api={dot,rng,normal,chol,lower,upper,kernel,gp,pdf,cdf,acquisition,lhs,samples,grid,truth};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GP=api;
})(typeof window!=='undefined'?window:globalThis);
