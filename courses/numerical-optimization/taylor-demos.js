(() => {
 'use strict';
 const {frame,chart,slider,fmt,green,rust,grey}=window.OPT_UI;
 // Restriction of f(u)=exp(u) to x=0, p=h: phi(t)=exp(h*t).
 // The strictly increasing derivative makes the intermediate point unique here.
 function mvtPoint(h){
  if(!(h>0))throw Error('本演示要求正步长');
  const slope=Math.expm1(h),tau=Math.log(slope/h)/h,value=Math.exp(h*tau);
  return {h,tau,value,slope,tangentSlope:h*value,endValue:Math.exp(h)};
 }
 window.OPT_TAYLOR_MATH={mvtPoint};
 window.OPT_DEMOS['taylor-mvt']=el=>{
  const d=frame(el,'弦与某处切线为什么平行？',slider('taylor-step','步长 h',.1,2,.1,1),
   '取 f(u)=exp(u)，从 x=0 走到 x+p=h；沿线段的函数为 φ(t)=exp(ht)。横轴是线段参数 t，纵轴是 φ(t)。调整 h，中间点 τ 会随之移动。');
  function draw(){
   const h=+d.q('input').value,r=mvtPoint(h),tangent=t=>r.value+r.slope*(t-r.tau);
   d.q('output').value=fmt(h,1);
   const c=chart('蓝色曲线、灰色端点弦与平行的红色切线',[0,1,Math.min(.8,tangent(0)-.15),r.endValue+.3],720,430);
   d.visual.innerHTML=c.start+c.line(c.curve(t=>Math.exp(h*t)),green)
    +c.line([[0,1],[1,r.endValue]],grey,'6 4')
    +c.line([[0,tangent(0)],[1,tangent(1)]],rust)
    +c.line([[r.tau,c.range[2]],[r.tau,r.value]],grey,'3 4')
    +c.point([0,1],grey)+c.point([1,r.endValue],grey)+c.point([r.tau,r.value],rust,6)
    +c.text([r.tau,r.value],`τ = ${fmt(r.tau,3)}`,rust)+c.end
    +'<div class="legend"><span><i></i>函数曲线</span><span><i class="grey"></i>端点连成的弦（虚线）</span><span><i class="rust"></i>中间点切线</span></div>';
   d.status.textContent=`弦的斜率 [φ(1)−φ(0)]/(1−0) = ${fmt(r.slope,5)}；切线斜率 φ′(τ) = ${fmt(r.tangentSlope,5)}。两者相同，因此平行。本例的 τ = ${fmt(r.tau,5)}，一般不等于 0.5。`;
  }
  d.q('input').addEventListener('input',draw);draw();
 };
})();
