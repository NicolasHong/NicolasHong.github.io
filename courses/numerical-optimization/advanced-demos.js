(() => {
 'use strict';
 const {frame,chart,contours,slider,fmt,green,rust,grey}=window.OPT_UI;
 const {rf,rg,rh}=window.OPT_MATH, demos=window.OPT_DEMOS;
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a);
 const add=(a,b,t=1)=>a.map((v,i)=>v+t*b[i]),scale=(a,t)=>a.map(v=>t*v);
 const mv=(A,x)=>A.map(r=>dot(r,x)),I=()=>[[1,0],[0,1]];
 const model=(B,g,p)=>dot(g,p)+.5*dot(p,mv(B,p));
 const table=(headers,rows)=>'<div class="table-wrap"><table><thead><tr>'+headers.map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const vec=p=>'('+p.map(v=>fmt(v,4)).join(', ')+')';
 const sync=el=>el.querySelectorAll('input[type="range"]').forEach(x=>x.closest('label').querySelector('output').value=fmt(+x.value,2));
 const circle=r=>Array.from({length:181},(_,i)=>[r*Math.cos(i*Math.PI/90),r*Math.sin(i*Math.PI/90)]);

 // Bracket and bisection zoom: endpoints retain semantic lo/hi roles.
 function strongWolfe(phi,der,{initial=1,c1=1e-4,c2=.9,maxAlpha=64,maxEval=80}={}){
  const f0=phi(0),d0=der(0),history=[];
  if(!(d0<0)||!Number.isFinite(f0)||!(0<c1&&c1<c2&&c2<1)||!(initial>0)||!(maxAlpha>0))return {ok:false,history,reason:'无效初值、参数或非下降方向'};
  const accept=(a,f,d)=>({ok:true,alpha:a,f,d,history});
  const evaluate=(a,phase)=>{const f=phi(a),d=der(a);history.push({a,f,d,phase,armijo:Number.isFinite(f)&&f<=f0+c1*a*d0,curvature:Number.isFinite(d)&&Math.abs(d)<=-c2*d0});return {f,d};};
  function zoom(lo,hi,flo){
   while(history.length<maxEval){
    const a=(lo+hi)/2;if(a===lo||a===hi)break;
    const {f,d}=evaluate(a,'zoom');
    if(!Number.isFinite(f)||f>f0+c1*a*d0||f>=flo){hi=a;continue;}
    if(Number.isFinite(d)&&Math.abs(d)<=-c2*d0)return accept(a,f,d);
    if(!Number.isFinite(d))return {ok:false,history,reason:'非有限方向导数'};
    if(d*(hi-lo)>=0)hi=lo;lo=a;flo=f;
   }
   return {ok:false,history,reason:'zoom 达到精度或评价次数限制'};
  }
  let prev=0,fprev=f0,a=Math.min(initial,maxAlpha);
  while(history.length<maxEval){
   const {f,d}=evaluate(a,'bracket');
   if(!Number.isFinite(f)||f>f0+c1*a*d0||(prev>0&&f>=fprev))return zoom(prev,a,fprev);
   if(Number.isFinite(d)&&Math.abs(d)<=-c2*d0)return accept(a,f,d);
   if(!Number.isFinite(d))return {ok:false,history,reason:'非有限方向导数'};
   if(d>=0)return zoom(a,prev,f);
   if(a>=maxAlpha)break;prev=a;fprev=f;a=Math.min(2*a,maxAlpha);
  }
  return {ok:false,history,reason:'未在搜索范围和评价次数内找到强 Wolfe 步长'};
 }
 function bfgsStep(x,H=I()){
  const g=rg(x);if(norm(g)<1e-7)return {ok:true,x:[...x],H,stop:true};
  let p=scale(mv(H,g),-1),reset=false;
  if(!(dot(g,p)<0)){H=I();p=scale(g,-1);reset=true;}
  const ls=strongWolfe(a=>rf(add(x,p,a)),a=>dot(rg(add(x,p,a)),p));
  if(!ls.ok)return {...ls,x:[...x],H};
  const next=add(x,p,ls.alpha),s=scale(p,ls.alpha),y=add(rg(next),g,-1),ys=dot(y,s);
  let updated=H,skipped=true;
  if(ys>1e-10*norm(y)*norm(s)){
   const rho=1/ys,Hy=mv(H,y),coef=(1+rho*dot(y,Hy))*rho;
   updated=H.map((row,i)=>row.map((v,j)=>v-rho*(s[i]*Hy[j]+Hy[i]*s[j])+coef*s[i]*s[j]));skipped=false;
  }
  return {ok:true,x:next,H:updated,ls,ys,skipped,reset,p};
 }
 // Symmetric 2x2 eigensystem, ordered from smallest to largest eigenvalue.
 function eigen2(B){const a=B[0][0],b=B[0][1],c=B[1][1],h=Math.hypot((a-c)/2,b),t=.5*Math.atan2(2*b,a-c);return {d:[(a+c)/2-h,(a+c)/2+h],Q:[[-Math.sin(t),Math.cos(t)],[Math.cos(t),Math.sin(t)]]};}
 function trustExact(B,g,delta){
  if(!(delta>0))throw Error('半径必须为正');
  const {d,Q}=eigen2(B),beta=Q.map(q=>dot(q,g)),tol=1e-13*Math.max(1,...d.map(Math.abs));
  const reconstruct=z=>add(scale(Q[0],z[0]),scale(Q[1],z[1]));
  const result=(z,lambda,branch)=>{const p=reconstruct(z);return {p,lambda,branch,pred:-model(B,g,p)};};
  const lower=Math.max(0,-d[0]),den=d.map(v=>v+lower);
  const compatible=den.every((v,i)=>v>tol||Math.abs(beta[i])<=1e-13*Math.max(1,norm(g)));
  const z0=den.map((v,i)=>v>tol?-beta[i]/v:0);
  if(compatible&&norm(z0)<=delta){
   if(lower===0)return result(z0,0,'域内最小点');
   z0[0]=Math.sqrt(Math.max(0,delta*delta-dot(z0,z0)));return result(z0,lower,'困难情形：补入负曲率');
  }
  const step=l=>d.map((v,i)=>-beta[i]/(v+l));
  let lo=lower,hi=lower+Math.max(1,norm(g)/delta);
  while(norm(step(hi))>delta)hi=lower+2*(hi-lower);
  // hi is the feasible side of the bracket; never divide at the singular lower bound.
  for(let i=0;i<120;i++){const mid=(lo+hi)/2;if(mid===lo||mid===hi)break;if(norm(step(mid))>delta)lo=mid;else hi=mid;}
  return result(step(hi),hi,'普通边界解');
 }
 function cauchy(B,g,delta){const ng=norm(g);if(!ng)return [0,0];const cur=dot(g,mv(B,g)),t=cur>0?Math.min(ng*ng/cur,delta/ng):delta/ng;return scale(g,-t);}
 function dogleg(B,g,delta){
  if(eigen2(B).d[0]<=0)throw Error('Dogleg 要求正定模型');
  if(!norm(g))return [0,0];
  const det=B[0][0]*B[1][1]-B[0][1]**2,pB=[(-B[1][1]*g[0]+B[0][1]*g[1])/det,(B[0][1]*g[0]-B[0][0]*g[1])/det];
  if(norm(pB)<=delta)return pB;
  const pU=scale(g,-dot(g,g)/dot(g,mv(B,g)));if(norm(pU)>=delta)return scale(g,-delta/norm(g));
  const v=add(pB,pU,-1),b=dot(pU,v),a=dot(v,v),c=dot(pU,pU)-delta*delta;
  const t=-c/(b+Math.sqrt(b*b-a*c));return add(pU,v,t);
 }
 function trustTrial(x,delta){
  const g=rg(x),B=rh(x),minEig=eigen2(B).d[0];
  if(norm(g)<1e-7&&minEig>=-1e-8)return {x:[...x],delta,stop:true};
  const r=trustExact(B,g,delta),candidate=add(x,r.p),ared=rf(x)-rf(candidate);
  if(!(r.pred>0))return {...r,x:[...x],delta,failed:true,reason:'预测下降非正，请检查停止精度或模型'};
  const rho=ared/r.pred,boundary=norm(r.p)>=delta*(1-1e-8),accepted=rho>.1;
  const nextDelta=rho<.25?delta/4:(rho>.75&&boundary?Math.min(2*delta,4):delta);
  return {...r,x:accepted?candidate:[...x],candidate,oldDelta:delta,delta:nextDelta,rho,ared,accepted};
 }
 window.OPT_ADV_MATH={strongWolfe,bfgsStep,eigen2,trustExact,cauchy,dogleg,trustTrial,model};

 demos['ls-backtrack']=el=>{
  const d=frame(el,'逐次拒绝，直到充分下降',slider('bt-initial','初始 α',.25,4,.05,4)+slider('bt-rho','缩短比例 ρ',.1,.9,.05,.5)+'<button class="primary" id="bt-next">检查下一个候选</button><button id="bt-reset">重置</button>','φ(α) = (1 − α)⁴ + 0.1(1 − α)²；c₁ = 0.1。修改参数会重新开始。');let rows,a,done;
  function reset(){rows=[];a=+d.q('#bt-initial').value;done=false;sync(el);draw();}
  function draw(){d.visual.innerHTML=table(['试探','α','φ(α)','Armijo 上界','判断'],rows);d.status.textContent=done?`已接受 α = ${fmt(a,6)}；共 ${rows.length} 次函数试探。`:`下一候选 α = ${fmt(a,6)}。`;d.q('#bt-next').disabled=done;}
  d.q('#bt-next').addEventListener('click',()=>{const f=(1-a)**4+.1*(1-a)**2,bound=1.1-.42*a;done=f<=bound;rows.push([rows.length+1,fmt(a,5),fmt(f,5),fmt(bound,5),done?'接受':'拒绝']);if(!done)a*=+d.q('#bt-rho').value;draw();});d.q('#bt-reset').addEventListener('click',reset);el.querySelectorAll('input').forEach(x=>x.addEventListener('input',reset));reset();
 };
 demos['ls-modify']=el=>{
  const d=frame(el,'正定化之后，还要检查步子的尺度',slider('mod-exp','δ 的十进制指数',-4,1,.25,0),'A = diag(−2, 4)，g = (2, 1)。比较原 Newton 方向、特征值截断和统一对角移位。');
  function draw(){sync(el);const delta=10**(+d.q('input').value),tau=Math.max(0,delta+2),data=[['原矩阵',[-2,4]],['特征值截断',[delta,Math.max(4,delta)]],['统一移位',[-2+tau,4+tau]]];
   d.visual.innerHTML=table(['方法','特征值','方向 p','gᵀp','‖p‖'],data.map(([name,e])=>{const p=[-2/e[0],-1/e[1]];return [name,e.map(v=>fmt(v,4)).join(', '),vec(p),fmt(dot([2,1],p),4),fmt(norm(p),4)];}));d.status.textContent=`δ = ${fmt(delta,5)}。负的 gᵀp 才是下降方向；δ 太小时，修正虽恢复下降，步子却可能很大，仍需要线搜索。`;}
  d.q('input').addEventListener('input',draw);draw();
 };
 const startSelect=id=>`<label>初值 <select id="${id}"><option value="-1.2,1">(−1.2, 1)</option><option value="0,1">(0, 1)</option><option value="1.5,-0.5">(1.5, −0.5)</option></select></label>`;
 const rosenPlot=()=>{const c=chart('Rosenbrock 等高线与迭代轨迹',[-2,2.2,-1,3.2],720,470,true);return {c,bg:contours(c,rf,[.2,1,4,10,30,100,300,1000],80)};};
 demos['ls-bfgs']=el=>{
  const d=frame(el,'BFGS + 强 Wolfe：查看一次内层搜索',startSelect('bf-start')+'<button id="bf-one" class="primary">走一步</button><button id="bf-run">运行 10 步</button><button id="bf-reset">重置</button>','初始逆 Hessian 近似为单位阵。c₁ = 10⁻⁴，c₂ = 0.9；括区间后用二分 zoom，最多 80 次试探。');const {c,bg}=rosenPlot();let path,H,last,failed;
  function reset(){path=[d.q('select').value.split(',').map(Number)];H=I();last=null;failed=false;draw();}
  function draw(){const x=path.at(-1),stop=norm(rg(x))<1e-7||path.length>300||failed;
   d.visual.innerHTML=c.start+bg+c.line(path,rust)+c.point(x,rust,5)+c.point([1,1],green,5)+c.end+(last?.ls?table(['本步内层试探','阶段','α','φ','φ′','Armijo','强曲率'],last.ls.history.map((v,i)=>[i+1,v.phase,fmt(v.a,5),fmt(v.f,5),fmt(v.d,4),v.armijo?'满足':'不满足',v.curvature?'满足':'不满足'])):'');
   d.status.textContent=`外层 ${path.length-1} 步；f = ${fmt(rf(x),7)}；‖g‖ = ${fmt(norm(rg(x)),6)}。`+(last?.ls?`α = ${fmt(last.ls.alpha,5)}；sᵀy = ${fmt(last.ys,6)}；${last.skipped?'跳过弱曲率更新':'更新 BFGS 矩阵'}。`:'')+(failed?last.reason:(stop?(norm(rg(x))<1e-7?'达到梯度精度。':'达到 300 步上限。'):''));d.q('#bf-one').disabled=d.q('#bf-run').disabled=stop;}
  function step(n){for(let j=0;j<n;j++){if(norm(rg(path.at(-1)))<1e-7||path.length>300||failed)break;last=bfgsStep(path.at(-1),H);if(!last.ok){failed=true;break;}H=last.H;path.push(last.x);}draw();}
  d.q('#bf-one').addEventListener('click',()=>step(1));d.q('#bf-run').addEventListener('click',()=>step(10));d.q('#bf-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);reset();
 };
 demos['tr-dogleg']=el=>{
  const B=[[1,0],[0,8]],g=[-2,-2],pB=[2,.25],pU=scale(g,-dot(g,g)/dot(g,mv(B,g)));
  const trajectory=[[0,0],...Array.from({length:100},(_,i)=>trustExact(B,g,norm(pB)*(i+1)/100).p)];
  const d=frame(el,'Dogleg 折线如何近似随半径变化的最优轨迹？',slider('dog-radius','半径 Δ',.1,2.5,.05,1),'蓝色曲线连接固定模型在不同半径下的精确最优步；灰折线为 Dogleg 路径，灰虚线圆为当前信赖域。蓝点为当前精确解，红点为 Dogleg，灰点为 Cauchy。视窗聚焦候选步区域，虚线圆可能超出视窗。这些曲线是子问题解路径，不是原目标的多次迭代轨迹。');const c=chart('Dogleg 折线与精确信赖域解随半径变化的轨迹',[-.3,2.5,-.6,1.1],720,470,true),bg=contours(c,p=>model(B,g,p),[-2,-1.5,-1,0,1,2,4,8,16]);
  function draw(){sync(el);const delta=+d.q('input').value,pc=cauchy(B,g,delta),pd=dogleg(B,g,delta),pe=trustExact(B,g,delta);
   d.visual.innerHTML=c.start+bg+`<defs><clipPath id="dogleg-circle-clip"><rect x="${c.X(-.3)}" y="${c.Y(1.1)}" width="${c.X(2.5)-c.X(-.3)}" height="${c.Y(-.6)-c.Y(1.1)}"/></clipPath></defs><g clip-path="url(#dogleg-circle-clip)">`+c.line(circle(delta),grey,'5 4')+'</g>'+c.line(trajectory,green)+c.line([[0,0],pU,pB],grey)+c.point([0,0],grey,4)+c.point(pU,grey,4)+c.text(pU,'pᵁ',grey)+c.point(pB,green,4)+c.text(pB,'pᴮ / Newton')+c.point(pc,grey,7)+c.point(pd,rust,5)+c.point(pe.p,green,3)+c.end+table(['步','p','预测下降'],[['Cauchy',vec(pc),fmt(-model(B,g,pc),5)],['Dogleg',vec(pd),fmt(-model(B,g,pd),5)],['精确解',vec(pe.p),fmt(pe.pred,5)]]);d.status.textContent=`Δ = ${fmt(delta,2)}；精确解乘子 λ = ${fmt(pe.lambda,5)}。Dogleg 与精确解的距离 = ${fmt(norm(add(pd,pe.p,-1)),4)}。`+(delta>=norm(pB)?'完整 Newton 步已可行，两条路径都到达同一终点。':'同一半径截取曲线与折线上的候选步；Dogleg 保证不差于 Cauchy，但一般不是精确解。');}
  d.q('input').addEventListener('input',draw);draw();
 };
 demos['tr-hard']=el=>{
  const B=[[-1,0],[0,2]],g=[0,1];const d=frame(el,'半径跨过 1/3，最优步离开梯度轴',slider('hard-radius','半径 Δ',.1,2,.01,.7),'横纵轴分别为 p₁、p₂；红色点是全局解，灰点是沿负梯度的 Cauchy 点。');const c=chart('困难情形与负曲率',[-2.2,2.2,-2.2,2.2],720,470,true),bg=contours(c,p=>model(B,g,p),[-2,-1,-.5,-.25,0,.5,1,2,4,8]);
  function draw(){sync(el);const delta=+d.q('input').value,r=trustExact(B,g,delta),pc=cauchy(B,g,delta),other=[-r.p[0],r.p[1]];
   d.visual.innerHTML=c.start+bg+c.line(circle(delta),green,'5 4')+c.line([[0,0],pc],grey)+c.point(pc,grey,7)+c.point(r.p,rust,4)+c.point(other,rust,4)+c.end+table(['方法','p','模型下降'],[['Cauchy',vec(pc),fmt(-model(B,g,pc),5)],['全局解',vec(r.p),fmt(r.pred,5)]]);d.status.textContent=`λ = ${fmt(r.lambda,5)}；${r.branch}。`+(delta>1/3?'两个对称解同样最优；补入负曲率分量会增大模型下降。':'半径尚未超过临界值，最优解在负梯度轴上。');}
  d.q('input').addEventListener('input',draw);draw();
 };
 demos['tr-adaptive']=el=>{
  const d=frame(el,'一步试探，两个决策：接受位置与调整半径',startSelect('tr-start')+slider('tr-initial','初始 Δ',.1,3,.1,1)+'<button id="tr-one" class="primary">试探一次</button><button id="tr-run">试探 10 次</button><button id="tr-reset">重置</button>','记录最近 8 次试探；候选被拒绝时，当前位置保持不变。灰虚线连接最近试探的起点与候选点。');const {c,bg}=rosenPlot();let path,delta,last,log,failed;
  function reset(){path=[d.q('select').value.split(',').map(Number)];delta=+d.q('input').value;last=null;log=[];failed=false;sync(el);draw();}
  function draw(){const x=path.at(-1),stop=(norm(rg(x))<1e-7&&eigen2(rh(x)).d[0]>=-1e-8)||log.length>=300||failed;
   d.visual.innerHTML=c.start+bg+c.line(path,rust)+(last?.candidate?c.line([last.origin,last.candidate],grey,'5 4')+c.point(last.candidate,grey,4):'')+c.point(x,rust,5)+c.point([1,1],green,4)+c.end+table(['试探','原 Δ','pred','ared','ρ','位置','新 Δ'],log.slice(-8).map((r,i)=>[log.length-Math.min(8,log.length)+i+1,fmt(r.oldDelta,4),fmt(r.pred,4),fmt(r.ared,4),fmt(r.rho,3),r.accepted?'接受':'拒绝',fmt(r.delta,4)]));
   d.status.textContent=`试探 ${log.length} 次，接受 ${path.length-1} 步；f = ${fmt(rf(x),7)}；‖g‖ = ${fmt(norm(rg(x)),6)}；当前 Δ = ${fmt(delta,5)}。`+(last?.branch?`最近子问题：${last.branch}。`:'')+(failed?last.reason:(stop?(norm(rg(x))<1e-7?'达到梯度与曲率停止精度。':'达到 300 次试探上限。'):''));d.q('#tr-one').disabled=d.q('#tr-run').disabled=stop;}
  function step(n){for(let i=0;i<n;i++){if(failed||log.length>=300)break;const origin=path.at(-1);last=trustTrial(origin,delta);if(last.stop)break;if(last.failed){failed=true;break;}last.origin=origin;log.push(last);delta=last.delta;if(last.accepted)path.push(last.x);}draw();}
  d.q('#tr-one').addEventListener('click',()=>step(1));d.q('#tr-run').addEventListener('click',()=>step(10));d.q('#tr-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);d.q('input').addEventListener('input',reset);reset();
 };
 demos['ls-step-tradeoff']=el=>{
  const d=frame(el,'同一个下降方向，比较不同步长',slider('ls-tradeoff-alpha','步长 α',.01,3,.01,.05)+'<button data-alpha="0.05">很短：0.05</button><button data-alpha="1">到谷底：1</button><button data-alpha="2.5">过长：2.5</button>','横轴是步长 α，纵轴是沿线函数值 φ(α) = (1 − α)²。蓝线为目标，灰虚线为出发时的函数值 1，红点为本次候选。');
  const c=chart('步长与沿线目标：短步、谷底与过长步',[0,3,-.2,4.3],720,360);
  function draw(){const a=+d.q('input').value,v=(1-a)**2,drop=1-v;sync(el);
   d.visual.innerHTML=c.start+c.line(c.curve(t=>(1-t)**2),green)+c.line([[0,1],[3,1]],grey,'5 4')+c.line([[a,0],[a,v]],rust,'3 3')+c.point([1,0],green,5)+c.text([1,0],'谷底：α = 1')+c.point([a,v],rust,6)+c.text([.02,4],'φ(α)')+c.text([2.72,.05],'α')+c.end;
   const reason=Math.abs(a-1)<1e-9?'恰好达到这个例子的沿线最小值。':Math.abs(drop)<1e-9?'目标与出发时相同，没有取得下降。':drop<0?'目标高于出发时，这个步长过长。':a<.2?'目标下降，但这次只走了很短的一段；继续沿线仍有明显收益。':a<1?'目标下降，尚未到达沿线谷底。':'虽然已经越过谷底，目标仍低于出发时；越过谷底不一定使本步失败。';
   d.status.textContent=`α = ${fmt(a,2)}；新位置 x = ${fmt(1-a,2)}；新函数值 = ${fmt(v,4)}；实际下降量 = ${fmt(drop,4)}。${reason}`;
  }
  d.q('input').addEventListener('input',draw);el.querySelectorAll('[data-alpha]').forEach(b=>b.addEventListener('click',()=>{d.q('input').value=b.dataset.alpha;draw();}));draw();
 };
})();
