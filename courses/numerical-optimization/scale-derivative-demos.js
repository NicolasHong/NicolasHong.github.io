(() => {
 'use strict';
 const {frame,chart,contours,slider,fmt,green,rust,grey}=window.OPT_UI;
 const {strongWolfe,trustExact}=window.OPT_ADV_MATH,D=window.OPT_DEMOS;
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=x=>Math.hypot(...x),scale=(x,a)=>x.map(v=>v*a),add=(x,y,a=1)=>x.map((v,i)=>v+a*y[i]),mv=(A,x)=>A.map(r=>dot(r,x));
 const vec=x=>'('+x.map(v=>fmt(v,5)).join(', ')+')';
 const table=(heads,rows)=>'<div class="table-wrap"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const sync=el=>el.querySelectorAll('input[type=range]').forEach(e=>e.closest('label').querySelector('output').value=fmt(+e.value,3));
 const model=(g,B,p)=>dot(g,p)+.5*dot(p,B(p));
 function boundary(z,d,delta){const a=dot(d,d),b=dot(z,d),c=dot(z,z)-delta*delta,s=Math.sqrt(Math.max(0,b*b-a*c));return [(-b-s)/a,(-b+s)/a];}
 // Zero initialization and explicit nonpositive curvature handling; B is an operator.
 function truncatedCG(B,g,{eta=.1,delta=Infinity,maxIter=g.length}={}){
  let z=g.map(()=>0),r=[...g],d=scale(r,-1),ops=0;const tol=eta*norm(g),path=[[...z]],residuals=[norm(r)];
  const finish=(p,reason)=>({p,reason,ops,path,residuals,relativeResidual:norm(add(B(p),g))/(norm(g)||1)});
  if(norm(g)===0)return finish(z,'零梯度');
  for(let j=0;j<maxIter;j++){
   const Bd=B(d),curv=dot(d,Bd);ops++;
   if(curv<=0){let p;if(Number.isFinite(delta)){const candidates=boundary(z,d,delta).map(t=>add(z,d,t));p=candidates.reduce((a,b)=>model(g,B,a)<model(g,B,b)?a:b);}else p=j===0?scale(g,-1):z;path.push(p);return finish(p,'非正曲率');}
   const rr=dot(r,r),alpha=rr/curv,next=add(z,d,alpha);
   if(norm(next)>=delta){const p=add(z,d,boundary(z,d,delta)[1]);path.push(p);return finish(p,'触及边界');}
   z=next;r=add(r,Bd,alpha);path.push([...z]);residuals.push(norm(r));
   if(norm(r)<=tol)return finish(z,'残差达标');
   d=add(scale(r,-1),d,dot(r,r)/rr);
  }
  return finish(z,'内层预算耗尽');
 }
 function forcingRun(mode){const diag=Array.from({length:24},(_,i)=>10**(2*i/23)),B=x=>x.map((v,i)=>diag[i]*v);let x=Array(24).fill(1),total=0;const history=[{k:0,g:norm(B(x)),ops:0,eta:null,inner:0}];
  for(let k=0;k<60&&norm(B(x))>1e-8;k++){const g=B(x),gn=norm(g),eta=mode==='fixed'?.5:mode==='super'?Math.min(.5,Math.sqrt(gn)):mode==='quadratic'?Math.min(.5,gn):1e-12,res=truncatedCG(B,g,{eta,maxIter:96});x=add(x,res.p);total+=res.ops;history.push({k:k+1,g:norm(B(x)),ops:total,eta,inner:res.ops,reason:res.reason});}
  return {x,history,done:norm(B(x))<=1e-8};
 }
 function twoLoop(g,pairs,gamma=1){let q=[...g];const aa=[];for(let i=pairs.length-1;i>=0;i--){const {s,y}=pairs[i],rho=1/dot(s,y);aa[i]=rho*dot(s,q);q=add(q,y,-aa[i]);}let r=scale(q,gamma);for(let i=0;i<pairs.length;i++){const {s,y}=pairs[i],beta=dot(y,r)/dot(s,y);r=add(r,s,aa[i]-beta);}return r;}
 function largeModel(n=24){const diag=Array.from({length:n},(_,i)=>10**(2*i/(n-1))),hv=x=>x.map((v,i)=>diag[i]*v+.2*((i>0?v-x[i-1]:0)+(i<n-1?v-x[i+1]:0)));return {f:x=>.5*dot(x,hv(x)),g:hv,hv,start:diag.map((_,i)=>1+.3*Math.sin(i))};}
 function lbfgsInit(problem){return {x:[...problem.start],pairs:[],k:0,evals:0,skips:0};}
 function lbfgsStep(problem,state,m){if(state.done||state.failed)return state;const g=problem.g(state.x);if(norm(g)<1e-6)return {...state,done:true};const last=state.pairs.at(-1),gamma=last?dot(last.s,last.y)/dot(last.y,last.y):1,p=scale(twoLoop(g,state.pairs,gamma),-1);
  if(!(dot(g,p)<0))return {...state,failed:true,reason:'方向不下降'};
  const ls=strongWolfe(t=>problem.f(add(state.x,p,t)),t=>dot(problem.g(add(state.x,p,t)),p),{c1:1e-4,c2:.9,initial:1,maxAlpha:1e6,maxEval:100});
  if(!ls.ok)return {...state,failed:true,reason:'线搜索未找到合格步长',evals:state.evals+ls.history.length};
  const s=scale(p,ls.alpha),x=add(state.x,s),y=add(problem.g(x),g,-1),safe=dot(s,y)>1e-12*norm(s)*norm(y),pairs=safe?[...state.pairs,{s,y}].slice(-m):state.pairs;
  return {x,pairs,k:state.k+1,evals:state.evals+ls.history.length,skips:state.skips+(safe?0:1),done:norm(problem.g(x))<1e-6,alpha:ls.alpha};
 }
 // Independent analytic oracle for the teaching graph, never used in AD propagation.
 function exampleValue(x){return Math.exp(x[0]*x[1])+Math.sin(x[2])+x[0]*x[2];}
 function exampleGradient(x){const E=Math.exp(x[0]*x[1]);return [x[1]*E+x[2],x[0]*E,Math.cos(x[2])+x[0]];}
 function exampleHessian(x){const [a,b,c]=x,E=Math.exp(a*b);return [[b*b*E,(1+a*b)*E,1],[(1+a*b)*E,a*a*E,0],[1,0,-Math.sin(c)]];}
 function adGraph(x,v=[1,0,0],reverseSteps=6){
  const nodes=x.map((value,i)=>({name:'x'+(i+1),value,tangent:v[i],parents:[],partials:[],second:[],bar:0,barDot:0}));
  function op(name,parents,fn,first,second){const values=parents.map(i=>nodes[i].value),partials=first(...values);nodes.push({name,parents,value:fn(...values),partials,second:second(...values),tangent:dot(partials,parents.map(i=>nodes[i].tangent)),bar:0,barDot:0});}
  const mul=(a,b)=>[b,a],mul2=()=>[[0,1],[1,0]],zero2=()=>[[0,0],[0,0]];
  op('v₁ = x₁x₂',[0,1],(a,b)=>a*b,mul,mul2);
  op('v₂ = exp(v₁)',[3],Math.exp,a=>[Math.exp(a)],a=>[[Math.exp(a)]]);
  op('v₃ = sin(x₃)',[2],Math.sin,a=>[Math.cos(a)],a=>[[-Math.sin(a)]]);
  op('v₄ = x₁x₃',[0,2],(a,b)=>a*b,mul,mul2);
  op('v₅ = v₂ + v₃',[4,5],(a,b)=>a+b,()=>[1,1],zero2);
  op('f = v₅ + v₄',[7,6],(a,b)=>a+b,()=>[1,1],zero2);
  nodes.at(-1).bar=1;
  for(let k=8;k>=Math.max(3,9-reverseSteps);k--){const z=nodes[k];z.parents.forEach((index,i)=>{const a=nodes[index];a.bar+=z.bar*z.partials[i];a.barDot+=z.barDot*z.partials[i]+z.bar*dot(z.second[i],z.parents.map(j=>nodes[j].tangent));});}
  return {nodes,value:nodes[8].value,directional:nodes[8].tangent,g:nodes.slice(0,3).map(n=>n.bar),hv:nodes.slice(0,3).map(n=>n.barDot)};
 }
 function residual(x){return x.map((v,i)=>Math.sin(v)+2*v-(x[i-1]||0)-(x[i+1]||0));}
 function sparseJacobian(x){return x.map((v,i)=>x.map((_,j)=>i===j?Math.cos(v)+2:Math.abs(i-j)===1?-1:0));}
 function coloredJacobian(x,colors,h=1e-6){const n=x.length,base=residual(x),J=x.map(()=>Array(n).fill(0));let conflicts=0;for(let c=0;c<colors;c++){const xx=x.map((v,i)=>v+(i%colors===c?h:0)),diff=add(residual(xx),base,-1);for(let i=0;i<n;i++){const indices=[];for(let j=Math.max(0,i-1);j<=Math.min(n-1,i+1);j++)if(j%colors===c)indices.push(j);if(indices.length>1)conflicts++;for(const j of indices)J[i][j]=diff[i]/h;}}return {J,conflicts,calls:colors+1};}
 function fdValue(h,noise=0){let seed=123456;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32*2-1;},a=Math.exp(1)+noise*random(),b=Math.exp(1+h)+noise*random(),c=Math.exp(1-h)+noise*random();return {forward:(b-a)/h,central:(b-c)/(2*h),exact:Math.E};}
 window.OPT_SCALE_MATH={truncatedCG,boundary,forcingRun,twoLoop,largeModel,lbfgsInit,lbfgsStep,exampleValue,exampleGradient,exampleHessian,adGraph,residual,sparseJacobian,coloredJacobian,fdValue};

 D['large-forcing']=el=>{
  const d=frame(el,'内层精度与总乘积数','<label>强迫项 <select id="forcing-kind"><option value="fixed">固定 0.5</option><option value="super">min(0.5, √‖g‖)</option><option value="quadratic">min(0.5, ‖g‖)</option><option value="tight">始终 10⁻¹²</option></select></label>','24 维正定对角二次目标，特征值对数均匀分布于 [1,100]。初值全 1，最优解为 0。单位外层步；停止 ‖g‖ ≤ 10⁻⁸，外层上限 60。');
  function draw(){const result=forcingRun(d.q('select').value),h=result.history,c=chart('梯度范数与外层步数',[0,Math.max(1,h.length-1),-12,3]);d.visual.innerHTML=c.start+c.line(h.map(r=>[r.k,Math.log10(Math.max(1e-12,r.g))]),green)+c.end+table(['外层步','η','本步内层乘积数','‖g‖'],h.slice(-8).map(r=>[r.k,r.eta===null?'—':fmt(r.eta,7),r.inner,fmt(r.g,7)]));d.status.textContent=`${result.done?'达到梯度精度':'达到外层上限'}；外层 ${h.length-1} 步；CG 方向乘积总数 ${h.at(-1).ops}。诊断残差和外层梯度计算未计入该乘积数；本实验不宣称固定 η 必然观察到精确线性速率。`;}
  d.q('select').addEventListener('change',draw);draw();
 };
 D['large-steihaug']=el=>{
  const d=frame(el,'Steihaug 的三种停止与隐藏曲率','<label>模型 <select id="stei-model"><option value="spd">正定 B = diag(1,8)</option><option value="negative">可见负曲率 B = diag(−1,2)</option><option value="hidden">隐藏负曲率 B = diag(−2,3)</option></select></label>'+slider('stei-radius','信赖域半径 Δ',.1,3,.1,1),'蓝色：CG–Steihaug 路径；红色点：近精确二维子问题解。图中横纵轴是步向量 p₁、p₂，原点代表当前外层位置。');
  function draw(){sync(el);const kind=d.q('select').value,A=kind==='spd'?[[1,0],[0,8]]:kind==='negative'?[[-1,0],[0,2]]:[[-2,0],[0,3]],g=kind==='hidden'?[0,1]:[-1,-1],delta=+d.q('input').value,B=p=>mv(A,p),result=truncatedCG(B,g,{eta:1e-10,delta,maxIter:4}),exact=trustExact(A,g,delta),c=chart('信赖域 CG 路径',[-3.4,3.4,-3.4,3.4],720,450,true),circle=Array.from({length:161},(_,i)=>[delta*Math.cos(2*Math.PI*i/160),delta*Math.sin(2*Math.PI*i/160)]);
   d.visual.innerHTML=c.start+contours(c,p=>model(g,B,p),[-8,-4,-2,-1,-.5,0,1,2,4,8,16],50)+c.line(circle,grey)+c.line(result.path,green)+result.path.map(p=>c.point(p,green,4)).join('')+c.point(exact.p,rust,6)+c.end;
   d.status.textContent=`停止原因：${result.reason}；内层乘积 ${result.ops} 次；‖p‖ = ${fmt(norm(result.p),5)}；CG 预测下降 ${fmt(-model(g,B,result.p),6)}，近精确解预测下降 ${fmt(exact.pred,6)}。`+(kind==='hidden'?'梯度与负特征方向正交：CG 的小残差不是子问题全局最优证书。':'边界停止不要求 Newton 方程残差很小。');}
  el.querySelectorAll('select,input').forEach(e=>e.addEventListener('input',draw));draw();
 };
 D['large-lbfgs']=el=>{
  const problem=largeModel(),d=frame(el,'有限记忆的代价与收敛','<label>记忆长度 m <select id="lb-memory"><option value="1">1</option><option value="3" selected>3</option><option value="8">8</option></select></label><button id="lb-run" class="primary">运行 20 步</button><button id="lb-reset">重置</button>','24 维原创正定耦合二次目标：对角曲率对数分布于 [1,100]，相邻差值平方的系数为 0.1。相同初值、强 Wolfe c₁=10⁻⁴、c₂=0.9；‖g‖ < 10⁻⁶ 停止，最多 500 步。');let s,history;
  function reset(){s=lbfgsInit(problem);history=[[0,Math.log10(norm(problem.g(s.x)))]];draw();}
  function draw(){const c=chart('L-BFGS 梯度历史',[0,Math.max(20,s.k),-7,3]);d.visual.innerHTML=c.start+c.line(history,green)+c.end+table(['迭代','f','‖g‖','保存向量对','曲率向量标量数'],[[s.k,fmt(problem.f(s.x),7),fmt(norm(problem.g(s.x)),7),s.pairs.length,2*24*s.pairs.length]]);d.status.textContent=`线搜索函数/方向导数成对试探 ${s.evals} 次；跳过更新 ${s.skips} 次。`+(s.failed?s.reason:s.done?'达到梯度精度。':s.k>=500?'达到 500 步上限，未达到精度。':'双循环仅使用当前保留的向量对。')+' 计数不含初始梯度及诊断评价；标量数不含工作向量和程序对象开销。';d.q('#lb-run').disabled=s.done||s.failed||s.k>=500;}
  d.q('#lb-run').addEventListener('click',()=>{for(let i=0;i<20&&!s.done&&!s.failed&&s.k<500;i++){s=lbfgsStep(problem,s,+d.q('select').value);history.push([s.k,Math.log10(Math.max(1e-7,norm(problem.g(s.x))))]);}draw();});d.q('#lb-reset').addEventListener('click',reset);d.q('select').addEventListener('change',reset);reset();
 };
 D['deriv-error']=el=>{
  const d=frame(el,'差分步长越小，导数一定越准吗？',slider('fd-logh','log₁₀ h',-16,-1,.25,-6)+'<label>额外求值误差上界 δ <select id="fd-noise"><option value="0">0（只有浮点舍入）</option><option value="1e-10">10⁻¹⁰</option><option value="1e-6">10⁻⁶</option></select></label>','对 exp(x) 在 x=1 求导，精确值为 e。蓝色：前向差分；红色：中心差分。纵轴 log₁₀ 绝对误差。额外误差使用固定种子的有界伪随机扰动，供重复对照，并非物理噪声模型。');
  function draw(){sync(el);const noise=+d.q('select').value,h=10**(+d.q('input').value),r=fdValue(h,noise),c=chart('有限差分误差曲线',[-16,-1,-17,12]),samples=Array.from({length:121},(_,i)=>{const l=-16+i/8;return {l,r:fdValue(10**l,noise)}});d.visual.innerHTML=c.start+c.line(samples.map(({l,r})=>[l,Math.log10(Math.max(1e-17,Math.abs(r.forward-r.exact)))]),green)+c.line(samples.map(({l,r})=>[l,Math.log10(Math.max(1e-17,Math.abs(r.central-r.exact)))]),rust)+c.point([Math.log10(h),Math.log10(Math.max(1e-17,Math.abs(r.central-r.exact)))],rust,5)+c.end+table(['方法','导数估计','绝对误差'],[['前向',fmt(r.forward,9),fmt(Math.abs(r.forward-r.exact),9)],['中心',fmt(r.central,9),fmt(Math.abs(r.central-r.exact),9)]]);d.status.textContent=`h = ${h.toExponential(3)}；1+h ${1+h===1?'在浮点数中仍等于 1，扰动已丢失':'可与 1 区分'}。曲线最低绘图值为 10⁻¹⁷；极小误差仍受双精度影响。`;}
  el.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',draw));draw();
 };
 D['deriv-coloring']=el=>{
  const d=frame(el,'三对角 Jacobian 的压缩与恢复','<label>维数 n <select id="color-n"><option value="6">6</option><option value="12" selected>12</option><option value="24">24</option></select></label><label>颜色组数 <select id="color-count"><option value="3">3（无冲突）</option><option value="2">2（故意制造冲突）</option></select></label>','固定 xᵢ = 0.2 + 0.03i，前向差分 h=10⁻⁶。小方格标记结构非零，颜色按列分组。两色模式演示错误解码，不能作为合法 Jacobian 估计使用。');
  function draw(){const n=+d.q('#color-n').value,k=+d.q('#color-count').value,x=Array.from({length:n},(_,i)=>.2+.03*(i+1)),r=coloredJacobian(x,k),exact=sparseJacobian(x),error=Math.max(...r.J.flatMap((row,i)=>row.map((v,j)=>Math.abs(v-exact[i][j])))),w=480,cell=400/n,col=[green,rust,grey];let svg='<svg viewBox="0 0 480 465" role="img" aria-label="三对角 Jacobian 的列着色"><text x="40" y="22" fill="currentColor">列 j →（颜色为扰动组）</text>';
   for(let i=0;i<n;i++)for(let j=0;j<n;j++)svg+=`<rect x="${40+j*cell}" y="${40+i*cell}" width="${cell-1}" height="${cell-1}" fill="${Math.abs(i-j)<=1?col[j%k]:'#e4e5dc'}"/>`;svg+='<text x="40" y="458" fill="currentColor">从上到下为残差分量 i</text></svg>';d.visual.innerHTML=svg+table(['逐列评价数','本分组评价数','冲突行/组次数','最大元素误差'],[[n+1,r.calls,r.conflicts,fmt(error,8)]]);d.status.textContent=r.conflicts?'同色列在若干行发生重叠，差分包含多个变量的贡献：恢复结果无效。':'结构无冲突，误差来自前向差分而非压缩。矩阵维数增大时仍只需 3 次额外向量评价，但每次评价的计算量随 n 增长。';}
  el.querySelectorAll('select').forEach(e=>e.addEventListener('change',draw));draw();
 };
 const pointControls=()=>slider('ad-x1','x₁',-.8,1.5,.1,.7)+slider('ad-x2','x₂',-.8,1.5,.1,-.4)+slider('ad-x3','x₃',.2,2,.1,1.1);
 D['deriv-ad']=el=>{
  const d=frame(el,'逐节点看链式法则怎样传播',pointControls()+'<label>模式 <select id="ad-mode"><option value="forward">前向：v=(1,0,0)</option><option value="reverse">反向：输出种子 1</option></select></label><button id="ad-one" class="primary">处理下一节点</button><button id="ad-all">完成传播</button><button id="ad-reset">重置传播</button>','函数 f = exp(x₁x₂) + sin(x₃) + x₁x₃。实线为依赖，已处理运算节点为蓝色，下一节点为红色。节点表展示已生成的切向或当前累计伴随。');let count=0;
  function draw(){sync(el);const x=['#ad-x1','#ad-x2','#ad-x3'].map(id=>+d.q(id).value),reverse=d.q('#ad-mode').value==='reverse',r=adGraph(x,[1,0,0],reverse?count:0),pos=[[48,50],[48,140],[48,255],[210,90],[365,55],[365,165],[365,280],[520,105],[675,195]],processed=i=>i<3|| (reverse?i>=9-count:i<3+count),active=reverse?8-count:3+count;let svg='<svg viewBox="0 0 725 335" role="img" aria-label="自动微分计算图"><defs><marker id="ad-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#788478"/></marker></defs>';
   r.nodes.forEach((n,i)=>n.parents.forEach(j=>{svg+=`<path d="M${pos[j][0]+20} ${pos[j][1]}L${pos[i][0]-22} ${pos[i][1]}" stroke="#a0aa9e" fill="none" marker-end="url(#ad-arrow)"/>`;}));
   r.nodes.forEach((n,i)=>{svg+=`<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="20" fill="${i===active&&count<6?rust:processed(i)?green:grey}"/><text x="${pos[i][0]}" y="${pos[i][1]+5}" text-anchor="middle" fill="white" font-size="14">${i<3?'x'+(i+1):i===8?'f':'v'+(i-2)}</text>`;});svg+='</svg>';
   d.visual.innerHTML=svg+table(['节点','数值',reverse?'当前伴随（尚可能继续累加）':'切向'],r.nodes.map((n,i)=>[n.name,fmt(n.value,6),reverse?fmt(n.bar,6):processed(i)?fmt(n.tangent,6):'待处理']));
   d.status.textContent=`已处理 ${count}/6 个运算节点。`+(count===6?(reverse?`梯度 = ${vec(r.g)}；解析对照误差 ${fmt(norm(add(r.g,exampleGradient(x),-1)),8)}。`:`方向导数 = ${fmt(r.directional,8)}，对应 ∂f/∂x₁。`):reverse?'输入伴随目前是部分和，全部反扫后才组成梯度。':'输入切向种子固定为 (1,0,0)，只计算一个方向。');d.q('#ad-one').disabled=d.q('#ad-all').disabled=count===6;
  }
  function reset(){count=0;draw();}d.q('#ad-one').addEventListener('click',()=>{count++;draw();});d.q('#ad-all').addEventListener('click',()=>{count=6;draw();});d.q('#ad-reset').addEventListener('click',reset);el.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',reset));reset();
 };
 D['deriv-hvp']=el=>{
  const d=frame(el,'Hessian–向量积与方向 Taylor 检验','<label>方向 v <select id="hvp-direction"><option value="1,0,0">(1,0,0)</option><option value="0,1,0">(0,1,0)</option><option value="1,-1,0.5">(1,−1,0.5)</option></select></label>'+slider('hvp-logh','log₁₀ h',-12,-1,.5,-3)+'<label>Taylor 检验的梯度 <select id="hvp-gradient"><option value="correct">正确 AD 梯度</option><option value="wrong">故意给第一分量加 0.2</option></select></label>','沿用计算图函数，固定 x=(0.7,−0.4,1.1)。AD 通过局部运算的伴随切向递推计算 Gv；解析乘积与中心差分仅作独立校验。故意修改只影响 Taylor 检验。');
  function draw(){sync(el);const x=[.7,-.4,1.1],v=d.q('#hvp-direction').value.split(',').map(Number),h=10**(+d.q('#hvp-logh').value),r=adGraph(x,v),analytic=mv(exampleHessian(x),v),fd=scale(add(exampleGradient(add(x,v,h)),exampleGradient(add(x,v,-h)),-1),1/(2*h)),g=[...r.g];if(d.q('#hvp-gradient').value==='wrong')g[0]+=.2;
   const R=t=>Math.abs(exampleValue(add(x,v,t))-r.value-t*dot(g,v)),r1=R(h),rhalf=R(h/2),order=r1>0&&rhalf>0?Math.log2(r1/rhalf):NaN;const c=chart('方向 Taylor 余项',[-12,-1,-18,0]),points=Array.from({length:45},(_,i)=>{const l=-12+i/4;return [l,Math.log10(Math.max(1e-18,R(10**l)))]});
   d.visual.innerHTML=c.start+c.line(points,green)+c.point([Math.log10(h),Math.log10(Math.max(1e-18,r1))],rust,5)+c.end+table(['计算方式','Gv','与解析乘积的误差'],[['AD 伴随切向',vec(r.hv),fmt(norm(add(r.hv,analytic,-1)),9)],['梯度中心差分',vec(fd),fmt(norm(add(fd,analytic,-1)),9)]])+table(['R₁(h)','R₁(h/2)','观察阶 log₂(R₁(h)/R₁(h/2))'],[[fmt(r1,9),fmt(rhalf,9),Number.isFinite(order)?fmt(order,3):'低于可分辨精度']]);d.status.textContent='横轴 log₁₀ h，纵轴 log₁₀ R₁。中间步长段观察阶数；极小步长会出现消减误差。若 v₁=0，第一分量的故意误差无法被这个方向发现，所以检查需要多个方向。';}
  el.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',draw));draw();
 };
})();
