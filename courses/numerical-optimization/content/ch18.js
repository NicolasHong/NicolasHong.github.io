window.OPT_CHAPTERS.push({id:'ch18',number:'18',title:'序列二次规划：非线性约束的 Newton 方法',subtitle:'Sequential Quadratic Programming · 局部 QP、全局化与结构化曲率',pages:'529–562',sections:[
{id:'newton',title:'从等式 KKT 的 Newton 步到 QP',pages:'529–532',lead:'SQP 不是只二次展开目标，还要使用 Lagrangian 的约束曲率。',body:String.raw`
\[F(x,\lambda)=\begin{bmatrix}g-A^T\lambda\\c\end{bmatrix}=0,\quad
\begin{bmatrix}H_L&-A^T\\A&0\end{bmatrix}
\begin{bmatrix}p\\\delta\lambda\end{bmatrix}=
-\begin{bmatrix}g-A^T\lambda\\c\end{bmatrix}.\]
\[\min_p g^Tp+\tfrac12p^TH_Lp\quad\text{s.t. }c+Ap=0.\]
<p>QP 驻点为 \(H_Lp+g-A^T\widehat\lambda=0\)，所以 \(\widehat\lambda=\lambda+\delta\lambda\)。QP 乘子是新乘子估计，不是仅仅一个增量。初值近、LICQ 与 SOSC 等成立并接受单位步时，精确 Hessian 的等式 SQP 表现为原始—对偶 Newton 的二次收敛。</p>
<div data-demo="sqp-circle"></div>`},
{id:'inequality',title:'不等式 QP、IQP 与 EQP',pages:'532–534',lead:'不等式的最优活跃集由局部模型识别，但需用真实约束复核。',body:String.raw`
\[\begin{aligned}\min_p\ &g_k^Tp+\tfrac12p^TB_kp,\\
\text{s.t. }&c_i(x_k)+\nabla c_i(x_k)^Tp=0\quad(i\in\mathcal E),\\
&c_i(x_k)+\nabla c_i(x_k)^Tp\geq0\quad(i\in\mathcal I).
\end{aligned}\]
<p>IQP 每轮求一般不等式 QP；EQP 方法先估计工作集，再求较便宜的等式 QP。工作集估计错误时需要修改与恢复机制。严格互补等条件可帮助在局部稳定识别活跃集。</p>
<p>\(B_k\) 近似 \(\nabla^2_{xx}L(x_k,\lambda_k)\)，不是固定使用目标 Hessian。即使 QP 预测可行，全步后的非线性违反也可能是二阶甚至更大。</p>`},
{id:'elastic',title:'不一致线性化与弹性模式',pages:'535–536',lead:'原问题可行，不保证任意迭代点的线性化子问题都可行。',body:String.raw`
\[\min_{p,v,w,t}g^Tp+\tfrac12p^TBp+\rho\mathbf1^T(v+w+t),\]
\[c_{\mathcal E}+A_{\mathcal E}p=v-w,\quad
c_{\mathcal I}+A_{\mathcal I}p\geq-t,\quad v,w,t\geq0.\]
<p>弹性变量给出可求解的违反度模型。足够大罚系数和规则性使它优先恢复线性可行性；实际仍需控制步长与真实违反。若恢复阶段停在不可行驻点，应诚实报告可行性失败。</p>
<p>线搜索 SQP 常修改 Hessian 使 QP 曲率足够正；信赖域 SQP 可以保留不定曲率，但线性等式与有限半径可能不相容，因此还需要法向步或罚模型。</p>`},
{id:'quasi-newton',title:'Lagrangian BFGS 与阻尼',pages:'536–540',lead:'用同一个新乘子评价两端梯度，避免把乘子变化混入割线曲率。',body:String.raw`
\[s_k=x_{k+1}-x_k,\quad
y_k=\nabla_xL(x_{k+1},\lambda_{k+1})-
\nabla_xL(x_k,\lambda_{k+1}).\]
\[B_{k+1}=B_k-\frac{B_ks_ks_k^TB_k}{s_k^TB_ks_k}
+\frac{y_ky_k^T}{s_k^Ty_k}.\]
<p>即使问题有严格局部解，完整 Lagrangian Hessian 也可能不定，\(s^Ty\) 不必正。正定 BFGS 要使用阻尼，例如把 \(y\) 混合为 \(\widetilde y=\theta y+(1-\theta)Bs\)，使 \(s^T\widetilde y\geq\delta s^TBs\)。SR1 可保留不定信息，但需相应信赖域处理。</p>
<p>约化 Hessian 更新只存切空间曲率，规模较小且局部正定性更自然；切空间变化和法向/切向交叉项需要一致处理，不能把不同基坐标直接相减。</p>`},
{id:'merit',title:'线搜索 SQP 与罚系数',pages:'540–546',lead:'局部 QP 好不等于真实目标或约束会按模型改善。',body:String.raw`
\[\phi_\rho=f+\rho h,\qquad x^+=x+\alpha p.\]
<p>对等式，若 \(Ap=-c\)，\(B\succeq0\)，QP 乘子为 \(\widehat\lambda\)，则</p>
\[g^Tp=-p^TBp-\widehat\lambda^Tc,\]
\[D\phi_\rho\leq-p^TBp-
(\rho-\|\widehat\lambda\|_\infty)\|c\|_1.\]
<p>这解释了把罚系数设到乘子范数以上的策略。零违反但非零切向步需要正曲率保证下降。若曲率不定，以上简单保证失效，需要修正模型或更一般罚更新。</p>
<p>回溯满足 merit 充分下降；乘子可按步长插值或采用 QP 估计，具体更新应与实现一致。靠近解可选择性使用二阶校正避免 Maratos 拒绝单位步。</p>`},
{id:'soc',title:'二阶校正与可行曲面',pages:'543–545',lead:'主 QP 负责一阶切向优化，校正负责局部约束弯曲。',body:String.raw`
\[A_k\widehat p=-c(x_k+p_k),\qquad x_{\rm trial}=x_k+p_k+\widehat p.\]
<p>也可以使用小型修正 QP，在与主 QP 兼容的曲率下计算校正。校正仅在主要拒绝来自二阶可行误差时使用，且校正范数受控；不是每步无限地重新求根。</p>
<p>圆约束演示使用最小范数校正，并显示校正前后的违反。课堂实现只求一个等式的严格凸目标例子，带 merit 回溯与数值失败状态，不能代表通用 SQP 软件。</p>`},
{id:'trust-region',title:'信赖域 SQP：法向与切向分解',pages:'546–551',lead:'先在较小半径内尽力修复约束，再在剩余空间改善目标。',body:String.raw`
\[v_k\approx\arg\min_{\|v\|\leq\zeta\Delta_k}\|A_kv+c_k\|^2,\quad
r_k=A_kv_k+c_k.\]
\[\min_p g_k^Tp+\tfrac12p^TH_kp,\quad A_kp+c_k=r_k,\ \|p\|\leq\Delta_k.\]
<p>令 \(p=v+Zz\)，切向步在零空间中优化并受总半径约束。也可直接最小化线性化 ℓ1 罚模型加二次项，即 Sℓ1QP。真实 merit 减少与模型预测减少之比决定接受和半径更新。</p>
<p>负曲率由信赖域边界限制，但不一致约束仍要处理。把无约束 dogleg 直接套在约束问题上通常破坏线性可行性。</p>`},
{id:'slqp',title:'SLQP 与非线性梯度投影',pages:'551–556',lead:'先用便宜模型识别约束，再在识别出的自由空间使用曲率。',body:String.raw`
\[\min_p g^Tp\quad\text{s.t. 线性化约束},\quad\|p\|_\infty\leq\Delta_{\rm LP}.\]
<p>SLQP 的 LP 阶段识别工作集，EQP 阶段加入二次曲率，总步组合两阶段信息。它与直接求一个完整不等式 QP 的 IQP 不同，也不是把 LP 解原样当成 Newton 步。</p>
<p>非线性梯度投影同样先产生投影/可行改善步，再进行切向子空间优化。适合大规模稀疏、简单边界和可利用结构的模型；具体投影与恢复成本会决定优势。</p>`},
{id:'convergence',title:'全局与局部收敛的不同含义',pages:'556–561',lead:'全局化指从较远初值获得驻点保证，不是保证全局最优。',body:String.raw`
<p>适当光滑性、有界性、约束资格、充分下降和子问题精度等条件下，算法可使聚点满足一阶条件。不同 SQP 框架的假设不同，不能为所有工程非凸模型承诺任意初值成功。</p>
<p>精确 Hessian 与单位步在规则解附近可二次收敛；拟 Newton 超线性要求约化曲率逼近满足相应 Dennis–Moré 类型条件。</p>
\[\frac{\|Z_*^T(B_k-H_*)p_k\|}{\|p_k\|}\to0\]
<p>这是关键思想的简化表达，完整结论还需步、乘子、活跃集与校正策略匹配。只观察目标曲线快速下降并不能证明理论收敛阶。</p>`},
{id:'practice',title:'SQP 工程模型与自检',pages:'560–562',lead:'在稳态设计中，变量、守恒、目标和约束的导数必须属于同一个模型。',body:String.raw`
<p>以反应器设计为例，状态和设计变量组成 \(x\)，物料/能量衡算作为等式，温度上限与设备尺寸作为不等式，成本或负利润作为目标。SQP 的每个 QP 把守恒一阶化，并把目标和约束二阶信息组合为 Lagrangian 曲率。</p>
<ol><li>从原始—对偶 Newton 系统推导 QP，解释新乘子与增量的区别。</li><li>为什么目标 Hessian 一般不足以替代 Lagrangian Hessian？</li><li>为什么 BFGS 两端应使用相同乘子？</li><li>一个线性化不可行 QP，如何进入弹性或恢复模式？</li></ol>
<p>最后一章 <a href="#ch19/perturbed">非线性内点法</a> 用正松弛与扰动互补构造另一条原始—对偶 Newton 路线。</p>`}
]});
