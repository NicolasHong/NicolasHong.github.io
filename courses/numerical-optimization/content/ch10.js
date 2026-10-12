window.OPT_CHAPTERS.push({id:'ch10',number:'10',title:'最小二乘：利用残差结构拟合模型',subtitle:'Least Squares · QR、Gauss–Newton、LM 与正交回归',pages:'245–269',sections:[
{id:'structure',title:'残差、权重与最小二乘的特殊曲率',pages:'245–250',lead:'保留各个残差，才能知道哪些曲率项可以便宜而准确地计算。',body:String.raw`
\[f(x)=\tfrac12\|r(x)\|^2,\quad J_{ij}=\partial_jr_i,\quad g=J^Tr,\quad
G=J^TJ+\sum_{i=1}^m r_i\nabla^2r_i.\]
<details><summary>推导梯度与 Hessian</summary><div><p>对 \(r_i^2/2\) 一次求导得到 \(r_i\nabla r_i\)；再求导得到 \(\nabla r_i\nabla r_i^T+r_i\nabla^2r_i\)。相加即得上式。第一项半正定，第二项可能不定。</p></div></details>
<p>若观测误差协方差为 \(\Sigma\succ0\)，可最小化 \(\tfrac12r^T\Sigma^{-1}r\)，或对白化后的残差应用同样公式。独立方差 \(\sigma_i^2\) 对应 \(r_i/\sigma_i\)，注意平方后的权重为 \(1/\sigma_i^2\)。</p>
<p>PSE 参数估计中，残差可来自浓度、温度或转化率。应以测量不确定性和物理尺度设权重；单纯数量多的某类数据可能掩盖其他变量。拟合误差小不代表参数可辨识。</p>`},
{id:'linear',title:'线性最小二乘与正交分解',pages:'250–254',lead:'法方程适合推导，QR 和 SVD 常更适合数值求解。',body:String.raw`
\[\min_x\tfrac12\|Ax-b\|^2,\qquad A^T(Ax-b)=0.\]
<p>若 \(A\) 满列秩，最优解唯一。薄 QR 分解 \(A=Q_1R\) 给出 \(Rx=Q_1^Tb\)；余下正交分量是无法拟合的残差。若列秩亏，SVD 可计算最小范数解并揭示弱辨识方向。</p>
\[A=U\Sigma V^T,\qquad x=A^\dagger b,\qquad
\kappa_2(A^TA)=\kappa_2(A)^2\quad(\text{满列秩}).\]
<p>显式法方程会平方条件数。长而窄、适度条件数的模型中，逐残差累积 \(A^TA,A^Tb\) 可节省存储，但需接受相应稳定性权衡。大规模问题可用只需 \(Av,A^Tw\) 的迭代最小二乘策略。</p>
<details><summary>秩亏例子</summary><div><p>若两列完全相同，数据只约束两个参数之和；再高的求解精度也无法分别辨认两者。应重新参数化、加入信息或正则化，并明确这改变了估计问题。</p></div></details>`},
{id:'gauss-newton',title:'Gauss–Newton：线性化残差再求最小二乘',pages:'254–258',lead:'舍弃残差加权二阶项，用较便宜的 JᵀJ 构造模型。',body:String.raw`
\[r(x+p)\approx r+Jp,\qquad \min_p\tfrac12\|r+Jp\|^2,\qquad
J^TJp=-J^Tr.\]
<p>可通过 QR 求步而无需形成法矩阵。\(J\) 满列秩且 \(g\ne0\) 时方向严格下降：</p>
\[g^Tp=-p^TJ^TJp=-\|Jp\|^2<0.\]
<p>用线搜索保护早期非线性步。若解处残差为零、Jacobian 满列秩且有适当光滑性，局部可二次收敛；非零残差时通常只有线性速率，且被舍弃项过大时局部迭代也可能失败。</p>
<details><summary>被舍弃项如何影响局部误差</summary><div><p>令 \(S_* =\sum_i r_i(x_*)\nabla^2r_i(x_*)\)，局部 Gauss–Newton 映射的一阶误差矩阵为 \(-(J_*^TJ_*)^{-1}S_*\)。其范数小有利于收敛，零残差则使它为零。不能仅检查残差数值小，还要与 \(J^TJ\) 的最弱曲率比较。</p></div></details>`},
{id:'lm',title:'Levenberg–Marquardt：用半径控制病态步',pages:'258–262',lead:'阻尼参数是信赖域约束的乘子，不是任意加上的常数。',body:String.raw`
\[\min_{\|p\|\leq\Delta}\tfrac12\|r+Jp\|^2,\qquad
(J^TJ+\lambda I)p=-J^Tr,\quad\lambda\geq0,\quad\lambda(\Delta-\|p\|)=0.\]
<p>无约束 Gauss–Newton 步在球内时取 \(\lambda=0\)；需要边界步时取正乘子。秩亏时存在最小范数解等退化情形，要按信赖域最优条件处理。</p>
\[\rho=\frac{\|r(x)\|^2-\|r(x+p)\|^2}{\|r(x)\|^2-\|r(x)+Jp\|^2}.\]
<p>利用比值接受或拒绝，并更新半径。变量缩放时可用 \(\|Dp\|\leq\Delta\)，相应移位为 \(\lambda D^TD\)。提高 \(\lambda\) 使方向更接近缩放后的负梯度，但过度阻尼会拖慢收敛。</p>
<div data-demo="least-fit"></div>
<p>演示采用按接受比直接调节阻尼的 LM 实现；指定半径并反解其乘子的实现则需要额外的标量求解。两者通过移位最小二乘模型相联系。</p>`},
{id:'implementation',title:'稳定实现与可靠停止',pages:'259–262',lead:'线性代数、评价预算和秩检查，是最小二乘算法的一部分。',body:String.raw`
\[\min_p\left\|\begin{bmatrix}J\\\sqrt\lambda I\end{bmatrix}p+
\begin{bmatrix}r\\0\end{bmatrix}\right\|^2.\]
<p>增广 QR 是计算阻尼步的一种方式；若多次试探不同 \(\lambda\)，可复用已有分解。许多残差、少数参数时，也可逐项累积 \(J^TJ,J^Tr\)，但要核对条件数。</p>
<ul><li>梯度 \(\|J^Tr\|\) 小：说明所选最小二乘目标的一阶驻点。</li><li>残差 \(\|r\|\) 小：说明模型与数据相近；含噪数据未必能达到零。</li><li>步长很小：可能是收敛，也可能是尺度、阻尼或秩亏问题。</li></ul>
<p>报告参数、加权与未加权残差、秩信息和停止原因。演示只拟合固定合成数据，不能提供实验参数的不确定性结论。</p>`},
{id:'large-residual',title:'大残差：何时需要恢复二阶信息',pages:'262–265',lead:'同样叫最小二乘，曲率近似的质量却可能不同。',body:String.raw`
\[B_k=J_k^TJ_k+S_k,\qquad S_k\approx\sum_i r_i(x_k)\nabla^2r_i(x_k).\]
<p>可直接计算残差 Hessian，或只对结构化的剩余项做拟牛顿更新。设 \(s=x_{k+1}-x_k\)，需要对剩余项选择与该近似一致的割线信息，不能把整个梯度差无区分地交给 \(S_k\)，否则会重复计入 \(J^TJ\)。</p>
<p>早期 Gauss–Newton 往往稳健，局部恢复二阶项可改善速度。大残差也可能提示模型缺项、数据异常或权重问题；换优化算法只能求解当前目标，不能自动修复模型。</p>`},
{id:'odr',title:'正交距离回归：自变量也有测量误差',pages:'265–267',lead:'若测量时间、温度或输入浓度也不精确，只拟合纵向误差可能造成偏差。',body:String.raw`
\[y_i=\phi(\theta;t_i+\delta_i)+\epsilon_i,\qquad
\min_{\theta,\delta,\epsilon}\tfrac12\sum_i(w_i^2\epsilon_i^2+d_i^2\delta_i^2).\]
<p>消去 \(\epsilon_i\)，得到关于参数和输入修正的增广最小二乘：</p>
\[\min_{\theta,\delta}\tfrac12\sum_i
\{w_i^2[y_i-\phi(\theta;t_i+\delta_i)]^2+d_i^2\delta_i^2\}.\]
<p>所有权重相等且轴单位一致时，几何意义是点到模型曲线的平方距离；一般权重对应不同方向的不确定性。变量增多，但每个 \(\delta_i\) 只作用于相应观测，形成可利用的块结构。</p>
<p>不能只因图形上横纵误差看起来相近就选等权重；应先统一单位，并依据测量误差模型设置尺度。</p>`},
{id:'practice',title:'参数拟合：从算法到可辨识性',pages:'267–269',lead:'目标最小化、模型合理性和参数可信程度，是三个相关但不同的问题。',body:String.raw`
<details><summary>自测：Jᵀr=0 是否表示所有残差为零？</summary><div><p>不表示。它要求残差与 Jacobian 各列正交，这是过定拟合的常见最优状态。</p></div></details>
<details><summary>自测：阻尼能否创造缺失的参数信息？</summary><div><p>不能。它改善步计算并限制不稳定方向，但若目标本身无法辨识参数，仍需额外数据或模型假设。</p></div></details>
<p>建议实验：改变拟合初值、删去后期数据、改变权重，分别观察收敛与参数变化。接下来<a href="#ch11/roots">非线性方程</a>更严格地要求残差向量本身接近零。</p>`}
]});
