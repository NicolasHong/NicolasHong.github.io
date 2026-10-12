(() => {
 'use strict';
 const {frame,chart,contours,slider,fmt,green,rust,grey}=window.OPT_UI;
 const {rf,rg}=window.OPT_MATH,{strongWolfe,trustExact,eigen2}=window.OPT_ADV_MATH,D=window.OPT_DEMOS;
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=x=>Math.hypot(...x),scale=(x,a)=>x.map(v=>v*a),add=(x,y,a=1)=>x.map((v,i)=>v+a*y[i]),mv=(A,x)=>A.map(r=>dot(r,x));
 const eye=(n,c=1)=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?c:0)),outer=(x,y)=>x.map(v=>y.map(w=>v*w));
 const matAdd=(A,B,c=1)=>A.map((r,i)=>r.map((v,j)=>v+c*B[i][j]));
 const energy=(A,b,x)=>.5*dot(x,mv(A,x))-dot(b,x),vec=x=>'('+x.map(v=>fmt(v,4)).join(', ')+')';
 const table=(heads,rows)=>'<div class="table-wrap"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const sync=el=>el.querySelectorAll('input[type=range]').forEach(e=>e.closest('label').querySelector('output').value=fmt(+e.value,2));
 function linearInit(A,b,x,precondition=false){const r=add(mv(A,x),b,-1),diag=A.map((row,i)=>precondition?row[i]:1);if(diag.some(v=>!(v>0)))throw Error('预条件器必须正定');const z=r.map((v,i)=>v/diag[i]);return {A,b,x:[...x],r,z,p:scale(z,-1),diag,k:0,tol:1e-10*(1+norm(b)),directions:[]};}
 function linearStep(s,steepest=false){
  if(s.done||s.failed)return s;const trueR=add(mv(s.A,s.x),s.b,-1);if(norm(trueR)<=s.tol)return {...s,done:true};
  const p=steepest?scale(s.r,-1):s.p,w=mv(s.A,p),den=dot(p,w),rz=steepest?dot(s.r,s.r):dot(s.r,s.z);
  if(!(den>0)||!(rz>0))return {...s,failed:true,reason:'曲率或残差内积非正，停止标准 CG'};
  const alpha=rz/den,x=add(s.x,p,alpha),r=add(s.r,w,alpha),z=r.map((v,i)=>v/s.diag[i]),beta=steepest?0:dot(r,z)/rz;
  return {...s,x,r,z,p:add(scale(z,-1),p,beta),k:s.k+1,alpha,beta,directions:[...s.directions,p],done:norm(add(mv(s.A,x),s.b,-1))<=s.tol};
 }
 function linearRun(A,b,x,pre=false,limit=200){let s=linearInit(A,b,x,pre);const states=[s];for(let k=0;k<limit;k++){s=linearStep(s);if(s.failed)break;states.push(s);if(s.done)break;}return {states,last:s};}
 function bfgsB(B,s,y){const Bs=mv(B,s),ys=dot(y,s),sBs=dot(s,Bs);if(!(ys>0&&sBs>0))return null;return matAdd(matAdd(B,outer(Bs,Bs),-1/sBs),outer(y,y),1/ys);}
 function inverseUpdate(H,s,y,method='bfgs'){
  const ys=dot(y,s),Hy=mv(H,y),yHy=dot(y,Hy);if(!(ys>0&&yHy>0))return null;
  if(method==='dfp')return matAdd(matAdd(H,outer(Hy,Hy),-1/yHy),outer(s,s),1/ys);
  const H1=matAdd(matAdd(H,outer(s,Hy),-1/ys),outer(Hy,s),-1/ys);return matAdd(H1,outer(s,s),(ys+yHy)/(ys*ys));
 }
 function dfpB(B,s,y){const Bs=mv(B,s),ys=dot(y,s);if(!(ys>0))return null;return matAdd(matAdd(matAdd(B,outer(y,Bs),-1/ys),outer(Bs,y),-1/ys),outer(y,y),(ys+dot(s,Bs))/(ys*ys));}
 function sr1Update(B,s,y,tolerance=1e-8){const v=add(y,mv(B,s),-1),den=dot(v,s),size=norm(v)*norm(s);if(size===0)return {B,updated:false,reason:'割线已满足或零试探步',den};if(Math.abs(den)<tolerance*size)return {B,updated:false,reason:'相对分母保护：跳过更新',den};return {B:matAdd(B,outer(v,v),1/den),updated:true,reason:'SR1 更新',den};}
 function nonlinearInit(x){return {x:[...x],g:rg(x),p:scale(rg(x),-1),k:0,evals:0,restarts:0};}
 function nonlinearStep(s,method='prplus',period=0){
  if(s.failed||norm(s.g)<1e-6)return {...s,done:!s.failed};let p=s.p,restarted=false;
  if(dot(s.g,p)>=-1e-10*dot(s.g,s.g)){p=scale(s.g,-1);restarted=true;}
  const ls=strongWolfe(a=>rf(add(s.x,p,a)),a=>dot(rg(add(s.x,p,a)),p),{c2:.1,maxAlpha:1024,maxEval:100});
  if(!ls.ok)return {...s,failed:true,reason:ls.reason,evals:s.evals+ls.history.length};
  const x=add(s.x,p,ls.alpha),g=rg(x),y=add(g,s.g,-1),fr=dot(g,g)/dot(s.g,s.g),pr=dot(g,y)/dot(s.g,s.g);
  let beta=method==='fr'?fr:method==='frpr'?Math.max(-fr,Math.min(fr,pr)):Math.max(0,pr),next=add(scale(g,-1),p,beta),cause='保留旧方向';
  if(period&&(s.k+1)%period===0){beta=0;next=scale(g,-1);restarted=true;cause='周期重启';}
  else if(dot(g,next)>=-1e-10*dot(g,g)){beta=0;next=scale(g,-1);restarted=true;cause='下降保护重启';}
  else if(beta===0){restarted=true;cause='β 截断重启';}
  return {x,g,p:next,k:s.k+1,evals:s.evals+ls.history.length,restarts:s.restarts+(restarted?1:0),beta,alpha:ls.alpha,ls,cause,done:norm(g)<1e-6};
 }
 function qnInit(x,gamma=1){return {x:[...x],H:eye(2,gamma),k:0,evals:0,skips:0};}
 function qnStep(s,method='bfgs'){
  if(s.failed||norm(rg(s.x))<1e-7)return {...s,done:!s.failed};const g=rg(s.x),p=scale(mv(s.H,g),-1);
  if(!(dot(g,p)<0))return {...s,failed:true,reason:'近似矩阵失去下降性'};
  const ls=strongWolfe(a=>rf(add(s.x,p,a)),a=>dot(rg(add(s.x,p,a)),p),{maxEval:100,maxAlpha:1e6});if(!ls.ok)return {...s,failed:true,reason:ls.reason,evals:s.evals+ls.history.length};
  const x=add(s.x,p,ls.alpha),step=scale(p,ls.alpha),y=add(rg(x),g,-1),ys=dot(y,step),safe=ys>1e-10*norm(y)*norm(step),H=safe?inverseUpdate(s.H,step,y,method):s.H;
  if(!H)return {...s,failed:true,reason:'曲率更新分母不合法'};
  return {x,H,k:s.k+1,evals:s.evals+ls.history.length,skips:s.skips+(safe?0:1),alpha:ls.alpha,ys,done:norm(rg(x))<1e-7};
 }
 function sr1Init(x){return {x:[...x],B:eye(2),delta:1,k:0,acceptedCount:0,updates:0};}
 function sr1Trial(s){
  if(s.failed||norm(rg(s.x))<1e-7)return {...s,done:!s.failed};const g=rg(s.x),sol=trustExact(s.B,g,s.delta),step=sol.p,candidate=add(s.x,step),y=add(rg(candidate),g,-1),ared=rf(s.x)-rf(candidate);
  if(!(sol.pred>0))return {...s,failed:true,reason:'预测下降非正'};
  const rho=ared/sol.pred,accepted=rho>1e-4,delta=rho>.75&&norm(step)>.8*s.delta?Math.min(4,2*s.delta):rho<.1?s.delta/2:s.delta,up=sr1Update(s.B,step,y);
  return {x:accepted?candidate:[...s.x],B:up.B,delta,k:s.k+1,acceptedCount:s.acceptedCount+(accepted?1:0),updates:s.updates+(up.updated?1:0),updated:up.updated,accepted,rho,pred:sol.pred,ared,step,y,candidate,origin:s.x,oldB:s.B,oldDelta:s.delta,reason:up.reason};
 }
 window.OPT_CURVATURE_MATH={linearInit,linearStep,linearRun,bfgsB,dfpB,inverseUpdate,sr1Update,nonlinearInit,nonlinearStep,qnInit,qnStep,sr1Init,sr1Trial};

 D['cg-geometry']=el=>{
  const A=[[4,1],[1,2]],b=[1,1],d=frame(el,'共轭方向与最速下降走向同一个解','<label>方法 <select id="cg-kind"><option value="cg">线性 CG</option><option value="sd">最速下降 · 精确线搜索</option></select></label><button id="cg-step" class="primary">走一步</button><button id="cg-reset">重置</button>','A = [[4,1],[1,2]]，b = (1,1)，初值 (−1.5,1.5)。横纵轴为两个决策变量。');const c=chart('CG 与最速下降的路径',[-2,2,-1.5,2.5],720,470,true),bg=contours(c,x=>energy(A,b,x),[-.27,0,.25,.5,1,2,4,8,12]);let s,path;
  function reset(){s=linearInit(A,b,[-1.5,1.5]);path=[s.x];draw();}
  function draw(){const dirs=s.directions,conj=dirs.length>=2?dot(dirs.at(-1),mv(A,dirs.at(-2)))/Math.sqrt(dot(dirs.at(-1),mv(A,dirs.at(-1)))*dot(dirs.at(-2),mv(A,dirs.at(-2)))):null;
   d.visual.innerHTML=c.start+bg+c.line(path,rust)+path.map(x=>c.point(x,rust,3)).join('')+c.point([1/7,3/7],green,5)+c.end;
   d.status.textContent=`第 ${s.k} 步；x = ${vec(s.x)}；真实残差 = ${fmt(norm(add(mv(A,s.x),b,-1)),7)}。`+(conj!==null?`相邻方向归一化 A 内积 = ${fmt(conj,7)}。`:'')+(s.done?'达到残差精度。':s.failed?s.reason:'');d.q('#cg-step').disabled=s.done||s.failed||s.k>=100;}
  d.q('#cg-step').addEventListener('click',()=>{s=linearStep(s,d.q('select').value==='sd');path.push(s.x);draw();});d.q('#cg-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);reset();
 };
 D['cg-spectrum']=el=>{
  const d=frame(el,'同样 κ = 100，比较三种谱分布',slider('spec-count','显示前几步',1,30,1,8),'24 维对角模型，x₀ 全为 1，最优解为零。纵轴为 log₁₀(能量误差/初始能量误差)。蓝色：均匀谱；红色：聚簇谱；灰色：仅三个不同特征值。');
  const lists=[Array.from({length:24},(_,i)=>1+99*i/23),[...Array.from({length:20},(_,i)=>1+.002*i),20,40,70,100],Array.from({length:24},(_,i)=>[1,10,100][i%3])];
  const runs=lists.map(vals=>{const A=vals.map((v,i)=>vals.map((_,j)=>i===j?v:0)),run=linearRun(A,Array(24).fill(0),Array(24).fill(1),false,100),e0=Math.sqrt(vals.reduce((a,b)=>a+b));return {...run,vals,points:run.states.map((s,i)=>[i,Math.log10(Math.max(1e-16,Math.sqrt(dot(s.x,mv(A,s.x)))/e0))])};});
  function draw(){sync(el);const steps=+d.q('input').value,c=chart('谱分布与 CG 能量误差',[0,steps,-16,1]);d.visual.innerHTML=c.start+runs.map((r,i)=>c.line(r.points.filter(p=>p[0]<=steps),[green,rust,grey][i])).join('')+c.end+table(['分布','达到真实残差阈值的步数','不同特征值数'],runs.map((r,i)=>[['均匀','聚簇','重复'][i],r.last.done?r.last.k:'预算内未达到',new Set(r.vals).size]));d.status.textContent='曲线在停止时结束，低于 10⁻¹⁶ 的误差仅在绘图时截断。相同条件数不意味着相同收敛轨迹；实际计算为双精度浮点运算。';}
  d.q('input').addEventListener('input',draw);draw();
 };
 function scaledModel(n,exponent){const S=Array.from({length:n},(_,i)=>10**(exponent*i/(n-1))),A=S.map((v,i)=>S.map((w,j)=>v*w*(i===j?2:Math.abs(i-j)===1?-.7:0))),exact=Array(n).fill(1);return {A,b:mv(A,exact),exact};}
 D['cg-precondition']=el=>{
  const d=frame(el,'变量尺度越悬殊，预条件越重要',slider('pcg-scale','最大/最小变量尺度的十进制指数',0,3,.25,2),'原创 24 维耦合模型 A = S T S，T 的主对角为 2、相邻项为 −0.7。比较普通 CG（红）与 Jacobi-PCG（蓝）；纵轴为真实残差相对初值的 log₁₀。');
  function draw(){sync(el);const {A,b,exact}=scaledModel(24,+d.q('input').value),runs=[linearRun(A,b,Array(24).fill(0),false,250),linearRun(A,b,Array(24).fill(0),true,250)],r0=norm(b),maxK=Math.max(...runs.map(r=>r.last.k)),c=chart('CG 与 Jacobi PCG 的真实残差',[0,Math.max(1,maxK),-12,1]);
   d.visual.innerHTML=c.start+runs.map((r,i)=>c.line(r.states.map(s=>[s.k,Math.log10(Math.max(1e-12,norm(add(mv(A,s.x),b,-1))/r0))]),i?green:rust)).join('')+c.end+table(['方法','迭代数','相对真实残差','相对解误差'],runs.map((r,i)=>[i?'Jacobi-PCG':'CG',r.last.k+(r.last.done?'':'（达上限/停止）'),fmt(norm(add(mv(A,r.last.x),b,-1))/r0,7),fmt(norm(add(r.last.x,exact,-1))/norm(exact),7)]));d.status.textContent='同一混合残差阈值：10⁻¹⁰(1 + ‖b‖)。PCG 每步还需应用一次对角预条件器。为诊断而重新计算残差的额外乘法未计入迭代数。';}
  d.q('input').addEventListener('input',draw);draw();
 };
 const starts=id=>`<label>初值 <select id="${id}"><option value="-1.2,1">(−1.2, 1)</option><option value="0,1">(0, 1)</option><option value="1.5,-0.5">(1.5, −0.5)</option></select></label>`;
 const rosen=()=>{const c=chart('Rosenbrock 目标与迭代',[-2,2.2,-1,3.2],720,470,true);return {c,bg:contours(c,rf,[.2,1,4,10,30,100,300,1000],75)};};
 D['cg-nonlinear']=el=>{
  const d=frame(el,'非线性 CG：保留方向还是重启？','<label>公式 <select id="ncg-method"><option value="prplus">PR+</option><option value="fr">FR</option><option value="frpr">FR–PR</option></select></label><label>周期重启 <select id="ncg-period"><option value="0">关闭（仍检查下降）</option><option value="2">每 2 步</option><option value="10">每 10 步</option></select></label>'+starts('ncg-start')+'<button class="primary" id="ncg-one">走一步</button><button id="ncg-run">运行 20 步</button><button id="ncg-reset">重置</button>','所有公式都使用强 Wolfe：c₁ = 10⁻⁴，c₂ = 0.1。额外检查充分下降方向，不合格时重启；这不是未经保护的原始 PR+。');const {c,bg}=rosen();let s,path;
  function reset(){s=nonlinearInit(d.q('#ncg-start').value.split(',').map(Number));path=[s.x];draw();}
  function draw(){d.visual.innerHTML=c.start+bg+c.line(path,rust)+c.point(s.x,rust,5)+c.point([1,1],green,4)+c.end;d.status.textContent=`迭代 ${s.k}；f = ${fmt(rf(s.x),7)}；‖g‖ = ${fmt(norm(s.g),7)}；内层函数/导数成对试探 ${s.evals}；重启 ${s.restarts} 次。`+(s.k?`β = ${fmt(s.beta,4)}；${s.cause}。`:'')+(s.failed?s.reason:s.done?'达到梯度精度。':s.k>=2000?'达到 2000 步上限。':'');d.q('#ncg-one').disabled=d.q('#ncg-run').disabled=s.done||s.failed||s.k>=2000;}
  function step(n){for(let i=0;i<n&&!s.done&&!s.failed&&s.k<2000;i++){s=nonlinearStep(s,d.q('#ncg-method').value,+d.q('#ncg-period').value);path.push(s.x);}draw();}
  d.q('#ncg-one').addEventListener('click',()=>step(1));d.q('#ncg-run').addEventListener('click',()=>step(20));d.q('#ncg-reset').addEventListener('click',reset);el.querySelectorAll('select').forEach(e=>e.addEventListener('change',reset));reset();
 };
 D['qn-secant']=el=>{
  const d=frame(el,'同一观测对，不同曲率更新','<label>真实曲率 A <select id="secant-A"><option value="positive">正定：diag(2, 5)</option><option value="indefinite">不定：diag(−2, 5)</option></select></label>'+slider('secant-angle','试探方向角（度）',0,90,1,35),'初始 B = I，s = (cos θ, sin θ)，y = As。表格直接检查割线残差和更新矩阵的最小特征值。');
  function draw(){sync(el);const A=[[d.q('select').value==='positive'?2:-2,0],[0,5]],angle=+d.q('input').value*Math.PI/180,s=[Math.cos(angle),Math.sin(angle)],y=mv(A,s),B=eye(2),sr=sr1Update(B,s,y),updates=[['BFGS',bfgsB(B,s,y)],['DFP',dfpB(B,s,y)],['SR1',sr.B]];
   d.visual.innerHTML=table(['方法','更新矩阵 B₊','‖B₊s − y‖','最小特征值'],updates.map(([name,U])=>U?[name,`[${U[0].map(v=>fmt(v,3)).join(', ')}; ${U[1].map(v=>fmt(v,3)).join(', ')}]`,fmt(norm(add(mv(U,s),y,-1)),7),fmt(eigen2(U).d[0],5)]:[name,'不满足正曲率，未应用','—','—']));d.status.textContent=`sᵀy = ${fmt(dot(s,y),5)}；SR1：${sr.reason}。负曲率观测不能同时与精确割线和正定模型兼容。`;}
  el.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',draw));draw();
 };
 D['qn-compare']=el=>{
  const d=frame(el,'同一线搜索，比较 BFGS 与 DFP',starts('qn-start')+slider('qn-scale','H₀ = 10ᵃ I 中的 a',-2,2,.25,0)+'<button id="qn-run" class="primary">两种方法各运行 10 步</button><button id="qn-reset">重置</button>','两者采用相同 c₁ = 10⁻⁴、c₂ = 0.9 和单位步优先，内层最多 100 次试探、α 上限 10⁶。蓝线 BFGS，红线 DFP；每种方法最多 500 步。');const {c,bg}=rosen();let states,paths;
  function reset(){const x=d.q('select').value.split(',').map(Number),gamma=10**(+d.q('input').value);states=[qnInit(x,gamma),qnInit(x,gamma)];paths=[[x],[x]];sync(el);draw();}
  function draw(){d.visual.innerHTML=c.start+bg+paths.map((p,i)=>c.line(p,i?rust:green)+c.point(p.at(-1),i?rust:green,4)).join('')+c.end+table(['方法','迭代','函数值','‖g‖','内层成对试探','状态'],states.map((s,i)=>[i?'DFP':'BFGS',s.k,fmt(rf(s.x),7),fmt(norm(rg(s.x)),7),s.evals,s.failed?s.reason:s.done?'达到精度':s.k>=500?'达到上限':'可继续']));d.status.textContent='同一迭代数不代表同一评价成本；曲率保护偶发跳过次数：'+states.map((s,i)=>(i?'DFP ':'BFGS ')+s.skips).join('，')+'。';d.q('#qn-run').disabled=states.every(s=>s.done||s.failed||s.k>=500);}
  d.q('#qn-run').addEventListener('click',()=>{states=states.map((s,j)=>{for(let i=0;i<10&&!s.done&&!s.failed&&s.k<500;i++){s=qnStep(s,j?'dfp':'bfgs');paths[j].push(s.x);}return s;});draw();});d.q('#qn-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);d.q('input').addEventListener('input',reset);reset();
 };
 D['qn-sr1-trust']=el=>{
  const d=frame(el,'拒绝位置，仍然学习曲率',starts('sr-start')+'<button id="sr-one" class="primary">试探一次</button><button id="sr-run">试探 10 次</button><button id="sr-reset">重置</button>','初始 B = I，Δ = 1，η = 10⁻⁴；子问题用二维精确解。位置接受与矩阵更新分别显示，最多 400 次试探。');const {c,bg}=rosen();let s,path,log;
  function reset(){s=sr1Init(d.q('select').value.split(',').map(Number));path=[s.x];log=[];draw();}
  function draw(){d.visual.innerHTML=c.start+bg+c.line(path,rust)+(s.candidate?c.line([s.origin,s.candidate],grey,'4 4'):'')+c.point(s.x,rust,5)+c.point([1,1],green,4)+c.end+table(['试探','ρ','位置','曲率更新','λmin(B)','新 Δ'],log.slice(-8).map(v=>[v.k,fmt(v.rho,4),v.accepted?'接受':'拒绝',v.updated?'已更新':'跳过',fmt(eigen2(v.B).d[0],4),fmt(v.delta,4)]));d.status.textContent=`试探 ${s.k} 次，位置接受 ${s.acceptedCount} 次，矩阵更新 ${s.updates} 次；f = ${fmt(rf(s.x),7)}；‖g‖ = ${fmt(norm(rg(s.x)),7)}。`+(s.failed?s.reason:s.done?'达到一阶梯度精度。':s.k>=400?'达到试探上限。':'');d.q('#sr-one').disabled=d.q('#sr-run').disabled=s.done||s.failed||s.k>=400;}
  function step(n){for(let i=0;i<n&&!s.done&&!s.failed&&s.k<400;i++){s=sr1Trial(s);if(!s.done&&!s.failed){log.push(s);if(s.accepted)path.push(s.x);}}draw();}
  d.q('#sr-one').addEventListener('click',()=>step(1));d.q('#sr-run').addEventListener('click',()=>step(10));d.q('#sr-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);reset();
 };
})();
