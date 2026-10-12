window.OPT_CHAPTERS.push({id:'ch15',number:'15',title:'约束算法基础：生成步与接受步',subtitle:'Fundamentals of Constrained Algorithms · 消元、merit、filter 与二阶校正',pages:'421–447',sections:[
{id:'framework',title:'约束算法的共同骨架',pages:'421–424',lead:'产生一个看起来好的步，与证明这个步可以接受，是两件相互配合的事。',body:String.raw`
<p>约束优化同时减少目标和违反度。算法通常包含：评估 \(f,c,g,A\)；建立局部模型；计算候选步和乘子；通过 merit 或 filter 接受；更新曲率与尺度；检查完整 KKT 残差。</p>
\[\min f(x),\quad c_{\mathcal E}(x)=0,\ c_{\mathcal I}(x)\geq0,\qquad
h(x)=\|c_{\mathcal E}(x)\|_1+\|\min(c_{\mathcal I}(x),0)\|_1.\]
<p>可按可行/非可行迭代、活跃集/内点、线搜索/信赖域、精确 Hessian/拟 Newton 分类。这些维度可以组合，不能简单把每一维当成互斥的完整算法。</p>
<p>可行迭代更容易保留物理约束，但寻找初值和沿非线性曲面移动可能很难；非可行迭代更灵活，却需要约束违反控制和恢复阶段。</p>`},
{id:'active',title:'组合性来自未知活跃集',pages:'424–426',lead:'最优点哪些约束恰好绑定，是计算过程的一部分。',body:String.raw`
\[c_i(x_*)>0\Rightarrow\lambda_i^*=0,\qquad
c_i(x_*)=0\Rightarrow\lambda_i^*\geq0.\]
<p>如果事先知道最优活跃集，可以把它与等式合并求解等式问题，然后验证乘子符号和其余约束。穷举所有不等式子集有指数成本，因此活跃集算法逐步加入阻挡约束并删除错误绑定的约束。</p>
<p>严格互补和规则性使局部活跃识别更稳定；弱活跃约束（乘子零）可能在边界反复切换。内点法用扰动互补平滑处理这种组合性，最终仍需区分实际活跃状态。</p>`},
{id:'elimination',title:'线性等式消元与约化问题',pages:'426–431',lead:'消元减少自由度，但要保护稀疏性和数值条件。',body:String.raw`
\[Ax=b,\quad Ax_p=b,\quad AZ=0,\qquad x=x_p+Zz.\]
\[\widehat f(z)=f(x_p+Zz),\quad\nabla\widehat f=Z^Tg,\quad
\nabla^2\widehat f=Z^T\nabla^2fZ.\]
<p>满行秩时选择 \(n-m\) 个独立零空间列。若 \(A=[B\ N]\)，可以用 \(x_B=B^{-1}b-B^{-1}Nx_N\) 得到简单消元；不良基会放大误差，正交 QR 零空间更稳定但可能稠密。</p>
<p>非线性消元可能丢失分支、隐含边界或造成奇异。例如 \(y^2=(x-1)^3\) 要求 \(x\geq1\)，且正负两个 \(y\) 分支不同。多数通用算法对线性化约束消元，而不盲目消掉原始非线性关系。</p>`},
{id:'normal-tangent',title:'非线性等式：法向步与切向步',pages:'431–435',lead:'一个分量修复约束，另一个分量在近似切空间内优化。',body:String.raw`
\[c(x+p)\approx c+Ap,\qquad p=v+Zz,\quad Av\approx-c,\quad AZ=0.\]
\[\min_v\|c+Av\|^2\quad\text{s.t. }\|v\|\leq\zeta\Delta,\quad0<\zeta<1.\]
<p>若线性等式与信赖域不相容，法向步只尽力降低违反度。给切向部分留出空间，然后优化目标的二次模型。全步仍需检验真实约束，\(Ap+c=0\) 不保证 \(c(x+p)=0\)。</p>
<p>不等式可使用工作集或松弛变量来形成相似结构。零空间方法、增广 KKT 系统与 Schur 补是同一个局部模型的不同线性代数实现。</p>`},
{id:'merit',title:'Merit 函数与方向下降',pages:'435–437',lead:'用一个标量平衡目标改善与约束违反。',body:String.raw`
\[\phi_\rho(x)=f(x)+\rho h(x),\qquad\rho>0.\]
<p>这里 \(\rho\) 是罚系数，避免与内点障碍参数 \(\mu\) 混淆。\(h\) 含绝对值和负部，通常不可微，但有方向导数。对等式且 \(Ap=-c\)，</p>
\[D\phi_\rho(x;p)=g^Tp-\rho\|c\|_1.\]
\[\phi_\rho(x+\alpha p)\leq\phi_\rho(x)+\eta\alpha D\phi_\rho(x;p),\quad0<\eta<1.\]
<p>需先确保方向导数负，再回溯。\(\rho\) 过小会牺牲可行性；过大可能拒绝有价值的目标步并使算法迟钝。乘子大小可以为罚系数更新提供尺度，但更新规则仍需相应下降分析。</p>`},
{id:'filter',title:'Filter：比较目标与违反度',pages:'437–440',lead:'不先固定一个加权和，直接记录二维的改进关系。',body:String.raw`
<p>filter 记录非支配的 \((h_j,f_j)\)。若已有点同时满足 \(h_j\leq h\)、\(f_j\leq f\)，候选被支配。实际接受通常要求对每个 filter 项满足至少一个有裕度的改进：</p>
\[h\leq(1-\gamma_h)h_j\quad\text{或}\quad f\leq f_j-\gamma_fh_j.\]
<p>还需 near-feasible 的目标充分下降、切换条件、最大违反限制、信赖域或线搜索保护；简单非支配性本身不保证收敛。子问题不可行或无法通过接受检验时，恢复阶段优先降低 \(h\)。</p>
<div data-demo="filter-frontier"></div>
<p>演示只可视化非支配与裕度判据，并明确区分它与完整的 filter 优化求解器。</p>`},
{id:'maratos',title:'Maratos 效应：好的局部步也可能被拒绝',pages:'440–443',lead:'线性化可行步会留下二阶约束误差，正好与目标改善同阶。',body:String.raw`
\[c(x)=0,\quad Ap=0\quad\Rightarrow\quad c(x+p)=O(\|p\|^2).\]
<p>靠近解时，目标改善也可能为 \(O(\|p\|^2)\)。精确罚 merit 的违反项 \(\rho\|c(x+p)\|\) 因此可能压过目标下降，使本应产生快速局部收敛的单位步反复被拒绝。这就是 Maratos 效应的核心机制。</p>
<p>它不意味着罚系数符号写错，也不能简单把所有拒绝都归于 Maratos。模型失准、错误 Jacobian 和定义域越界同样会导致回溯失败。</p>`},
{id:'correction',title:'二阶校正、watchdog 与非单调接受',pages:'443–446',lead:'消掉主要约束弯曲误差，帮助恢复单位步。',body:String.raw`
\[A\widehat p=-c(x+p),\qquad
\widehat p=-A^T(AA^T)^{-1}c(x+p).\]
<p>在满行秩下，这是最小范数校正；实践应求解系统而非显式求逆。若主步满足线性化约束且在规则局部邻域，\(\widehat p=O(\|p\|^2)\)，从 \(x+p\) 修正到 \(x+p+\widehat p\) 可把二阶可行误差进一步减小。Jacobian 使用旧点还是试探点对应不同实现。</p>
<p>watchdog 暂时允许不满足严格单调条件的步，保留一个参考点，若后续没有足够进度则回退。非单调窗口以最近多个值作为参考。二者都需要有限窗口和回退控制；任意允许目标增大不构成收敛算法。</p>`},
{id:'practice',title:'实现检查与方法选择',pages:'446–447',lead:'算法要同时回答“为什么产生这个步”和“为什么接受这个步”。',body:String.raw`
<ol><li>对圆约束 \(x^Tx=1\)，沿切向步计算真实违反度，验证其为二阶。</li><li>对等式步 \(Ap=-c\) 推导 merit 方向导数，并解释罚系数作用。</li><li>向 filter 加一个支配已有项的候选，说明该删哪些项。</li><li>非线性消元要保留哪些边界与分支？</li></ol>
<p>下一章的 <a href="#ch16/equality">二次规划</a> 提供约束 Newton 与 SQP 的核心子问题。前面这些接受机制仍负责把局部 QP 步变成可靠的非线性迭代。</p>`}
]});
