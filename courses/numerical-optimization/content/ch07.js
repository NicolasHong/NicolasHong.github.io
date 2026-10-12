window.OPT_CHAPTERS.push({id:'ch07',number:'07',title:'大规模优化：只计算真正需要的信息',subtitle:'Large-Scale Optimization · 非精确 Newton、L-BFGS 与结构利用',pages:'164–192',sections:[
{id:'cost',title:'规模变大后，瓶颈在哪里',pages:'164–165',lead:'维数只是起点：存储、分解填充、导数评价与内层迭代，共同决定一次求解的成本。',body:String.raw`
<p>前六章讨论了“什么方向值得走”。当变量来自空间网格、时间离散或大量待估参数时，还必须追问：这个方向能否在可接受的内存和时间内算出来？</p>
<div class="table-wrap"><table><tr><th>策略</th><th>主要信息</th><th>典型存储</th><th>主要代价</th></tr><tr><td>稠密 Newton</td><td>完整 Hessian</td><td>\(O(n^2)\)</td><td>稠密分解 \(O(n^3)\)</td></tr><tr><td>稀疏 Newton</td><td>稀疏 Hessian 与消元顺序</td><td>由因子填充决定</td><td>不能只按原矩阵非零数估计</td></tr><tr><td>Newton–CG</td><td>梯度与 \(v\mapsto\nabla^2f(x)v\)</td><td>CG 工作向量 \(O(n)\)</td><td>若干 Hessian–向量积</td></tr><tr><td>L-BFGS</td><td>梯度、最近 \(m\) 对曲率信息</td><td>\(O(mn)\)</td><td>方向计算 \(O(mn)\)</td></tr><tr><td>非线性 CG</td><td>梯度与少量历史向量</td><td>\(O(n)\)</td><td>梯度评价与线搜索</td></tr></table></div>
<p>以上不含模型本身、自动微分记录和预条件器的存储。双精度完整矩阵在 \(n=10^5\) 时需要约 80 GB；保存 10 对长度为 \(n\) 的向量约需 16 MB。这是数据存储估算，并非求解器总内存。</p>
<h2>PSE 中的结构机会</h2><p>离散反应扩散模型通常只有相邻网格耦合；动态优化中局部时间段贡献可相加；某些参数估计目标的 Hessian 稠密，但仍可快速计算其对向量的作用。选方法时应先判断这些结构，而不是单凭“变量很多”。</p>`},
{id:'inexact',title:'非精确 Newton：内层解到什么程度',pages:'165–168',lead:'远离解时，精确解一个尚不准确的局部模型可能浪费计算。',body:String.raw`
<p>记 \(g_k=\nabla f(x_k)\)、\(G_k=\nabla^2f(x_k)\)。Newton 方程是 \(G_kp_k=-g_k\)。允许线性方程保留残差：</p>
\[r_k=G_kp_k+g_k,\qquad \|r_k\|\leq\eta_k\|g_k\|,\qquad0\leq\eta_k<1.\]
<p>\(\eta_k\) 是强迫项，控制内层相对残差；\(\|g_k\|\) 是外层的一阶最优性指标。两者不能混作同一个停止条件。为避免符号混淆，内层 CG 下标用 \(j\)，外层优化下标用 \(k\)。</p>
<p>可选固定 \(\eta_k=0.5\)，也可在接近解时收紧：</p>
\[\eta_k=\min\{0.5,\sqrt{\|g_k\|}\},\qquad
\eta_k=\min\{0.5,\|g_k\|\}.\]
<p>这些例子默认变量与梯度已合理缩放。把带物理量纲的梯度范数直接代入通用阈值，可能导致单位改变后求解策略完全不同。</p>
<div data-demo="large-forcing"></div>
<p>实验用已知解的正定二次目标隔离内层精度的影响。精确二次模型允许单位步，所以无需线搜索；这不代表一般非线性问题也可以省略全局化策略。本例中始终使用紧容差反而能一次外层完成且总乘积更少，因为二次模型在全域精确；不能把这一结果推广为所有非线性问题的最佳策略。</p>`},
{id:'local',title:'强迫项如何决定局部收敛速度',pages:'166–168',lead:'下一次梯度等于本次线性求解误差，再加上 Taylor 余项。',body:String.raw`
<p>假设 \(f\in C^2\)，\(x_*\) 处 \(G_*\succ0\)，初值足够近，并采用单位步 \(x_{k+1}=x_k+p_k\)。Hessian 连续且局部可逆时，\(\|p_k\|=O(\|g_k\|)\)。</p>
<details><summary>从积分余项推导误差传递</summary><div>
\[g_{k+1}=g_k+G_kp_k+\int_0^1[\nabla^2f(x_k+tp_k)-G_k]p_k\,dt.\]
\[g_{k+1}=r_k+o(\|p_k\|),\qquad
\|g_{k+1}\|\leq(\eta_k+o(1))\|g_k\|.\]
<p>若 Hessian 还局部 Lipschitz 连续，积分项范数不超过 \(L\|p_k\|^2/2\)，于是</p>
\[\|g_{k+1}\|\leq\eta_k\|g_k\|+C\|g_k\|^2.\]
<p>注意积分中相减的是两个 Hessian，乘以步向量后才与梯度同维。</p></div></details>
<ul><li>若 \(\eta_k\leq\bar\eta<1\)：局部至少线性收敛。教材的线性收缩写在 \(\|G_*(x_k-x_*)\|\) 这一固定加权范数中。</li><li>若 \(\eta_k\to0\)：在上述邻域中得到超线性收敛。</li><li>若 Hessian 局部 Lipschitz，且 \(\eta_k=O(\|g_k\|)\)：得到二次收敛。</li></ul>
<p>由 \(g_k=G_*(x_k-x_*)+o(\|x_k-x_*\|)\)，可把梯度估计转成迭代点误差估计。结论是局部的，并假定最终接受单位步。内层总是很精确，既不保证从任意初值收敛，也不保证找到全局最小值。</p>`},
{id:'newton-cg',title:'线搜索 Newton–CG：遇到负曲率就截断',pages:'168–170',lead:'用 CG 近似 Newton 方向，但不把不定 Hessian 当作正定线性系统。',body:String.raw`
<p>固定外层点，令 \(B=G_k\)、\(g=g_k\)，初始化 \(z_0=0,r_0=g,d_0=-g\)。若 \(g=0\)，先报告一阶驻点；否则重复：</p>
<ol><li>计算 \(w_j=Bd_j\)。若 \(d_j^Tw_j\leq0\)，在 \(j=0\) 时返回 \(-g\)，在 \(j>0\) 时返回已有近似 \(z_j\)。</li><li>沿正曲率方向完成一次 CG 更新：</li></ol>
\[a_j=\frac{r_j^Tr_j}{d_j^TBd_j},\quad z_{j+1}=z_j+a_jd_j,\quad r_{j+1}=r_j+a_jBd_j.\]
<p>若 \(\|r_{j+1}\|\leq\eta_k\|g\|\)，返回 \(z_{j+1}\)；否则</p>
\[b_{j+1}=\frac{r_{j+1}^Tr_{j+1}}{r_j^Tr_j},\qquad d_{j+1}=-r_{j+1}+b_{j+1}d_j.\]
<p>外层再对返回的 \(p_k\) 做线搜索，优先试单位步。初始零向量与 CG 正交关系保证截断所得方向下降；这比在不定系统上任意提前停止更有依据。</p>
<details><summary>为什么正曲率阶段已有近似是下降方向</summary><div><p>在精确算术下，\(r_j\) 与此前搜索子空间正交，故 \(r_j^Tz_j=0\)，即 \(g^Tz_j=-z_j^TBz_j\)。在已探索的共轭方向上曲率为正，因此非零 \(z_j\) 满足 \(g^Tz_j<0\)。第一步就遇到非正曲率时，\(-g\) 自身满足 \(g^T(-g)=-\|g\|^2<0\)。</p></div></details>
<h2>Hessian-free 的含义</h2>\[Bd\approx\frac{\nabla f(x+hd)-\nabla f(x)}h.\]
<p>“不显式形成 Hessian”仍然使用二阶信息。差分近似每个乘积需额外梯度评价；也可由第 8 章的自动微分直接得到。近奇异 Hessian 可能产生很长的方向，信赖域能更直接限制步长。</p>`},
{id:'steihaug',title:'CG–Steihaug：把内层路径截在信赖域内',pages:'170–174',lead:'三种合理的内层停止：残差足够小、触及边界、发现非正曲率。',body:String.raw`
\[\min_{\|p\|\leq\Delta}q(p)=g^Tp+\tfrac12p^TBp.\]
<p>仍从 \(z_0=0\) 开始。CG 候选在球内时继续；候选越界时沿当前方向截到球面；若发现 \(d^TBd\leq0\)，比较该直线与球面的两个交点，选择模型值较小者。</p>
<details><summary>球面交点与模型下降</summary><div>
\[\|z+\tau d\|^2=\Delta^2\iff(d^Td)\tau^2+2(z^Td)\tau+(z^Tz-\Delta^2)=0.\]
\[\tau_\pm=\frac{-z^Td\pm\sqrt{(z^Td)^2+(d^Td)(\Delta^2-z^Tz)}}{d^Td}.\]
<p>普通越界取正根；非正曲率时，在可行线段两端比较 \(q\)。首个正曲率步到达 Cauchy 点或其边界截断；后续 CG 步继续降低模型，因此在初始梯度未触发停止时，所得步至少提供 Cauchy 下降。外层再用真实/预测下降比接受或拒绝，并调整半径。</p></div></details>
<div data-demo="large-steihaug"></div>
<p>精确算术下，未终止 CG 近似的欧氏范数随内层步数增长，这依赖零初始化。不能把任意暖启动点代入后，仍直接套用同一性质。</p>
<div class="callout"><p>仅用梯度生成的子空间可能看不到某些负特征方向。尤其 \(g=0\) 时，返回零步不能证明二阶最优性。实验中的“隐藏负曲率”例子展示了这一限制。</p></div>`},
{id:'preconditioning',title:'预条件不仅改变速度，也改变信赖域度量',pages:'174–175',lead:'内层变换和步长约束必须用一致的坐标。',body:String.raw`
<p>取可逆矩阵 \(D\)，设 \(M=D^TD\succ0\)，使用椭球约束 \(\|Dp\|\leq\Delta\)。令 \(\widehat p=Dp\)，则</p>
\[\widehat g=D^{-T}g,\quad\widehat B=D^{-T}BD^{-1},\qquad
\min_{\|\widehat p\|\leq\Delta}\widehat g^T\widehat p+\tfrac12\widehat p^T\widehat B\widehat p.\]
<p>在新坐标中应用普通 Steihaug，等价于在原坐标做相应 PCG。单调增长的是 \(M\) 范数 \(\|p\|_M=\sqrt{p^TMp}\)。把 PCG 与未经分析的欧氏截断混用，不能直接引用上节的证明。</p>
<h2>不完全修正 Cholesky 的思想</h2><p>先缩放 Hessian，再对移位后的矩阵尝试不完全分解；失败则增大正移位，直到得到可用的正定预条件器。限制填充控制存储，移位处理不定性。分解是近似关系，不能把舍弃项当作零。</p>
\[T_{ii}=\max\{\|Be_i\|,\epsilon_T\},\quad
\overline B=T^{-1/2}BT^{-1/2},\quad LL^T\approx\overline B+\sigma I.\]
<p>这里 \(\epsilon_T>0\) 是针对零列补充的数值保护。若把缩放一并还原到原坐标，可用 \(D=L^TT^{1/2}\)，从而 \(M=T^{1/2}LL^TT^{1/2}\)。只在已缩放坐标工作时才直接用 \(L^T\)。</p>
<p>好的预条件器同时追求易应用和改善谱分布；过于精细的分解可能抵消内层迭代减少带来的收益。</p>`},
{id:'lanczos',title:'Newton–Lanczos：在子空间中继续搜集曲率',pages:'175–176',lead:'第一次发现负曲率，并不意味着已经找到最有价值的负曲率。',body:String.raw`
<p>Steihaug 可以很便宜地给出合格下降，但不保证近似全局求解不定二次子问题。Lanczos 在对称矩阵上构造正交基 \(Q_j\)，满足</p>
\[Q_j^TQ_j=I,\quad Q_j^TBQ_j=T_j,\quad BQ_j=Q_jT_j+\beta_jq_{j+1}e_j^T,\]
<p>其中 \(T_j\) 为对称三对角矩阵。取 \(p=Q_jw\)，原球约束简化为 \(\|w\|\leq\Delta\)：</p>
\[\min_{\|w\|\leq\Delta}(Q_j^Tg)^Tw+\tfrac12w^TT_jw.\]
<p>若首向量 \(q_1=g/\|g\|\)，线性项为 \(\|g\|e_1^Tw\)。这一写法同时明确维数：\(Q_j\) 是 \(n\times j\)，而 \(w\in\mathbb R^j\)。对三对角子问题，可使用第 4 章的移位和世俗方程思路。</p>
<details><summary>三项递推从何而来</summary><div><p>初始化 \(\beta_0=0\)。对 \(j\) 阶基向量，令</p>
\[v=Bq_j-\beta_{j-1}q_{j-1},\quad a_j=q_j^Tv,\quad
v\leftarrow v-a_jq_j,\quad \beta_j=\|v\|,\quad q_{j+1}=v/\beta_j.\]
<p>对称性使精确算术下更早的基方向自动正交，产生三对角结构。浮点误差会破坏正交性，实际实现可能需要重正交。\(\beta_j=0\) 时不能继续除法。</p></div></details>
<p>如果起始梯度恰好与某个负特征子空间正交，仅扩展同一 Krylov 子空间仍无法发现它。困难情形需要额外方向或重启等处理。Lanczos 提供更丰富的子问题策略，但不意味着单次基本递推自动解决所有隐藏负曲率问题。</p>`},
{id:'lbfgs',title:'L-BFGS：用最近的向量对表示一个大矩阵',pages:'176–180',lead:'丢掉旧曲率信息，换取与维数近似线性的存储成本。',body:String.raw`
<p>维护最近至多 \(m\) 对 \(s_i=x_{i+1}-x_i\)、\(y_i=g_{i+1}-g_i\)。每次从基准 \(H_k^{(0)}\) 出发，按时间先后依次施加这些 BFGS 更新，定义当前逆近似。它不是保存稠密矩阵，也不是对普通 BFGS 的元素做截断。</p>
\[H_+=(I-\rho sy^T)H(I-\rho ys^T)+\rho ss^T,\quad\rho=(y^Ts)^{-1}.\]
\[H_k^{(0)}=\gamma_k I,\qquad\gamma_k=\frac{s_{k-1}^Ty_{k-1}}{y_{k-1}^Ty_{k-1}}>0.\]
<p>基准允许随外层步变化；尚无观测对时可用 \(I\)。方向为 \(-H_kg_k\)，Wolfe 搜索帮助保证 \(y_k^Ts_k>0\)。新增一对后，如果总数超过 \(m\)，删除最旧一对；始终保持最多 \(m\) 对。</p>
<div data-demo="large-lbfgs"></div>
<p>实验用相同目标、初值和强 Wolfe 搜索比较不同记忆长度。更多记忆提高了每步工作量，却不保证每次都减少迭代数，更不保证总耗时最短。固定 \(m\) 的 L-BFGS 也不能直接继承完整 BFGS 的一般超线性结论。</p>`},
{id:'two-loop',title:'双循环：不形成 H，也能计算 Hg',pages:'178–181',lead:'先向后应用投影，再向前恢复各次秩一贡献。',body:String.raw`
<p>令保留的索引为 \(i=\ell,\ldots,k-1\)，\(\ell=\max(0,k-m)\)。初始化 \(q=g_k\)。</p>
\[\begin{aligned}
&i=k-1,k-2,\ldots,\ell:\quad a_i=\rho_i s_i^Tq,\quad q\leftarrow q-a_i y_i;\\
&r\leftarrow H_k^{(0)}q;\\
&i=\ell,\ell+1,\ldots,k-1:\quad b_i=\rho_i y_i^Tr,\quad r\leftarrow r+s_i(a_i-b_i);\\
&p_k=-r.
\end{aligned}\]
<details><summary>一对观测的推导，说明两个循环的顺序</summary><div><p>记 \(V=I-\rho ys^T\)。要计算 \(H_+g=V^THVg+\rho s(s^Tg)\)，先算 \(a=\rho s^Tg\)、\(q=g-ay=Vg\)，再算 \(r=Hq\)，最后</p>
\[H_+g=r+s(a-\rho y^Tr).\]
<p>多对观测时，把中间的 \(Hq\) 继续递归展开。最晚的更新先作用于输入，最早的更新先恢复输出，正好得到两个相反顺序的循环。</p></div></details>
<p>除基准矩阵作用外，约需 \(4mn\) 次乘法。若基准是对角阵，再需 \(n\) 次乘法；若用复杂预条件器作为基准，则应计入其应用成本。</p>
<h2>与共轭梯度的联系</h2><p>当 \(m=1\)、\(H^{(0)}=I\)，得到无记忆 BFGS。若每次精确线搜索使 \(s_k^Tg_{k+1}=0\)，展开双循环可得</p>
\[p_{k+1}=-g_{k+1}+\frac{g_{k+1}^Ty_k}{y_k^Tp_k}p_k,\]
<p>即 Hestenes–Stiefel 形式。在相应精确搜索递推条件下又与 PR 联系起来。若使用缩放基准或非精确搜索，不能直接宣称这几种算法完全相同。</p>`},
{id:'compact',title:'紧凑表示：Hessian 本身也可低存储使用',pages:'181–185',lead:'线搜索常需要 Hg，信赖域常需要 Bv；两者不能混淆。',body:String.raw`
<p>按从旧到新排序，令 \(S=[s_0,\ldots,s_{m-1}]\)、\(Y=[y_0,\ldots,y_{m-1}]\)，并定义 \(D=\operatorname{diag}(s_i^Ty_i)\)、\(L_{ij}=s_i^Ty_j\)（\(i>j\)），其余元素为零。</p>
\[B=B_0-[B_0S\ \ Y]
\begin{bmatrix}S^TB_0S&L\\L^T&-D\end{bmatrix}^{-1}
\begin{bmatrix}S^TB_0\\Y^T\end{bmatrix}.\]
<p>这是对同一基准 \(B_0\succ0\) 依次应用 BFGS 的紧凑表达；每对曲率为正时中间矩阵可逆。其维数仅为 \(2m\)，实际计算应解小线性系统，不显式求逆。有限记忆时只保留最近的列，可选 \(B_0=\gamma_k^{-1}I\)。</p>
<details><summary>用一对观测检验符号</summary><div><p>\(m=1\) 时 \(L=0\)，中间矩阵为 \(\operatorname{diag}(s^TB_0s,-s^Ty)\)，展开立即得到</p>
\[B=B_0-\frac{B_0ss^TB_0}{s^TB_0s}+\frac{yy^T}{s^Ty}.\]
<p>右下块的负号使第二个秩一修正变为相加。</p></div></details>
<h2>SR1 的对应表示</h2>
\[B=B_0+(Y-B_0S)(D+L+L^T-S^TB_0S)^{-1}(Y-B_0S)^T.\]
<p>需满足相应更新分母与小矩阵非奇异条件；SR1 可以不定。不能因为 BFGS 的双循环可行，就把 SR1 公式简单替换进去。</p>
<h2>为什么不能只丢掉最老的外积</h2>
\[B_{i+1}=B_i-a_ia_i^T+b_ib_i^T,\quad
a_i=\frac{B_is_i}{\sqrt{s_i^TB_is_i}},\quad b_i=\frac{y_i}{\sqrt{s_i^Ty_i}}.\]
<p>后面的 \(a_i\) 依赖此前所有更新。删掉旧观测后必须重新生成相关 \(a_i\)，不能只从外积列表移除一项。逐项重建约需 \(O(m^2n)\) 工作，而维护紧凑表示可利用小矩阵结构降低开销。</p>`},
{id:'sparse',title:'保持稀疏性：约束更新的收益与代价',pages:'185–186',lead:'真实 Hessian 稀疏，不代表标准 BFGS 更新也会稀疏。',body:String.raw`
<p>令 \(\Omega\) 表示在问题定义域内可能非零的结构位置。可要求新近似同时满足对称、割线与稀疏模式：</p>
\[\min_B\|B-B_k\|_F^2\quad\text{s.t. }Bs_k=y_k,\ B=B^T,\ B_{ij}=0\ ((i,j)\notin\Omega).\]
<p>这是带线性约束的二次优化问题。在约束相容等条件下，可通过相应稀疏线性系统求解；遇到零分量或退化约束时需处理秩亏。结果并不保证正定，且未加权的 Frobenius 距离对尺度敏感。</p>
<p>也可用多对观测放松割线要求：</p>
\[\min_{B=B^T,\ B_{ij}=0\ ((i,j)\notin\Omega)}\|BS-Y\|_F^2.\]
<p>该线性最小二乘问题有解，但可能不唯一，所得矩阵可能奇异或病态。更多约束和历史数据不自动带来更好的搜索方向。教材因此转向更细致的元素函数结构。</p>
<div class="callout"><p>结构零意味着整个相关定义域内都为零。只在当前点数值为零的导数，不应从稀疏模式中删除；否则后续变化会被错误忽略。</p></div>`},
{id:'partial',title:'部分可分性：从元素函数组装梯度与曲率',pages:'186–189',lead:'“可分成小项”不等于“可以分别优化”：这些小项可能共享变量。',body:String.raw`
\[f(x)=\sum_{i=1}^{n_e}\phi_i(U_ix),\qquad U_i\in\mathbb R^{n_i\times n},\quad n_i\ll n.\]
<p>\(U_i\) 可以选取少数变量，也可以是一般的低维线性映射；后者说明部分可分函数未必具有稀疏 Hessian。只有各元素变量互不重叠等情形才可直接分开优化。</p>
\[g(x)=\sum_iU_i^T\nabla\phi_i(U_ix),\qquad
G(x)=\sum_iU_i^T\nabla^2\phi_i(U_ix)U_i.\]
\[G(x)v=\sum_iU_i^T\big[\nabla^2\phi_i(U_ix)(U_iv)\big].\]
<h2>原创工程结构例：相邻单元的状态拟合与平滑</h2>
\[f(x)=\frac12\sum_{i=1}^{n}(x_i-d_i)^2+
\frac\lambda2\sum_{i=1}^{n-1}(x_{i+1}-x_i)^2,\qquad\lambda>0.\]
<p>可把 \(x_i\) 看作沿管式装置离散的状态，\(d_i\) 是测量。观测项只含一个变量，耦合项只含两个。每个耦合元素 Hessian 为 \(\lambda\begin{bmatrix}1&-1\\-1&1\end{bmatrix}\)，合成后为三对角正定矩阵，梯度与乘积可在 \(O(n)\) 时间内计算。</p>
<h2>元素级拟牛顿</h2>
\[s_{[i]}=U_is,\quad y_{[i]}=\nabla\phi_i(U_ix_+)-\nabla\phi_i(U_ix),\quad
B=\sum_iU_i^TB_{[i]}U_i.\]
<p>若每个元素都满足 \(B_{[i],+}s_{[i]}=y_{[i]}\)，相加即得到整体割线方程 \(B_+s=g(x_+)-g(x)\)。但整体正曲率不保证每个元素正曲率；对非凸元素，SR1 配合信赖域可能更合适。需要权衡识别结构、计算元素导数及求步的总成本。</p>`},
{id:'practice',title:'选择方法与检查大规模求解结果',pages:'189–192',lead:'把内存、导数接口和收敛要求放到同一张决策表中。',body:String.raw`
<div class="table-wrap"><table><tr><th>问题条件</th><th>值得比较的策略</th><th>需要记录</th></tr><tr><td>稀疏 Hessian 可形成，填充可控</td><td>稀疏 Newton</td><td>因子非零数、分解时间</td></tr><tr><td>Hessian–向量积便宜</td><td>Newton–CG / Lanczos</td><td>内层乘积数、强迫项、负曲率事件</td></tr><tr><td>仅梯度可靠，完整矩阵太大</td><td>L-BFGS / 非线性 CG</td><td>函数与梯度评价数、记忆长度</td></tr><tr><td>有低维元素分解</td><td>元素级导数与曲率近似</td><td>元素维数、装配与求步成本</td></tr></table></div>
<p>教材的 §7.5 列举了当时的软件实现，说明这些策略如何进入求解器。讲义保留其方法分类，不把 2006 年的性能比较当成当前软件排名。</p>
<details><summary>自测 1：内层相对残差 0.1 是否表示解误差 10%？</summary><div><p>不是。对正定线性系统，解误差还受条件数影响；对非线性优化，它更只是当前 Newton 方程的近似精度。要分别检查真实梯度、模型残差与最终工程误差。</p></div></details>
<details><summary>自测 2：为何固定记忆长度通常不能保证完整 BFGS 的超线性速度？</summary><div><p>因为持续删除信息，无法直接沿用完整更新所积累的方向准确性证明。特殊目标上可能非常快，但不能据此得出一般保证。</p></div></details>
<details><summary>自测 3：某次 CG 没发现负曲率，能否判定 Hessian 正定？</summary><div><p>不能。只检查了访问过的方向；与当前 Krylov 子空间正交的负特征方向可能完全不可见。</p></div></details>
<p>下一章进入这些方法共同依赖的接口：<a href="#ch08/routes">怎样可靠地计算导数</a>。后续新章仍可按独立内容文件接入，无需改写路由。</p>`}
]});
