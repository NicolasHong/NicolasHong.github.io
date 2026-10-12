window.OPT_CHAPTERS.push({id:'ch14',number:'14',title:'线性规划内点法：追踪中心路径',subtitle:'Interior-Point Methods for Linear Programming · 原始—对偶 Newton 与预测校正',pages:'392–420',sections:[
{id:'kkt',title:'把互补条件变成平滑路径',pages:'392–397',lead:'与单纯形的基移动不同，内点法维持原始变量和对偶松弛严格为正。',body:String.raw`
\[Ax=b,\quad A^T\lambda+s=c,\quad Xs=0,\quad x,s\geq0,\qquad X=\operatorname{diag}(x).\]
\[Ax=b,\quad A^T\lambda+s=c,\quad Xs=\tau\mathbf1,\quad x,s>0.\]
<p>以 \(\tau>0\) 扰动互补得到中心路径。假设满行秩并存在严格原始及对偶可行点时，每个 \(\tau\) 对应唯一中心路径点。沿路径有 \(c^Tx-b^T\lambda=n\tau\)，当 \(\tau\to0\) 逼近最优性。</p>
<p>没有严格内部的模型，需要预处理、嵌入或更一般初始化。严格正变量并不表示当前 \(Ax=b\) 已满足：现代 infeasible-start 方法允许等式残差。</p>
<div data-demo="lp-interior"></div>`},
{id:'newton',title:'原始—对偶 Newton 线性系统',pages:'393–397',lead:'同时修复原始可行性、对偶可行性与互补性。',body:String.raw`
\[r_p=Ax-b,\quad r_d=A^T\lambda+s-c,\quad \mu=x^Ts/n.\]
\[\begin{bmatrix}0&A^T&I\\A&0&0\\S&0&X\end{bmatrix}
\begin{bmatrix}\Delta x\\\Delta\lambda\\\Delta s\end{bmatrix}
=\begin{bmatrix}-r_d\\-r_p\\-Xs+\sigma\mu\mathbf1\end{bmatrix}.\]
<p>\(S=\operatorname{diag}(s)\)。\(\sigma=0\) 的仿射缩放步直接朝互补零点走，容易靠近边界；\(\sigma>0\) 加入居中。步后必须保持正性，并协调可行残差与互补下降。</p>
<details><summary>消元为正定正规方程</summary><div><p>令第三行右端为 \(r_c\)、\(D=XS^{-1}\)。由 \(\Delta s=-r_d-A^T\Delta\lambda\)，得到</p>
\[\Delta x=S^{-1}r_c+Dr_d+DA^T\Delta\lambda,\]
\[ADA^T\Delta\lambda=-r_p-AS^{-1}r_c-ADr_d.\]
<p>当 \(A\) 满行秩且 \(x,s>0\) 时矩阵正定。实际稀疏求解也可使用增广系统，以避免正规方程的填充与条件放大。</p></div></details>`},
{id:'barrier',title:'对数障碍与对偶间隙',pages:'397–399',lead:'中心路径也是障碍子问题的一阶解。',body:String.raw`
\[\min_{Ax=b,\ x>0} c^Tx-\tau\sum_{i=1}^n\log x_i.\]
\[c-\tau X^{-1}\mathbf1-A^T\lambda=0,\quad s=\tau X^{-1}\mathbf1.\]
<p>由此 \(x_i s_i=\tau\)。障碍对接近零的变量施加无限代价；减少 \(\tau\) 才能让解逼近最优边界。障碍问题解不是原 LP 的精确解，其可行对偶间隙为 \(n\tau\)。</p>
<p>非中心点的 \(\mu=x^Ts/n\) 是平均互补性。若等式残差不为零，目标差还包含残差项，不能把 \(x^Ts\) 直接称为严格的原始—对偶目标间隙。</p>
\[c^Tx-b^T\lambda=x^Ts+\lambda^Tr_p-x^Tr_d.\]`},
{id:'neighborhood',title:'中心邻域与多项式理论',pages:'399–407',lead:'复杂度证明控制每个互补乘积，而不只控制平均值。',body:String.raw`
\[\mathcal N_2(\theta)=\{(x,\lambda,s):\text{严格可行},\ \|Xs-\mu\mathbf1\|_2\leq\theta\mu\},\]
\[\mathcal N_{-\infty}(\gamma)=\{(x,\lambda,s):\text{严格可行},\ x_i s_i\geq\gamma\mu\ \forall i\}.\]
<p>窄邻域的短步法让路径跟踪可证明；宽邻域允许更大步但需要相应控制规则。经典短步结果可达到 \(O(\sqrt n\log(\mu_0/\epsilon))\) 量级的迭代界，在指定初始化、邻域和步参数假设下成立。</p>
<p>这一理论不等于任意居中系数和回溯都有相同复杂度，也不等于每次迭代成本与维度无关。线性系统分解往往决定实际总时间。教材还介绍长步与预测—校正理论，核心是平衡边界安全和互补下降。</p>`},
{id:'predictor',title:'Mehrotra 预测—校正',pages:'407–409',lead:'先试探仿射步，再利用剩余互补误差进行校正。',body:String.raw`
\[M\Delta v_{\rm aff}=(-r_d,-r_p,-Xs)^T.\]
\[\mu_{\rm aff}=\frac{(x+\alpha_p^{\rm aff}\Delta x_{\rm aff})^T
(s+\alpha_d^{\rm aff}\Delta s_{\rm aff})}{n},\quad
\sigma=(\mu_{\rm aff}/\mu)^3.\]
<p>仿射步长取最大非负边界步（上限一）。这是用于预测的试探，不是最终正性步。再使用同一矩阵求组合步：</p>
\[M\Delta v=
\begin{bmatrix}-r_d\\-r_p\\-Xs-\Delta x_{\rm aff}\odot\Delta s_{\rm aff}+\sigma\mu\mathbf1\end{bmatrix}.\]
<p>乘积展开 \((x+\Delta x)\odot(s+\Delta s)\) 中有二阶交叉项；仿射交叉乘积用来估计并抵消它。两次求解共享矩阵分解。演示采用此策略，但不把它宣称为对任意 LP 无条件收敛的完整求解器。</p>`},
{id:'steps',title:'边界步长、初始化与停止',pages:'409–411',lead:'原始变量和对偶松弛各自保持正性。',body:String.raw`
\[\alpha_{\max}(z,d)=\min\left(1,\min_{i:d_i<0}\frac{-z_i}{d_i}\right),\quad
\alpha_p=\min(1,\eta\alpha_{\max}(x,\Delta x)),\quad
\alpha_d=\min(1,\eta\alpha_{\max}(s,\Delta s)).\]
<p>\(0<\eta<1\)，例如 0.99；无负分量时内层最小值视为无穷。分别更新 \(x\) 与 \((\lambda,s)\)，避免被一个边界变量过度限制两侧进度。</p>
<p>可从线性系统的最小范数估计开始再平移保证正性，也可简单使用正向量与非可行等式初值，但需要 infeasible-start 机制。停止需用尺度化 \(r_p,r_d\)、互补性和正性一起判断。</p>
<p>初始化不是不可行性证明。遇到数值发散不能直接宣布无解；应采用可靠证书、齐次自对偶嵌入等机制或报告数值失败。</p>`},
{id:'linear-algebra',title:'稀疏线性代数与病态',pages:'411–413',lead:'中心路径逼近边界时，对角缩放差异会变得很大。',body:String.raw`
\[D_{ii}=x_i/s_i,\qquad K=ADA^T.\]
<p>最优时一部分变量趋零，另一部分对偶松弛趋零，\(D\) 可同时出现很大和很小的元素。正规方程通常采用稀疏 Cholesky；增广系统采用对称不定分解。选择取决于秩、稀疏填充与数值条件。</p>
<p>结构重排、行列缩放、迭代改进与适度正则化能提升稳定性，但正则化会改变线性步，需复核原始残差。预测校正共享分解可节省大量成本。</p>`},
{id:'extensions',title:'势函数、扩展与 crossover',pages:'413–417',lead:'路径跟踪是内点法的一条主线，势函数提供另一种进度度量。',body:String.raw`
\[\Phi(x,s)=\rho\log(x^Ts)-\sum_i\log(x_i s_i),\quad\rho>n.\]
<p>势函数同时度量总间隙和互补乘积的均衡，势下降方法根据它选步。理论参数与步规则需配合，不能只写势函数就继承收敛结论。</p>
<p>教材讨论从 LP 扩展到凸 QP、锥规划等结构。内点结果往往在最优面的相对内部；crossover 可把它转为基本解，以支持稀疏方案、灵敏度报告与后续单纯形热启动。是否需要 crossover 取决于使用目的。</p>`},
{id:'practice',title:'内点法自检与下一步',pages:'417–420',lead:'学习重点是扰动 KKT、正性与可验证的终止。',body:String.raw`
<ol><li>从障碍最优性推导 \(x_i s_i=\tau\)，解释为什么间隙是 \(n\tau\)。</li><li>展开互补乘积，指出 Mehrotra 校正右端的交叉项符号。</li><li>为什么非可行迭代的 \(x^Ts\) 不等于目标差？</li><li>对同一个生产 LP，比较单纯形基序列与内点互补轨迹，复核两者的最优证书。</li></ol>
<p>后续 <a href="#ch15/framework">约束算法基础</a> 把这里的可行性和接受准则推广到非线性模型。</p>`}
]});
