window.OPT_CHAPTERS.push({id:'ch12',number:'12',title:'约束优化理论：从可行方向到 KKT',subtitle:'Theory of Constrained Optimization · 几何、约束资格、二阶条件与对偶',pages:'304–354',sections:[
{id:'problem',title:'问题、符号与工程约束',pages:'304–307',lead:'守恒关系限定状态，设备能力限定可行域，目标函数表达选择。',body:String.raw`
\[\min_x f(x),\quad c_i(x)=0\ (i\in\mathcal E),\quad c_i(x)\geq0\ (i\in\mathcal I).\]
\[\mathcal F=\{x:c_{\mathcal E}(x)=0,\ c_{\mathcal I}(x)\geq0\},\qquad
\mathcal A(x)=\mathcal E\cup\{i\in\mathcal I:c_i(x)=0\}.\]
<p>全书后续统一使用大于等于零的不等式。温度上限可写成 \(T_{\max}-T\geq0\)，物料衡算写成等式。改变约束符号会改变乘子符号；缩放约束还会改变乘子数值，单位也随之变化。</p>
<p>局部解只与可行邻域比较；严格局部解要求其他可行点目标严格更大。非凸可行域上，局部 KKT 解未必是全局解。算法终止报告应分别列出原始可行性、对偶可行性、驻点和互补残差。</p>`},
{id:'geometry',title:'切空间、切锥与线性化锥',pages:'307–319',lead:'边界上的梯度不必为零，因为有些下降方向被约束挡住。',body:String.raw`
\[T_{\mathcal F}(x)=\{d:\exists x_j\in\mathcal F,\ t_j\downarrow0,\ (x_j-x)/t_j\to d\}.\]
\[\mathcal L(x)=\{d:\nabla c_i^Td=0\ (i\in\mathcal E),\quad
\nabla c_i^Td\geq0\ (i\in\mathcal A(x)\cap\mathcal I)\}.\]
<p>在光滑约束下 \(T_{\mathcal F}\subseteq\mathcal L\)。非活跃约束对足够小的局部步通常不起一阶限制。等式的线性化给出切空间；不等式给出允许向内部移动的锥。约束资格的作用之一，是保证线性化没有捏造可行方向。</p>
<details><summary>退化约束为什么需要额外条件？</summary><div><p>对 \(\min x\) 满足 \(x^2=0\)，唯一可行点是零，所以它是全局解。但 \(c'(0)=0\)，线性化允许任意方向；驻点方程 \(1-\lambda\,0=0\) 无解。失败来自约束描述退化，不来自最优点不存在。</p></div></details>
<p>任意局部最优点满足 \(\nabla f(x_*)^Td\geq0\) 对所有真实切方向成立。将这条几何条件变成乘子条件，需要约束资格。</p>`},
{id:'kkt',title:'Lagrangian 与一阶 KKT 条件',pages:'320–330',lead:'目标梯度由活跃约束的法向量平衡。',body:String.raw`
\[L(x,\lambda)=f(x)-\sum_{i\in\mathcal E\cup\mathcal I}\lambda_i c_i(x),\quad A(x)_{i,:}=\nabla c_i(x)^T.\]
\[\begin{aligned}\nabla_xL(x_*,\lambda_*)&=\nabla f(x_*)-A(x_*)^T\lambda_*=0,\\
c_i(x_*)&=0\ (i\in\mathcal E),\quad c_i(x_*)\geq0\ (i\in\mathcal I),\\
\lambda_i^*&\geq0\ (i\in\mathcal I),\quad \lambda_i^*c_i(x_*)=0\ (i\in\mathcal I).
\end{aligned}\]
<p>等式乘子可以正也可以负；不等式乘子非负。非活跃约束乘子为零，但活跃约束乘子也可能为零。严格互补是每个活跃不等式的乘子严格为正，是额外假设。</p>
<details><summary>从可行方向到乘子的推理</summary><div><p>约束资格允许将真实切锥替换为线性化锥。于是没有满足线性约束又使 \(g^Td<0\) 的方向。Farkas 型替代定理把“下降方向不存在”转化成 \(g\) 是等式法向量的线性组合与活跃不等式法向量的非负组合，即 \(g=A^T\lambda\)。</p></div></details>
<div data-demo="kkt-projection"></div>`},
{id:'qualification',title:'LICQ、MFCQ 与乘子唯一性',pages:'315–319,338–340',lead:'约束资格检查约束描述是否足够规则。',body:String.raw`
<p><strong>LICQ：</strong>所有活跃约束梯度线性独立。局部解满足 LICQ 时存在 KKT 乘子且乘子唯一。活跃约束数超过变量数时 LICQ 必然失败；冗余约束也会造成失败。</p>
\[\{\nabla c_i(x):i\in\mathcal A(x)\}\ \text{线性独立}.\]
<p><strong>MFCQ：</strong>等式梯度独立，并存在一个切于等式、严格指向所有活跃不等式内部的方向。</p>
\[A_{\mathcal E}d=0,\qquad \nabla c_i^Td>0\quad(i\in\mathcal A\cap\mathcal I).\]
<p>LICQ 蕴含 MFCQ，反向通常不成立。MFCQ 足以支持一阶乘子必要条件，但不保证唯一乘子。教材还讨论更弱的常秩等资格；在实现中应检查 Jacobian 的数值秩与约束缩放，而不是把一次奇异分解直接等同于不可行。</p>`},
{id:'second-order',title:'临界锥与二阶必要、充分条件',pages:'330–337',lead:'只需在一阶目标不增加的可行方向上检查曲率。',body:String.raw`
\[C(x_*,\lambda_*)=\{d\in\mathcal L(x_*):\nabla f(x_*)^Td=0\}.\]
<p>在 KKT 下，正乘子的活跃不等式要求 \(\nabla c_i^Td=0\)，零乘子的活跃不等式仍允许 \(\nabla c_i^Td\geq0\)。因此不能任意把所有活跃不等式都当成等式。</p>
\[H_L=\nabla^2_{xx}L=\nabla^2 f-\sum_i\lambda_i\nabla^2c_i.\]
<p>在局部解与 LICQ 下，二阶必要条件为 \(d^TH_Ld\geq0\) 对所有 \(d\in C\) 成立。反之，KKT 加上</p>
\[d^TH_Ld>0\quad\forall d\in C\setminus\{0\}\]
<p>给出严格局部解的二阶充分条件。非负曲率仅是必要条件，零曲率仍需更高阶信息。充分条件是局部的，并不排除另一个更优分支。</p>
<details><summary>为什么是 Lagrangian Hessian？</summary><div><p>沿可行光滑曲线 \(x(t)\)，等式给出 \(A x'=0\) 和 \(\nabla c_i^Tx''+x'^T\nabla^2c_ix'=0\)。利用 \(g=A^T\lambda\)，有 \(\frac{d^2}{dt^2}f(x(t))=x'^T(\nabla^2f-\sum_i\lambda_i\nabla^2c_i)x'\)。约束弯曲贡献必须计入目标沿曲线的曲率。</p></div></details>`},
{id:'reduced',title:'约化 Hessian 与凸问题的特殊保证',pages:'337,343–349',lead:'等式问题把曲率限制到切空间；凸问题还可以把局部条件提升为全局结论。',body:String.raw`
\[AZ=0,\quad \operatorname{rank}Z=n-m,\quad d=Zv,\qquad H_R=Z^TH_LZ.\]
<p>等式 Jacobian 满行秩时，约化 Hessian 正定是二阶充分条件。整个 \(H_L\) 可以不定，因为沿约束法向量的曲率不决定可行局部最优性。</p>
<p>凸问题要求 \(f\) 凸、等式仿射、当前 \(c_i\geq0\) 约定下不等式函数 \(c_i\) 凹。此时任何 KKT 点都是全局解。严格凸目标在凸可行域上至多有一个解。Slater 严格可行性等条件可保证凸问题强对偶和乘子存在；它们不能直接推广为非凸全局保证。</p>`},
{id:'sensitivity',title:'乘子的单位与最优值敏感性',pages:'341–343',lead:'影子价格回答约束边界改变一点，最优目标如何变化。',body:String.raw`
\[v(b)=\min f(x)\quad\text{s.t. }c_i(x)\geq b_i,\qquad
L=f-\lambda^T(c-b).\]
\[\frac{\partial v}{\partial b_i}=\lambda_i^*\quad\text{在解分支光滑且包络定理适用时}.\]
<p>提高 \(b_i\) 表示收紧当前约束，因此不等式乘子非负对应成本不下降。若写成放松 \(c_i(x)+\varepsilon_i\geq0\)，导数则为 \(-\lambda_i^*\)。等式右端扰动的符号按同一 Lagrangian 检查。</p>
<p>例如最小成本的产量约束 \(q-q_{\min}\geq0\)，乘子单位为“成本/产量”。若使用 \((q-q_{\min})/q_0\geq0\)，新乘子为旧乘子的 \(q_0\) 倍。活跃集切换时最优值可能不可微，此时需要单侧导数或更一般的敏感性分析。</p>`},
{id:'duality',title:'Lagrangian 对偶与上下界',pages:'343–349',lead:'对偶函数给出可行解目标的下界，先于强对偶成立。',body:String.raw`
\[q(\lambda)=\inf_x L(x,\lambda),\qquad
\max_\lambda q(\lambda)\quad\text{s.t. }\lambda_{\mathcal I}\geq0.\]
\[q(\lambda)\leq L(x,\lambda)\leq f(x)\quad(x\in\mathcal F).\]
<p>这就是弱对偶。\(q\) 总是凹函数，即使原问题非凸；也可能处处取负无穷，或最优对偶值与原始值有间隙。强对偶要求额外结构。存在鞍点意味着原始和对偶都达到同一目标值；非凸 KKT 点不一定是鞍点。</p>
<p>在工程设计中，可行方案提供上界，对偶解提供下界；二者接近才形成全局质量证据。仅有小 KKT 残差通常只能支持局部一阶最优性。</p>`},
{id:'practice',title:'约束理论自检与算法接口',pages:'349–354',lead:'先把符号、几何与残差写清楚，再进入具体算法。',body:String.raw`
<ol><li>为什么 \(\min x\) 满足 \(x\geq0\) 的解处梯度非零？写出 \(\lambda=1\)。</li><li>约束 \(x^2=0\) 与 \(x=0\) 可行域相同，KKT 表现为什么不同？</li><li>何时可把临界锥替换为活跃约束零空间？考虑严格互补。</li><li>收紧温度上限意味着 \(T_{\max}\) 减小；目标导数应怎样与乘子对应？</li></ol>
\[r_d=\nabla f-A^T\lambda,\quad
r_p=(c_{\mathcal E},\min(c_{\mathcal I},0)),\quad
r_c=\lambda_{\mathcal I}\odot c_{\mathcal I}.\]
<p>同时检查 \(\lambda_{\mathcal I}\geq0\) 与变量尺度。下一章在仿射模型中把这些条件转化为可执行的 <a href="#ch13/standard">单纯形算法</a>。</p>`}
]});
