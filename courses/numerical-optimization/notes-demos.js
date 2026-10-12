(() => {
 'use strict';
 const {frame,chart,contours,fmt,slider,green,rust,grey}=window.OPT_UI;
 const {trustExact,model}=window.OPT_ADV_MATH;
 const B=[[2,1],[1,4]],g=[-2,-1];
 const overlayModel=p=>model(B,g,p);
 const overlayValue=p=>overlayModel(p)+2*p[0]**4;
 const cauchySlice=(curvature,t)=>-t+.5*curvature*t*t;
 window.OPT_NOTE_MATH={B,g,overlayModel,overlayValue,cauchySlice};
 const table=(headers,rows)=>'<div class="table-wrap"><table><thead><tr>'+headers.map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const circle=r=>Array.from({length:181},(_,i)=>[r*Math.cos(i*Math.PI/90),r*Math.sin(i*Math.PI/90)]);
 demosRegister();
 function demosRegister(){
  window.OPT_DEMOS['tr-model-overlay']=el=>{
   const d=frame(el,'真实地形与模型地形：半径改变候选步',slider('overlay-radius','半径 Δ',.1,1.4,.05,.35),'横纵轴分别为位移 p₁、p₂。蓝色等高线为真实函数，灰色等高线为二次模型；虚线圆为信赖域，水平虚线为固定 Newton 搜索方向。当前点始终固定在原点。');
   const c=chart('真实函数与二次模型的等高线及信赖域候选步',[-1.5,1.5,-1.5,1.5],720,440,true);
   const levels=[-.9,-.6,-.3,0,.5,1.5,3];
   const actual=contours(c,overlayValue,levels,90).replaceAll('#7194c7',green).replaceAll('opacity=".55"','opacity=".85"').replaceAll('stroke-width="1"','stroke-width="1.5"');
   const approx=contours(c,overlayModel,levels,90).replaceAll('#7194c7',grey).replaceAll('opacity=".55"','opacity=".65"');
   function draw(){const delta=+d.q('input').value;d.q('output').value=fmt(delta,2);const r=trustExact(B,g,delta),p=r.p,ared=-overlayValue(p),rho=ared/r.pred;
    const same=Math.hypot(p[0]-1,p[1])<1e-8;
    d.visual.innerHTML=c.start+approx+actual+c.line(circle(delta),grey,'6 4')+c.line([[0,0],[1.35,0]],grey,'7 5')+c.line([[0,0],p],rust)+c.point([0,0],green,5)+`<text x="${c.X(0)-8}" y="${c.Y(0)+22}" text-anchor="end" fill="${green}" font-size="13">当前点</text>`+(!same?c.point([1,0],grey,6)+c.text([1,0],'完整 Newton',grey):'')+c.point(p,rust,6)+c.text(p,same?'Newton / 候选':'候选',rust)+c.end+table(['步','预测下降','实际下降','ρ'],[['完整 Newton',fmt(1,3),fmt(-1,3),fmt(-1,3)],['当前信赖域步',fmt(r.pred,4),fmt(ared,4),fmt(rho,4)]]);
    d.status.textContent=`Δ = ${fmt(delta,2)}；p = (${fmt(p[0],3)}, ${fmt(p[1],3)})；ρ = ${fmt(rho,4)}。按 η = 0.1，当前候选${rho>.1?'可接受':'应拒绝'}。`+(rho<0?'模型预测下降，但真实目标上升，提示需要缩小范围。':same?'完整 Newton 步已在域内，扩大半径不会改变本模型的最优步。':'缩小范围后，模型误差通常减小，候选方向也可发生变化。');
   }
   d.q('input').addEventListener('input',draw);draw();
  };
  window.OPT_DEMOS['tr-cauchy-curve']=el=>{
   const cases={inside:{k:2,xmax:1.6,ymin:-.4,ymax:1.1,name:'正曲率：顶点在域内'},outside:{k:.4,xmax:2.8,ymin:-1.45,ymax:.15,name:'正曲率：顶点在域外'},negative:{k:-1,xmax:1.6,ymin:-3.2,ymax:.2,name:'非正曲率：走到边界'}};
   const d=frame(el,'把 Cauchy 步看成一元模型的顶点或端点','<label for="cauchy-case">曲率情形 <select id="cauchy-case">'+Object.entries(cases).map(([key,v])=>`<option value="${key}">${v.name}</option>`).join('')+'</select></label>','固定 g = (1, 0)ᵀ、Δ = 1.2，取 B = diag(κ, 1)。球面步 pₖˢ = (−1.2, 0)ᵀ。横轴 τ 表示 p = τpₖˢ；纵轴模型变化为 −1.2τ + 0.72κτ²。浅色区域 0 ≤ τ ≤ 1；虚线 τ = 1 对应信赖域边界。');
   function draw(){const o=cases[d.q('select').value],limit=1,tau=o.k>0?Math.min(1/(1.2*o.k),limit):limit,vertex=o.k>0?1/(1.2*o.k):null,slice=v=>cauchySlice(o.k,1.2*v);
    const c=chart(o.name+'：Cauchy 点的一元模型',[0,o.xmax/1.2,o.ymin,o.ymax],720,340);
    const feasible=`<rect x="${c.X(0)}" y="${c.Y(o.ymax)}" width="${c.X(limit)-c.X(0)}" height="${c.Y(o.ymin)-c.Y(o.ymax)}" fill="#154fbe" opacity=".06"/>`;
    d.visual.innerHTML=c.start+feasible+c.line(c.curve(slice),green)+c.line([[limit,o.ymin],[limit,o.ymax]],grey,'5 4')+c.point([tau,slice(tau)],rust,6)+c.text([tau,slice(tau)],'Cauchy',rust)+(vertex!==null&&vertex>limit?c.point([vertex,slice(vertex)],grey,5)+c.text([vertex,slice(vertex)],'域外顶点',grey):'')+c.end;
    d.status.textContent=`κ = ${fmt(o.k,1)}；可行区间 0 ≤ τ ≤ 1；τₖ = ${fmt(tau,3)}；步长 ‖pₖᶜ‖ = ${fmt(1.2*tau,3)}；模型下降 = ${fmt(-slice(tau),3)}。`+(o.k<=0?'模型沿负梯度一直下降，因此取边界；κ = 0 时同样取边界。':vertex<=limit?'抛物线顶点可行，取顶点，无需走满半径。':'抛物线顶点在域外，只能取可行右端点。');
   }
   d.q('select').addEventListener('change',draw);draw();
  };
 }
})();
