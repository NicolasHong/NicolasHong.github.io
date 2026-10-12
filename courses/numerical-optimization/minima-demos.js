(() => {
 'use strict';
 const {frame,chart,slider,green,rust,grey}=window.OPT_UI;
 const value=(x,q)=>x===0?0:x**q*(2+Math.cos(1/x));
 const phaseDerivative=(t,q)=>q*(2+Math.cos(t))+t*Math.sin(t);
 // On [(2k+1)pi,(2k+1.5)pi], the phase derivative decreases through zero
 // for q=4 or 6 and k>=2. Reversing t=1/x gives a strict local minimum.
 function minimum(q,k){
  if(![4,6].includes(q)||!Number.isInteger(k)||k<2)throw Error('需要 q=4 或 6，且 k 为不小于 2 的整数');
  let l=(2*k+1)*Math.PI,r=(2*k+1.5)*Math.PI;
  for(let i=0;i<65;i++){const t=(l+r)/2;if(phaseDerivative(t,q)>0)l=t;else r=t;}
  const t=(l+r)/2,x=1/t;
  return {x,t,value:value(x,q),lo:1/(2*Math.PI*(k+1)),hi:1/(2*Math.PI*k)};
 }
 const number=v=>v===0?'0':Math.abs(v)<.001?v.toExponential(2):Number(v.toPrecision(4)).toString();
 const ticks=v=>v===0?'0':Math.abs(v)<.001?v.toExponential(1):Number(v.toPrecision(3)).toString();
 window.OPT_MINIMA_MATH={value,minimum,phaseDerivative};
 window.OPT_DEMOS['strict-not-isolated']=el=>{
  const d=frame(el,'严格最小点，为什么还可以不孤立？',
   '<label for="minima-power">函数版本 <select id="minima-power"><option value="4">书中例子：x⁴[2+cos(1/x)]</option><option value="6">C² 例子：x⁶[2+cos(1/x)]</option></select></label>'
   +slider('minima-index','放大第 k 段（越大越靠近零）',2,30,1,3),
   '蓝线是函数，红点是非零局部最小点，原点用深蓝点标出。先看总体，再看右侧正半轴上的一段振荡；负半轴与之对称。');
  function draw(){
   const q=+d.q('select').value,k=+d.q('input').value,r=minimum(q,k),a=.12;
   d.q('output').value=k;
   const c=chart('总体图：零点是严格全局最小点，但两侧还有局部最小点',[-a,a,0,3.2],720,340,false,ticks);
   const roots=Array.from({length:11},(_,i)=>minimum(q,i+2));
   const scale=a**q,curve=c.curve(x=>value(x,q)/scale,-a,a,4000);
   const dots=roots.flatMap(m=>[c.point([m.x,m.value/scale],rust,3),c.point([-m.x,m.value/scale],rust,3)]).join('');
   const overview=c.start+c.line(c.curve(x=>(x/a)**q),grey,'4 4')+c.line(c.curve(x=>3*(x/a)**q),grey,'4 4')
    +c.line(curve,green)+dots+c.point([0,0],green,5)+c.text([0,0],'严格全局最小点',green)+c.end;
   const b=r.hi,zoomScale=b**q,points=Array.from({length:601},(_,i)=>{const x=r.lo+(r.hi-r.lo)*i/600;return [x,value(x,q)/zoomScale];});
   const ys=points.map(p=>p[1]),low=Math.min(...ys),high=Math.max(...ys),pad=(high-low)*.12;
   const z=chart('放大图：一个正函数值的严格局部最小点',[r.lo,r.hi,Math.max(0,low-pad),high+pad],720,340,false,ticks);
   const zoom=z.start+z.line(points,green)+z.point([r.x,r.value/zoomScale],rust,6)+z.text([r.x,r.value/zoomScale],'局部最小点',rust)+z.end;
   d.visual.innerHTML='<h4>总体：零点最低，其他小谷底仍然存在</h4>'
    +`<p>横轴 x；纵轴 f(x) / a<sup>${q}</sup>，a = 0.12。灰色虚线为上下界 x<sup>${q}</sup> 与 3x<sup>${q}</sup>（同样缩放）。</p>`+overview
    +'<h4>放大：让观察区间继续靠近零点</h4>'
    +`<p>第 ${k} 段：x ∈ [${number(r.lo)}, ${number(r.hi)}]。横轴仍是 x；纵轴为 f(x) / b<sup>${q}</sup>，b = ${number(b)}。为了看清越来越浅的小谷底，每次都会重新缩放纵轴。</p>`+zoom
    +'<div class="legend"><span><i></i>函数与原点</span><span><i class="rust"></i>非零局部最小点</span><span><i class="grey"></i>函数值上下界</span></div>';
   d.status.textContent=`当前局部最小点 xₖ ≈ ${number(r.x)}，f(xₖ) ≈ ${number(r.value)} > 0 = f(0)。增大 k，xₖ 越来越靠近零，却始终不是零。严格：附近所有非零点的函数值都高于 f(0)；不孤立：任何零点邻域里仍有其他局部最小点。`
    +(q===4?' 当前为书中 x⁴ 版本，二阶导数在零点不连续。':' 当前为 x⁶ 版本，二阶导数在零点连续，属于 C²。');
  }
  el.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',draw));draw();
 };
})();
