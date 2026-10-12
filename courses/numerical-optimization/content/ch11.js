window.OPT_CHAPTERS.push({id:'ch11',number:'11',title:'非线性方程：把守恒关系求解为状态',subtitle:'Nonlinear Equations · Newton、Broyden、全局化与延拓',pages:'270–303',sections:[
{id:'roots',title:'求根与优化驻点的区别',pages:'270–274',lead:'状态方程、守恒关系与稳态反应器，通常要求每个方程都成立。',body:String.raw`
\[r(x)=0,\qquad r:\mathbb R^n\to\mathbb R^n,\qquad
\psi(x)=\tfrac12\|r(x)\|^2.\]
<p>所有根都使 \(\psi=0\)，但 \(\nabla\psi=J^Tr=0\) 未必是根。例如 \(r(x)=x^2+1\) 在零点使梯度为零，却没有实根。方程求解结束必须检查残差，而不是只看最小二乘梯度。</p>
<p>同一非线性系统可能有多个根或根本无根；初值和参数决定算法落到哪个状态分支。工程模型还需要检查正浓度、温度范围与守恒尺度；数值根未必物理可接受。</p>
<div data-demo="root-newton"></div>`},
{id:'newton',title:'Newton 线性化与局部收敛',pages:'274–277',lead:'Jacobian 不需要对称或正定，关键是局部可逆。',body:String.raw`
\[r(x+p)=r(x)+J(x)p+O(\|p\|^2),\qquad J_kp_k=-r_k.\]
<p>解线性系统而非显式求逆。若根 \(x_*\) 非退化、Jacobian 局部 Lipschitz 且初值足够近，单位步 Newton 二次收敛。</p>
<details><summary>二次误差估计</summary><div><p>由 \(r(x_*)=0\) 及 Taylor 余项，\(r(x_k)=J_k(x_k-x_*)+O(\|x_k-x_*\|^2)\)。因此</p>
\[x_{k+1}-x_*=x_k-x_*-J_k^{-1}r_k=O(\|x_k-x_*\|^2).\]
<p>估计依赖 \(J_k^{-1}\) 一致有界。多重根或近奇异 Jacobian 不满足相同保证。</p></div></details>
<p>大步可能跳出局部邻域或定义域。演示提供纯 Newton 与残差 merit 回溯；纯 Newton 的二周期说明即使根存在也不能从任意初值期待收敛。</p>`},
{id:'inexact',title:'非精确 Newton 与大规模方程',pages:'277–279',lead:'内层迭代适用于一般 Jacobian，不能默认使用要求对称正定的 CG。',body:String.raw`
\[\|J_kp_k+r_k\|\leq\eta_k\|r_k\|,\qquad0\leq\eta_k<1.\]
<p>近非退化根且 \(\eta_k\) 足够小时局部线性收敛；\(\eta_k\to0\) 可超线性；在 Lipschitz Jacobian 下 \(\eta_k=O(\|r_k\|)\) 可二次。内层算法应匹配矩阵结构；非对称系统通常需要相应 Krylov 方法和预条件器。</p>
\[J(x)v\approx\frac{r(x+hv)-r(x)}h.\]
<p>Jacobian-free 只避免显式存储，仍需评价残差或 AD 方向作用。线性求解误差、差分误差和非线性外层容差必须协调。</p>`},
{id:'broyden',title:'Broyden：更新一般 Jacobian 的割线信息',pages:'279–283',lead:'方程 Jacobian 一般不对称，所以使用不同于 BFGS 的更新。',body:String.raw`
\[s_k=x_{k+1}-x_k,\quad y_k=r(x_{k+1})-r(x_k),\quad B_{k+1}s_k=y_k.\]
\[B_{k+1}=B_k+\frac{(y_k-B_ks_k)s_k^T}{s_k^Ts_k}.\]
<details><summary>最小改动推导</summary><div><p>令 \(E=B_{k+1}-B_k\)，要求 \(Es=v=y-Bs\)。逐行最小化 \(\|E\|_F^2\) 时，每行最短向量都平行于 \(s\)，于是 \(E=vs^T/(s^Ts)\)。未施加对称条件。</p></div></details>
<p>用 \(B_kp=-r_k\) 求步。非零步不保证新矩阵可逆；需要初始化、重置与奇异保护。局部超线性结论需要初值及初始 Jacobian 近似足够接近。稠密近似会填满原本稀疏的结构，可采用低秩或有限记忆表示。</p>`},
{id:'tensor',title:'张量方法：在线性模型中补少量高阶信息',pages:'283–285',lead:'退化根附近，一阶模型可能缺少决定性的弯曲信息。',body:String.raw`
\[M(p)=r_k+J_kp+\tfrac12T_k[p,p],\qquad
(T[u,v])_i=\sum_{j,\ell}T_{ij\ell}u_jv_\ell.\]
<p>完整残差二阶张量需 \(O(n^3)\) 存储，通常通过低秩结构和过去迭代的插值信息构造。它与优化 Hessian 的区别是每个残差都有一个二阶矩阵，最终作用输出仍是向量。</p>
<p>教材以概述介绍其处理部分退化根的潜力。求解这个非线性模型与全局化比 Newton 更复杂，不能只写一个二阶项就认定已获得稳健求解器。</p>`},
{id:'globalization',title:'残差 merit 函数与下降保护',pages:'285–290',lead:'先让候选步可靠减小残差目标，再检查是否真正在逼近根。',body:String.raw`
\[\psi=\tfrac12\|r\|^2,\qquad\nabla\psi=J^Tr,\qquad
\nabla\psi^Tp=-\|r\|^2\quad(Jp=-r).\]
<p>非零残差且 Newton 步可定义时它是下降方向。对非精确步，令 \(e=Jp+r\)，可得 \(\nabla\psi^Tp=-\|r\|^2+r^Te\leq-(1-\eta)\|r\|^2\)。</p>
<p>线搜索收敛到 merit 驻点不自动表示找到根。若 Jacobian 逆一致有界，则 \(\|r\|\leq\|J^{-T}\|\|J^Tr\|\)，才可由驻点残差推向方程残差。</p>
<p>近奇异时可用 \((J^TJ+\lambda I)p=-J^Tr\) 正则化。这改变了步，却仍需残差判据。过强阻尼可能收敛到非根驻点。</p>`},
{id:'trust',title:'用线性残差模型构造信赖域',pages:'290–296',lead:'沿用最小二乘模型，但成功标准是方程残差。',body:String.raw`
\[\min_{\|p\|\leq\Delta_k}\tfrac12\|r_k+J_kp\|^2,\quad
\rho_k=\frac{\|r_k\|^2-\|r(x_k+p)\|^2}{\|r_k\|^2-\|r_k+J_kp\|^2}.\]
<p>可用 Dogleg、LM 或迭代子问题方法。真实改善不足则拒绝并缩半径；改善良好且碰到边界则扩大。全球化理论一般先保证 merit 梯度趋零，再借非退化条件推导根收敛。</p>
<p>近非退化根时，半径最终允许完整 Newton 步，恢复二次局部速度。对奇异或无解系统，这一解释不成立。</p>`},
{id:'continuation',title:'延拓：沿一个更容易求解的方程族追踪',pages:'296–302',lead:'解曲线可能折返，所以简单单调增加参数并不总能成功。',body:String.raw`
\[H(x,t)=t r(x)+(1-t)(x-a),\qquad H(a,0)=0,\quad H(x,1)=r(x).\]
<p>以弧长 \(s\) 参数化零路径，可得</p>
\[H_x\dot x+H_t\dot t=0,\qquad\|\dot x\|^2+|\dot t|^2=1.\]
<p>切向属于 \([H_x\ H_t]\) 的零空间。预测点为 \(z_P=z+h\dot z\)；校正点可满足 \(H(z)=0\) 与 \(\dot z^T(z-z_P)=0\)，这是伪弧长形式的局部校正条件。</p>
<p>当 \(H_x\) 奇异但增广矩阵满行秩时，参数 \(t\) 可暂时下降而路径仍继续。分支、秩亏与发散路径仍可能阻止到达 \(t=1\)。延拓需要步长调整和事件检测，不是任意方程的全局求根保证。</p>`},
{id:'practice',title:'方程求解结束时应报告什么',pages:'302–303',lead:'残差、物理范围和分支信息，比“优化成功”更有意义。',body:String.raw`
<ol><li>按每条守恒或平衡方程的尺度报告残差。</li><li>检查 Jacobian 条件与变量的物理范围。</li><li>记录停止原因、接受步和失败试探。</li><li>若存在多根，用不同初值或参数延拓检查分支。</li></ol>
<details><summary>自测：r=x²+1，最小二乘在 x=0 停止，是否求根成功？</summary><div><p>不是；残差为 1。它只是 merit 函数的最小点，原实方程无解。</p></div></details>
<p>至此完成无约束求解、拟合与求根的共同基础。下一章<a href="#ch12/problem">约束优化理论</a>将可行性、乘子和最优性结合起来。</p>`}
]});
