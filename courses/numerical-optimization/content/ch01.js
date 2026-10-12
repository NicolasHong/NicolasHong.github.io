window.OPT_CHAPTERS = window.OPT_CHAPTERS || [];
window.OPT_CHAPTERS.push({id:'ch01',number:'01',title:'把实际问题写成优化模型',subtitle:'Introduction · 建模、分类与凸性',pages:'1–9',sections:[
{id:'model',title:'优化的语言与建模闭环',pages:'1–3',lead:'先明确什么可以改变、什么值得改善、什么必须满足，再选择求解方法。',body:String.raw`
<h2>一个模型，三个组成部分</h2>
<p>优化把决策转化为数学对象：决策变量 \(x\) 描述可调整的量，标量目标 \(f(x)\) 衡量方案优劣，约束决定哪些方案可行。对过程系统工程而言，这三者常对应操作条件、经济或能耗指标，以及物料衡算、设备能力和产品规格。</p>
\[\begin{aligned}\min_{x\in\mathbb R^n}\quad &f(x)\\ \text{s.t.}\quad &c_i(x)=0,\quad i\in\mathcal E,\\ &c_i(x)\geq0,\quad i\in\mathcal I.\end{aligned}\]
<p>\(\mathcal E\) 与 \(\mathcal I\) 分别是等式和不等式约束的索引集。可行域为</p>
\[\mathcal F=\{x\in\mathbb R^n:c_i(x)=0\ (i\in\mathcal E),\ c_i(x)\geq0\ (i\in\mathcal I)\}.\]
<div class="callout"><div class="label">符号约定</div><p>本讲义沿用书中的 \(c_i\geq0\)。若习惯写 \(g_i\leq0\)，令 \(c_i=-g_i\) 即可。符号本身没有优劣，但凸性判断和后续乘子符号必须一致。</p></div>
<h2>求解只是闭环中的一步</h2>
<div class="step-flow"><span>01 定义问题<small>变量 · 目标 · 约束</small></span><span>02 数值求解<small>算法 · 初值 · 精度</small></span><span>03 检验结果<small>可行性 · 最优性</small></span><span>04 返回工程<small>解释 · 敏感性 · 修正</small></span></div>
<p>复杂模型不一定更有用，简单模型也可能遗漏关键机制。计算结束后，还要检查结果是否满足现实要求、是否对数据误差敏感，以及最优性条件是否成立。数学上求对了一个不合适的模型，依然可能给出错误决策。</p>
<details><summary>展开：把工程表述转换为标准形式</summary><div><ul><li>最大化利润 \(P(x)\)：改写为最小化 \(-P(x)\)。</li><li>变量范围 \(l_j\leq x_j\leq u_j\)：写为 \(x_j-l_j\geq0\) 与 \(u_j-x_j\geq0\)。</li><li>多个下标的变量，如 \(x_{ij}\)：按固定顺序排列为一个向量，不改变数学问题。</li><li>多指标决策：先明确权衡方式，例如归一化后的加权和。权重表达偏好，并不是求解器自动发现的物理常数。</li></ul><p>变量、已知参数和测量数据要分开。例如模型预测 \(y=F(u,\theta)\) 中，操作优化以 \(u\) 为变量；参数估计以 \(\theta\) 为变量。同一个模型可以服务于不同的优化任务。</p></div></details>
<h2>“有解”也需要检查</h2><p>可行域可能为空，目标也可能无下界，或只有下确界却取不到。作为补充例子，\(\min_{x\in\mathbb R}e^x\) 的下确界为 0，但没有有限的最优点。求解器输出一个数，并不能代替存在性判断。</p>
<div class="callout warning"><p><strong>本章的边界：</strong>建立模型语言与分类意识。约束最优性条件和具体约束算法尚未展开，不应把第 2 章的无约束梯度条件直接套在边界最优点上。</p></div>`},
{id:'geometry',title:'从等高线理解可行域',pages:'3–4',lead:'最优点由目标函数与可行域共同决定；最低的“谷底”不一定允许到达。',body:String.raw`
<p>书中的二维例子为</p>
\[\min_{x_1,x_2}\ f(x)=(x_1-2)^2+(x_2-1)^2\quad\text{s.t.}\quad x_1^2\leq x_2,\quad x_1+x_2\leq2.\]
<p>目标是到点 \((2,1)\) 的距离平方；等高线是一组同心圆。可行域在抛物线 \(x_2=x_1^2\) 上方、直线 \(x_2=2-x_1\) 下方。两条边界在 \(x_1=-2\) 和 \(x_1=1\) 处相交。</p>
<div data-demo="feasible"></div>
<h2>为什么最优点是 (1, 1)？</h2>
<p>可行性蕴含 \(-2\leq x_1\leq1\)，因此 \((x_1-2)^2\geq1\)，同时 \((x_2-1)^2\geq0\)。可行点 \((1,1)\) 恰好达到下界 1，故它是唯一的全局最优点。</p>
\[x^*=(1,1)^T,\qquad f(x^*)=1,\qquad \nabla f(x^*)=(-2,0)^T\neq0.\]
<div class="callout warning"><p>在这个约束问题里，最优点的梯度并不为零。沿负梯度方向走会离开可行域。“还能下降”与“还能可行地下降”是两件事。</p></div>
<details><summary>展开：目标和约束各自提供了什么信息？</summary><div><p>目标等高线说明“同样好”的点有哪些；可行域说明“允许”的点有哪些。最优值相当于最小一条能够接触可行域的等高线。这里两个不等式在最优点都取等号，称为活跃约束。活跃只说明取等号，并不单独证明最优性。</p></div></details>`},
{id:'transport',title:'案例：化工产品运输',pages:'4–5',lead:'用运输问题把变量、目标和约束写完整，再观察改变模型假设会发生什么。',body:String.raw`
<p>书中考虑 2 个工厂和 12 个销售点。工厂 \(i\) 的周产能为 \(a_i\)，销售点 \(j\) 的需求为 \(b_j\)，单位运输成本为 \(c_{ij}\)。决策变量 \(x_{ij}\) 是从工厂 \(i\) 运到销售点 \(j\) 的数量。</p>
\[\begin{aligned}\min_x\quad &\sum_{i=1}^{2}\sum_{j=1}^{12}c_{ij}x_{ij}\\ \text{s.t.}\quad &\sum_{j=1}^{12}x_{ij}\leq a_i,\quad i=1,2,\\ &\sum_{i=1}^{2}x_{ij}\geq b_j,\quad j=1,\ldots,12,\\ &x_{ij}\geq0.\end{aligned}\]
<p>目标和约束都是线性的，所以这是线性规划。24 个变量并不等于 24 个独立选择：工厂端共享产能，需求端必须得到供应，它们通过约束耦合。</p>
<div data-demo="transport"></div>
<h2>演示的模型及可行性</h2><p>为便于观察，上面的原创教学数据缩减为 2 个工厂、3 个客户。需求固定为 \((35,40,25)\)，单位成本矩阵为</p>
\[C=\begin{pmatrix}2&6&4\\5&3&5\end{pmatrix}.\]
<p>所有路线可用、产能非负时，\(a_1+a_2\geq100\) 是满足总需求的充分必要条件。因为运输成本全部为正，总存在一个最优方案恰好满足各客户需求，因此演示用等式需求求解，不会漏掉更优解。</p>
<details><summary>展开：这个小案例如何直接求解？</summary><div><p>先假设全部从工厂 2 发货。把客户 \(j\) 的一吨货改由工厂 1 供应，成本变化为 \(d_j=c_{1j}-c_{2j}\)，三个客户依次为 \(-3,3,-1\)。按 \(d_j\) 从小到大配置工厂 1 的产能，同时满足其最低发货量 \(\max(0,100-a_2)\) 和最高发货量 \(\min(a_1,100)\)。这是该特殊两源问题的精确求解规则，不是对一般线性规划的替代。</p></div></details>
<h2>假设一变，问题类型也会变</h2><ul><li>加入库存、生产成本：仍可保持线性，取决于成本表达式。</li><li>整车发运、工厂启停：出现整数或二元变量。</li><li>规模折扣：费用可能是非线性的。书中以 \(\sum c_{ij}\sqrt{\delta+x_{ij}}\)、\(\delta>0\) 作为示意；目标的凹性意味着最小化问题一般不再是凸优化。</li><li>需求未知：需决定使用确定预测、场景期望还是鲁棒约束。</li></ul>`},
{id:'taxonomy',title:'优化问题的分类坐标',pages:'5–7',lead:'这些分类是不同维度。同一个工程问题可以同时是连续、约束、非线性和确定性的。',body:String.raw`
<div class="table-wrap"><table><thead><tr><th>分类维度</th><th>数学区别</th><th>工程例子与影响</th></tr></thead><tbody><tr><td>连续 / 离散</td><td>实数变量 / 整数、二元或组合对象</td><td>流量连续可调；设备台数和开停状态离散。连续松弛可辅助求离散问题，但取整未必可行。</td></tr><tr><td>无约束 / 约束</td><td>可在整个空间移动 / 必须留在可行域</td><td>参数拟合可能无显式约束；安全温度和产能限制不可随意忽略。</td></tr><tr><td>线性 / 非线性</td><td>目标和全部约束均为仿射 / 至少一个非线性</td><td>运输成本常可线性化；动力学和热力学通常引入非线性。</td></tr><tr><td>凸 / 非凸</td><td>凸目标及凸可行域 / 不满足该结构</td><td>决定局部最优能否直接解释为全局最优。</td></tr><tr><td>光滑 / 非光滑</td><td>可微结构 / 尖点、分段或不连续</td><td>平方残差光滑；绝对误差在残差为零处可能有尖点。</td></tr><tr><td>确定性 / 随机性</td><td>模型数据给定 / 模型包含不确定量</td><td>固定订单与随机需求对应不同决策模型。</td></tr></tbody></table></div>
<h2>局部与全局：先说清求解目标</h2><p>全局最小点与所有可行点比较；局部最小点只与附近的可行点比较。本书主要研究连续优化中的局部求解。多次更换初值可能找到更好的解，但不能单靠有限次尝试证明全局最优。</p>
<h2>随机优化不是“算法使用随机数”</h2><p>模型中的需求 \(\xi\) 未知时，可以最小化期望成本；若必须高概率满足约束，可以采用机会约束；若要求对一个不确定集合内的全部情形满足约束，则属于鲁棒处理。以下是概念性写法：</p>
\[\min_x\mathbb E_\xi[F(x,\xi)],\qquad \mathbb P(c(x,\xi)\geq0)\geq1-\varepsilon,\qquad c(x,\xi)\geq0\ \ \forall\xi\in\mathcal U.\]
<p>给一个确定性目标随机生成初值，不会把目标模型变成随机规划。反过来，随机模型经场景离散后，可能由确定性优化子问题求解。</p>
<details><summary>展开：约束能否“放进目标函数”？</summary><div><p>罚函数可以把违反约束的程度加入目标，形成无约束子问题。但有限罚系数下，解可能违反原约束；过大的系数也可能损害数值条件。因此“加个罚项”不是自动等价变换。这里只理解两类问题之间的联系，具体方法留待以后。</p></div></details>`},
{id:'convexity',title:'凸性：从局部走向全局',pages:'7–8；第2章16–17',lead:'凸性是全局结构信息；它比某一点的 Hessian 正定更强。',body:String.raw`
<h2>凸集、凸函数与严格凸函数</h2><p>集合 \(S\) 是凸的，意味着任意两点间的整段线段都留在集合中：</p>
\[x,y\in S,\quad\alpha\in[0,1]\quad\Longrightarrow\quad\alpha x+(1-\alpha)y\in S.\]
<p>在凸定义域上，函数的图像不高于任意两点之间的弦：</p>
\[f(\alpha x+(1-\alpha)y)\leq\alpha f(x)+(1-\alpha)f(y).\]
<p>当 \(x\neq y\)、\(0<\alpha<1\) 时总为严格小于，则是严格凸。\(-f\) 凸意味着 \(f\) 凹。球、线性等式与不等式的交集都是凸集；仿射函数既凸又凹。</p>
<div data-demo="convex"></div>
<h2>怎样得到一个凸优化问题？</h2><p>一种标准的充分结构是：目标凸、等式约束仿射、以 \(c_i\geq0\) 表示的不等式函数凹。这样得到凸可行域。若使用 \(g_i\leq0\)，对应要求 \(g_i\) 凸。</p>
<div class="callout"><p><strong>核心结论：</strong>凸目标在凸可行域上的每个局部最小点都是全局最小点。严格凸目标的最优点如果存在，则唯一；严格凸本身不保证最优点存在。</p></div>
<details><summary>推导：局部最优为什么成为全局最优？</summary><div><p>假设 \(x^*\) 局部最优，却存在可行点 \(z\) 满足 \(f(z)<f(x^*)\)。令 \(x_\alpha=(1-\alpha)x^*+\alpha z\)。凸可行域保证 \(x_\alpha\) 可行，凸函数保证</p>\[f(x_\alpha)\leq(1-\alpha)f(x^*)+\alpha f(z)<f(x^*),\quad0<\alpha\leq1.\]<p>取足够小的 \(\alpha\)，这个更好的点就落入 \(x^*\) 的任意小邻域，与局部最优矛盾。</p></div></details>
<h2>可微情况下的判断工具</h2><p>对整个 \(\mathbb R^n\) 上的可微凸函数，有支撑超平面不等式；若二阶连续可微，则全域 Hessian 半正定等价于凸性：</p>
\[f(y)\geq f(x)+\nabla f(x)^T(y-x),\qquad \nabla^2f(x)\succeq0\quad\forall x.\]
<p>因此，无约束凸问题中 \(\nabla f(x^*)=0\) 足以证明全局最优。一个点处 Hessian 正定只说明局部曲率，不能据此宣布整个函数凸。</p>
<details><summary>练习：二次型为什么凸？</summary><div><p>设 \(Q=Q^T\succeq0\)，\(f(x)=x^TQx\)。直接展开得到</p>\[\alpha f(x)+(1-\alpha)f(y)-f(\alpha x+(1-\alpha)y)=\alpha(1-\alpha)(x-y)^TQ(x-y)\geq0.\]<p>若 \(Q\succ0\)，则非重合两点对应严格不等式。</p></div></details>`},
{id:'algorithm',title:'怎样评价一次优化计算',pages:'8–9',lead:'迭代次数、计算成本和求解精度，需要放在一起看。',body:String.raw`
<p>迭代算法从 \(x_0\) 出发，依次生成 \(x_1,x_2,\ldots\)。不同算法的区别是：收集什么信息、怎样形成下一步，以及何时停止。求函数值、梯度或 Hessian 都可能有成本，尤其当每一次评价都要调用反应器或流程模拟时。</p>
<div class="table-wrap"><table><thead><tr><th>维度</th><th>真正需要考察的量</th><th>容易产生的误解</th></tr></thead><tbody><tr><td>稳健性</td><td>合理初值范围内的成功率，对不同问题的适应性</td><td>一个演示例子成功 ≠ 对所有问题有效</td></tr><tr><td>效率</td><td>函数/导数评价次数、线性代数成本、内存和时间</td><td>迭代更少 ≠ 总时间更短</td></tr><tr><td>精度</td><td>最优性残差、可行性、数值与数据误差</td><td>目标值不再变化 ≠ 已经最优</td></tr></tbody></table></div>
<p>这三方面常有冲突：利用更多二阶信息可能减少迭代，却增加单步成本；更稳健的步长控制可能多做函数评价。算法选择必须结合问题结构和代价。</p>
<details><summary>术语背景：为什么叫 mathematical programming？</summary><div><p>书内第 9 页回顾了从 Euler、Lagrange 的变分思想到 20 世纪 40 年代线性规划的发展。“数学规划”中的 programming 指安排、规划与决策，其用法早于今天普遍使用的计算机编程含义。建模是把应用连接到数学理论与软件的环节，而本书的主要篇幅放在算法和支撑理论上。</p></div></details>
<h2>学习地图：先建立共同基础</h2><p>本讲义当前覆盖第 1 至 19 章：建模、无约束优化基础、<a href="#ch03/framework">线搜索</a>、<a href="#ch04/framework">信赖域</a>、<a href="#ch05/linear">共轭梯度</a>、<a href="#ch06/secant">拟牛顿</a>、<a href="#ch07/cost">大规模优化</a>和<a href="#ch08/routes">导数计算</a>，并接入<a href="#ch09/black-box">无导数优化</a>、<a href="#ch10/structure">最小二乘</a>、<a href="#ch11/roots">非线性方程</a>、<a href="#ch12/problem">约束理论</a>、<a href="#ch13/standard">LP</a>、<a href="#ch16/equality">QP</a>、<a href="#ch17/quadratic">罚方法</a>、<a href="#ch18/newton">SQP</a>和<a href="#ch19/perturbed">非线性内点法</a>。</p>
<details><summary>本章自检 · 三个问题</summary><div><ol><li><strong>产能不足时，该换求解算法吗？</strong>首先检查模型可行性。若总产能小于总需求且无外购途径，更换算法不会使原模型可行。</li><li><strong>目标是非线性的，是否一定存在多个局部最优？</strong>不一定。严格凸二次函数就是非线性且至多一个最优点的例子。</li><li><strong>零残差才说明参数估计成功吗？</strong>不是。含噪数据通常无法被模型精确拟合。应检查是否已经最小化所选误差，以及模型是否合理。</li></ol></div></details>
<div class="callout"><p>进入第 2 章前，应能够把实际任务写成变量、目标和约束，并说明问题属于哪几类。接下来回答：怎样判断一个点是解，又怎样走向它？</p></div>`}
]});
