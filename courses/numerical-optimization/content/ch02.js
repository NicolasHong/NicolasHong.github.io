window.OPT_CHAPTERS.push({id:'ch02',number:'02',title:'无约束优化的理论与算法',subtitle:'Fundamentals · 判别一个解，构造下一步',pages:'10–29',sections:[
{id:'fitting',title:'用参数估计进入无约束优化',pages:'10–12',lead:'参数少，不代表函数便宜；残差不为零，也不代表没有找到最优解。',body:String.raw`
<h2>基本问题与信息来源</h2>\[\min_{x\in\mathbb R^n}f(x).\]
<p>本章主要研究光滑目标，通常假设二阶连续可微。算法并不能看到完整函数地形，只能在选择的点上查询函数及其导数。每次查询的计算成本，是算法设计的重要因素。</p>
<h2>书中的非线性拟合例子</h2><p>给定观测 \((t_j,y_j)\)，以参数向量 \(x\in\mathbb R^6\) 描述信号：</p>
\[\phi(t;x)=x_1+x_2\exp\!\left[-\frac{(x_3-t)^2}{x_4}\right]+x_5\cos(x_6t).\]
\[r_j(x)=y_j-\phi(t_j;x),\qquad f(x)=\sum_{j=1}^{m}r_j(x)^2.\]
<p>即使只有 6 个参数，当数据点达到十万量级，每次计算所有残差也会有明显代价。真实实现还需处理定义域：上式在 \(x_4=0\) 无定义，若将其解释为峰宽，通常应取 \(x_4>0\)，例如用 \(x_4=e^z\) 参数化。书中的简写不意味着可以忽略这些限制。</p>
<h2>工程教学案例：估计一级反应速率</h2><p>对恒容、等温、不可逆一级反应，采用教学模型 \(c(t;k)=c_0e^{-kt}\)，已知 \(c_0=1\)。用 \(k=e^\theta\) 保证正速率常数，得到无约束参数估计问题：</p>
\[\min_{\theta\in\mathbb R}f(\theta)=\frac12\sum_j\left[e^{-e^\theta t_j}-c_j^{\mathrm{obs}}\right]^2.\]
<div data-demo="fit"></div>
<p>演示数据是固定的合成教学数据，时间与浓度均已归一化。曲线与观测之间的差距形成残差；即便拟合达到最佳，测量扰动仍可能使目标值大于零。这里展示目标的形成与一维搜索结果，不提前展开专门的最小二乘算法。</p>
<details><summary>推导：目标的梯度从哪里来？</summary><div><p>令 \(r_j(\theta)=e^{-kt_j}-c_j^{\mathrm{obs}}\)，\(k=e^\theta\)。链式法则给出</p>\[\frac{\partial r_j}{\partial\theta}=-kt_je^{-kt_j},\qquad f'(\theta)=\sum_jr_j(\theta)(-kt_je^{-kt_j}).\]<p>当梯度为零时，各数据点对总目标的一阶贡献相互抵消，并不要求每一个残差都为零。</p></div></details>`},
{id:'solutions',title:'全局、局部、严格与孤立',pages:'12–14',lead:'“是一个解”并不是单一结论。要明确比较范围，以及附近是否还有其他最小点。',body:String.raw`
<div class="table-wrap"><table><thead><tr><th>概念</th><th>定义</th><th>需要注意</th></tr></thead><tbody><tr><td>全局最小点</td><td>\(f(x^*)\leq f(x)\)，对全部定义域内的 \(x\) 成立</td><td>比较所有点</td></tr><tr><td>局部最小点</td><td>存在邻域 \(N\)，对所有 \(x\in N\)，\(f(x^*)\leq f(x)\)</td><td>允许其他点取相同值</td></tr><tr><td>严格局部最小点</td><td>存在邻域 \(N\)，对所有 \(x\in N\setminus\{x^*\}\)，\(f(x^*)<f(x)\)</td><td>只比较目标值是否严格更小</td></tr><tr><td>孤立局部最小点</td><td>存在邻域 \(N\)，其中只有 \(x^*\) 是局部最小点</td><td>排除附近其他局部最小点</td></tr></tbody></table></div>
<p>常数函数的每一点都是局部最小点，却都不是严格或孤立的。\(f(x)=x^4\) 在零点既严格又孤立。孤立局部最小点一定严格，反向一般不成立。</p>
<details><summary>推导：孤立为什么蕴含严格？</summary><div><p>先在一个小邻域内确保 \(f(x)\geq f(x^*)\)，并确保没有其他局部最小点。若附近存在不同点 \(y\) 且 \(f(y)=f(x^*)\)，取一个以 \(y\) 为中心、完全落在该邻域内的小球，球内函数值都不小于 \(f(y)\)。于是 \(y\) 也是局部最小点，矛盾。</p></div></details>
<details><summary>深入：严格但不孤立的例子与书中表述</summary><div><p>书内第 13 页使用 \(x^4[2+\cos(1/x)]\)、并在零点定义为 0，说明严格最小点旁仍可以聚集其他局部最小点。这个例子足以说明严格与孤立的区别，但其二阶导数在零点并不连续，不能按该页文字把它当作 \(C^2\) 函数。若希望同时具有 \(C^2\) 性质，可改用</p>\[f(x)=\begin{cases}x^6[2+\cos(1/x)],&x\neq0,\\0,&x=0.\end{cases}\]<p>因为 \(f(x)\geq x^6>0\)（\(x\neq0\)），零点是严格最小点；振荡导数在任意接近零的位置仍产生局部极小点。这里是数学核对后的补充例子，不是逐字引用。</p>
<div data-demo="strict-not-isolated"></div>
<p>图中的非零局部最小点各自位于一个逐渐靠近零点的区间：</p>
\[\frac{1}{2\pi(k+1)}<x_k<\frac{1}{2\pi k},\qquad k\geq2.\]
<p>这些区间随 \(k\to\infty\) 收缩到零点，因此 \(x_k\to0\)。它们的函数值都比 \(f(0)\) 高，这与“零点严格”没有冲突；但无论零点的邻域取多小，里面仍有别的局部最小点，所以零点不孤立。图示只展示有限个点，这个区间关系说明它们可以无限延续。</p></div></details>
<h2>局部信息的局限</h2><p>一般非凸目标可以有大量局部极小值。若只访问有限个点，就很难排除未探索区域内存在更低的谷底。凸性提供额外的全局结构；否则，“收敛到局部最小点”与“找到全局解”必须区分。</p>`},
{id:'taylor',title:'Taylor 展开：局部模型的来源',pages:'14–16',lead:'梯度描述一阶变化，Hessian 描述曲率。最优性条件和迭代方向都从这里产生。',body:String.raw`
<p>约定梯度是列向量，Hessian 是二阶偏导数组成的对称矩阵：</p>
\[g(x)=\nabla f(x),\qquad H(x)=\nabla^2f(x),\qquad H_{ij}(x)=\frac{\partial^2f}{\partial x_i\partial x_j}.\]
<h2>先把多元问题变成沿线段的一元问题</h2>
<p>固定起点 \(x\) 和步向量 \(p\)，沿 \(x\to x+p\) 这条线段看函数值。令</p>
\[\varphi(t)=f(x+tp),\qquad0\leq t\leq1.\]
<p>\(t=0\) 对应起点，\(t=1\) 对应终点。原函数有多少个变量都不影响这一步：沿选定线段，\(\varphi\) 只有一个自变量 \(t\)。链式法则给出</p>
\[\varphi'(t)=\nabla f(x+tp)^Tp,\qquad
\varphi''(t)=p^T H(x+tp)p.\]
<p>后面的三个表达式，分别来自一元函数的<strong>中值定理、微积分基本定理，以及曲率的加权平均</strong>。假设整条线段位于函数定义域内；所需的连续性在其邻域成立。</p>
<h2>三个有用的 Taylor 表达式</h2>
<h3>1. 函数增量：某个中间位置的斜率</h3>
<p>若 \(f\in C^1\)（一阶导数存在且连续），存在 \(\tau_1\in(0,1)\)，使</p>
\[f(x+p)=f(x)+\nabla f(x+\tau_1p)^Tp.\]
<p>这是精确等式。梯度取在线段上的某个中间位置，不一定是起点 \(x\)。在一元图像中，它表示：<strong>两端点连成的弦，与某处的切线平行。</strong></p>
<details><summary>展开推导与图示：回忆一元中值定理</summary><div>
<p>中值定理提醒：若 \(u\) 在 \([a,b]\) 连续、在 \((a,b)\) 可微，则存在 \(\xi\in(a,b)\)，满足</p>
\[u(b)-u(a)=u'(\xi)(b-a).\]
<p>对 \(\varphi(t)=f(x+tp)\) 使用区间 \([0,1]\)，有</p>
\[\varphi(1)-\varphi(0)=\varphi'(\tau_1)(1-0)
=\nabla f(x+\tau_1p)^Tp.\]
<p>把 \(\varphi(0)=f(x)\)、\(\varphi(1)=f(x+p)\) 代回即可。这里不是忽略了高阶项，而是把全部变化放进了<strong>未知中间点的导数</strong>。</p>
<div data-demo="taylor-mvt"></div>
</div></details>
<h3>2. 梯度增量：沿途曲率的累计</h3>
<p>若 \(f\in C^2\)（二阶导数存在且连续），梯度变化满足</p>
\[\nabla f(x+p)-\nabla f(x)=\int_0^1H(x+sp)p\,ds.\]
<p>梯度本身在变，而 Hessian 描述它怎样变。这个积分把整条线段上的变化累积起来；\(s\) 是从零到一遍历线段的积分变量。</p>
<details><summary>展开推导：对每个梯度分量使用微积分基本定理</summary><div>
<p>先看第 \(i\) 个分量 \(q_i(t)=\partial_i f(x+tp)\)。链式法则给出</p>
\[q_i'(t)=\sum_{j=1}^n H_{ij}(x+tp)p_j.\]
<p>再用“终值减初值等于变化率的积分”：</p>
\[q_i(1)-q_i(0)=\int_0^1\sum_jH_{ij}(x+sp)p_j\,ds.\]
<p>把各个分量叠成列向量，就是上面的 Hessian 积分式。通常不能把这个<strong>向量积分</strong>替换成某一个公共中间点的 Hessian 作用；不同分量未必对应同一位置。</p>
</div></details>
<h3>3. 函数增量：起点斜率加曲率修正</h3>
<p>在相同的 \(C^2\) 条件下，还存在 \(\tau_2\in(0,1)\)，使</p>
\[f(x+p)=f(x)+g(x)^Tp+\frac12p^TH(x+\tau_2p)p.\]
<p>\(g(x)^Tp\) 是起点斜率给出的一阶变化，后面一项补上曲率造成的偏离。\(\tau_2\) 与第一式的 \(\tau_1\) 一般不同；它们都不是预先给定的半步位置。</p>
<details><summary>展开推导：为什么二阶项前面有 1/2？</summary><div>
<p>先累计沿途斜率，再把斜率的变化写成曲率积分：</p>
\[\varphi(1)-\varphi(0)=\int_0^1\varphi'(t)\,dt,\qquad
\varphi'(t)=\varphi'(0)+\int_0^t\varphi''(s)\,ds.\]
<p>在三角区域 \(0\leq s\leq t\leq1\) 交换积分次序，得到</p>
\[\varphi(1)=\varphi(0)+\varphi'(0)+
\int_0^1(1-s)\varphi''(s)\,ds.\]
<p>曲率 \(\varphi''\) 连续，权重 \(1-s\) 非负。加权平均值介于沿途最小和最大曲率之间，所以存在某个 \(\tau_2\)，使</p>
\[\int_0^1(1-s)\varphi''(s)\,ds
=\varphi''(\tau_2)\int_0^1(1-s)\,ds
=\tfrac12\varphi''(\tau_2).\]
<p>代入 \(\varphi'(0)=g(x)^Tp\) 和 \(\varphi''(\tau_2)=p^TH(x+\tau_2p)p\)，就得到了第三式。这里取中值的是<strong>标量曲率</strong> \(p^THp\)，不是把 Hessian 矩阵的每个元素都放在同一个中间点。</p>
</div></details>
<h2>把沿途 Hessian 换成当前 Hessian</h2>
<p>前三式使用了沿途信息或未知中间点，算法却希望只凭当前点的导数计算候选步。于是用 \(H(x)\) 代替沿途 Hessian，建立可计算的二次模型：</p>
\[m_x(p)=f(x)+g(x)^Tp+\frac12p^TH(x)p.\]
\[f(x+p)=m_x(p)+R_x(p).\]
<p>\(R_x(p)\) 就是真实函数与二次模型之间的<strong>误差</strong>。它来自“沿途曲率与起点曲率不同”。步长越小，这种差异通常越小，但差异变小的速度取决于函数的光滑程度。</p>
<div class="table-wrap"><table><thead><tr><th>对 Hessian 的要求</th><th>能怎样描述误差？</th></tr></thead><tbody>
<tr><td>连续：越靠近起点，曲率差越接近零</td><td>\(R_x(p)=o(\|p\|^2)\)：误差除以步长平方后趋于零，即误差比二阶尺度更小。</td></tr>
<tr><td>局部 Lipschitz：曲率差最多按距离线性增长</td><td>\(|R_x(p)|\leq L\|p\|^3/6\)：存在统一的三阶误差上界，记作 \(O(\|p\|^3)\)。</td></tr>
</tbody></table></div>
<p>因此，<strong>“二次模型的误差比二阶小”与“误差有三阶上界”是两种强弱不同的结论</strong>。前者不要求它一定按步长的三次方变小。</p>
<details><summary>展开说明：小 o、大 O 和误差界从哪里来？</summary><div>
<p>令 \(h=\|p\|\)。小 \(o\) 表示 \(|R_x(p)|/h^2\to0\)；大 \(O(h^3)\) 表示存在与小步 \(p\) 无关的常数 \(C\)，使 \(|R_x(p)|\leq Ch^3\)。三阶<strong>上界</strong>在步长减半时缩小到八分之一；实际误差还可能更小。</p>
<p>从上一推导的积分式减去当前点模型，得到精确余项：</p>
\[R_x(p)=\int_0^1(1-s)p^T[H(x+sp)-H(x)]p\,ds.\]
<p>使用欧氏范数及对应矩阵算子范数。如果 Hessian 连续，定义起点附近最大的曲率差</p>
\[\omega(h)=\sup_{\|q\|\leq h}\|H(x+q)-H(x)\|,
\qquad \omega(h)\to0,\]
\[|R_x(p)|\leq\tfrac12\omega(h)h^2
\quad\Longrightarrow\quad R_x(p)=o(h^2).\]
<p>连续性只说明 \(\omega(h)\) 趋于零，还没说明它趋零的速度。局部 Lipschitz 条件进一步要求，邻域内</p>
\[\|H(y)-H(z)\|\leq L\|y-z\|.\]
<p>取 \(y=x+sp,z=x\)，曲率差最多为 \(Lsh\)，所以</p>
\[|R_x(p)|\leq Lh^3\int_0^1s(1-s)\,ds
=\frac L6h^3.\]
<p>这是三阶界的来源；不能仅因为模型含二次项，就自动把剩余误差称为三阶。</p>
</div></details>
<details><summary>一个直观反例：误差也可以是 2.5 阶</summary><div>
<p>看一元函数 \(f(u)=|u|^{5/2}\)。在零点有 \(f(0)=f'(0)=f''(0)=0\)，二次模型为零。它的二阶导数 \(f''(u)=\tfrac{15}{4}|u|^{1/2}\) 连续，但在零点附近不满足 Lipschitz 条件。</p>
\[R_0(p)=|p|^{5/2},\qquad
\frac{R_0(p)}{|p|^2}=|p|^{1/2}\to0,\qquad
\frac{R_0(p)}{|p|^3}=|p|^{-1/2}\to\infty.\]
<p>它的误差确实比二阶小，但没有统一的三阶上界。这正是上面两种结论的区别；光滑程度是为了说明模型能信到什么精度，而不是额外的记号规定。</p>
</div></details>
<h2>正定与半正定</h2>\[H\succ0\iff p^THp>0\quad\forall p\neq0;\qquad H\succeq0\iff p^THp\geq0\quad\forall p.\]
<p>对实对称矩阵，正定等价于全部特征值为正；半正定允许零特征值。不定矩阵同时具有正与负特征值。</p>`},
{id:'optimality',title:'一阶与二阶最优性条件',pages:'14–17',lead:'必要条件用于排除，充分条件用于确认；两者之间存在不能忽略的空隙。',body:String.raw`
<h2>先定义驻点，再判断是不是最小点</h2>
<p>本节讨论定义域内部、可微函数的无约束优化问题。如果一点 \(\widehat x\) 满足</p>
\[\nabla f(\widehat x)=0,\]
<p>就称它为<strong>驻点（stationary point）</strong>；一元函数中就是 \(f'(\widehat x)=0\)。此时沿任意方向的一阶变化率都为零，但这并不表示函数在附近不变化，也不表示该点一定最优。二阶或更高阶变化仍可能让函数上升、下降，或沿不同方向呈现不同趋势。</p>
<div class="table-wrap"><table><thead><tr><th>概念</th><th>判断依据</th><th>告诉我们什么？</th></tr></thead><tbody>
<tr><td>驻点</td><td>\(\nabla f(\widehat x)=0\)</td><td>检查导数：所有方向的一阶变化率为零，尚未判断函数值大小</td></tr>
<tr><td>局部最小点</td><td>存在邻域 \(N\)，对全部 \(x\in N\)，\(f(x^*)\leq f(x)\)</td><td>比较函数值：附近没有更低的点，但远处可能有</td></tr>
<tr><td>全局最小点</td><td>对全部定义域内的 \(x\)，\(f(x^*)\leq f(x)\)</td><td>比较整个定义域：没有函数值更低的点</td></tr>
</tbody></table></div>
<p>在上述可微、无约束且位于定义域内部的前提下，关系为：</p>
\[\text{全局最小点}\ \Longrightarrow\ \text{局部最小点}\ \Longrightarrow\ \text{驻点}.\]
<p>反过来通常不成立。例如，\(f(x)=-x^2\) 的零点是驻点，却是局部最大点；\(f(x_1,x_2)=x_1^2-x_2^2\) 的原点是驻点，却是鞍点；\(f(x)=x^3\) 的零点也是驻点，但既不是局部最小点，也不是局部最大点。后面的交互演示会进一步比较最小点、鞍点及其他非最小驻点。</p>
<p>因此，求解 \(\nabla f(x)=0\) 是寻找候选点；接下来还需借助曲率或直接比较函数值，判断候选点是否为最小点。局部、全局、严格与孤立的定义也可回到<a href="#ch02/solutions">本章第 2 节</a>对照。</p>
<h2>用一阶与二阶条件排除或确认候选点</h2>
<div class="table-wrap"><table><thead><tr><th>条件</th><th>假设与结论</th><th>不能推出什么</th></tr></thead><tbody><tr><td>一阶必要</td><td>\(f\in C^1\)，局部最小 \(\Rightarrow\nabla f(x^*)=0\)</td><td>驻点未必是最小点</td></tr><tr><td>二阶必要</td><td>\(f\in C^2\)，局部最小 \(\Rightarrow\nabla f(x^*)=0,\ H(x^*)\succeq0\)</td><td>半正定未必足够</td></tr><tr><td>二阶充分</td><td>\(f\in C^2\)，\(\nabla f(x^*)=0,\ H(x^*)\succ0\Rightarrow\) 严格局部最小</td><td>不是必要条件，也不自动意味着全局最优</td></tr><tr><td>凸问题</td><td>可微凸目标，无约束驻点 \(\Rightarrow\) 全局最小</td><td>没有严格凸性时未必唯一</td></tr></tbody></table></div>
<details><summary>证明一：非零梯度为什么排除局部最小？</summary><div><p>取 \(p=-\nabla f(x^*)\)，则 \(g^Tp=-\|g\|^2<0\)。足够小的 \(\alpha>0\) 下，</p>\[f(x^*+\alpha p)=f(x^*)-\alpha\|g\|^2+o(\alpha)<f(x^*).\]<p>出现邻近的更优点，与局部最小矛盾。</p></div></details>
<details><summary>证明二：负曲率为什么排除局部最小？</summary><div><p>在驻点，如果存在 \(p\) 使 \(p^THp<0\)，则</p>\[f(x^*+\alpha p)-f(x^*)=\frac{\alpha^2}{2}p^THp+o(\alpha^2)<0\]<p>在足够小的非零步长下成立。因此局部最小点的 Hessian 不能含负特征值。</p></div></details>
<details><summary>证明三：正曲率怎样保证严格局部最小？</summary><div><p>Hessian 在驻点正定且连续，意味着某个邻域内存在统一下界 \(\mu>0\)，满足 \(p^TH(x)p\geq\mu\|p\|^2\)。二阶 Taylor 定理给出</p>\[f(x^*+p)-f(x^*)\geq\frac\mu2\|p\|^2>0\quad(p\neq0\text{ 且足够小}).\]<p>所以任何足够近的不同点都更差。</p></div></details>
<div data-demo="stationary"></div>
<h2>必须记住的反例</h2><ul><li>\(f(x)=x^3\)：零点梯度与二阶导都为零，却不是极小点。</li><li>\(f(x)=x^4\)：零点为严格全局最小点，但二阶导为零。</li><li>\(f(x_1,x_2)=x_1^2-x_2^2\)：原点为鞍点，沿不同方向一升一降。</li></ul>
<div class="callout warning"><p>计算中 \(\|\nabla f\|\) 很小只能表示近似一阶驻点。还要区分曲率、尺度、停滞和真正的最小点。</p></div>`},
{id:'nonsmooth',title:'非光滑问题与适用边界',pages:'17–18',lead:'尖点处的最优解可能没有通常意义下的梯度。',body:String.raw`
<p>对 \(f(x)=|x|\)，最小点是零点，但 \(f'(0)\) 不存在。因此不能把“梯度为零”作为所有优化问题的必要条件：前面的结论有光滑性前提。</p>
<p>书中提到次梯度和广义梯度作为非光滑分析的工具。本节只补充凸函数的直观例子，不展开一般非光滑算法：</p>
\[\partial|x|\big|_{x=0}=[-1,1],\qquad0\in\partial|x|\big|_{x=0}.\]
<h2>改变误差度量，会改变问题结构</h2>\[\|r(x)\|_1=\sum_j|r_j(x)|,\qquad\|r(x)\|_\infty=\max_j|r_j(x)|.\]
<p>这两种数据拟合目标可能不可微。若每个残差光滑，可以引入辅助变量，把目标的尖点转化为光滑约束表达。下面是教学推导，不需要先学习后续约束算法：</p>
\[\begin{aligned}\min_{x,t}\quad &\sum_jt_j\\ \text{s.t.}\quad &-t_j\leq r_j(x)\leq t_j,\quad\forall j,\end{aligned}\qquad\begin{aligned}\min_{x,t}\quad &t\\ \text{s.t.}\quad &-t\leq r_j(x)\leq t,\quad\forall j.\end{aligned}\]
<p>两侧约束会自动保证对应的 \(t_j\) 或 \(t\) 非负。这样的重写消除了绝对值和最大值运算的不可微性，但若残差非线性，重写后仍可能是非凸问题。</p>
<div class="callout"><p>“无约束但非光滑”与“有约束但光滑”可能描述同一个拟合目标。这也解释了为什么问题分类与数学表达方式有关。</p></div>`},
{id:'strategies',title:'两种推进方式：线搜索与信赖域',pages:'18–20',lead:'线搜索先选方向再选步长；信赖域先限定范围，再在范围内找模型的好步。',body:String.raw`
<h2>线搜索：沿一条射线做选择</h2>\[x_{k+1}=x_k+\alpha_kp_k,\qquad\min_{\alpha>0}f(x_k+\alpha p_k).\]
<p>先构造方向 \(p_k\)，再试探步长 \(\alpha_k\)。精确求一维最小点可能昂贵，通常只需一个带来合适下降的步长。这里的 \(\alpha\) 是方向的乘数，实际移动距离为 \(\alpha\|p\|\)。</p>
<h2>信赖域：只在局部相信二次模型</h2>\[m_k(p)=f_k+g_k^Tp+\frac12p^TB_kp,\qquad \min_{\|p\|_2\leq\Delta_k}m_k(p).\]
<p>\(B_k\) 是真实 Hessian 或其近似；\(\Delta_k\) 是信赖域半径。若候选步在真实目标中表现很差，就缩小范围并重新求步。重新求出的方向通常会改变，这一点不同于沿固定方向缩短步长。</p>
<div data-demo="trust"></div>
<p>演示沿用书内第 19 页的函数 \(f(x)=10(x_2-x_1^2)^2+(1-x_1)^2\)，在 \(x_k=(0,1)\) 处有</p>
\[f_k=11,\quad g_k=\begin{pmatrix}-2\\20\end{pmatrix},\quad B_k=\begin{pmatrix}-38&0\\0&20\end{pmatrix}.\]
<p>模型在某些方向具有负曲率，无约束地最小化会无界；但闭球是紧集，连续二次模型在其上一定取得最小值。演示通过密集角度采样计算近似的边界最优步，并同时显示真实目标变化；它是二维概念展示，不是通用信赖域求解器。</p>
<p><strong>阅读提示：</strong>这里先用一个二维例子理解信赖域。最优步为什么在球内或边界、不同曲率下怎样求解，会在<a href="#ch04/optimality">第 4 章：球约束二次问题的全局最优条件</a>中详细说明，此处不必掌握完整求解方法。</p>
<details><summary>展开：为什么这里可以搜索圆周？</summary><div>
<p>“负特征值”意味着：至少沿一个方向，二次模型向下弯曲。如果某个驻点位于球内部，沿这个方向移动一点仍然可行，却能让模型值更低，因此这个驻点不可能是局部最小点。当前例子的 Hessian 为 \(\operatorname{diag}(-38,20)\)，就存在这样的负曲率方向。</p>
<p>所以，本例的全局最小点必在圆周上。令 \(p=\Delta(\cos t,\sin t)^T\) 后，可以直接比较不同角度的模型值。<strong>这是当前例子的性质，并不是所有信赖域子问题都只需搜索边界。</strong></p>
<p>先记住三种典型情况：</p>
<div class="table-wrap"><table><thead><tr><th>模型与半径的关系</th><th>最优步在哪里？</th><th>直观理解</th></tr></thead><tbody>
<tr><td>Hessian 正定，无约束最小点在球内部</td><td>球内部</td><td>模型像一个碗，碗底已经在允许范围内，直接走到碗底。</td></tr>
<tr><td>Hessian 正定，无约束最小点达到或超出球的边界</td><td>球的边界</td><td>碗底尚未进入球内部，最佳可行位置受半径限制。超出时需要求球约束下的最优步，并非简单按比例缩短 Newton 步。</td></tr>
<tr><td>Hessian 存在负特征值，如本例</td><td>球的边界</td><td>沿负曲率方向还能继续降低模型值；球内没有能成为最小点的驻点，半径把步子限制在边界。</td></tr>
</tbody></table></div>
<p>这三种是入门时的典型情况；半正定、奇异矩阵等退化情形也会在第 4 章进一步讨论。现在只需区分：最优点可能在球内，也可能在边界，取决于曲率和半径。</p>
</div></details>
<div class="callout warning"><p>这两类都是算法框架。选择了线搜索，还没有确定方向与步长规则；选择了信赖域，也没有确定模型、半径更新与子问题求解方式。后续章节再逐步补足这些接口。</p></div>`},
{id:'descent',title:'下降方向与最速下降',pages:'20–22',lead:'最速下降描述单位距离的一阶下降率，并不保证最快到达最优点。',body:String.raw`
<h2>怎样判断一个方向能下降？</h2><p>对于 \(g_k\neq0\)，方向 \(p_k\) 满足</p>\[g_k^Tp_k<0\]
<p>时称为下降方向。它与负梯度夹角小于 90°。Taylor 展开给出 \(f(x_k+\alpha p_k)=f_k+\alpha g_k^Tp_k+o(\alpha)\)，所以足够小的正步长会降低目标。</p>
<h2>负梯度为什么是“最速”的？</h2>\[\min_{\|p\|_2=1}g_k^Tp=-\|g_k\|_2,\qquad p^*=-\frac{g_k}{\|g_k\|_2}.\]
<p>Cauchy–Schwarz 不等式表明 \(g_k^Tp\geq-\|g_k\|_2\|p\|_2\)，等号在相反方向取得。这里先把所有方向的长度固定为 1，才公平比较它们的下降能力：<strong>“最速”指单位长度内，一阶下降最多</strong>，不是比较任意长短的步子。</p>
<p>单位长度只是用来定义方向，并不要求每次实际移动长度为 1。算法通常取未归一化的 \(p_k=-g_k\)，再由 \(\alpha_k\) 决定实际步长；最终位移是 \(\alpha_kp_k\)，长度为 \(\alpha_k\|p_k\|_2\)。</p>
<h2>变量尺度：怎样的一步算“同样长”？</h2>
<p>欧氏长度按当前坐标的数值计算：</p>
\[\|p\|_2=\sqrt{p_1^2+\cdots+p_n^2}.\]
<p>如果两个变量分别是温度和浓度，把它们的变化量直接代入上式，就默认按当前单位的数值比较距离。例如，把浓度的单位从 mol/L 换成 mmol/L，同一浓度变化的数值会放大 1000 倍；物理过程没有改变，但按原样计算的欧氏长度、梯度分量以及负梯度方向都会改变。因此，<strong>最速方向依赖于变量单位与尺度</strong>。</p>
<p>常见做法是按各变量的典型变化范围归一化。若温度的参考变化量为 \(s_T=10\,\mathrm{K}\)，浓度的参考变化量为 \(s_c=0.1\,\mathrm{mol/L}\)，就用下式比较一步的大小：</p>
\[\|p\|_{\mathrm{scaled}}=\sqrt{\left(\frac{p_T}{s_T}\right)^2+\left(\frac{p_c}{s_c}\right)^2}.\]
<p>改变温度 10 K，或改变浓度 0.1 mol/L，在这个度量下都算一个单位长度。这样比较的是相对于各自参考尺度的变化；寻找最速方向时，比较的单位长度也随之改变。</p>
<h2>适当缩放为什么能改善收敛？</h2>
<p>考虑一个狭长的二次谷地：</p>
\[f(x)=\frac12(x_1^2+100x_2^2),\qquad \nabla f(x)=\begin{pmatrix}x_1\\100x_2\end{pmatrix}.\]
<p>第二个方向的曲率是第一个方向的 100 倍。原坐标下的负梯度常跨过谷底，两次相邻迭代可能朝不同侧移动，形成锯齿状路径。令</p>
\[z_1=x_1,\qquad z_2=10x_2,\qquad \widetilde f(z)=\frac12(z_1^2+z_2^2).\]
<p>新坐标下等高线变成圆，两个方向曲率相同。在 \(z\) 中取负梯度，再换回 \(x\)，得到的方向是 \((-x_1,-x_2)^T\)，而原坐标的负梯度为 \((-x_1,-100x_2)^T\)。<strong>缩放改变了方向，不只是统一地把原来的步子变长或变短。</strong>这个特殊二次例子在缩放后配合精确线搜索，一步就能到达原点。</p>
<div class="callout"><p>变量缩放有两个相关目的：让距离比较具有合理的参考尺度，以及改善模型在不同方向上的曲率差异。按数量级归一化有助于计算，但不必然消除狭长谷地；“单位长度内下降最多”也不等于“整个算法收敛最快”。后面的<a href="#ch02/scaling">变量缩放与尺度不变性</a>一节会进一步展开。</p></div>
<details><summary>展开推导：缩放后的负梯度怎样换回原坐标？</summary><div>
<p>设 \(x=Sz\)，其中 \(S=\operatorname{diag}(s_1,\ldots,s_n)\)，且各 \(s_i>0\)。这对应在新坐标中使用欧氏长度，在原坐标中使用 \(\|S^{-1}p\|_2\) 作为距离。链式法则给出：</p>
\[\widetilde f(z)=f(Sz),\qquad \nabla_z\widetilde f=S^Tg_x.\]
<p>在新坐标取未归一化的负梯度方向，然后把方向映回原坐标：</p>
\[p_z=-S^Tg_x,\qquad p_x=Sp_z=-SS^Tg_x.\]
<p>对上述例子，\(S=\operatorname{diag}(1,1/10)\)，所以</p>
\[p_x=-\begin{pmatrix}1&0\\0&1/100\end{pmatrix}\begin{pmatrix}x_1\\100x_2\end{pmatrix}=\begin{pmatrix}-x_1\\-x_2\end{pmatrix}.\]
<p>各分量受到不同的缩放，因此一般会改变方向；统一的步长乘数只改变整体长度。使用归一化方向时还需除以对应长度，但不改变这里比较的方向。</p>
</div></details>
<h2>在同一谷地里比较两种走法</h2>
<p>下面先选择“最速下降 · 精确线搜索”，把曲率比 \(\kappa\) 调大并走几步；再选择“缩放后最速下降”，观察方向和迭代路径怎样变化。图仍画在原来的 \(x\) 坐标中，因此可以直接比较实际步子。</p>
<div data-demo="quadratic"></div>
<p>演示使用 \(f(x)=\tfrac12(x_1^2+\kappa x_2^2)\)，从 \((2,2/\kappa)\) 出发，让初始两个梯度分量相等。最速下降采用<strong>精确线搜索</strong>，因此观察到的曲折路径并不是来自粗糙的步长规则。</p>
\[g=Qx,\quad Q=\operatorname{diag}(1,\kappa),\quad p=-g,\quad\alpha^*=\frac{g^Tg}{g^TQg}.\]
<details><summary>推导：二次函数的精确步长</summary><div><p>沿 \(x+\alpha p\) 的目标导数为 \(g^Tp+\alpha p^TQp\)。令其为零得 \(\alpha^*=-g^Tp/(p^TQp)\)。当 \(p=-g\) 时即得上式。正定性保证分母为正。</p></div></details>
<div class="callout"><p>狭长谷地中，垂直等高线的方向可能不断跨越谷底，导致锯齿状慢进展。二阶信息和变量缩放都能改变这种表现。</p></div>`},
{id:'newton',title:'Newton 方向与二阶信息',pages:'22–23',lead:'Newton 法最小化当前二次模型，但模型好不好、曲率对不对，决定了这一步是否可靠。',body:String.raw`
<h2>另一条理解路径：对“一阶导数等于零”求根</h2>
<p>无约束优化的一阶条件是 \(\nabla f(x)=0\)。把梯度看成一个向量函数 \(F(x)=\nabla f(x)\)，优化中的 Newton 法就可以理解为：对这个向量方程使用 Newton 求根法。</p>
\[F(x_k+p)\approx F(x_k)+J_F(x_k)p=0.\]
<p>梯度的每个分量再对各变量求一次导数，组成的 Jacobian 正是 Hessian。因此：</p>
\[J_F(x_k)=\nabla^2f(x_k)=H_k,\qquad H_kp=-g_k.\]
<p><strong>Hessian 不是要被“设为零”的量，而是用来线性化梯度方程的系数矩阵。</strong>这也解释了它的获取方式：对标量目标先求梯度，再对梯度各分量求导。解析求导、自动微分或梯度的差分近似，是计算这张矩阵的不同途径。</p>
<details><summary>展开对照：优化 Newton 与方程 Newton</summary><div>
<table><thead><tr><th>问题</th><th>希望什么为零？</th><th>Newton 线性方程</th></tr></thead><tbody>
<tr><td>一般方程求解</td><td>残差向量 \(F(x)\)</td><td>\(J_F(x_k)p=-F(x_k)\)</td></tr>
<tr><td>无约束优化</td><td>梯度向量 \(g(x)\)</td><td>\(H_kp=-g_k\)</td></tr>
</tbody></table>
<p>一元时，优化 Newton 步为 \(p=-f'(x_k)/f''(x_k)\)：它是在用切线求 \(f'\) 的零点，而不是求 \(f\) 的零点。多元时，\((J_F)_{ij}=\partial F_i/\partial x_j=\partial^2f/\partial x_j\partial x_i\)；在 \(C^2\) 条件下混合偏导相等，得到对称 Hessian。</p>
<p>求根视角不要求 Hessian 正定，但找到梯度的根可能是极大点或鞍点。下面的二次模型视角进一步解释：何时这个 Newton 步是模型的最小化步、何时是下降方向。</p>
</div></details>
<h2>与二次模型的最小化相连接</h2>
<p>当 \(H_k\succ0\) 时，二次模型 \(m_k(p)=f_k+g_k^Tp+\tfrac12p^TH_kp\) 有唯一最小点。对 \(p\) 求导并令其为零：</p>
\[H_kp_k^N=-g_k,\qquad p_k^N=-H_k^{-1}g_k.\]
<p>实现中应求解线性方程组，而不是显式计算逆矩阵。若 \(g_k\neq0\)，则</p>
\[g_k^Tp_k^N=-(p_k^N)^TH_kp_k^N<0.\]
<p>因此正定 Hessian 给出下降方向。自然候选步长是 \(\alpha=1\)，因为 \(p_k^N\) 已经是模型的完整最小化步；离解较远时，仍可能需要缩短。</p>
<h2>为什么可能很快？</h2><p>对严格凸二次函数，Hessian 恒定，模型与真实函数完全一致，精确算术下一个完整 Newton 步直接到解。对一般函数，在非退化最小点附近、Hessian 满足适当光滑性且最终接受完整步等条件下，Newton 法可以二次收敛。这是局部性质，不是任意初值下的保证。</p>
<details><summary>失败案例：Newton 方程的解未必是下降方向</summary><div><p>考虑 \(f(x)=x^4-x^2\)，取 \(x=0.1\)。有 \(g=-0.196\)、\(H=-1.88\)，故 \(p=-g/H\approx-0.10426\)。于是 \(gp>0\)，该方向局部上升。它正朝着原点附近的局部极大值移动。</p><p>Hessian 奇异时方程可能无法给出唯一方向；Hessian 不定时即使有解也未必下降。需要修改曲率模型、使用其他下降方向或加入信赖域，而不能只缩短一个上升方向并期待其成为下降方向。</p></div></details>
<h2>代价与收益</h2><p>Newton 法需要二阶导数，并求解线性系统。对一般稠密问题，矩阵存储为 \(O(n^2)\)，直接分解通常为 \(O(n^3)\)；稀疏结构或迭代线性求解可以改变成本。该成本分析是理解本章比较的补充，不展开大规模实现。</p>`},
{id:'quasi',title:'拟牛顿：从梯度变化学习曲率',pages:'23–25',lead:'不直接计算 Hessian，而是让近似矩阵解释刚刚观察到的梯度变化。',body:String.raw`
<h2>割线方程：把第二个 Taylor 公式用于刚走过的一步</h2>
<p>记 \(g_k=\nabla f(x_k)\)。完成一次迭代后，我们知道本次位移和两端的梯度差：</p>
\[s_k=x_{k+1}-x_k,\qquad y_k=g_{k+1}-g_k.\]
<p>回到前面<a href="#ch02/taylor">Taylor 展开中的第二个表达式</a>。若 \(f\in C^2\)，且线段在定义域内，梯度变化的精确积分式为：</p>
\[\nabla f(x+p)-\nabla f(x)=\int_0^1\nabla^2 f(x+tp)p\,dt.\]
<p>现在代入 \(x=x_k\)、\(p=s_k\)，因此 \(x+p=x_{k+1}\)。左边就是 \(y_k\)，右边的 \(s_k\) 不随积分变量 \(t\) 改变，可以提出积分：</p>
\[y_k=\left[\int_0^1\nabla^2f(x_k+ts_k)\,dt\right]s_k=\overline H_k s_k,\qquad \overline H_k:=\int_0^1\nabla^2f(x_k+ts_k)\,dt.\]
<p>\(\overline H_k\) 是这条线段上的<strong>平均 Hessian</strong>。这个等式是精确的：本次位移经过沿途曲率的作用，产生了观测到的梯度差。只有当步子较小、沿途 Hessian 的变化也较小时，才可以进一步近似为 \(y_k\approx\nabla^2f(x_k)s_k\)。</p>
<p>拟牛顿法不直接计算这个 Hessian 积分，而是用新近似矩阵 \(B_{k+1}\) 解释刚刚得到的数据。因此给新矩阵施加<strong>割线条件</strong>：</p>
\[\boxed{B_{k+1}s_k=y_k}.\]
<div class="callout"><p>这里要区分两层关系：\(y_k=\overline H_k s_k\) 是 Taylor 积分公式给出的精确恒等式；\(B_{k+1}s_k=y_k\) 是我们为近似矩阵选定的更新条件。后者让新矩阵在本次位移上复现真实梯度变化，并不要求它等于平均 Hessian，也不意味着它就是新点的真实 Hessian。</p></div>
<details><summary>展开例子：一维割线斜率与平均曲率</summary><div>
<p>一维时 Hessian 就是二阶导数。若 \(s_k\neq0\)，割线条件变成：</p>
\[B_{k+1}=\frac{f'(x_{k+1})-f'(x_k)}{x_{k+1}-x_k}.\]
<p>它是<strong>梯度函数 \(f'\) 图像上两端点连成的割线斜率</strong>，而不是原函数 \(f\) 的割线斜率。它也等于沿这段区间的平均二阶导数。</p>
<p>例如取 \(f(x)=x^4\)，从 \(x_k=1\) 走到 \(x_{k+1}=2\)。有 \(f'(x)=4x^3\)、\(f''(x)=12x^2\)，所以：</p>
\[s_k=1,\qquad y_k=32-4=28,\qquad \overline H_k=\int_0^1 12(1+t)^2\,dt=28.\]
<p>割线条件要求 \(B_{k+1}=28\)。而起点 Hessian 为 12，终点 Hessian 为 48；这个有限步得到的是沿途平均曲率，不能直接把它当作任一端点的真实曲率。</p>
</div></details>
<h3>为什么一个割线条件会对应多种更新方式？</h3>
<p>多维时，\(s_k\) 和 \(y_k\) 都是向量，不能简单地“相除”得到矩阵。设有 \(n\) 个变量，且 \(s_k\neq0\)。把割线方程逐行写开：</p>
\[\sum_{j=1}^n (B_{k+1})_{ij}(s_k)_j=(y_k)_i,\qquad i=1,\ldots,n.\]
<p>这只有 \(n\) 个标量等式，而我们要确定一个矩阵：</p>
<div class="table-wrap"><table><thead><tr><th>对新矩阵的要求</th><th>独立未知数</th><th>割线条件给出的标量等式</th><th>尚未确定的自由度</th></tr></thead><tbody>
<tr><td>一般矩阵</td><td>\(n^2\)</td><td>\(n\)</td><td>\(n^2-n\)</td></tr>
<tr><td>对称矩阵，符合 Hessian 的结构</td><td>\(n(n+1)/2\)</td><td>\(n\)</td><td>\(n(n-1)/2\)</td></tr>
</tbody></table></div>
<p>因此，当 \(n>1\) 时，<strong>即使加上对称性，未知数仍多于等式，割线方程不能唯一确定新矩阵</strong>。它只规定了 \(B_{k+1}\) 作用在本次位移 \(s_k\) 上应得到 \(y_k\)，其他独立方向上的曲率信息还需要补充。这里统计的是满足割线等式的自由度，尚未施加正定性等额外要求。</p>
<details><summary>展开二维例子：同一个割线条件，仍有一个自由参数</summary><div>
<p>取本次位移和梯度差为：</p>
\[s_k=\begin{pmatrix}1\\0\end{pmatrix},\qquad y_k=\begin{pmatrix}2\\1\end{pmatrix},\qquad B_{k+1}=\begin{pmatrix}a&b\\b&c\end{pmatrix}.\]
<p>对称矩阵有 \(a,b,c\) 三个未知数；割线条件只给出两个等式：</p>
\[B_{k+1}s_k=\begin{pmatrix}a\\b\end{pmatrix}=\begin{pmatrix}2\\1\end{pmatrix}\quad\Longrightarrow\quad a=2,\ b=1.\]
<p>于是所有下列矩阵都满足同一割线条件，\(c\) 仍可自由选择：</p>
\[B_{k+1}=\begin{pmatrix}2&1\\1&c\end{pmatrix}.\]
<p>如果还要求正定，需要 \(\det B_{k+1}=2c-1>0\)，即 \(c>1/2\)，但仍有无穷多个选择。例如 \(c=1\) 和 \(c=3\) 都合格，却对第二个坐标方向赋予不同曲率。更新方法的作用就是结合旧矩阵和其他原则，选出一个具体的新矩阵。</p>
</div></details>
<p>因此，各种更新方式共有的目标是满足割线条件，区别在于<strong>怎样使用旧矩阵、怎样选择剩余自由度</strong>：</p>
<div class="table-wrap"><table><thead><tr><th>更新方式</th><th>进一步采用的原则</th><th>得到的特点</th></tr></thead><tbody>
<tr><td>SR1</td><td>用一个对称秩一修正，补上旧矩阵未能解释的梯度差</td><td>修正简单，保持对称；可以表达负曲率，但不保证正定，分母退化时需跳过更新</td></tr>
<tr><td>BFGS</td><td>用对称秩二更新满足割线条件，并在适当的矩阵度量下尽量保留旧信息</td><td>若旧矩阵正定且 \(s_k^Ty_k>0\)，新矩阵仍正定；适合继续构造下降方向</td></tr>
</tbody></table></div>
<p>下面先看这两种具体公式；它们的构造原则和推导会在<a href="#ch06/least-change">第 6 章：最小改动原则与加权矩阵距离</a>中展开。</p>
<p>本次方向由旧矩阵求得：\(B_kp_k=-g_k\)。走完这一步、取得 \(s_k,y_k\) 后再更新为 \(B_{k+1}\)，供下一次迭代使用；所以割线条件中的下标是 \(k+1\)。</p>
<h2>SR1：对称秩一更新</h2>\[v_k=y_k-B_ks_k,\qquad B_{k+1}=B_k+\frac{v_kv_k^T}{v_k^Ts_k}.\]
<p>当分母非零时，乘以 \(s_k\) 可直接验证割线方程。SR1 保持对称，但不保证正定；分母很小时更新不可靠，实际算法需要跳过或保护。对信赖域模型而言，表达负曲率有时恰好是优势。</p>
<h2>BFGS：对称秩二更新</h2>\[B_{k+1}=B_k-\frac{B_ks_ks_k^TB_k}{s_k^TB_ks_k}+\frac{y_ky_k^T}{y_k^Ts_k}.\]
<p>若 \(B_k\succ0\) 且 \(s_k^Ty_k>0\)，更新后仍正定，因此能继续产生下降方向。“正定保持”有条件，不能忽略曲率条件或数值误差。</p>
<details><summary>验证：BFGS 满足割线方程</summary><div>\[B_{k+1}s_k=B_ks_k-B_ks_k+y_k=y_k.\]<p>第二项消去旧矩阵在本次位移上的作用，第三项补上观测到的梯度差；其他方向的信息尽可能通过原近似保留下来。</p></div></details>
<h2>直接更新逆矩阵近似</h2><p>为避免每一步重新分解 \(B_k\)，可维护逆近似 \(H_k\approx[\nabla^2f(x_k)]^{-1}\)。这里的 \(H_k\) 遵循书中本段记法，区别于前文用 \(H(x)\) 表示真实 Hessian。BFGS 的逆更新式为</p>
\[H_{k+1}=(I-\rho_ks_ky_k^T)H_k(I-\rho_ky_ks_k^T)+\rho_ks_ks_k^T,\quad\rho_k=\frac1{y_k^Ts_k}.\]
\[p_k=-H_kg_k.\]
<div class="callout warning"><p><strong>公式辨析：</strong>书内第 25 页式 (2.21) 是 BFGS 的逆更新式。不能将它同时用于 SR1。逆 SR1 的对应形式如下，且同样需要分母保护：</p>\[H_{k+1}=H_k+\frac{(s_k-H_ky_k)(s_k-H_ky_k)^T}{(s_k-H_ky_k)^Ty_k}.\]<p>同一名称下的 Hessian 更新与逆 Hessian 更新应配套使用。</p></div>
<p>在适当局部条件和步长机制下，拟牛顿方法可实现超线性收敛。稠密 BFGS 通常需要 \(O(n^2)\) 存储与更新成本；有限记忆等扩展只在此保留入口。</p>`},
{id:'cg-models',title:'共轭梯度与信赖域模型谱系',pages:'25–26',lead:'把“怎样用历史信息”和“怎样建立局部模型”分开理解。',body:String.raw`
<h2>共轭梯度：让上一次方向参与下一步</h2>\[p_0=-g_0,\qquad p_k=-g_k+\beta_kp_{k-1}.\]
<p>共轭梯度最初用于对称正定线性系统 \(Ax=b\)。它与最小化下列严格凸二次函数等价：</p>
\[\phi(x)=\frac12x^TAx-b^Tx,\qquad\nabla\phi(x)=Ax-b.\]
<p>对二次问题，共轭性指 \(p_i^TAp_j=0\ (i\neq j)\)，与普通欧氏正交不同。非线性共轭梯度沿用方向递推的思想；不同的 \(\beta_k\) 和步长规则产生不同方法，对一般非线性目标不保证所有方向严格共轭。</p>
<p>它的优势是避免存储稠密矩阵，主要工作向量的存储通常为 \(O(n)\)。它通常比最速下降更有效，但不能无条件许诺 Newton 式的局部收敛速度。本节不提前列出第 5 章的具体 \(\beta_k\) 规则。</p>
<h2>同一模型形式，可以容纳不同曲率信息</h2>\[\min_{\|p\|_2\leq\Delta_k}\ f_k+g_k^Tp+\frac12p^TB_kp.\]
<div class="table-wrap"><table><thead><tr><th>选择</th><th>模型与步</th><th>解释</th></tr></thead><tbody><tr><td>\(B_k=0\)</td><td>\(p_k=-\Delta_k g_k/\|g_k\|_2\)，\(g_k\neq0\)</td><td>线性模型，退化为受半径控制的最速下降步</td></tr><tr><td>\(B_k=\nabla^2f(x_k)\)</td><td>Newton 信赖域模型</td><td>即使曲率不定，有限闭球上的子问题仍有解</td></tr><tr><td>\(B_k\) 为拟牛顿近似</td><td>拟牛顿信赖域模型</td><td>用累积梯度信息减少 Hessian 计算</td></tr></tbody></table></div>
<p>当 \(g_k=0\)、\(B_k=0\) 时模型为常数，零步可作为解，不能套用含 \(\|g_k\|\) 分母的公式。共轭梯度方向递推也不直接等同于某个固定的 Hessian 模型；它还可用于子问题求解，但那是后续内容。</p>
<h2>三个层次：框架、模型与内部求解器</h2>
<p>方法名称有时回答的是不同问题，不能全部放在同一个层次比较：</p>
<table><thead><tr><th>层次</th><th>决定什么？</th><th>例子</th></tr></thead><tbody>
<tr><td>推进框架</td><td>如何产生试探、接受或拒绝一步？</td><td>线搜索、信赖域</td></tr>
<tr><td>方向或模型构造</td><td>利用哪些导数与历史信息？</td><td>负梯度、真实 Hessian、拟牛顿近似</td></tr>
<tr><td>内部求解器</td><td>如何算出这一步的数值结果？</td><td>矩阵分解、共轭梯度、Dogleg、乘子求根</td></tr>
</tbody></table>
<p>例如“Newton 信赖域方法 + 截断共轭梯度”：信赖域管理范围及接受规则；Newton 指采用真实 Hessian 建模；截断共轭梯度负责近似求解这个子问题。共轭梯度不负责提供 Hessian，因此不应说它不能用于信赖域。</p>
<details><summary>展开区分：两种共轭梯度与线性模型的关系</summary><div>
<p><strong>非线性共轭梯度</strong>在原目标上递推搜索方向，通常配合线搜索；<strong>线性或截断共轭梯度</strong>可以在一个局部二次模型内部求步子。两者的迭代对象不同，详细算法见<a href="#ch05/linear">第 5 章</a>与<a href="#ch07/steihaug">大规模信赖域求解</a>。</p>
<p>当信赖域模型取 \(B_k=0\) 时，步子沿负梯度，方向与最速下降一致；但步长由半径给出，接受与半径更新也遵循信赖域规则。因此它们有相同的方向，不能直接说两套算法完全相同。</p>
</div></details>`},
{id:'scaling',title:'变量缩放与尺度不变性',pages:'26–27；习题2.10–2.12',lead:'数值上看起来“很难”的谷地，有时来自坐标与单位；但缩放不能消除所有结构性病态。',body:String.raw`
<h2>化学反应参数的数量级差异</h2><p>书中以四个反应速率常数为例，预期数量级为 \(10^{-10},1,1,10^5\)。引入新变量</p>
\[x=Sz,\qquad S=\operatorname{diag}(10^{-10},1,1,10^5),\qquad\widetilde f(z)=f(Sz).\]
<p>新变量的预期解都在 1 的数量级附近。改变单位，例如从秒换成小时，也是缩放。良好尺度有助于设定初值、步长和停止容差，但变量大小相近并不必然使 Hessian 条件数接近 1。</p>
<h2>链式法则揭示算法为什么会改变</h2><p>对可逆仿射变换 \(x=Sz+b\)：</p>
\[\nabla_z\widetilde f=S^T\nabla_xf,\qquad\nabla_z^2\widetilde f=S^T(\nabla_x^2f)S.\]
<p>在 \(z\) 坐标做最速下降，再映回 \(x\)，得到 \(p_x=-SS^Tg_x\)，一般不等于 \(-g_x\)。所以“最速”与坐标有关。</p>
<details><summary>推导：Newton 步为什么具有仿射不变性？</summary><div><p>若 Hessian 可逆，精确线性求解给出</p>\[p_z=-(S^TH_xS)^{-1}S^Tg_x=-S^{-1}H_x^{-1}g_x,\qquad Sp_z=-H_x^{-1}g_x=p_x.\]<p>使用对应初值和相同步长时，两套坐标产生对应的 Newton 迭代。但浮点误差、停止准则、线性系统求解误差以及信赖域形状，仍会造成实际差异。不能把理想方向的不变性误解为软件完全不受缩放影响。</p></div></details>
<h2>一个可以完全消除病态的例子</h2>\[f(x)=\frac12(x_1^2+\kappa x_2^2),\qquad x_1=z_1,\quad x_2=\frac{z_2}{\sqrt\kappa}\quad\Longrightarrow\quad\widetilde f(z)=\frac12(z_1^2+z_2^2).\]
<p>二次目标的 Hessian 条件数由 \(\kappa\) 变为 1。在前面的 <a href="#ch02/descent">最速下降演示</a> 中选择“缩放后最速下降”，可以看到这种变量替换如何改变实际步。</p>
<details><summary>推导：方向敏感性与条件数 · 对应习题2.12</summary><div><p>在正定 Hessian 的驻点附近，沿单位坐标方向 \(e_i\) 有 \(f(x^*+te_i)-f(x^*)=\tfrac12t^2H_{ii}+o(t^2)\)。若两个方向曲率 \(H_{ii}\) 和 \(H_{jj}\) 相差很大，由 Rayleigh 商边界可得</p>\[\lambda_{\min}(H)\leq H_{jj}\ll H_{ii}\leq\lambda_{\max}(H),\qquad\kappa_2(H)\geq H_{ii}/H_{jj}.\]<p>因此二次近似对同样长度的位移呈现悬殊敏感性，并对应较大的条件数。这一论证要求非退化正定曲率；在退化极小点，高阶项可能主导敏感性，不能仅凭函数变化就作相同推断。</p></div></details>
<details><summary>进一步：拟牛顿更新的尺度条件</summary><div><p>若 \(s_x=Ss_z\)、\(y_z=S^Ty_x\)、初始近似满足 \(B_{z,0}=S^TB_{x,0}S\)，则将它们代入 SR1 或 BFGS 更新，可得到每次更新仍有 \(B_{z,k}=S^TB_{x,k}S\)，前提是更新有定义且使用对应步长。两边都随意设置单位矩阵，通常不满足这个变换关系。</p></div></details>
<div class="callout"><p><strong>参数估计中的一个限制：</strong>缩放能改善变量的数值尺度，但如果不同参数组合产生相同或非常接近的预测，缩放无法帮助数据区分这些组合。此时还需要检查模型、测量内容和实验设计，可能需要增加能够区分参数的信息。</p></div>
<details><summary>展开例子：只测反应物时，为什么分不清两个速率常数？</summary><div>
<p>考虑两条不可逆的一级平行反应：</p>
\[A\xrightarrow{k_1}B,\qquad A\xrightarrow{k_2}C.\]
<p>在满足该动力学模型的条件下，反应物 A 的消耗速率取决于两个速率常数之和：</p>
\[\frac{dc_A}{dt}=-(k_1+k_2)c_A,\qquad c_A(t)=c_A(0)\exp[-(k_1+k_2)t].\]
<p>如果只测量 \(c_A(t)\)，数据只能确定 \(k_1+k_2\)，无法分别确定 \(k_1\) 和 \(k_2\)。例如，取相同单位：</p>
\[(k_1,k_2)=(1,2)\quad\text{与}\quad(k_1,k_2)=(2,1).\]
<p>两组参数给出完全相同的反应物浓度曲线。即使测量没有噪声、采样很密，也不能凭这些数据区分它们。这叫<strong>不可辨识</strong>；把参数缩放到相近的数量级，仍然改变不了这种关系。若进一步分别测量产物 B、C，在这个模型下便能获得区分两条反应速率的信息。</p>
<p><strong>强相关</strong>通常是程度较轻的情况：一个参数增大、另一个减小，可以让预测几乎不变，因而许多参数组合都有接近的拟合效果。即便最终能区分参数，估计也可能对测量噪声很敏感。适当缩放有助于数值计算，但不能消除数据对这些组合区分不足的问题。</p>
</div></details>`},
{id:'rosenbrock',title:'完整算例：Rosenbrock 函数',pages:'习题2.1，第27–28页',lead:'把梯度、Hessian、驻点判别与算法表现连成一次完整练习。',body:String.raw`
\[f(x_1,x_2)=100(x_2-x_1^2)^2+(1-x_1)^2.\]
<p>注意系数为 100，与第 19 页信赖域示意使用的 10 不同。以下使用习题 2.1 的版本。</p>
\[\nabla f=\begin{pmatrix}-400x_1(x_2-x_1^2)+2(x_1-1)\\200(x_2-x_1^2)\end{pmatrix}.\]
\[\nabla^2f=\begin{pmatrix}1200x_1^2-400x_2+2&-400x_1\\-400x_1&200\end{pmatrix}.\]
<h2>唯一驻点与全局最小点</h2><p>第二个梯度分量为零要求 \(x_2=x_1^2\)，代入第一个得到 \(x_1=1\)。于是唯一驻点为 \((1,1)\)。两个平方项都非负，在该点同时为零，所以它也是唯一全局最小点。</p>
\[\nabla^2f(1,1)=\begin{pmatrix}802&-400\\-400&200\end{pmatrix},\qquad\det\nabla^2f(1,1)=400>0.\]
<p>首个顺序主子式 802 为正，行列式也为正，故 Hessian 正定。其两个特征值约为 1001.6006 与 0.3994，狭长谷底说明最速下降可能很慢。</p>
<div data-demo="rosenbrock"></div>
<p>此演示采用最速下降，或带正定检查的 Newton 方向；Newton 检查失败时退回负梯度。步长从 1 开始二分，直到达到 \(f(x+\alpha p)\leq f(x)+10^{-4}\alpha g^Tp\)。这是为让演示可运行而采用的明确实现规则；其系统理论留到第 3 章。最大步数不是收敛证明。</p>
<details><summary>观察任务</summary><div><ol><li>从 \((-1.2,1)\) 出发，比较两种方法在谷地中的轨迹与梯度范数。</li><li>换到 \((0,1)\)，观察 Hessian 非正定时 Newton 模式如何回退。</li><li>区分“函数值接近零”和“梯度足够小”。在狭长谷地中，两者未必同步。</li></ol></div></details>`},
{id:'exercises',title:'习题工作台与知识检查',pages:'27–29',lead:'按第 2 章习题的能力要求组织，先独立判断，再展开推导。',body:String.raw`
<p>下面覆盖原章习题的主要训练主题。Rosenbrock 导数（2.1）、凸二次型（2.7）、缩放与更新（2.10–2.12）已在前文展开。这里补齐驻点、Taylor、下降与收敛概念；不是原题逐字转录。</p>
<details><summary><span class="exercise-number">01</span>求出一个鞍点 · 对应2.2、2.3</summary><div><p>对 \(f=8x_1+12x_2+x_1^2-2x_2^2\)，\(\nabla f=(8+2x_1,12-4x_2)^T\)。唯一驻点为 \((-4,3)\)，Hessian 为 \(\operatorname{diag}(2,-4)\)，故是鞍点。一般地：</p>\[\nabla(a^Tx)=a,\quad\nabla^2(a^Tx)=0;\qquad\nabla(x^TAx)=2Ax,\quad\nabla^2(x^TAx)=2A\quad(A=A^T).\]</div></details>
<details><summary><span class="exercise-number">02</span>Taylor 展开中的定义域 · 对应2.4</summary><div><p>设 \(h(x)=\cos(1/x)\)，在非零点附近：</p>\[h'(x)=\frac{\sin(1/x)}{x^2},\qquad h''(x)=-\frac{2\sin(1/x)}{x^3}-\frac{\cos(1/x)}{x^4}.\]<p>把这些量代入二阶展开即可，线段必须避开零点。对余弦函数在任意 \(x\) 处：</p>\[\cos(x+p)=\cos x-\sin x\,p-\frac12\cos x\,p^2+\frac16\sin x\,p^3+O(p^4).\]</div></details>
<details><summary><span class="exercise-number">03</span>每步下降能否保证收敛到解？ · 对应2.5</summary><div><p>不能。取 \(f(x)=\|x\|_2\)，\(x_k=(1+2^{-k})(\cos k,\sin k)^T\)。目标值严格下降至 1，但最优值是 0。角度序列模 \(2\pi\) 在圆周上稠密，因此迭代有整个单位圆作为聚点集合，并不收敛到一个点。这说明单调下降不是完整的收敛保证。</p></div></details>
<details><summary><span class="exercise-number">04</span>凸函数的最小点集合是否凸？ · 对应2.8</summary><div><p>设 \(x,y\) 均达到最优值 \(f^*\)。凸性给出</p>\[f(\alpha x+(1-\alpha)y)\leq\alpha f^*+(1-\alpha)f^*=f^*.\]<p>根据最优值定义又不能更低，所以线段上每一点都达到 \(f^*\)。严格凸时，则不可能有两个不同最小点。孤立与严格的区别见前文，对应习题 2.6。</p></div></details>
<details><summary><span class="exercise-number">05</span>下降方向和一维最小点 · 对应2.9</summary><div><p>取 \(f(x)=(x_1+x_2^2)^2\)，\(x=(1,0)^T\)，\(p=(-1,1)^T\)。有 \(g=(2,0)^T\)、\(g^Tp=-2<0\)。沿线</p>\[f(x+\alpha p)=(1-\alpha+\alpha^2)^2.\]<p>括号始终为正，导数为 \(2(1-\alpha+\alpha^2)(2\alpha-1)\)。因此在 \(\alpha>0\) 上唯一最优步长为 \(\alpha=1/2\)，目标值为 \(9/16\)。</p></div></details>
<h2>收敛速度：为习题提供最小背景</h2><p>原章习题 2.13–2.16 引用附录。本次没有读取附录；下面给出解题所需的标准定义作为补充。设 \(e_k=\|x_k-x^*\|>0\)，且 \(e_k\to0\)：</p>
\[\begin{array}{ll}\text{Q-线性：}&e_{k+1}\leq q e_k\quad\text{最终成立，某个 }0<q<1;\\\text{Q-超线性：}&e_{k+1}/e_k\to0;\\\text{Q-二次：}&e_{k+1}\leq C e_k^2\quad\text{最终成立，某个 }C>0.\end{array}\]
<p>Q 描述实际误差的逐步关系。R 描述被某个具有对应 Q 速度的收敛序列上界控制；它允许实际序列相邻两步间出现不规则变化。</p>
<details><summary><span class="exercise-number">06</span>三个误差序列 · 对应2.13–2.15</summary><div><ul><li>\(e_k=1/k\)：比值 \(k/(k+1)\to1\)，不是 Q-线性。</li><li>\(e_k=2^{-2^k}\)：\(e_{k+1}=e_k^2\)，为 Q-二次；注意指数是 \(2^k\)，不是 \(2k\)。</li><li>\(e_k=1/k!\)：\(e_{k+1}/e_k=1/(k+1)\to0\)，但 \(e_{k+1}/e_k^2=k!/(k+1)\to\infty\)，故 Q-超线性而非 Q-二次。</li></ul></div></details>
<details><summary><span class="exercise-number">07</span>不规则序列：Q 与 R 的区别 · 对应2.16</summary><div><p>令偶数 \(k\) 时 \(e_k=4^{-2^k}\)，奇数 \(k\) 时 \(e_k=e_{k-1}/k\)。偶到奇的相邻比值为 \(1/k\)，奇到偶的比值为 \((k-1)4^{-3\cdot2^{k-2}}\)，都趋于零，所以 Q-超线性。</p><p>但偶到奇的二次比值为 \(4^{2^{k-1}}/k\to\infty\)，故不是 Q-二次。取上界 \(v_k=4^{-2^{k-1}}\)，则每一步 \(e_k\leq v_k\)，并且 \(v_{k+1}=v_k^2\)。因此它是 R-二次收敛。</p></div></details>
<h2>学完这两章，应能回答</h2><ol><li>怎样建立并分类一个优化模型？可行性由什么决定？</li><li>驻点、局部最小点、全局最小点有什么区别？<a href="#ch02/optimality">回顾第 2 章第 4 节的定义与关系</a>。</li><li>哪条最优性条件是必要的，哪条是充分的？</li><li>线搜索和信赖域分别把什么交给子问题？</li><li>最速下降、Newton、拟牛顿和共轭梯度分别用什么信息？</li><li>为什么缩放会改变最速下降？理想 Newton 不变性有哪些前提？</li></ol>
<div class="callout"><p>继续阅读<a href="#ch03/framework">第 3 章：怎样选择步长</a>，再进入<a href="#ch04/framework">第 4 章：怎样建立与调整信赖域</a>，把本章的算法框架变成可执行的求解过程。</p></div>`}
]});
