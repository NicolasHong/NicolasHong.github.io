window.OPT_CHAPTERS.push({id:'ch04',number:'04',title:'信赖域：让模型接受实际检验',subtitle:'Trust-Region Methods · 子问题、负曲率与自适应半径',pages:'66–100',sections:[
{id:'framework',title:'模型预测与实际下降',pages:'66–69',lead:'先规定模型可以被信任的范围，再在这个范围内同时确定方向和步长。',body:String.raw`
<p>在当前点建立对称二次模型，并限制步子的欧氏范数：</p>
\[m_k(p)=f_k+g_k^Tp+\tfrac12p^TB_kp,\qquad \min_{\|p\|\leq\Delta_k}m_k(p).\]
<p>其中 \(g_k=\nabla f(x_k)\)，\(B_k\) 为 Hessian 或其近似。半径 \(\Delta_k\) 表达模型的可信范围，不是设备运行边界；原问题的物理约束需要另外建模。二次模型可以非凸，但球形可行域紧致，因此子问题仍有全局最小点。</p>

<div class="callout"><p><strong>子问题是信赖域方法的核心计算任务。</strong>我们先说明精确解的最优条件，再用 <a href="#ch04/cauchy">Cauchy 点</a>建立近似解的下降基准，随后介绍 Dogleg 和二维子空间两种改进策略。得到候选步后，还要评价原目标，决定是否接受以及怎样调整半径。</p></div>
<h2>同一位置，真实函数与模型可能指向不同谷底</h2>
<p>下面用一个原创函数叠加真实目标与当前二次模型的等高线。以 \(x_k=0\) 为起点，故图中位移 \(p\) 也就是新位置：</p>
\[f(p)=-2p_1-p_2+p_1^2+p_1p_2+2p_2^2+2p_1^4,\qquad m(p)=f(p)-2p_1^4.\]
<p>两者在起点的函数值、梯度和 Hessian 都一致，但走远后被模型忽略的四次项变得明显。模型的完整 Newton 步为 \((1,0)^T\)：模型预测下降 1，真实函数却上升 1。线搜索可沿这个固定方向缩短；信赖域则改变范围，并重新在球内求步，方向也可能随之改变。</p>
<div data-demo="tr-model-overlay"></div>
<p>信赖域并不自动保证模型准确。半径表达的是允许试探的范围，是否可信仍需用下面的实际下降与预测下降比值检验。线搜索同样要评价真实目标，并非直接采用模型谷底。</p>
<h2>用一次真实计算检验模型</h2>
\[\operatorname{pred}_k=m_k(0)-m_k(p_k),\quad\operatorname{ared}_k=f(x_k)-f(x_k+p_k),\quad\rho_k=\frac{\operatorname{ared}_k}{\operatorname{pred}_k}.\]
<p>只有预测下降严格为正时才计算比值。\(\rho_k\) 接近 1 表示模型预测准确；为负表示真实目标上升；大于 1 表示实际下降比预测更多。预测下降为零时，应检查停止条件、负曲率或子问题求解失败，不能直接除零。</p>
<h2>一组典型的半径与接受规则</h2><p>取最大半径 \(\widehat\Delta>0\)、初始半径 \(\Delta_0\in(0,\widehat\Delta)\)、接受阈值 \(\eta\in[0,1/4)\)：</p>
\[\Delta_{k+1}=\begin{cases}\Delta_k/4,&\rho_k<1/4,\\\min(2\Delta_k,\widehat\Delta),&\rho_k>3/4\ \text{且}\ \|p_k\|=\Delta_k,\\\Delta_k,&\text{其他情况},\end{cases}\]
\[x_{k+1}=\begin{cases}x_k+p_k,&\rho_k>\eta,\\x_k,&\rho_k\leq\eta.\end{cases}\]
<p>数值实现用容差判断是否触及边界。接受与扩张是两件事：例如 \(\eta=0.1\)、\(\rho_k=0.2\)，接受当前步，同时缩小下一次半径。拒绝一次试探后，位置不变，但半径变小，下一次子问题可能给出不同方向。</p>

<details><summary>为什么预测很好，还要“触及边界”才扩大半径？</summary><div>
<p>高比值说明当前候选点的下降支持模型预测，但不证明整个球内都预测准确。若步子位于球内部，当前半径通常没有限制它；仅扩大半径，不一定能带来更好的模型步。候选步碰到边界，则提示它可能还想走得更远，此时再结合良好的比值，扩大范围才有明确动机。</p>
<p>例如正定模型的 Newton 步长度为 0.4、当前半径为 1，完整 Newton 步已经可行；把半径增到 2，模型最优步仍是同一个点。反之，若候选步长度等于半径 1 且预测可靠，可以试着给下一步更大的范围。这是这里采用的典型规则的设计理由，并非所有信赖域变体都必须用同一组阈值。</p>
</div></details>
<details><summary>为什么缩小范围通常能改善预测？</summary><div><p>若真实 Hessian 与 \(B_k\) 在考察区域有界，则模型误差为 \(O(\|p\|^2)\)。采用精确 Hessian 且 Hessian 连续时，误差为 \(o(\|p\|^2)\)；进一步具有 Lipschitz 连续性时：</p>\[|f(x_k+p)-m_k(p)|\leq\tfrac{L_H}{6}\|p\|^3.\]<p>梯度远离零且半径足够小时，合格子问题步的预测下降具有一阶量级，模型误差为更高阶量级，于是比值接近 1。若梯度接近零，需要结合曲率分析，不能机械套用这个解释。</p></div></details>`},
{id:'optimality',title:'球约束二次问题的全局最优条件',pages:'69–73',lead:'一个非负乘子把可能不定的矩阵移成半正定矩阵，并把边界约束纳入线性方程。',body:String.raw`
<p>略去常数项，记 \(q(p)=g^Tp+\tfrac12p^TBp\)，其中 \(B=B^T\)。向量 \(p^*\) 是信赖域子问题的全局解，当且仅当它可行，且存在 \(\lambda\geq0\) 满足：</p>
\[(B+\lambda I)p^*=-g,\qquad B+\lambda I\succeq0,\qquad\lambda(\Delta-\|p^*\|)=0,\qquad\|p^*\|\leq\Delta.\]
<p>若 \(B\succ0\)，无约束 Newton 步 \(-B^{-1}g\) 位于球内，则 \(\lambda=0\)。否则最优步常位于边界；乘子修正曲率，同时调节步的长度。矩阵允许奇异，因此不能把上述线性方程一律写成普通逆矩阵公式。</p>
<div class="callout"><p>这里要求 \(B+\lambda I\) 在整个空间半正定。这比只检查约束切空间上的二阶必要条件更强，也是二次球约束问题的全局最优证据。</p></div>
<details><summary>充分性的简洁证明</summary><div><p>令 \(d=p-p^*\)，利用驻点方程，对任意可行 \(p\) 有：</p>
\[q(p)-q(p^*)=\tfrac12d^T(B+\lambda I)d+\tfrac\lambda2(\|p^*\|^2-\|p\|^2).\]
<p>第一项非负。若 \(\lambda=0\)，第二项为零；若 \(\lambda>0\)，互补条件给出 \(\|p^*\|=\Delta\)，第二项也非负。因此 \(p^*\) 优于所有可行点。反向结论还需要利用二次目标与球约束的特殊结构，并不是任意非线性约束的 KKT 条件都能保证全局最优。</p></div></details>
<h2>是否唯一？</h2><p>当 \(B+\lambda I\succ0\) 时上述差值对非零 \(d\) 严格为正，解唯一。若矩阵奇异，可能有多个全局解；本章的“困难情形”会具体展示这一点。</p>`},
{id:'cauchy',title:'Cauchy 点：最低限度的模型下降',pages:'71–73',lead:'不必精确求解子问题；沿负梯度射线的最佳可行点已经提供了一个可计算的下降基准。',body:String.raw`
<h2>先看全貌：子问题需要解到什么程度？</h2>
<p>信赖域每轮都要在球内寻找一个使二次模型下降的步：</p>
\[\min_{\|p\|\leq\Delta}m(p),\qquad m(p)=f(x)+g^Tp+\tfrac12p^TBp.\]
<p>上一节给出了这个子问题的精确全局解应满足的条件。但每轮都精确求解可能代价较高，而局部模型本身也只是原目标的近似。因此，算法通常允许使用<strong>可行、且能让模型充分下降的近似解</strong>。Cauchy 点提供了一个容易计算的下降基准，用来衡量近似解是否足够好；配合适当的模型假设和半径更新规则，这样的下降要求可以支持收敛。</p>
<h2>Cauchy 点的定义：负梯度射线上的最佳可行点</h2>
<p>当 \(g\ne0\) 时，从步空间的原点 \(p=0\) 出发，沿最速下降方向 \(-g\) 最小化<strong>二次模型</strong>，同时不越出信赖域，得到的步 \(p^C\) 就称为 <strong>Cauchy 点（Cauchy 步）</strong>：</p>
\[p^C\in\operatorname*{arg\,min}_{p=-\tau\Delta g/\|g\|,\ 0\leq\tau\leq1}m(p).\]
<p>其中 \(\tau\) 表示保留球面步的比例，具体计算如下。这里“点”位于步空间，原变量中的候选位置是 \(x+p^C\)。它只在一条射线上寻找最优点，通常不是整个球内的最优解，也不一定在球面上。</p>
<h2>两种改进策略：从下降基准走向更好的子问题解</h2>
<p>书中第 71 页预告的两种策略，是<strong>寻找子问题近似解的方法</strong>。它们利用更多曲率信息，争取获得不低于 Cauchy 点的模型下降，而不是两种计算 Cauchy 点的方法。</p>
<table><thead><tr><th>方法</th><th>在哪里找步？</th><th>与 Cauchy 点的关系</th></tr></thead><tbody>
<tr><td><a href="#ch04/dogleg">Dogleg（折线法）</a></td><td>沿“原点 → 梯度射线最小点 → Newton 步”的两段折线搜索</td><td>适用于正定模型；可行路径包含 Cauchy 点，所选步的模型值不会更高</td></tr>
<tr><td><a href="#ch04/subspace">二维子空间最小化</a></td><td>在包含梯度方向和一个曲率相关方向的平面内求解球约束问题</td><td>搜索范围包含负梯度方向，可达到至少相同的下降；不定模型的版本还需估计最负特征值并适当构造子空间</td></tr>
</tbody></table>
<p>本节先建立 Cauchy 基准，接下来两节再介绍这两种改进。对于大型稀疏问题，书中第 7 章还介绍基于共轭梯度的求解策略；本章后续也会讨论通过迭代确定乘子来更准确地求解子问题。</p>
<h2>按教材计算：先求 \(p_k^S\)，再求缩放系数 \(\tau_k\)</h2>
<p>下面保留教材中的迭代下标 \(k\)；它表示当前这一轮。前后讨论中的 \(g,B,\Delta\) 分别就是本轮的 \(g_k,B_k,\Delta_k\)。假设 \(g_k\ne0\)、\(\Delta_k>0\)。整个计算只有一条路线：</p>
\[p_k^S\ \longrightarrow\ m_k(\tau p_k^S)\ \longrightarrow\ \tau_k\ \longrightarrow\ p_k^C=\tau_kp_k^S.\]
<h3>第一步：在线性模型上，先得到球面步</h3>
<p>先暂时去掉二次项，求解</p>
\[p_k^S=\operatorname*{arg\,min}_{\|p\|\leq\Delta_k}\{f_k+g_k^Tp\}
=-\frac{\Delta_k}{\|g_k\|}g_k.\]
<p>这是沿负梯度走到球面的步，长度为 \(\Delta_k\)。原因是 \(g_k^Tp\geq-\|g_k\|\|p\|\geq-\Delta_k\|g_k\|\)，而 \(p_k^S\) 恰好取到等号。但线性模型忽略了曲率，走满这段距离未必使二次模型最小。</p>
<h3>第二步：代入二次模型，只优化一个缩放系数</h3>
<p>令候选步为 \(p=\tau p_k^S\)。由于 \(\|p_k^S\|=\Delta_k\)，信赖域约束就变为 \(0\leq\tau\leq1\)：\(\tau=1\) 保留球面步，\(0<\tau<1\) 将它缩短到球内。现在恢复二次项：</p>
\[m_k(\tau p_k^S)=f_k+\tau g_k^Tp_k^S+
\tfrac12\tau^2(p_k^S)^TB_kp_k^S.\]
<p>把第一步得到的 \(p_k^S=-\Delta_k g_k/\|g_k\|\) 代入，两个系数分别是</p>
\[g_k^Tp_k^S=-\Delta_k\|g_k\|,\qquad
(p_k^S)^TB_kp_k^S=\frac{\Delta_k^2}{\|g_k\|^2}g_k^TB_kg_k.\]
<p>因此，需要最小化的是下面这个关于 \(\tau\) 的一元二次函数：</p>
\[m_k(\tau p_k^S)=f_k-\tau\Delta_k\|g_k\|
+\frac{\tau^2\Delta_k^2}{2\|g_k\|^2}g_k^TB_kg_k,\qquad0\leq\tau\leq1.\]
<p>对 \(\tau\) 求导：</p>
\[\frac{d}{d\tau}m_k(\tau p_k^S)
=-\Delta_k\|g_k\|+\tau\frac{\Delta_k^2}{\|g_k\|^2}g_k^TB_kg_k.\]
<h3>按方向曲率分两种情况，确定 \(\tau_k\)</h3>
<p><strong>情况一：\(g_k^TB_kg_k\leq0\)。</strong>上式第一项严格为负，第二项在 \(\tau\geq0\) 时非正，因此导数始终为负。模型沿这条线段一直下降，取最大的可行系数：</p>
\[\tau_k=1.\]
<p><strong>情况二：\(g_k^TB_kg_k>0\)。</strong>一元二次函数开口向上。令导数等于零，先得到不考虑上界时的最小点：</p>
\[\tau\frac{\Delta_k^2}{\|g_k\|^2}g_k^TB_kg_k=\Delta_k\|g_k\|
\quad\Longrightarrow\quad
\tau_* = \frac{\|g_k\|^3}{\Delta_k\,g_k^TB_kg_k}.\]
<p>若 \(\tau_*\leq1\)，顶点可行，直接取它；若 \(\tau_*>1\)，模型在可行线段上还在下降，只能取端点 1。因此最终得到教材中的系数及 Cauchy 点：</p>
\[\tau_k=\begin{cases}
1,&g_k^TB_kg_k\leq0,\\
\min\left\{\dfrac{\|g_k\|^3}{\Delta_k\,g_k^TB_kg_k},1\right\},&g_k^TB_kg_k>0,
\end{cases}\qquad
p_k^C=-\tau_k\frac{\Delta_k}{\|g_k\|}g_k.\]
<div class="callout"><p><strong>这里判断的是 \(g_k^TB_kg_k\) 的符号，不是直接把 \(B_k\) 分成正定与非正定两类。</strong>正定 \(B_k\) 保证任意非零梯度都有正方向曲率；但不定 \(B_k\) 在某些方向上也有正曲率。例如 \(B_k=\operatorname{diag}(-1,2)\)、\(g_k=(0,1)^T\)，仍有 \(g_k^TB_kg_k=2>0\)，应按第二种情况计算。</p></div>
<p>若 \(g_k=0\)，以上归一化公式不适用，约定 Cauchy 步为零；此时若模型有负曲率，仍可能存在更好的子问题步。</p>
<h2>用同一个 \(\tau\) 看图：取顶点，还是取端点？</h2>
<p>下面的横轴也使用缩放系数 \(\tau\)，可行区间始终为 \([0,1]\)。纵轴是模型相对起点的变化 \(m_k(\tau p_k^S)-m_k(0)\)。切换曲率情形，对照刚才的分段公式：正曲率看顶点是否可行，非正曲率则走到 \(\tau=1\)。</p>
<div data-demo="tr-cauchy-curve"></div>
<p>Cauchy 步的方向始终是 \(-g_k\)；\(B_k\) 通过 \(g_k^TB_kg_k\) 决定缩放系数，也就是走多远。后续 Dogleg 和二维子空间方法会进一步利用曲率信息来改变方向。</p>
<h2>怎样判断近似解的下降够不够？</h2>
<p>精确 Cauchy 下降量是 \(m(0)-m(p^C)\)。一种要求是让候选步获得它的固定正比例：</p>
\[\|p\|\leq\Delta,\qquad m(0)-m(p)\geq\kappa_C\,[m(0)-m(p^C)],\qquad0<\kappa_C\leq1.\]
<p>取 \(\kappa_C=1\)，就是“至少不比 Cauchy 点差”；更小的固定比例允许较宽松的近似求解。Cauchy 下降本身还有下面的可计算下界：</p>
\[m(0)-m(p^C)\geq\tfrac12\|g\|\min\left(\Delta,\frac{\|g\|}{\|B\|}\right).\]
<p>这里 \(\|B\|\) 为谱范数；\(B=0\) 时把分式理解为无穷大。因此，上面的比例要求蕴含下列常用的充分下降条件；也可以直接把它作为子问题求解器的验收要求：</p>
\[m_k(0)-m_k(p_k)\geq\frac{\kappa_C}{2}\|g_k\|\min\left(\Delta_k,\frac{\|g_k\|}{\|B_k\|}\right).\]
<details><summary>下界从哪里来？</summary><div><p>若射线最小点位于球内，则模型下降为 \(\|g\|^4/(2g^TBg)\)，用 \(g^TBg\leq\|B\|\|g\|^2\) 得到下界。若走到边界且曲率为正，截断条件保证二次惩罚不超过线性下降的一半；若曲率非正，二次项只会增大下降。</p></div></details>
<div class="callout"><p>Cauchy 步的作用是建立收敛底线。单独使用它仍可能像最速下降一样缓慢，而且梯度为零时无法主动利用负曲率。高效算法通常争取更好的步。</p></div>`},
{id:'dogleg',title:'Dogleg：连接梯度步与 Newton 步',pages:'73–76',lead:'正定模型下，用两段折线近似随半径变化的最优路径。',body:String.raw`
<p>本节先讨论梯度非零且 \(B\succ0\) 的情况，保证梯度射线最小点 \(p^U\) 与完整 Newton 步有良好定义，但<strong>不保证它们位于信赖域内</strong>。\(p^U\) 尚未按半径截断；它可行时才等于 Cauchy 点，否则 Cauchy 点在负梯度方向的球面交点。下面仍需比较两个步的长度与半径：</p>
\[p^U=-\frac{g^Tg}{g^TBg}g,\qquad p^B=-B^{-1}g.\]
<p>Dogleg 路径从原点走到 \(p^U\)，再走到 \(p^B\)。沿路径，步长范数增大，模型值下降。选取路径上最后一个可行点：</p>
<ol><li>若 \(\|p^B\|\leq\Delta\)，直接取 \(p^B\)。</li><li>否则若 \(\|p^U\|\geq\Delta\)，取 \(-\Delta g/\|g\|\)。</li><li>否则取 \(p=p^U+t(p^B-p^U)\)，使 \(\|p\|=\Delta\)，其中 \(t\in(0,1)\)。</li></ol>
\[\|v\|^2t^2+2(p^U)^Tvt+\|p^U\|^2-\Delta^2=0,\qquad v=p^B-p^U.\]
<p>选择位于 \((0,1)\) 的根。Dogleg 至少获得 Cauchy 点的模型下降，但不保证是球约束子问题的精确解。</p>

<h2>折线在近似哪一条路径？</h2>
<p>固定 \(B\) 与 \(g\)，让半径 \(\Delta\) 从小到大变化。每个半径都有一个精确模型最优步 \(p^*(\Delta)\)，这些步连接起来，形成一条从原点附近走向完整 Newton 步的曲线。Dogleg 用“原点 → 梯度射线最小点 → Newton 步”两段直线近似这条曲线。</p>
<p>图中的蓝色曲线是不同半径的<strong>精确子问题解轨迹</strong>，并不是原目标算法连续迭代产生的轨迹。灰色折线是 Dogleg 路径。移动半径，比较同一个圆内两条路径给出的步子。</p>
<div data-demo="tr-dogleg"></div>
<details><summary>计算代价与适用范围</summary><div><p>一次正定矩阵分解可用于计算 Newton 步；随后不同半径的 Dogleg 步只需简单向量运算。如果模型不定，上述路径性质不再成立。可以先修正矩阵再对修正后的模型使用 Dogleg，但这已经改变了子问题，也失去了原模型的部分负曲率信息。</p></div></details>`},
{id:'subspace',title:'二维子空间：把折线扩展为一个平面',pages:'76–77',lead:'在包含梯度方向和 Newton 方向的平面内优化，比只沿两段折线搜索更灵活。',body:String.raw`
<div class="callout"><p><strong>从这里开始，先区分两层迭代。</strong>第 5、7、8 节研究固定当前点后，怎样求一个子问题步；其中 \(g,B,\Delta\) 都不变。第 6、9 节则研究外层不断更新 \(x_k\) 后是否收敛、收敛多快。求子问题时改变的乘子，不是外层迭代点。</p></div>
<h2>为什么还要从折线扩展到平面？</h2>
<p>Dogleg 只沿两段预先规定的线走。即使同一个球里存在更低的模型值，只要不在这条折线上，它就不会去找。二维子空间方法把搜索范围扩大到<strong>包含整条折线的平面</strong>，在这个平面与信赖域的交集内最小化模型。</p>
<p>先讨论梯度非零且 \(B\succ0\) 的情况。回顾 \(p^U\) 平行于负梯度，\(p^B\) 是完整 Newton 步：</p>
\[p^U=-\frac{g^Tg}{g^TBg}g,\qquad Bp^B=-g.\]
<p>因此 Dogleg 的两条线段都由 \(g\) 和 \(p^B\) 张成。所谓“张成”，就是允许它们的任意线性组合：</p>
\[\mathcal S=\operatorname{span}\{g,p^B\}
=\{a g+b p^B:a,b\in\mathbb R\}.\]
<p>这里 \(a,b\) 是两个待求系数。原来即使有一千个变量，我们也只在这个最多二维的空间里找步，但仍保留约束 \(\|p\|\leq\Delta\)。</p>
<h2>怎样变成只有两个未知数的问题？</h2>
<p>直接写 \(p=ag+bp^B\) 也可以，但两个方向通常不垂直，长度不等于 \(\sqrt{a^2+b^2}\)。为使约束更简单，先在同一个平面内选两条<strong>互相垂直、长度为 1</strong>的基向量 \(v_1,v_2\)，组成矩阵 \(V=[v_1\ v_2]\)。于是</p>
\[p=Vz=z_1v_1+z_2v_2,\qquad z=(z_1,z_2)^T,\qquad V^TV=I_2.\]
<p>\(z\) 是步在这个平面中的两个坐标。把这个表达代入长度和模型，各算一次：</p>
\[\|p\|^2=z^TV^TVz=z^Tz=\|z\|^2,\]
\[g^Tp=(V^Tg)^Tz,\qquad p^TBp=z^T(V^TBV)z.\]
<p>所以只需计算二维梯度 \(\widehat g=V^Tg\) 和二阶矩阵 \(\widehat B=V^TBV\)，然后求解</p>
\[\min_{\|z\|\leq\Delta}\ \widehat g^Tz+\tfrac12z^T\widehat Bz,\qquad p=Vz.\]
<p>形式与原子问题完全相同，只是未知数变成了两个。后面的乘子求解方法也可用于这个小问题。这里“在二维子空间内精确求解”，通常只得到原高维子问题的近似解。</p>
<details><summary>两条正交基向量怎样得到？一个三维例子</summary><div>
<p>当 \(g\ne0\)，先取 \(v_1=g/\|g\|\)，再去掉 \(p^B\) 在第一方向上的分量：</p>
\[r=p^B-v_1(v_1^Tp^B),\qquad v_2=r/\|r\|.\]
<p>如果 \(r=0\)，两个方向线性相关，实际只有一维；不能再除以 \(\|r\|\)。数值计算中用容差判断。</p>
<p>例如 \(B=\operatorname{diag}(1,4,9)\)、\(g=(1,1,0)^T\)，有 \(p^B=(-1,-1/4,0)^T\)。两者张成 \(p_3=0\) 平面。直接用坐标轴 \(v_1=(1,0,0)^T,v_2=(0,1,0)^T\) 作基，即得 \(\widehat g=(1,1)^T\)、\(\widehat B=\operatorname{diag}(1,4)\)，把三变量问题变为两变量问题。</p>
</div></details>
<h2>为什么至少不比 Cauchy 和 Dogleg 差？</h2>
<p>在当前正定情形，可行搜索范围有如下包含关系：</p>
\[\{p^C\}\ \subseteq\ \{\text{可行 Dogleg 路径}\}
\ \subseteq\ \mathcal S\cap\{p:\|p\|\leq\Delta\}.\]
<p>在更大的集合里找最小值，不会比在其中一个点或一条路径上找更差。因此，若二维问题求得精确解 \(p^{2D}\)，便有</p>
\[m(p^{2D})\leq m(p^{\mathrm{Dogleg}})\leq m(p^C).\]
<p>这是一条<strong>模型值</strong>的比较，真实目标仍需通过 \(\rho_k\) 检验。在实际近似求解二维问题时，也要保留相应的充分下降检查。</p>
<h2>如果 \(B\) 不定，为什么不能照搬？</h2>
<p>这时 Newton 步可能指向鞍点；矩阵甚至可能奇异。教材提出用移位后的线性系统产生第二个方向，并对负曲率另作处理。<strong>移位在这里用于选择搜索方向，评价候选步的仍是原来的二次模型。</strong></p>
<details><summary>进阶：移位方向，以及它可能遗漏的负曲率</summary><div>
<p>设最小特征值为 \(d_{\min}<0\)，教材考虑选择 \(\alpha\in(-d_{\min},-2d_{\min}]\)，使 \(B+\alpha I\succ0\)。解</p>
\[(B+\alpha I)w=-g,\qquad\mathcal S=\operatorname{span}\{g,w\}.\]
<p>需要估计最负特征值，是为了选取既能使系统正定、又不过分偏大的移位。但仅凭这两个方向不一定捕捉到负曲率。例如 \(B=\operatorname{diag}(-1,2)\)、\(g=(0,1)^T\)，对任何合法移位，\(w\) 仍只有第二个分量，第一坐标方向的负曲率被遗漏。</p>
<p>书中还讨论：移位步已在域内时，应改用附加分量来构造步，而非仅继续在上述空间搜索。完整不定版本需要设计这一分量并保证可行性和模型下降；“先移位再做二维搜索”本身不是完整算法。第 8 节将用这个二阶例子具体解释缺少的方向。</p>
</div></details>
<p>对于大型问题，成本主要在产生第二个方向所需的线性求解，而不是二维问题本身。实现中求解线性系统即可，不必显式计算逆矩阵。接下来暂时离开“怎样求一步”，讨论这些合格步为什么能推动外层迭代。</p>
`},
{id:'global',title:'全局收敛需要哪些条件？',pages:'77–83',lead:'充分模型下降、可信度比值和半径更新一起，阻止算法无限停留在梯度显著非零的区域。',body:String.raw`
<h2>已经会求近似步，为什么还要讨论收敛？</h2>
<p>每次让模型下降，并不自动保证原目标有足够进展：模型可能不准，或者半径越缩越小。收敛分析要说明，在明确假设下，算法不会一直停留在梯度明显非零的位置。</p>
<p>回顾本章的两道检查：</p>
<table><thead><tr><th>层次</th><th>检查什么？</th><th>防止什么？</th></tr></thead><tbody><tr><td>子问题求解</td><td>候选步可行，并获得足够的模型下降</td><td>子问题求得太差，即使模型准确也没进展</td></tr><tr><td>外层接受与半径调整</td><td>用真实目标计算 \(\rho_k\)，决定接受、拒绝和调整范围</td><td>把模型预测直接当作真实效果</td></tr></tbody></table>
<h2>把模型下降转换为真实下降</h2>
<p>为减少长公式，记预测下降为 \(P_k=m_k(0)-m_k(p_k)>0\)，实际下降为 \(A_k=f(x_k)-f(x_k+p_k)\)。这里 \(A_k\) 是标量，不是 Hessian。由 \(\rho_k=A_k/P_k\)，若接受阈值为 \(\eta>0\)，则接受的一步满足</p>
\[f(x_k)-f(x_{k+1})=\rho_kP_k>\eta P_k.\]
<p>再代入 Cauchy 基准给出的充分模型下降条件，得到</p>
\[P_k\geq c\|g_k\|\min\left\{\Delta_k,\frac{\|g_k\|}{\|B_k\|}\right\},\qquad c>0.\]
<p>\(c\) 是各轮共用的正常数，例如直接取得至少 Cauchy 下降时可取 \(c=1/2\)。所以，只要梯度、半径都不太小，合格且被接受的步就必须带来一定量的真实下降。</p>
<h2>那为什么半径不能一直缩到零？</h2>
<p>关键是：<strong>当梯度仍明显非零时，半径足够小会使模型的相对预测误差也很小</strong>。模型因此重新变得可信，算法便不再继续缩小半径。</p>
<p>具体地，假设 \(\|g_k\|\geq\varepsilon>0\)。在下面列出的光滑性和有界性条件下，模型误差至多与 \(\Delta_k^2\) 同阶，而小半径时的预测下降至少与 \(\varepsilon\Delta_k\) 同阶。两者相除：</p>
\[|1-\rho_k|=\frac{|f(x_k+p_k)-m_k(p_k)|}{P_k}
\ \leq\ C\frac{\Delta_k}{\varepsilon}\ \longrightarrow\ 0\quad(\Delta_k\to0).\]
<p>这里 \(C\) 是与当前半径无关的常数。因此半径缩到一定程度，\(\rho_k\) 就会接近 1，接受与半径更新规则会阻止它无休止地缩小。再结合足够的真实下降，就不能永远保持 \(\|g_k\|\geq\varepsilon\)：否则目标值会无限下降，与“目标有下界”矛盾。</p>
<details><summary>推导：为什么误差是二阶，而预测下降至少是一阶？</summary><div>
<p>设梯度 Lipschitz 常数为 \(L\)，且 \(\|B_k\|\leq M\)，其中 \(M>0\)。在相关邻域内，一阶 Taylor 余项给出</p>
\[|f(x_k+p)-f(x_k)-g_k^Tp|\leq\tfrac L2\|p\|^2.\]
<p>模型比一阶式多了 \(p^TB_kp/2\)，故</p>
\[|f(x_k+p)-m_k(p)|\leq\tfrac{L+M}{2}\|p\|^2.\]
<p>若 \(\Delta_k\leq\varepsilon/M\)、\(\|p_k\|\leq\Delta_k\)，充分下降条件给出 \(P_k\geq c\varepsilon\Delta_k\)，于是</p>
\[|1-\rho_k|\leq\frac{(L+M)\Delta_k^2}{2c\varepsilon\Delta_k}
=\frac{L+M}{2c}\frac{\Delta_k}{\varepsilon}.\]
<p>这解释了“梯度还不小时，小半径会让预测可靠”。若梯度同时趋于零，就不能直接沿用固定 \(\varepsilon\) 的估计。完整证明还需区分接受和拒绝的子序列。</p>
</div></details>
<h2>结论究竟说到了哪一步？</h2>
<table><thead><tr><th>接受阈值</th><th>结论</th><th>直观含义</th></tr></thead><tbody><tr><td>\(\eta=0\)：只要真实下降就接受</td><td>\(\liminf_{k\to\infty}\|g_k\|=0\)</td><td>至少存在一列越来越小的梯度范数；不能据此断言后面每一步都小</td></tr><tr><td>\(0<\eta<1/4\)：要求真实下降达到预测的固定比例</td><td>\(\lim_{k\to\infty}\|g_k\|=0\)</td><td>足够往后，每一步的梯度范数都能小于任意指定的正阈值</td></tr></tbody></table>
<p>例如数列 \(1,1/2,1,1/3,1,1/4,\ldots\) 的下极限为零，却不趋于零。这只用于说明两个结论的区别，并不是本算法的一条运行记录。正阈值带来的更强结论，还需利用梯度连续性控制反复离开小梯度区域的代价。</p>
<details><summary>定理假设与“全局收敛”的含义</summary><div>
<ul><li>目标在初始水平集 \(\{x:f(x)\leq f(x_0)\}\) 上有下界，梯度在其一个邻域内 Lipschitz 连续。</li><li>模型矩阵一致有界：存在固定 \(M\)，使所有轮次都满足 \(\|B_k\|\leq M\)。</li><li>每轮满足固定常数的充分模型下降条件，并按第 1 节的接受及半径规则更新。</li><li>这里按 \(\|p_k\|\leq\Delta_k\) 说明；书中还允许 \(\|p_k\|\leq\gamma\Delta_k\)，其中 \(\gamma\geq1\) 为固定常数。</li></ul>
<p>“全局收敛”表示无需一开始就足够接近某个最小点，不表示找到全局最优解，也不自动保证迭代点收敛到唯一位置。上述结论控制一阶驻点；怎样进一步利用负曲率，见第 8、9 节。</p></div></details>
<p>到这里，Cauchy 基准为什么足够重要就清楚了。下一节回到子问题本身：若愿意多做几次线性系统求解，能否得到更接近球内最优点的步？</p>
`},
{id:'secular',title:'更精确地求解：寻找一个标量乘子',pages:'83–87；89–91',lead:'矩阵问题可以通过特征结构解释为一维方程；实际实现通常依靠分解和线性求解。',body:String.raw`
<h2>回到子问题：这次希望求得更准确</h2>
<p>Dogleg 和二维子空间限制了搜索路径或空间。本节直接利用第 2 节的全局最优条件求解整个球约束问题。<strong>当前 \(g,B,\Delta\) 固定，内层只调整乘子 \(\lambda\)</strong>；得到步以后，外层才计算新的真实函数值。</p>
\[(B+\lambda I)p=-g,\quad B+\lambda I\succeq0,\quad
\lambda\geq0,\quad\|p\|\leq\Delta,\quad\lambda(\Delta-\|p\|)=0.\]
<p>这些条件提出了两个问题：球内已有无约束最小点吗？如果没有，要用多大的 \(\lambda\) 才能让步恰好落在球面上？</p>
<h2>先检查球内解，再寻找边界解</h2>
<p>下面的普通求根流程针对梯度非零的情形。若梯度为零且模型有负特征值，应直接检查负曲率方向，见下一节；此时不能套用涉及步长范数倒数的公式。</p>
<ol><li>若 \(B\succ0\)，先解 \(Bp^N=-g\)。若 \(\|p^N\|\leq\Delta\)，直接返回它，此时 \(\lambda=0\)。</li><li>否则，在通常的边界情形中选择 \(\lambda\geq0\)，使 \(B+\lambda I\succ0\)，解线性系统得到 \(p(\lambda)\)，再调节 \(\lambda\) 使 \(\|p(\lambda)\|=\Delta\)。</li></ol>
\[p(\lambda)=-(B+\lambda I)^{-1}g,\qquad\|p(\lambda)\|=\Delta.\]
<p>逆矩阵写法用来说明关系，实际计算仍解线性系统。这里求的是<strong>乘子</strong>，不是沿固定方向缩放的步长；\(\lambda\) 改变后，步的方向与长度都可能改变。</p>
<h2>一个手算例子：乘子怎样把过长的步缩到边界？</h2>
\[B=\operatorname{diag}(1,4),\qquad g=(-2,0)^T,\qquad\Delta=1.\]
<p>不加移位时，Newton 步为 \((2,0)^T\)，长度 2，超出了半径。加上乘子后：</p>
\[(1+\lambda)p_1=2,\qquad(4+\lambda)p_2=0,
\qquad p(\lambda)=\left(\frac2{1+\lambda},0\right)^T.\]
<table><thead><tr><th>\(\lambda\)</th><th>步的长度</th><th>判断</th></tr></thead><tbody><tr><td>0</td><td>2</td><td>太长，应增大乘子</td></tr><tr><td>1</td><td>1</td><td>恰好在边界，满足最优条件</td></tr><tr><td>3</td><td>1/2</td><td>太短；正乘子却没到边界，不满足互补条件</td></tr></tbody></table>
<p>可见“移位后正定、算出的步可行”还不够。乘子还必须与半径匹配；这与第 3 章为取得下降方向而修正 Hessian 的目的有所区别。</p>
<h2>为什么增大乘子会缩短步？</h2>
<p>\(\lambda\) 增大时，步的长度会减小。把对称矩阵写成特征分解，只是为了把这个关系看清，不要求实际算法每次计算全部特征值。记特征值为 \(d_1\leq\cdots\leq d_n\)，单位特征向量为 \(q_j\)，梯度在这些方向的分量为 \(\beta_j=q_j^Tg\)：</p>
\[p(\lambda)=-\sum_{j=1}^n\frac{\beta_j}{d_j+\lambda}q_j,\qquad
\|p(\lambda)\|^2=\sum_{j=1}^n\frac{\beta_j^2}{(d_j+\lambda)^2}.\]
<p>在 \(B+\lambda I\succ0\) 的区域，各个分母都为正，随 \(\lambda\) 增大而增大。若 \(g\ne0\)，步长范数便严格减小，并最终趋于零。合法乘子还必须非负；不能只满足分母条件而忽略 \(\lambda\geq0\)。</p>
<details><summary>推导：特征方向上的分量公式怎样得到？</summary><div>
<p>写成 \(p=\sum_j u_jq_j\)、\(g=\sum_j\beta_jq_j\)。因为 \(Bq_j=d_jq_j\)，线性系统逐个方向变为</p>
\[(d_j+\lambda)u_j=-\beta_j,\qquad u_j=-\beta_j/(d_j+\lambda).\]
<p>特征向量互相正交且长度为 1，故 \(\|p\|^2=\sum_j u_j^2\)。这就是上面的两个公式。当某个分母为零时，不能继续使用普通相除；下一节专门处理这一情形。</p></div></details>
<h2>怎样快速找乘子？用一元 Newton 求根</h2>
<p>最直接的残差是 \(\|p(\lambda)\|-\Delta\)。但接近奇异边界时，范数可能像倒数函数一样迅速增大。教材改用同一个根的另一种表达：</p>
\[\psi(\lambda)=\frac1\Delta-\frac1{\|p(\lambda)\|}=0.\]
<p>例如上面的手算例子中，\(\|p(\lambda)\|=2/(1+\lambda)\)，取倒数后得到 \(\psi(\lambda)=1-(1+\lambda)/2\)，恰好变成直线。一般情形未必是直线，但这个变换通常有利于求根。</p>
<h3>计算流程：对应书中算法 4.3，并补充实现时的检查</h3>
<p>用 \(\ell\) 表示内层求根次数，避免与外层优化次数 \(k\) 混淆。选取使移位矩阵正定的初始乘子后，重复：</p>
<ol><li>分解 \(B+\lambda^{(\ell)}I=R^TR\)，其中 \(R\) 为上三角矩阵。</li><li>解 \(R^TRp_\ell=-g\)，得到本次候选步。</li><li>若步长已足够接近半径，例如 \(\big|\|p_\ell\|-\Delta\big|\leq\epsilon_{\rm tr}\Delta\)，并通过所需的可行性、模型下降检查，就结束内层求解。</li><li>否则解 \(R^Tw_\ell=p_\ell\)，计算下面的 Newton 候选乘子。</li><li>对候选乘子作区间保护，保证非负、移位矩阵仍正定，再开始下一轮；若逼近奇异端点仍无根，转入下一节的处理。</li></ol>
\[\lambda^{(\ell+1)}=\lambda^{(\ell)}+
\left(\frac{\|p_\ell\|}{\|w_\ell\|}\right)^2
\frac{\|p_\ell\|-\Delta}{\Delta}.\]
<p>\(w_\ell\) 只是用于计算导数的辅助向量；它对应教材算法中的 \(q_\ell\)，这里换名以免与特征向量 \(q_j\) 混淆。\(\epsilon_{\rm tr}\) 是内层精度参数。式子的符号也符合直觉：步太长就增加乘子，步太短就减小乘子。</p>
<details><summary>推导：从一元 Newton 公式到上述更新式</summary><div>
<p>令 \(M=B+\lambda I\)、\(r=\|p(\lambda)\|>0\)。对 \(Mp=-g\) 求导，注意 \(M'=I\)：</p>
\[p+Mp'=0,\qquad p'=-M^{-1}p.\]
<p>由 \(r^2=p^Tp\)，以及 \(R^Tw=p\)，得到</p>
\[2rr'=2p^Tp'=-2p^TM^{-1}p=-2\|w\|^2,
\qquad r'=-\frac{\|w\|^2}{r}.\]
<p>因此</p>
\[\psi'=\frac{r'}{r^2}=-\frac{\|w\|^2}{r^3},\qquad
\lambda_{\rm new}=\lambda-\frac{1/\Delta-1/r}{-\|w\|^2/r^3}
=\lambda+\frac{r^2}{\|w\|^2}\frac{r-\Delta}{\Delta}.\]
<p>这给出未保护的 Newton 候选。实际求根可维护合法区间：步太长提高乘子下界，步太短降低上界；候选越界时改用区间内的保守试探。分解失败也必须调整乘子，不能继续使用无效因子。</p></div></details>
<details><summary>边界情况：半正定奇异模型能有球内解吗？</summary><div><p>可以。若 \(B\succeq0\) 且 \(Bp=-g\) 有解，任一可行解都是模型的无约束最小点，可取 \(\lambda=0\)。例如 \(B=\operatorname{diag}(0,2)\)、\(g=(0,1)^T\)，则 \(p=(0,-1/2)^T\) 在 \(\Delta\geq1/2\) 时可行。普通逆矩阵不存在，但最小点仍存在。若线性方程无解或解都不可行，才需要继续寻找合适的边界解。</p></div></details>
<p>最后还差一种情况：当 \(B\) 有负特征值，却发现所有正定移位算出的步都太短，继续减小乘子又会碰到奇异矩阵。这正是下一节要解释的“困难情形”。</p>
`},
{id:'hardcase',title:'困难情形：梯度看不见的负曲率',pages:'87–88',lead:'最小特征值方向与梯度正交时，仅靠移位逆作用还可能缺少最关键的一段步子。',body:String.raw`
<h2>困难在哪里：乘子求根可能没有内部的根</h2>
<p>上一节通过调节 \(\lambda\)，希望找到 \(\|p(\lambda)\|=\Delta\)。通常在乘子降低、接近正定边界时，步会变得足够长。但如果梯度在最负曲率方向上的分量恰好为零，这部分步可能始终算不出来。此时不是再多迭代几次就能解决。</p>
<h2>先手算一个例子，不用伪逆</h2>
\[B=\begin{pmatrix}-1&0\\0&2\end{pmatrix},\qquad
 g=\begin{pmatrix}0\\1\end{pmatrix},\qquad\Delta=1.\]
<p>对应的模型去掉常数项后为 \(q(p)=p_2-\tfrac12p_1^2+p_2^2\)。第一坐标方向向下弯，但梯度的第一分量为零。在 \(\lambda>1\) 时，移位矩阵正定，方程变成</p>
\[(\lambda-1)p_1=0,\qquad(\lambda+2)p_2=-1
\quad\Longrightarrow\quad p(\lambda)=\left(0,-\frac1{\lambda+2}\right)^T.\]
<p>无论怎样选 \(\lambda>1\)，都有 \(\|p(\lambda)\|<1/3\)，永远够不到半径 1。这里的关键是第一条方程始终强迫 \(p_1=0\)，它没有利用第一方向的负曲率。</p>
<h2>到奇异端点，反而多出一个可用的自由度</h2>
<p>令 \(\lambda=1\)。最优条件只要求移位矩阵<strong>半正定</strong>，所以这个端点合法：</p>
\[B+I=\begin{pmatrix}0&0\\0&3\end{pmatrix},\qquad
0\cdot p_1=0,\quad3p_2=-1.\]
<p>现在 \(p_2=-1/3\)，而第一条方程不再限制 \(p_1\)。因为 \(\lambda=1>0\)，互补条件要求步在球面上，故</p>
\[p_1^2+\frac19=1\quad\Longrightarrow\quad
p^*=\left(\pm\frac{2\sqrt2}{3},-\frac13\right)^T.\]
<p>检查三个关键条件：线性方程成立，移位矩阵半正定，步长等于半径。于是两种符号都给出全局子问题解。把第一分量从 0 补到这个值，还让 \(-p_1^2/2\) 贡献额外下降：模型值从 \(-2/9\) 降到 \(-2/3\)。</p>
<h2>梯度正交就一定出现困难情形吗？还要看半径</h2>
<p>在同一个例子中，若半径小于 \(1/3\)，普通移位求根仍能找到球面解。只有当需要的半径不小于这个极限长度时，才需要考虑奇异端点：</p>
\[p^*=\begin{cases}(0,-\Delta)^T,&0<\Delta<1/3,\\
(\pm\sqrt{\Delta^2-1/9},-1/3)^T,&\Delta\geq1/3.
\end{cases}\]
<p>前一情况 \(\lambda=1/\Delta-2>1\)，后一情况 \(\lambda=1\)。等号 \(\Delta=1/3\) 时不需要附加非零分量；超过它后，两个最优步离开负梯度轴。</p>
<div data-demo="tr-hard"></div>
<details><summary>推广到高维：伪逆只是记录“先求一个解，再补零空间分量”</summary><div>
<p>设最小特征值 \(d_1<0\)，梯度与对应的整个特征子空间正交。到 \(\lambda=-d_1\) 时，线性系统有一个最小范数解</p>
\[p_0=-(B-d_1I)^\dagger g.\]
<p>\(\dagger\) 是 Moore–Penrose 伪逆：在非零特征值方向上做通常的相除，在零特征值方向上先取分量零。这正对应例子里的 \(p_0=(0,-1/3)^T\)，不是凭空引入另一种优化方法。</p>
<p>取最小特征子空间内任一单位向量 \(z\)，则 \((B-d_1I)z=0\)，所以增加 \(sz\) 不改变线性方程。最小范数解还满足 \(p_0\perp z\)，于是</p>
\[p^*=p_0+sz,\qquad\|p^*\|^2=\|p_0\|^2+s^2.\]
<p>若 \(\|p_0\|\leq\Delta\)，取</p>
\[s=\pm\sqrt{\Delta^2-\|p_0\|^2},\qquad\lambda=-d_1.\]
<p>这里用 \(s\) 命名补充分量的系数，与 Cauchy 点的缩放系数区分。若 \(\|p_0\|>\Delta\)，则正定区域中仍存在普通边界根，不按本公式补分量。临近困难情形时，数值算法还需处理近零分量和近奇异分解。</p></div></details>
<div class="callout"><p>这也说明 Cauchy 基准的局限：若 \(g=0\)，Cauchy 步为零；但只要 \(B\) 有负特征值，仍可沿相应方向降低模型。下一节据此区分“一阶驻点保证”与“利用二阶信息的更强保证”。</p></div>
`},
{id:'local',title:'更强的模型求解与局部快速收敛',pages:'91–95',lead:'远处靠半径管理保持稳健，接近非退化极小点后让完整 Newton 步恢复速度。',body:String.raw`
<h2>先分清两个问题：最终到哪里，到了附近走多快？</h2>
<p>第 6 节说明梯度可以趋于零；第 8 节则提醒我们，梯度为零的地方也可能有负曲率。本节先讨论更强的子问题求解要求能带来什么，再讨论接近正定最小点以后的速度。两部分不能混成“求得越精确就自动收敛到全局最小点”。</p>
<h2>为什么 Cauchy 下降还不够排除负曲率？</h2>
<p>取 \(g=0\)、\(B=\operatorname{diag}(-1,2)\)、\(\Delta=1\)。Cauchy 步是零，对应模型下降也为零。但沿第一坐标走到边界：</p>
\[q(\pm1,0)=-\tfrac12,\qquad q(0)=0.\]
<p>模型明明还能下降 \(1/2\)，Cauchy 基准却允许零下降。这是因为该基准主要跟随梯度，没有强迫求解器去利用负曲率。</p>
<h2>更强的要求：取得整个子问题最佳下降的固定比例</h2>
<p>记 \(p_k^*\) 为球内的精确模型最优步。要求近似步 \(p_k\) 满足</p>
\[m_k(0)-m_k(p_k)\geq\kappa\,[m_k(0)-m_k(p_k^*)],\qquad0<\kappa\leq1.\]
<p>例如刚才最佳下降为 \(1/2\)，若 \(\kappa=0.2\)，候选步就必须至少下降 0.1，零步不再合格。因为精确解的下降不低于 Cauchy 下降，这个要求也包含了一阶下降基准。</p>
<p>这里用未知的精确解定义“质量标准”，不表示实现时必须先算出 \(p_k^*\) 才能停止。实际求解器可使用能保证相应下降质量的终止条件。步长还需受控，本讲义通常取 \(\|p_k\|\leq\Delta_k\)，书中也允许固定倍数的放宽。</p>
<details><summary>这能带来怎样的二阶收敛保证？</summary><div>
<p>在第 6 节正接受阈值的假设下，进一步要求使用真实 Hessian \(B_k=\nabla^2f(x_k)\)、目标二阶连续可微，以及上述更强的模型下降要求。若初始水平集还紧致，则教材的结论是：算法或者在满足二阶必要条件的点终止，或者迭代序列存在这样的聚点：</p>
\[\nabla f(x^*)=0,\qquad\nabla^2f(x^*)\succeq0.\]
<p>这里是“存在聚点满足二阶必要条件”，并非所有聚点都是严格最小点，也不是全局最优保证。例如 \(f(x)=-x^4\) 在零点梯度和 Hessian 都为零，却不是局部最小点。只有二阶必要条件还不够。</p></div></details>
<h2>接近正定最小点后，为什么又能使用完整 Newton 步？</h2>
<p>现在额外假设迭代已经收敛到 \(x^*\)，且 \(\nabla^2f(x^*)\succ0\)，使用真实 Hessian，附近 Hessian Lipschitz 连续。此时发生三个相互衔接的变化：</p>
<ol><li>附近模型变为正定，完整 Newton 步 \(p_k^N\) 是二次模型的无约束最小点，而且随梯度减小而趋于零。</li><li>二阶模型误差比它预测的下降消失得更快，真实检验越来越支持模型，即 \(\rho_k\to1\)。</li><li>在适当的求解质量和半径规则下，半径最终不再限制 Newton 步，算法恢复局部 Newton 行为。</li></ol>
<p>因此 Dogleg 开头先检查完整 Newton 步是否可行，并不只是省事：这个分支使它在解附近能够恢复 Newton 的速度。</p>
<details><summary>用误差阶数解释“模型越来越可信”</summary><div>
<p>在正定最小点附近，精确 Hessian 模型的误差满足 \(|f(x_k+p)-m_k(p)|\leq C\|p\|^3\)。完整 Newton 步满足 \(B_kp_k^N=-g_k\)，所以预测下降为</p>
\[m_k(0)-m_k(p_k^N)=\tfrac12(p_k^N)^TB_kp_k^N\geq c\|p_k^N\|^2\]
<p>其中 \(c>0\) 在足够小的邻域内可统一选取。用三阶误差除以二阶下降：</p>
\[|1-\rho_k|\leq\frac{C\|p_k^N\|^3}{c\|p_k^N\|^2}
=\frac Cc\|p_k^N\|\to0.\]
<p>这是完整 Newton 候选越来越容易被接受的原因。要证明它最终可行，还需要半径更新和近似步质量的配合，不能只靠这个比值估计。</p></div></details>
<h2>超线性与二次收敛，差别在哪里？</h2>
<p>若近似步相对 Newton 步的误差趋于零，可以恢复超线性收敛；若最终直接取完整 Newton 步，在上述光滑性条件下则恢复二次收敛。</p>
\[\frac{\|p_k-p_k^N\|}{\|p_k^N\|}\to0
\quad\Longleftrightarrow\quad
\|p_k-p_k^N\|=o(\|p_k^N\|).\]
<p>这个小 \(o\) 条件表示误差占 Newton 步的比例越来越小，不是只要求两者都趋于零。例如一直取 \(p_k=0.5p_k^N\)，相对误差始终为 1/2，就不满足它。</p>
<details><summary>教材定理 4.9 的条件怎样连接？</summary><div>
<p>定理先假设迭代收敛到满足二阶充分条件的点，附近使用真实 Hessian，Hessian Lipschitz 连续，并且每轮满足 Cauchy 型充分模型下降。还要求：每当完整 Newton 步明显可行，即 \(\|p_k^N\|\leq\Delta_k/2\)，求解器给出的步渐近满足上述相对误差条件。定理由此证明信赖域限制最终不再起作用，并得到超线性收敛；若最终 \(p_k=p_k^N\)，则得到二次收敛。</p>
<p>所以“Newton 步最终可行”是需要证明的结果，不能事先悄悄当成假设。严格局部结论也不能只由“函数下降了”推出。</p></div></details>
<p>至此，子问题求解质量与外层收敛的联系已经建立。下一节处理工程变量中很常见的问题：不同单位、不同变化尺度下，“半径为 1”究竟应该表示什么？</p>
`},
{id:'scaling',title:'缩放与其他范数：距离也需要建模',pages:'95–97',lead:'温度、流量与反应速率的单位不同，未缩放的球可能对某些变量过严、对另一些变量过松。',body:String.raw`
<h2>为什么同一个半径可能不适合所有变量？</h2>
<p>假设两个决策变量是温度和速率常数，典型变化量分别为 10 K 和 \(0.01\,\mathrm{s}^{-1}\)。直接要求两者的数值变化落在同一个单位圆里，会把物理意义完全不同的“变化 1”当成同样大。我们希望先按各自的尺度衡量步长。</p>
<p>记位移为 \(p=(p_T,p_r)^T\)，取</p>
\[D=\operatorname{diag}(1/10,1/0.01),\qquad
\|Dp\|_2\leq1
\quad\Longleftrightarrow\quad
\left(\frac{p_T}{10}\right)^2+\left(\frac{p_r}{0.01}\right)^2\leq1.\]
<p>在原坐标中，这是两个半轴分别为 10 和 0.01 的椭圆；每个变量单独变化时可达到对应尺度，但不能同时各走满一个尺度，因为那样归一化长度为 \(\sqrt2\)。</p>
<h2>换一个坐标，椭球就变回熟悉的球</h2>
<p>一般地，取正对角矩阵 \(D=\operatorname{diag}(d_i)\)，用约束 \(\|Dp\|_2\leq\Delta\)。定义缩放后的步 \(\widetilde p=Dp\)，则 \(p=D^{-1}\widetilde p\)。逐项代入原模型：</p>
\[g^Tp=g^TD^{-1}\widetilde p=(D^{-1}g)^T\widetilde p,\]
\[p^TBp=\widetilde p^TD^{-1}BD^{-1}\widetilde p.\]
<p>所以只需使用新的梯度和曲率矩阵：</p>
\[\widetilde g=D^{-1}g,\qquad\widetilde B=D^{-1}BD^{-1},\]
\[\min_{\|\widetilde p\|_2\leq\Delta}
\widetilde g^T\widetilde p+\tfrac12\widetilde p^T\widetilde B\widetilde p.\]
<p><strong>在缩放坐标中使用前面学过的球约束算法，求完再用 \(p=D^{-1}\widetilde p\) 变回来。</strong>原来的目标没有换，改变的是衡量模型可信范围的距离。</p>
<h2>Cauchy 点还是“先求球面步，再求缩放系数”</h2>
<p>在缩放坐标里，第 3 节的公式直接适用：</p>
\[\widetilde p^S=-\frac{\Delta}{\|\widetilde g\|}\widetilde g.
\]
<p>变回原坐标，得到</p>
\[p^S=D^{-1}\widetilde p^S
=-\frac{\Delta}{\|D^{-1}g\|}D^{-2}g,\qquad p^C=\tau p^S.\]
<p>它在原坐标里一般不再平行于 \(-g\)，因为“等长”的定义已经改变；但在缩放坐标里，仍沿负梯度 \(-\widetilde g\)。随后将 \(\tau p^S\) 代入二次模型并求最小，步骤与前面完全相同，\(0\leq\tau\leq1\)。</p>
<details><summary>推导缩放后的 τ：只需替换梯度与方向曲率</summary><div>
<p>以下假设 \(g\ne0\)。在球坐标的系数公式中代入 \(\widetilde g\)、\(\widetilde B\)，注意</p>
\[\|\widetilde g\|=\|D^{-1}g\|,\qquad
\widetilde g^T\widetilde B\widetilde g=g^TD^{-2}BD^{-2}g.\]
<p>因此</p>
\[\tau=\begin{cases}1,&g^TD^{-2}BD^{-2}g\leq0,\\
\min\left\{1,\dfrac{\|D^{-1}g\|^3}{\Delta\,g^TD^{-2}BD^{-2}g}\right\},&g^TD^{-2}BD^{-2}g>0.
\end{cases}\]
<p>取 \(D=I\) 就恢复普通 Cauchy 公式。梯度为零时仍需另行检查曲率。</p></div></details>
<h2>尺度怎么选？</h2>
<p>若第 \(i\) 个变量的典型变化量为 \(s_i\)，可从 \(d_i=1/s_i\) 开始。也可以结合曲率信息：对模型较不可信、变化较敏感的方向，采用更短的轴。缩放不会创造数据中缺少的信息，也不能自动消除参数不可辨识性。</p>
<details><summary>两个技术条件</summary><div><p>若尺度随迭代变化，为继承通常的收敛分析，应避免它退化，例如要求 \(0<d_{\min}\leq d_{k,i}\leq d_{\max}<\infty\)。上述推导利用了 \(D\) 为正对角矩阵；对一般可逆矩阵变换，应写 \(\widetilde g=D^{-T}g\)、\(\widetilde B=D^{-T}BD^{-1}\)。</p></div></details>
<h2>其他范数：改变可行域形状，也改变求解方法</h2>
<table><thead><tr><th>约束</th><th>二维形状</th><th>含义</th></tr></thead><tbody><tr><td>\(\|p\|_2\leq\Delta\)</td><td>圆</td><td>控制各分量平方和</td></tr><tr><td>\(\|p\|_1\leq\Delta\)</td><td>菱形</td><td>控制各分量绝对值之和</td></tr><tr><td>\(\|p\|_\infty\leq\Delta\)</td><td>轴对齐方框</td><td>每个分量分别满足 \(|p_i|\leq\Delta\)</td></tr></tbody></table>
<p>无穷范数便于与变量界限结合。例如原变量要求 \(x+p\geq0\)，再加上方框信赖域，可直接合并为</p>
\[p_i\geq-x_i,\quad-\Delta\leq p_i\leq\Delta
\quad\Longrightarrow\quad\max(-x_i,-\Delta)\leq p_i\leq\Delta.\]
<p>此时得到的是带变量上下界的二次子问题。欧氏球对应的标量移位条件和乘子求根公式不能原样照搬。信赖域描述模型的使用范围，温度安全上限等物理约束仍需单独纳入。</p>
`},
{id:'practice',title:'把所有环节连成一次求解',pages:'66–69；95–100',lead:'观察候选步、模型误差、接受判断和半径变化，理解一次失败试探如何改善下一步。',body:String.raw`
<h2>先串起外层与内层，不必同时记住所有公式</h2>
<ol><li><strong>建立模型：</strong>在当前 \(x_k\) 计算 \(f_k,g_k,B_k\)，给定半径 \(\Delta_k\)。</li><li><strong>求一个候选步：</strong>用 Cauchy 基准检查质量；可以选 Dogleg、二维子空间，或更精确的乘子方法。乘子迭代发生在这一步内部。</li><li><strong>回到真实目标：</strong>计算 \(f(x_k+p_k)\)，比较实际下降和模型预测，得到 \(\rho_k\)。</li><li><strong>接受或拒绝：</strong>接受才更新 \(x_k\)；无论接受与否，都按规则决定半径。拒绝后在原位置、较小范围内重新求子问题。</li></ol>
<p>不同子问题算法是可供选择的求步策略，不是每一轮都要依次执行一遍。下面的演示采用二维近精确求解器，所以也会处理不定模型和困难情形。</p>
<h2>阅读实验时，先观察这三个关系</h2>
<ul><li>步长与半径：候选步是在域内，还是碰到了边界？</li><li>预测下降与实际下降：拒绝来自模型预测不准，还是根本没有得到合格的模型步？</li><li>位置与试探次数：一次被拒绝的试探并没有产生新的迭代位置，但改变半径会改变下一次子问题。</li></ul>
<p>下面对 Rosenbrock 函数使用真实 Hessian，每次求解二维球约束子问题。示例包含不定模型与负曲率处理；接受阈值为 \(\eta=0.1\)，半径上限为 4。这里的小型特征分解实现用于教学，大规模问题需采用相应的数值线性代数方法。</p>
\[f(x)=100(x_2-x_1^2)^2+(1-x_1)^2.\]
<div data-demo="tr-adaptive"></div>
<h2>与第 3 章的连接</h2><div class="table-wrap"><table><thead><tr><th>问题</th><th>线搜索</th><th>信赖域</th></tr></thead><tbody><tr><td>先控制什么</td><td>先定下降方向，再挑步长</td><td>先定模型可信范围，再求步子</td></tr><tr><td>不定 Hessian</td><td>通常修正方向以保证下降</td><td>可在有界域内直接利用负曲率</td></tr><tr><td>候选不合适</td><td>调整同一方向上的步长</td><td>调整半径并重新求子问题</td></tr><tr><td>收敛依据</td><td>充分下降、曲率与方向质量</td><td>模型下降、比值与半径管理</td></tr><tr><td>邻近正定极小点</td><td>接受单位 Newton 步</td><td>接受域内完整 Newton 步</td></tr></tbody></table></div>

<h2>工程拓展：过程方程求解也需要检验一步是否有进展</h2>
<p>物料衡算、能量衡算和相平衡等过程模拟常写成方程组 \(F(x)=0\)。这里的 \(F\) 是方程残差，不是优化目标的梯度。为了评价试探步，可引入残差平方和作为评价函数（merit function）：</p>
\[\Psi(x)=\tfrac12\|F(x)\|^2,\qquad\nabla\Psi(x)=J_F(x)^TF(x).\]
<p>若 Newton 方程 \(J_F(x_k)p_k=-F(x_k)\) 有解，且残差非零，则</p>
\[\nabla\Psi(x_k)^Tp_k=F(x_k)^TJ_F(x_k)p_k=-\|F(x_k)\|^2<0.\]
<p>因此这个方程 Newton 步也是残差评价函数的下降方向，可以沿它做线搜索；也可以在信赖域内最小化线性化残差形成的模型：</p>
\[\min_{\|p\|\leq\Delta_k}\ \tfrac12\|F(x_k)+J_F(x_k)p\|^2.\]
<p>前四章的“产生候选—检验真实进展—接受或调整”因此也能用于过程模拟。这里先建立联系，专门的最小二乘与方程求解算法见<a href="#ch10/structure">第 10 章</a>及<a href="#ch11/roots">第 11 章</a>。</p>
<details><summary>工程例子：一个稳态反应器的物料衡算</summary><div>
<p>恒容 CSTR 中进行不可逆二级反应。假设流量、体积、入口浓度和速率常数已知，未知的是稳态出口浓度 \(C\)。物料衡算为</p>
\[F(C)=C_{\mathrm{in}}-C-k\tau C^2=0,\qquad\tau=V/Q.\]
<p>这里先求运行状态，并没有选择一个经济目标。Newton 求解使用 \(F'(C)=-1-2k\tau C\)；评价函数为 \(\Psi(C)=F(C)^2/2\)。无量纲教学例子 \(C_{\mathrm{in}}=1\)、\(k\tau=4\) 的非负根为</p>
\[C^*=\frac{\sqrt{17}-1}{8}\approx0.3904.\]
<p>若再把温度或停留时间作为决策变量、以产率或能耗为目标，就形成了外层过程优化问题。方程求解与优化可以共享数值工具，但它们的任务不同；试探过程中还应检查浓度非负及模型定义域等实际要求。</p>
</div></details>
<details><summary>残差目标的驻点，是否一定把方程解出来了？</summary><div>
<p>不一定。\(\nabla\Psi=J_F^TF=0\) 不一般蕴含 \(F=0\)。例如 \(F(x)=x^2+1\) 没有实根，但 \(\Psi=(x^2+1)^2/2\) 在零点取得最小值 1/2，且梯度为零。优化器成功最小化了残差，仍没有把原方程解到零。</p>
<p>对方形且非奇异的 \(J_F\)，驻点条件才推出 \(F=0\)。对一般矩形残差系统，最小二乘最优解允许非零残差，这与第 2 章的数据拟合一致。因此方程求解的停止报告应检查残差范数，不能只检查评价函数梯度。</p>
</div></details>
<h2>原创自测与讨论</h2>
<details><summary>1 · 预测下降 10，实际下降 2，下一步怎样更新？</summary><div><p>\(\rho=0.2\)。当 \(\eta=0.1\) 时接受位置更新，同时将半径缩为原来的四分之一。这不是矛盾：当前步带来进展，但模型可信范围仍需收紧。</p></div></details>
<details><summary>2 · 为什么驻点仍可能需要继续走？</summary><div><p>令 \(g=0\)、\(B=\operatorname{diag}(-2,3)\)、\(\Delta=1\)。Cauchy 步为零；\(p=(\pm1,0)^T\) 的模型变化为 \(-1\)，故预测下降为 1。乘子 \(\lambda=2\) 使移位矩阵半正定，满足全局最优条件。</p></div></details>
<details><summary>3 · 变量尺度相差很大，怎样选择距离？</summary><div><p>假设可接受的典型温度变化为 10 K，典型速率常数变化为 \(0.01\,\mathrm{s}^{-1}\)。令 \(D=\operatorname{diag}(1/10,1/0.01)\)。半径为 1 时，两坐标轴分别允许这些典型变化。它是模型使用范围的设计，不能替代温度安全上限等物理约束。</p></div></details>
<details><summary>4 · 建议记录哪些诊断量？</summary><div><p>至少记录迭代点、函数值、梯度范数、试探编号、半径、步范数、预测下降、实际下降、比值、接受状态与计算成本。若反复拒绝，要区分模型误差、导数错误和数值噪声；若都接受但进展很慢，要检查缩放、子问题质量和病态性。</p></div></details>
<p>本章完成了两种基本的全局化框架。继续进入<a href="#ch05/linear">第 5 章共轭梯度</a>和<a href="#ch06/secant">第 6 章拟牛顿</a>，理解如何积累方向与曲率信息，再把这些策略用于参数估计、过程优化与控制。</p>`}
]});
