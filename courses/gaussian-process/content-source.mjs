// Authoring source: equations are compiled to native MathML by build.mjs.
export default function content({eq,inline}){
const e=s=>eq(s.raw[0]),i=s=>inline(s.raw[0]);
const note=s=>`<div class="takeaway">${s}</div>`,detail=(title,s)=>`<details><summary>${title}</summary>${s}</details>`;
const table=(headers,rows)=>`<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const lab=(id,title)=>`<section class="lab" data-lab="${id}" aria-label="${title}"><div class="lab-head">${title}<span>INTERACTIVE LAB</span></div><div class="lab-body"></div></section>`;
return [
{id:'purpose',group:'01 / 为什么需要它',title:'一次昂贵评估，放在哪里？',lead:'GP 负责描述未知函数，贝叶斯优化负责选择下一次评估。先分清模型与决策。',body:`
<p>假设要用反应器模拟寻找更好的操作条件。每给定一组温度、进料比和停留时间，都需要运行一次模型，才能知道产品性能和能耗。预算只允许少量评估，我们希望每次调用都有价值。</p>
${e`\min_{\mathbf{x}\in\mathcal X} f(\mathbf{x}),\qquad \mathcal D_n=\{(\mathbf{x}_i,y_i)\}_{i=1}^{n}`}
<p>${i`\mathbf{x}`} 是允许调整的变量；${i`f`} 是需要降低的目标，例如能耗或参数拟合误差；${i`\mathcal X`} 是允许搜索的区域。若要最大化产率 ${i`Y`}，可定义 ${i`f=-Y`}，保持后面所有符号一致。</p>
<div class="flow"><div><small>01 / DESIGN</small><strong>获得初始数据</strong><p>先让样本覆盖允许区域。</p></div><div><small>02 / LEARN</small><strong>更新 GP</strong><p>计算均值与不确定性。</p></div><div><small>03 / SELECT</small><strong>优化采集函数</strong><p>选择值得评估的位置。</p></div><div><small>04 / EVALUATE</small><strong>调用真实评估器</strong><p>补充数据，再重复。</p></div></div>
${note('<strong>代理模型便宜，不等于真实实验便宜。</strong> 内层可以多次计算采集函数；外层每新增一个观测，才消耗一次昂贵评估预算。')}
${table(['场景','输入','昂贵输出'],[['动力学参数辨识','速率常数、活化能等参数','模拟与实验之间的误差'],['操作条件优化','温度、压力、进料组成','能耗、产率或产品指标'],['材料或超参数搜索','配方、结构描述或模型超参数','实验性能或训练后的验证误差']])}
<h2>什么时候值得考虑？</h2><p>目标评估昂贵、梯度难以获得、输入维度较低或具有可利用结构时，GP 与贝叶斯优化常有吸引力。若已有可靠导数和便宜模型，前面课程中的梯度方法仍然很重要。贝叶斯优化并不要求自然界的真实函数本身在反复随机变化：概率模型可以表达我们对一个固定未知函数的认识。</p>`},
{id:'lhs',group:'01 / 为什么需要它',title:'先用有限样本看见整个区域',lead:'拉丁超方抽样让每个变量的一维投影都覆盖各个分层；它不保证填满所有高维小格。',body:`
<p>将每一维的允许区间归一化到 [0,1]，等分为 n 层。每一维各层恰好取一个样本，再通过不同排列把各维配成 n 个向量。</p>
${e`u_{ij}=\frac{\pi_j(i)-1+v_{ij}}{n},\quad v_{ij}\sim U(0,1),\qquad x_{ij}=a_j+(b_j-a_j)u_{ij}`}
<p>${i`\pi_j`} 是第 j 维对 1,…,n 的排列；${i`[a_j,b_j]`} 是该维的范围。不同维度使用不同排列，避免所有样本排成一条对角线。</p>
${lab('lhs','实验 01 · LHS 与独立随机采样')}
${note('先沿横轴、再沿纵轴数一数：LHS 的每条分层带恰好有一个点。二维网格的许多格子仍然没有点，这是正常的。')}
<p>普通 LHS 不保证点间距离最大，也不自动满足工艺约束。约束复杂时，应先确认可行域；如果简单删除不可行点，原有的分层性质通常会被破坏。</p>`},
{id:'normal',group:'02 / 从分布到函数',title:'正态分布：描述一个随机变量',lead:'正态分布与高斯分布是同一个概念。先看一个未知值，再扩展到多个值，最后扩展到整个函数。',body:`
<nav class="concept-path" aria-label="概念递进"><a href="#normal" aria-current="step"><small>01 / 一个随机变量</small><strong>正态分布 / 高斯分布</strong><span>一次抽样得到一个数</span></a><a href="#multivariate"><small>02 / 一个随机向量</small><strong>多元高斯分布</strong><span>一次抽样得到一组数</span></a><a href="#prior"><small>03 / 一族随机变量</small><strong>高斯过程</strong><span>一次实现对应一个函数</span></a></nav>
<h2>先固定一个输入，只问这一个输出</h2><p>例如，用 x 表示一个归一化操作变量，用 f(x) 表示尚不清楚的响应关系。先固定 x = 0，只考虑未知函数值 <strong>Z = f(0)</strong>。在概率模型中，我们可以用正态分布表达对这个值的不确定性。</p>
<p><strong>随机变量 Z</strong> 是尚未确定的量；<strong>具体数值 z</strong> 是它的一次取值。分布说明哪些取值更可能出现，并不是说一个数本身“长得像钟形曲线”。</p>
${e`Z\sim\mathcal N(\mu,\sigma^2),\qquad p(z)=\frac{1}{\sqrt{2\pi}\sigma}\exp\!\left[-\frac{(z-\mu)^2}{2\sigma^2}\right],\quad \sigma>0`}
${table(['符号','含义','在 GP 中的对应'],[[i`\mu`,'均值','某个输入处的预测中心'],[i`\sigma^2`,'方差','对该处函数值的不确定程度'],[i`\sigma`,'标准差，单位与输出相同','用来画预测带'],[i`\Phi(z)`,'标准正态累积分布函数','计算提升的概率'],[i`\varphi(z)`,'标准正态概率密度函数','计算期望提升']])}
${e`P(a\le Z\le b)=\Phi\!\left(\frac{b-\mu}{\sigma}\right)-\Phi\!\left(\frac{a-\mu}{\sigma}\right)`}
${lab('normal','实验 02 · 改变均值和标准差')}
<p>对于正态分布，${i`\mu\pm1.96\sigma`} 覆盖约 95% 的概率质量。之后 GP 图上的浅蓝带是<strong>每个位置单独的后验区间</strong>；不能据此说整条未知曲线有 95% 的概率处处落在带内。</p>
${note('到这里，我们只描述了 f(0) 一个值。若还想同时描述 f(2.5) 和 f(5)，分别画三个钟形分布够不够？还不够：它们之间如何一起变化，也需要描述。这就进入多元高斯分布。')}`},
{id:'multivariate',group:'02 / 从分布到函数',title:'多元高斯分布：把一组值联合起来',lead:'从一个数扩展到一个向量。除了每个分量的均值和方差，还要描述分量之间的协方差。',body:`
<h2>1. 同时考虑三个固定位置</h2>
${e`Z_1=f(0),\qquad Z_2=f(2.5),\qquad Z_3=f(5),\qquad\mathbf Z=\begin{bmatrix}Z_1\\Z_2\\Z_3\end{bmatrix}`}
<p>一次联合抽样给出一个三维向量，例如三个位置各得到一个函数值。这里“三元”指<strong>三个输出随机变量</strong>，即使每个输入 x 都只是一维，也可以形成三元高斯分布。</p>
<h2>2. 均值变成向量，方差扩展为矩阵</h2>
${e`\mathbf Z\sim\mathcal N(\boldsymbol\mu,\Sigma),\qquad \boldsymbol\mu=\begin{bmatrix}\mu_1\\\mu_2\\\mu_3\end{bmatrix}`}
${e`\Sigma=\begin{bmatrix}\sigma_1^2&\operatorname{Cov}(Z_1,Z_2)&\operatorname{Cov}(Z_1,Z_3)\\\operatorname{Cov}(Z_2,Z_1)&\sigma_2^2&\operatorname{Cov}(Z_2,Z_3)\\\operatorname{Cov}(Z_3,Z_1)&\operatorname{Cov}(Z_3,Z_2)&\sigma_3^2\end{bmatrix}`}
<p>对角线记录每个变量自己的方差；非对角线记录两个变量是否倾向一起变化。正协方差表示倾向于同时高于或同时低于各自均值，负协方差表示倾向于反向变化。协方差矩阵必须对称、半正定。</p>
${table(['层次','一次抽样得到什么','分布参数'],[['一元高斯','一个数 z','均值 μ、方差 σ²'],['n 元高斯','一个 n 维向量','n 维均值向量、n × n 协方差矩阵']])}
<h2>3. 什么才叫“联合高斯”？</h2><p>严格地说，如果这个随机向量的<strong>任意线性组合</strong>都服从一元正态分布（允许方差为零的退化情形），就称它服从多元高斯分布：</p>
${e`\mathbf a^T\mathbf Z\sim\mathcal N(\mathbf a^T\boldsymbol\mu,\mathbf a^T\Sigma\mathbf a),\qquad\text{对任意 }\mathbf a\in\mathbb R^n`}
${note('联合高斯必然使每个分量分别正态，但反过来不成立。把几个各自正态的变量放在一起，并不自动构成多元高斯分布；它们的联合关系也必须满足高斯结构。')}
${detail('进一步看：密度从钟形曲线变成什么？',`<p>一元密度可以画成平面里的钟形曲线；二元密度可画成两个变量上方的钟形曲面，俯视得到等高线；更高维通常使用切片或边缘分布来观察。曲面上的高度仍是概率密度。</p>${e`p(\mathbf z)=\frac{\exp[-\tfrac12(\mathbf z-\boldsymbol\mu)^T\Sigma^{-1}(\mathbf z-\boldsymbol\mu)]}{(2\pi)^{n/2}|\Sigma|^{1/2}}`}<p>该密度形式要求 Σ 正定。取 n = 1，就回到上一节的一元正态密度；Σ 半正定时也可以定义退化高斯分布，但不能直接套用这个含逆矩阵的密度式。</p>`)}
<h2>下一步：三个位置之外呢？</h2><p>目前只给出了三个位置的联合分布。但建模的目标是描述整个 x 区间上的未知函数，希望任何新位置都能纳入同一套规则。因此，需要将有限个随机变量的联合描述，扩展成由输入位置 x 索引的一族随机变量——这就是下一节的高斯过程。</p>`},
{id:'prior',group:'02 / 从分布到函数',title:'高斯过程：把规则扩展到所有输入位置',lead:'从一组固定位置的联合分布，扩展到任意有限组位置的联合分布，由此描述未知函数。',body:`
<h2>1. 先把“随机过程”这个名字讲清楚</h2><p>随机过程是一族由索引标记的随机变量。这里索引就是输入位置 x：固定 x = 0，f(0) 是一个随机变量；固定 x = 2.5，f(2.5) 是另一个。把允许区域内所有位置都纳入考虑，得到 ${i`\{f(x):x\in\mathcal X\}`}。索引也可以是温度、组成或多维操作条件，并不必须是时间。</p>
<p><strong>固定位置，看不同实现：</strong>得到这个位置的随机函数值分布。<strong>固定一次实现，看不同位置：</strong>得到一条函数样本。这是从“随机数”走向“随机函数”的关键。</p>
<h2>2. 高斯过程的定义：任取有限个位置，都联合高斯</h2>
${e`f\sim\mathcal{GP}(m,k)\quad\Longleftrightarrow\quad[f(\mathbf x_1),\ldots,f(\mathbf x_n)]^T\sim\mathcal N(\mathbf m,K)`}
${e`m(\mathbf x)=\mathbb E[f(\mathbf x)],\qquad k(\mathbf x,\mathbf x')=\operatorname{Cov}(f(\mathbf x),f(\mathbf x'))`}
<p>这里的“任取”包括任意正整数 n 和任意输入位置。只让一组固定网格上的值联合高斯，还不是完整的过程定义；换一组位置、增加一个位置，都必须遵循同一套规则。</p>
<h2>3. 为什么需要均值函数与核函数？</h2><p>多元高斯用均值向量与协方差矩阵描述固定的 n 个变量；GP 用两个函数，为任意输入集合生成相应的向量和矩阵：</p>
${e`m_i=m(x_i),\qquad K_{ij}=k(x_i,x_j)`}
<p>例如，先选择三个位置，得到 3 × 3 的 K；再增加一个位置，按相同的 k 扩展成 4 × 4。取出原来三点对应的子矩阵，仍应是原来的 K。这些有限维分布需要彼此一致，而不是每次另造一个不相容的分布。</p>
${table(['描述对象','一个值','固定 n 个值','整个输入区域上的函数'],[['名称','一元高斯分布','多元高斯分布','高斯过程'],['均值','一个数 μ','向量 μ','函数 m(x)'],['相关结构','一个方差 σ²','矩阵 Σ','核函数 k(x,x′)'],['一次抽样 / 实现','一个数','一个向量','一个函数样本']])}
<h2>4. 从一个位置的一元高斯，到多个位置的联合高斯，再到整个输入域上的高斯过程</h2><p>下面三种显示方式使用<strong>同一批函数样本</strong>。选择“一个位置”只看每条样本在 x = 0 的值；选择“三个位置”得到各自的三维向量；选择“85 个位置”看到较密的函数轨迹。切换显示范围不会重新抽样。</p>
<p>计算机只在有限网格上抽样并连接显示。<strong>85 个位置上的函数值仍服从 85 元高斯分布；图中的轨迹是高斯过程样本的有限网格展示。</strong>增加绘图点，是让我们更清楚地观察同一过程；<strong>不是点数达到某个阈值后，多元高斯才突然变成高斯过程</strong>。样本的平滑程度由核决定，并非“高斯”二字自动保证。</p>
${lab('prior','实验 03 · 从一个数、一个向量到函数轨迹')}
${note('<strong>每个点都服从正态分布，并不意味着点与点彼此独立。</strong> 核函数把这些点连接起来，才形成有结构的随机函数。')}
<p>GP 不必预先限定一个有限参数的显式函数式，但仍通过均值和核函数作出假设。接下来再讨论“知道部分函数值以后，怎样更新这些可能的函数”，就进入条件分布与 GP 回归。</p>
${detail('笔记拓展：从随机参数的线性模型理解核',`${e`f(\mathbf x)=\boldsymbol\phi(\mathbf x)^T\mathbf w,\qquad\mathbf w\sim\mathcal N(0,\Sigma_w)`}${e`k(\mathbf x,\mathbf x')=\boldsymbol\phi(\mathbf x)^T\Sigma_w\boldsymbol\phi(\mathbf x')`}<p>同一组随机权重作用于不同输入，导致输出相关。有限维特征已能构成 GP；选择合适的无限维特征或谱表示，还可以得到 RBF 等核。不需要先学习这条路线，才能使用后面的条件预测公式。</p>`)} `},
{id:'joint',group:'03 / 用数据更新 GP',title:'知道一个值，为什么能推断另一个？',lead:'现在已经定义了高斯过程，接下来用最简单的二元高斯，理解“得到观测后怎样更新认识”。',body:`
<p>上一阶段讨论的是<strong>先验：还没看到数据时，怎样描述可能的函数</strong>。现在假设已经知道其中一个函数值，需要推断另一个；这个操作叫“取条件分布”。为看清计算，先回到两个随机变量的例子。</p>
${e`\begin{bmatrix}Z_1\\Z_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}0\\0\end{bmatrix},\begin{bmatrix}1&\rho\\\rho&1\end{bmatrix}\right),\qquad |\rho|<1`}
<p>两个边缘分布都是标准正态，但 ${i`\rho`} 决定它们是否倾向一起增大。联合密度的等高线因此可以从圆形变成倾斜的椭圆。</p>
${e`Z_2\mid Z_1=a\sim\mathcal N(\rho a,\,1-\rho^2)`}
<p>若 ${i`\rho=0.8`}，观测 ${i`Z_1=1`}，对 ${i`Z_2`} 的预测均值变成 0.8，标准差从 1 降到 0.6。若相关性为零，在联合高斯假设下，两者独立，看到第一个值并不能帮助预测第二个。</p>
${lab('joint','实验 04 · 联合分布与条件分布')}
${detail('展开推导：将相关部分与独立残差分开',`<p>取两个相互独立的标准正态变量 ${i`U,V`}，构造：</p>${e`Z_1=U,\qquad Z_2=\rho U+\sqrt{1-\rho^2}\,V`}<p>于是两个变量方差都是 1，协方差为 ${i`\rho`}。一旦已知 ${i`Z_1=a`}，右式中的 U 就被固定为 a，剩下的 V 仍是独立标准正态。这直接给出条件均值和条件方差。</p>`)}
${detail('多变量密度的完整形式',`${e`p(\mathbf z)=\frac{\exp[-\tfrac12(\mathbf z-\boldsymbol\mu)^T\Sigma^{-1}(\mathbf z-\boldsymbol\mu)]}{(2\pi)^{n/2}|\Sigma|^{1/2}}`}<p>此密度表达式要求 ${i`\Sigma\succ0`}。协方差矩阵也可以半正定，此时仍可定义退化高斯分布，但不能直接使用这个含逆矩阵和行列式的密度式。仅知道每个分量分别正态，还不足以保证联合高斯。</p>`)} `},
{id:'notation',group:'03 / 用数据更新 GP',title:'先把矩阵里每个对象对上号',lead:'输入维数 d、样本数 n、预测点数 q 是三件不同的事。',body:`
${table(['对象','大小','含义'],[[i`\mathbf x_i`,i`d\times1`,'第 i 次实验的输入向量'],[i`X=[\mathbf x_1^T;\ldots;\mathbf x_n^T]`,i`n\times d`,'每一行是一组输入'],[i`\mathbf y`,i`n\times1`,'已观测输出'],[i`\mathbf m=m(X)`,i`n\times1`,'训练点的先验均值'],[i`K_{ij}=k(\mathbf x_i,\mathbf x_j)`,i`n\times n`,'训练点的潜在函数值协方差'],[i`K_y=K+\sigma_\epsilon^2 I`,i`n\times n`,'带独立同方差噪声的观测协方差'],[i`k_*=k(X,\mathbf x_*)`,i`n\times1`,'训练点与一个预测点之间的协方差'],[i`k_{**}=k(\mathbf x_*,\mathbf x_*)`,'标量','预测点的先验函数方差']])}
${e`y_i=f(\mathbf x_i)+\epsilon_i,\qquad\epsilon_i\overset{\mathrm{iid}}\sim\mathcal N(0,\sigma_\epsilon^2)`}
${note('<strong>核矩阵计算的是输出之间的协方差。</strong> 输入位置只负责告诉我们“比较的是哪两个输出”。对输入数据求经验协方差，得到的是 d × d 矩阵；它不是这里的 n × n 核矩阵。')}
<p>例如，5 次实验，每次控制温度与进料比两个变量：X 是 5 × 2，而 K 是 5 × 5。即使要预测 1000 个位置，已有的训练核矩阵仍是 5 × 5。</p>`},
{id:'posterior',group:'03 / 用数据更新 GP',title:'预测公式来自条件高斯分布',lead:'将“已经看到的值”和“还不知道的值”放进同一个联合分布，再对已知部分取条件。',body:`
<h2>1. 写出联合分布</h2>
${e`\begin{bmatrix}\mathbf y\\ f_*\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mathbf m\\m_*\end{bmatrix},\begin{bmatrix}K_y&k_*\\k_*^T&k_{**}\end{bmatrix}\right)`}
<p>${i`f_*=f(\mathbf x_*)`} 是待预测的潜在函数值，${i`m_*=m(\mathbf x_*)`}。此处已经以输入位置和给定超参数为条件，只是省略了它们。</p>
<h2>2. 用数据修正均值，缩小方差</h2>
${e`f_*\mid\mathcal D_n\sim\mathcal N(\mu_*,s_*^2)`}
${e`\mu_*=m_*+k_*^T K_y^{-1}(\mathbf y-\mathbf m)`}
${e`s_*^2=k_{**}-k_*^T K_y^{-1}k_*`}
${table(['部分','怎么读'],[[i`\mathbf y-\mathbf m`,'观测与先验预测相差多少'],[i`k_*^T K_y^{-1}`,'考虑训练点相互相关后，如何利用这些差异'],[i`k_{**}`,'还没看数据时的不确定性'],[i`k_*^TK_y^{-1}k_*`,'观测所解释掉的不确定性，非负']])}
${detail('展开推导：构造与观测独立的残差',`<p>定义未被观测解释的部分：</p>${e`r=f_*-m_*-k_*^TK_y^{-1}(\mathbf y-\mathbf m)`}${e`\operatorname{Cov}(\mathbf y,r)=k_*-K_yK_y^{-1}k_*=0`}<p>r 和观测是联合高斯且不相关，所以相互独立。代入并展开方差，得到：</p>${e`\operatorname{Var}(r)=k_{**}-k_*^TK_y^{-1}k_*`}<p>给定观测后，表达式中的数据部分变成确定的均值修正；独立残差保留上式方差。这就是条件预测公式，也解释了方差中的减号。</p>`)}
${detail('两点手算：矩阵公式如何变成数字',`<p>设零均值、无噪声，训练核矩阵、观测和交叉协方差如下：</p>${e`K=\begin{bmatrix}1&0.5\\0.5&1\end{bmatrix},\quad\mathbf y=\begin{bmatrix}1\\0\end{bmatrix},\quad k_*=\begin{bmatrix}0.5\\0.5\end{bmatrix},\quad k_{**}=1`}${e`K^{-1}=\begin{bmatrix}4/3&-2/3\\-2/3&4/3\end{bmatrix},\quad K^{-1}\mathbf y=\begin{bmatrix}4/3\\-2/3\end{bmatrix}`}${e`\mu_*=1/3,\qquad s_*^2=1-1/3=2/3`}<p>这里写逆矩阵是为手算看清关系；实际程序会求解线性方程组。</p>`)}
${note('若预测的是一次新的带噪观测 y*，其方差还需加上噪声方差：s*² + σɛ²。潜在函数的不确定性和实验测量的波动不是同一件事。')}
<p class="small">核对阅读：<a href="https://gaussianprocess.org/gpml/chapters/RW2.pdf" target="_blank" rel="noopener">Rasmussen & Williams，GPML 第 2 章，式 (2.22)–(2.24)</a>。</p>`},
{id:'regression',group:'03 / 用数据更新 GP',title:'加入一个数据点，会改变什么？',lead:'从局部的三个观测开始，观察远处的新数据如何改变预测。',body:`
<p>教学函数取 ${i`f(x)=\sin x`}，初始观测在 x = 0.3、0.5、0.7。选择新位置，点击“观测此处”，网页才把该点的函数值加入训练集。这是模拟真实评估，不是把整条真值曲线拿去训练。</p>
${lab('regression','实验 05 · 一维 GP 回归')}
<h2>按这个顺序观察</h2><ol><li>先不添加数据：三个点附近较确定，远处逐渐回到零均值先验。</li><li>在 x = 2 或 4 加点：均值与区间在新点周围一起更新。</li><li>增大模型噪声：模型对单次观测更保留，预测均值不再必须穿过数据点。</li></ol>
${note('固定输入、核超参数和噪声后，GP 后验方差不依赖观测值 y；均值依赖 y。若加入数据后重新拟合超参数，方差也可能因为参数变化而增大。')}
<p>本实验的数据是无噪声的正弦值，滑块调节的是<strong>模型假设的噪声标准差</strong>，便于单独查看信任程度的影响。浅蓝带始终表示潜在函数的逐点区间；灰色真值仅用于教学核对。</p>`},
{id:'kernels',group:'04 / 模型怎样选',title:'核函数把“相似”变成可计算的假设',lead:'长度尺度控制影响范围，核的类型控制平滑方式；这两者不能混为一谈。',body:`
${e`r^2=\sum_{j=1}^{d}\frac{(x_j-x'_j)^2}{\ell_j^2},\qquad k_{\mathrm{RBF}}(\mathbf x,\mathbf x')=\sigma_f^2\exp(-r^2/2)`}
<p>${i`\sigma_f`} 控制先验函数幅度；${i`\ell_j`} 是第 j 维的长度尺度。同样的距离，在较大的长度尺度下表示更相似。各维使用不同长度尺度称为 ARD；其数值不能脱离输入单位直接比较。</p>
<h2>长度尺度短或长，分别意味着什么？</h2>
<p>以 RBF 核为例，保持幅度不变，只改变长度尺度：</p>
${table(['长度尺度','不同位置的关系','函数样本通常表现'],[['较短','只有很近的位置才强相关','变化快，起伏较密'],['较长','相距较远的位置仍强相关','变化慢，较大范围内的值更接近']])}
${note('<strong>核曲线接近零，不代表函数值彼此接近。</strong> 短尺度时，不同位置的相关性很快减弱，函数值可以各自变化；核矩阵的非对角元素可能很小，但对角线仍是各位置自身的方差 σf²。')}
<p class="small">下面展示的是尚未加入观测数据的先验函数样本。这里先讨论不同位置的函数值如何相关；加入数据后，长度尺度才进一步体现为一个观测影响多大范围的预测。</p>
${e`k_{3/2}(r)=\sigma_f^2(1+\sqrt3r)e^{-\sqrt3r},\qquad k_{5/2}(r)=\sigma_f^2(1+\sqrt5r+5r^2/3)e^{-\sqrt5r}`}
<p>这是 Matérn 核的两个常用特例。Matérn 的 ${i`\nu`} 决定均方可微程度；${i`\nu=1/2`} 为指数核，较粗糙；RBF 在均方意义下无限可微。改变长度尺度会改变变化的快慢，但不改变这一光滑性类别。</p>
${lab('kernels','实验 06 · 核曲线、函数样本与核矩阵')}
${detail('其他核与正半定条件',`${table(['核','含义'],[['有理二次核','实验取形状参数 α = 1；可理解为不同长度尺度 RBF 的混合。'],['周期核','相差一个周期也高度相关，说明“越近越相关”并非所有核的普遍规则。']])}${e`k_{\mathrm{RQ}}(r)=\sigma_f^2\left(1+\frac{r^2}{2\alpha}\right)^{-\alpha},\quad\alpha>0`}${e`k_{\mathrm{per}}(x,x')=\sigma_f^2\exp\!\left[-\frac{2\sin^2(\pi(x-x')/p)}{\ell^2}\right]`}<p>有效核必须对任意有限输入集合形成对称半正定矩阵：</p>${e`\mathbf c^TK\mathbf c=\operatorname{Var}\!\left(\sum_i c_i f(\mathbf x_i)\right)\ge0`}<p>仅“长得像相似度”还不够。有效核的非负加权和与乘积也能构造有效核；将白噪声项加入观测对角线时，需要明确预测的是函数还是新观测。</p>`)} `},
{id:'bayes',group:'04 / 模型怎样选',title:'贝叶斯更新：超参数固定，模型也能更新',lead:'先说明贝叶斯定理怎样使用新数据，再分清“更新函数预测”和“重新学习超参数”。',body:`
<h2>1. 刚才调的参数，在真实问题中由谁确定？</h2>
<p>前面的实验由我们指定长度尺度、幅度和噪声。将这些量合记为 ${i`\eta=(\ell_1,\ldots,\ell_d,\sigma_f,\sigma_\epsilon)`}。例如固定 ℓ = 1，表示暂时接受这一相关性假设；它不意味着预测曲线也固定不变。</p>
${table(['要解决的问题','固定什么，改变什么？','在哪里学习'],[['给定模型做预测','给定数据和超参数，计算各位置的均值与方差','前面的条件高斯预测'],['来了新数据，更新预测','超参数可以不变，数据集增大，条件分布随之改变','本节：贝叶斯更新'],['超参数取什么更合适','给定已有数据，比较或推断不同超参数','下一节：MLE、MAP、完全贝叶斯'],['下一次实验做在哪里','使用当前预测，选择值得评估的输入','后面的采集函数与 BO 循环']])}
<h2>2. 贝叶斯定理：用数据修正原有认识</h2>
<p>用 θ 表示某个未知量，用 D 表示已经得到的数据。联合分布有两种写法：</p>
${e`p(\theta,D)=p(D\mid\theta)p(\theta)=p(\theta\mid D)p(D)`}
${e`\underbrace{p(\theta\mid D)}_{\text{后验}}=\frac{\underbrace{p(D\mid\theta)}_{\text{似然}}\,\underbrace{p(\theta)}_{\text{先验}}}{\underbrace{p(D)}_{\text{证据}}},\qquad p(D)=\int p(D\mid\theta)p(\theta)\,d\theta`}
<p>先验描述看数据前的认识；似然衡量“假设 θ 如此，眼前数据有多相容”；两者相乘，再除以归一化常数，就得到后验。连续变量这里使用的是<strong>概率密度</strong>，不是取某个精确数值的概率。</p>
${detail('一个小例子：同样的数据怎样改变两种解释的权重？',`<p>暂时只比较两个假设 A、B，先验权重各为 0.5。某次观测在 A、B 下的似然分别为 0.8、0.2，则未归一化权重为 0.4、0.1；除以总和 0.5 后，后验权重变为 0.8、0.2。GP 将这类“按数据重新加权”的思想用于函数值，也可以用于超参数。</p>`)}
<h2>3. 固定超参数：更新的是未知函数</h2>
<h3>先读懂竖线：什么是条件概率？</h3>
<p>${i`p(A\mid B)`} 读作“<strong>给定 B 时，A 的条件概率</strong>”；对于这里的连续变量，更准确地说是条件概率密度。竖线左边是要描述的未知量，右边是已知或暂时固定的条件。${i`p(\mathbf f\mid\mathcal D,\eta)`} 就是“给定观测数据 D 和超参数 η 时，函数值 f 的分布”；逗号表示同时给定这些条件。</p>
<p>所以，你可以把这里理解为：<strong>仍然使用贝叶斯定理，只是整个推断都在给定 η 的前提下进行。</strong>例如暂时固定 ℓ = 1，再用观测更新函数值；此时并没有推断 ℓ 本身。η 在竖线后面，不表示它永远已知，只表示这一层计算先把它固定。</p>
<p>取若干位置上的函数值组成向量 ${i`\mathbf f`}，并令观测满足 ${i`\mathbf y=\mathbf f+\boldsymbol\epsilon`}。给定 η 后，GP 给出高斯先验，独立高斯测量噪声给出高斯似然：</p>
${e`p(\mathbf f\mid X,\mathbf y,\eta)=\frac{p(\mathbf y\mid\mathbf f,X,\eta)\,p(\mathbf f\mid X,\eta)}{p(\mathbf y\mid X,\eta)}`}
<p>这里 ${i`\mathcal D=(X,\mathbf y)`}，因此左边也可写成 ${i`p(\mathbf f\mid\mathcal D,\eta)`}。在本节的独立同方差噪声模型下，给定这些位置的函数值 f 后，观测 y 的分布不再额外依赖 X，所以似然中可以省略 X。分母不随待推断的 f 改变，省略这个归一化因子后，就得到：</p>
${e`p(\mathbf f\mid\mathcal D,\eta)\propto p(\mathbf y\mid\mathbf f,\eta)\,p(\mathbf f\mid X,\eta)`}
<p class="small">符号 ∝ 表示“成正比”，不能直接换成等号。同样，上面的通用贝叶斯公式省略分母后，应写为 ${i`p(\theta\mid D)\propto p(D\mid\theta)p(\theta)`}。先验中也可以有条件：这里“先验”指尚未使用观测输出 y，并非连输入位置 X 和超参数 η 都不知道。</p>
<p>高斯先验乘以高斯似然，整理后仍是高斯分布。因此，<a href="#posterior">第 8 节的条件预测公式</a>就是这个贝叶斯推断的解析结果，不需要每次再用优化算法搜索函数值。无噪声情形可直接按联合高斯取条件理解。</p>
<p>现在得到新观测 ${i`(\mathbf x_{n+1},y_{n+1})`}，令 ${i`\mathcal D_{n+1}=\mathcal D_n\cup\{(\mathbf x_{n+1},y_{n+1})\}`}。旧的后验成为下一轮更新的起点：</p>
${e`p(\mathbf f\mid\mathcal D_{n+1},\eta)\propto p(y_{n+1}\mid\mathbf f,\mathbf x_{n+1},\eta)\,p(\mathbf f\mid\mathcal D_n,\eta)`}
<p class="small">此式的函数向量包含新观测位置；假设给定函数值后各次测量噪声独立。固定 η 时，逐次条件化与用全部数据一次条件化结果相同。程序可以直接扩大训练矩阵、重新计算预测。</p>
${note('<strong>更新模型不等于必须重选超参数。</strong> 只增加数据、保持 ℓ 等参数不变，预测均值和方差就会更新。固定模型下，新增观测不会增加同一位置的理论后验方差；若同时重新拟合超参数，则没有这个统一保证。')}
<h2>4. 超参数也不确定：再增加一层推断</h2>
<p>如果不知道该选 ℓ = 0.3 还是 ℓ = 2，就把 η 本身当作未知量。此时贝叶斯定理的形式不变，但未知对象从函数值换成超参数：</p>
${e`p(\eta\mid\mathcal D)=\frac{p(\mathbf y\mid X,\eta)p(\eta)}{\int p(\mathbf y\mid X,\eta')p(\eta')\,d\eta'}`}
${table(['对象','问题'],[[i`p(f_*\mid\mathcal D,\eta)`,'假设超参数已知，新的函数值是什么？'],[i`p(\mathbf y\mid X,\eta)`,'某组超参数下，这组观测有多合理？'],[i`p(\eta)`,'看数据之前，对超参数的认识'],[i`p(\eta\mid\mathcal D)`,'看数据之后，哪些超参数更可信？']])}
<p>下一节再回答：是选最能解释数据的一组 η，结合先验选一组 η，还是保留多种 η 的可能性？它们分别引出 MLE、MAP 和完全贝叶斯方法。</p>
<h2>5. 这些更新怎样进入贝叶斯优化？</h2>
<div class="takeaway"><strong>已有数据 → 当前 GP 预测 → 采集函数选点 → 真实评估 → 新数据回到 GP</strong><p>更新函数预测是循环的一部分；重新学习超参数是可选的模型调整，可以每轮做，也可以间隔若干轮做。贝叶斯定理回答“如何更新认识”，采集函数回答“下一次去哪里观察”。</p></div>
<p><a href="#hyperparameters">继续：超参数学习的三种处理方式 →</a>　<a href="#bo">查看完整 BO 循环</a></p>`},
{id:'hyperparameters',group:'04 / 模型怎样选',title:'超参数怎样学：MLE、MAP 与完全贝叶斯',lead:'先确定要解决的统计问题，再选择优化或积分算法；三种方法是不同选择，不是先后执行的三个步骤。',body:`
<h2>1. 共同的问题：不知道 η，该怎样利用数据？</h2>
<p>前面的 GP 预测公式要求给定超参数 η，例如长度尺度 ℓ。但现有数据可能同时支持几种不同的长度尺度。三种方法处理的是<strong>同一份数据、同一组未知超参数</strong>，区别在于最终保留什么结果。</p>
${table(['方法','从数据中获得什么？','然后怎样预测？'],[['MLE','一组使边际似然最大的超参数','将这一组参数代入 GP'],['MAP','一组使后验密度最大的超参数','将这一组参数代入 GP'],['完全贝叶斯','超参数的后验分布：不同取值各有多可信','综合不同参数下的预测分布']])}
${note('<strong>完全贝叶斯不是“不学习超参数”，而是把学习结果保留为一个分布。</strong> η 仍然是待推断的量；只是计算目标从“找到一个最优 η”变为“确定不同 η 的后验权重”。三种方法是不同选择，不是依次执行的三个步骤。')}
${detail('共同的数据评分：为什么叫“边际”似然？',`
<p>固定一组 η 时，函数值还不确定。把所有可能的训练函数值按 GP 先验加权积分，才能得到这组 η 对观测数据的解释：</p>
${e`p(\mathbf y\mid X,\eta)=\int p(\mathbf y\mid\mathbf f,\eta)\,p(\mathbf f\mid X,\eta)\,d\mathbf f`}
<p>这里被积分掉的是<strong>函数值 f</strong>，并没有积分掉超参数 η。由于高斯函数值加上独立高斯噪声仍然高斯，观测向量服从 ${i`\mathbf y\sim\mathcal N(\mathbf m,K_y)`}，其中 ${i`K_y=K_\eta+\sigma_\epsilon^2I`}。把它的密度取对数，得到一个可计算的评分：</p>
${e`\log p(\mathbf y\mid X,\eta)=-\frac12\mathbf r^TK_y^{-1}\mathbf r-\frac12\log|K_y|-\frac n2\log(2\pi),\qquad\mathbf r=\mathbf y-\mathbf m`}
${table(['项','直观作用'],[[i`-\tfrac12\mathbf r^TK_y^{-1}\mathbf r`,'数据匹配：观测残差在这个协方差结构下是否合理'],[i`-\tfrac12\log|K_y|`,'归一化与复杂度权衡：不能只看拟合残差'],[i`-\tfrac n2\log(2\pi)`,'样本数固定时为常数']])}
`)}
<h2>2. MLE 与 MAP：最终选出一组参数</h2>
<p>记 ${i`L(\eta)=p(\mathbf y\mid X,\eta)`} 为边际似然：固定 η 后，已有观测在模型下的密度。把数据固定、改变 η，它就是比较候选超参数的数据评分。</p>
${e`\widehat\eta_{\mathrm{MLE}}=\arg\max_\eta\log p(\mathbf y\mid X,\eta)`}
${e`\widehat\eta_{\mathrm{MAP}}=\arg\max_\eta\big[\log p(\mathbf y\mid X,\eta)+\log p(\eta)\big]`}
<p>MLE 与 MAP 将得到的一组参数代回 GP 预测公式。MAP 可以略去贝叶斯公式的分母，因为它不随候选 η 改变；取对数不改变最大值所在位置。只有先验在所考虑的参数化和区域内为常数时，两者目标才相同。</p>
${e`p(f_*\mid\mathcal D,\widehat\eta)=\mathcal N\!\left(f_*;\mu_*(\widehat\eta),s_*^2(\widehat\eta)\right)`}
<p>这里 ${i`f_*=f(\mathbf x_*)`} 是待预测位置的函数值。选定 η 后，函数值仍有预测不确定性；只是超参数本身的不确定性没有继续保留。</p>
<h2>3. 完全贝叶斯：先求参数分布，再综合预测</h2>
<h3>第一步：哪些 η 更可信？</h3>
${e`p(\eta\mid\mathcal D)=\frac{L(\eta)p(\eta)}{\int L(\eta')p(\eta')\,d\eta'}`}
<p>这一部分与 MAP 使用的是<strong>同一个超参数后验</strong>。MAP 找它的最高点；完全贝叶斯保留它在整个参数空间的分布。程序得到的可以是一组网格点及其权重，也可以是代表后验的样本，不一定要得到一条解析公式。</p>
<h3>第二步：这些 η 分别预测什么，再怎样合起来？</h3>
${e`p(f_*\mid\mathcal D)=\int p(f_*\mid\mathcal D,\eta)\,p(\eta\mid\mathcal D)\,d\eta`}
<p>把这条式子读成：<strong>每组 η 对应的预测分布 × 这组 η 的后验权重，再对所有 η 加起来。</strong>这是条件全概率公式，也叫对超参数进行边缘化。它是在使用第一步的结果做预测，并没有展示第一步怎样求出后验；只看这一条式子，就容易觉得“没有待调整的参数”。</p>
${note('执行完成后有两类结果：① 超参数后验，说明哪些参数更可信；② 综合预测分布，可进一步算均值、方差和区间。这里平均的是整个预测分布，不是先把 η 平均后代入一个 GP。')}
<h2>4. 用同一组候选，把三种方法算一遍</h2>
<p>为方便手算，暂时假设长度尺度<strong>只可能取下面三个值</strong>。数据评分是人为设定的相对似然，仅用于解释方法，不是下方实验的计算结果。先验列是这三个离散假设的概率。</p>
${table(['长度尺度 ℓ','相对似然 L','先验概率','L × 先验','后验概率'],[['0.5','2','0.6','1.2','0.6'],['1.0','3','0.2','0.6','0.3'],['2.0','1','0.2','0.2','0.1']])}
<p>最后一列来自归一化：三个乘积之和为 2，所以后验概率分别为 1.2/2、0.6/2、0.2/2。</p>
<ul><li><strong>MLE：</strong>只比较似然列，3 最大，选择 ℓ = 1。</li><li><strong>MAP：</strong>比较后验列，0.6 最大，选择 ℓ = 0.5。</li><li><strong>完全贝叶斯：</strong>保留三个后验权重 0.6、0.3、0.1，让三种预测都参与。</li></ul>
${e`p(f_*\mid\mathcal D)=0.6\,p(f_*\mid\mathcal D,\ell=0.5)+0.3\,p(f_*\mid\mathcal D,\ell=1)+0.1\,p(f_*\mid\mathcal D,\ell=2)`}
<p>这就是前面积分的离散版本。每一项都是一个 GP 预测分布，加起来得到混合分布，一般不再是单一高斯。若新数据更支持长尺度，对应的后验权重就会增加，综合预测也随之更新。</p>
${detail('进一步看：综合预测均值与方差怎样算？',`<p>设各候选在同一预测位置给出的均值为 μⱼ、方差为 sⱼ²，后验权重为 wⱼ，则：</p>${e`\bar\mu=\sum_j w_j\mu_j,\qquad \bar s^2=\sum_jw_j\left[s_j^2+(\mu_j-\bar\mu)^2\right]`}<p>例如三种预测的均值分别为 1、2、3，方差都为 0.25，使用上面的权重 0.6、0.3、0.1，得到均值 1.5、方差 0.70。其中 0.25 来自各模型内部的不确定性，额外的 0.45 来自模型之间的预测差异。</p>`)}
${detail('为什么只代入一组参数会遗漏一部分不确定性？',`${e`\operatorname{Var}(f_*\mid\mathcal D)=\mathbb E_\eta[s_*^2(\eta)]+\operatorname{Var}_\eta[\mu_*(\eta)]`}<p>第一项是每个模型内部的预测不确定性；第二项是不同超参数模型之间的预测差异。单个点估计不会显式保留第二项。</p>`)}
<h2>5. 再回到连续长度尺度：动手做 MLE</h2>
<p>调节 ℓ 相当于提出一个候选模型。左图给它的对数边际似然评分，右图给这个模型的预测；点击最优尺度按钮，就把扫描中评分最高的候选用于预测。这个实验没有给 η 加先验，也没有进行完全贝叶斯积分。</p>
${lab('likelihood','实验 07 · 长度尺度与对数边际似然')}
<p>本实验只扫描一个长度尺度，幅度固定为 1、噪声标准差固定为 0.08，均值固定为零。标出的最好尺度仅是<strong>该区间网格上的最大值</strong>，不等于完整超参数空间的全局最优。</p>
<h2>6. 连续参数下，完全贝叶斯具体怎样执行？</h2>
<p>如果只有一个长度尺度，可以在覆盖主要后验质量的范围内，取足够密的<strong>等间距网格</strong> ℓ₁,…,ℓₘ。分别计算似然与先验密度，再归一化：</p>
${e`w_j=\frac{L(\ell_j)p(\ell_j)}{\sum_{r=1}^{M}L(\ell_r)p(\ell_r)},\qquad p(f_*\mid\mathcal D)\approx\sum_{j=1}^{M}w_jp(f_*\mid\mathcal D,\ell_j)`}
<p>这里的 wⱼ 是网格积分的近似权重，不是连续参数恰好等于 ℓⱼ 的概率。非等间距网格还须计入积分权重；若在 log ℓ 上建网格，也要使用相应变量变换后的密度。</p>
<p>只有一个 ℓ 时可以像实验一样扫描网格；多个长度尺度、幅度和噪声一起变化时，网格代价迅速增加。MLE、MAP 的目标又一般不能直接解出最大值，于是需要梯度优化、多初值搜索等算法。完全贝叶斯面临的是积分问题，所需算法不同。</p>
${detail('MCMC 的输出是什么？为什么样本可以用于预测？',`<p>MCMC 通过设计在参数空间移动的规则，使生成的样本在充分收敛后代表目标后验 p(η | D)。它寻找的是代表整个分布的样本，不是不断向最高点移动直到停下。获得 M 个可用于估计的后验样本 η⁽¹⁾,…,η⁽ᴹ⁾ 后，可以近似：</p>${e`p(f_*\mid\mathcal D)\approx\frac1M\sum_{j=1}^{M}p(f_*\mid\mathcal D,\eta^{(j)})`}<p>这里每个样本等权，因为样本出现的频率已经体现后验权重，无需再乘一次似然。实际仍须检查收敛和有效样本量；相邻 MCMC 样本通常相关。</p>`)}
${note('新数据会改变边际似然，因此可能改变最合适的超参数。但即使没有新数据，第一次拟合模型时也已经需要解决超参数选择问题。是否每轮重新拟合，是精度与计算成本之间的选择。')}
<p class="small">进一步阅读：<a href="https://gaussianprocess.org/gpml/chapters/RW5.pdf" target="_blank" rel="noopener">GPML 第 5 章：模型选择与超参数学习</a>。预测和似然里的矩阵运算统一放到后面的<a href="#numerics">计算实现</a>。</p>
${detail('连接前面的数值优化课程',`<p>实际常对正超参数的对数使用梯度优化，并尝试多个初始点。零均值或均值不依赖 η 时，令 ${i`\boldsymbol\alpha=K_y^{-1}\mathbf y`}，有：</p>${e`\frac{\partial\log p(\mathbf y\mid X,\eta)}{\partial\eta_j}=\frac12\operatorname{tr}\!\left[(\boldsymbol\alpha\boldsymbol\alpha^T-K_y^{-1})\frac{\partial K_y}{\partial\eta_j}\right]`}<p>这使 GP 超参数拟合变成一个可用梯度方法处理的优化问题。若均值也有待估参数，应加入均值对参数的导数贡献。</p>`)} `},
{id:'acquisition',group:'05 / 从预测到决策',title:'下一点：均值更低，还是更不确定？',lead:'采集函数把两种价值转为一个便宜的分数。下面统一讨论最小化、无噪声目标。',body:`
<p>到这里，我们已经能给定或学习超参数，再利用已有数据计算 GP 后验。现在换一个问题：<strong>不是寻找更合适的 η，而是选择下一次实验输入 x。</strong>下面的 EI、PI 和 LCB 使用预测均值与不确定性来给候选输入打分；它们不负责拟合超参数。</p>
<p>当前最好观测 ${i`f_{\min}=\min_i y_i`}。候选位置的后验为 ${i`f(x)\mid\mathcal D\sim\mathcal N(\mu(x),s^2(x))`}。令提升门槛 ${i`\xi\ge0`}，并记：</p>
${e`I(x)=\max\{f_{\min}-f(x)-\xi,0\},\quad\delta=f_{\min}-\mu(x)-\xi,\quad z=\delta/s(x)`}
${table(['策略','公式（s > 0）','选择方向'],[['PI：提升概率',i`\mathrm{PI}(x)=\Phi(z)`,'最大化 PI'],['EI：期望提升',i`\mathrm{EI}(x)=\delta\Phi(z)+s(x)\varphi(z)`,'最大化 EI'],['LCB：置信下界',i`\mathrm{LCB}(x)=\mu(x)-\kappa s(x)`,'最小化 LCB']])}
<p>PI 只关心“有没有超过门槛”；EI 还考虑提升有多大；LCB 用 ${i`\kappa\ge0`} 决定对不确定性的奖励。${i`\xi`} 不改变 GP，只改变“值得提升”的标准，通常会降低对当前最好点附近微小改进的偏好。</p>
${lab('acquisition','实验 08 · 比较 EI、PI 与 LCB 的建议')}
${detail('EI 为什么是这两项？',`<p>令 ${i`F=\mu+sZ`}，其中 Z 为标准正态。只在 ${i`Z<z`} 时产生正提升：</p>${e`\mathbb E[I]=\int_{-\infty}^{z}(\delta-st)\varphi(t)\,dt=\delta\Phi(z)+s\varphi(z)`}<p>最后一步用到 ${i`\varphi'(t)=-t\varphi(t)`}。当 s = 0 时，直接计算确定的提升 ${i`\max(\delta,0)`}；PI 按是否严格超过门槛取 0 或 1，避免除零。</p>`)}
${detail('如果目标是最大化，怎么对应到 UCB？',`${e`\delta=\mu-f_{\max}-\xi,\qquad z=\delta/s`}${e`\mathrm{UCB}(x)=\mu(x)+\kappa s(x),\qquad x_{n+1}=\arg\max_x\mathrm{UCB}(x)`}<p>最大化时，EI 和 PI 仍按较大者选择，但改用新的 δ。最小化也可最大化分数 −μ + κs；它与最小化 LCB 完全等价。</p>`)}
${note('有噪声时，最小观测可能只是一次幸运的负噪声。这里的无噪声 EI 不能直接当作完整的噪声感知策略；应考虑潜在函数、重复评估或 noisy EI 等方法。')}`},
{id:'bo',group:'05 / 从预测到决策',title:'亲手走完一轮贝叶斯优化',lead:'看模型 → 看建议 → 做一次真实评估 → 更新模型。采集函数不直接给出最终答案。',body:`
<h2>每轮哪些事必须做，哪些事可以选择做？</h2>
${table(['环节','输入 → 输出','是否每轮进行'],[['函数预测更新','当前数据与超参数 → GP 后验均值、方差','每次加入新数据后更新'],['超参数学习','当前数据 → η 的点估计或后验分布','可固定、每轮重拟合或间隔重拟合'],['采集函数优化','当前 GP 预测 → 下一次评估的输入 x','每轮选点'],['真实评估','选中的 x → 新观测 y','每轮消耗评估预算']])}
<p>这里有两个不同的优化问题：MLE/MAP 可以优化<strong>超参数 η</strong>，采集函数优化的是<strong>实验输入 x</strong>。它们都可能使用数值优化，但目标和变量不同。</p>
<pre class="algorithm">输入：允许区域 𝒳，总预算 N，初始样本数 n₀ ≤ N
1. 在 𝒳 内设计 n₀ 个点，调用评估器，获得数据 D
2. 当观测数 n &lt; N 时：
   可选：用当前 D 重新学习超参数；否则沿用已有超参数
   用当前 D 与超参数计算 GP 后验预测
   在 𝒳 内最大化 EI 或 PI；或最小化 LCB
   在选定的 xₙ₊₁ 上运行真实评估器，得到 yₙ₊₁
   将新观测加入 D，令 n ← n + 1
3. 返回已评估点中的最好可行解，并进行确认</pre>
${lab('bo','实验 09 · 用 12 次评估寻找较小值')}
<p>实验取 ${i`f(x)=\sin x+0.15\sin(2.7x),\;x\in[0,10]`}，3 个固定初始观测，最多再增加 9 个。模型使用固定 RBF、长度尺度 1、零均值、无观测噪声。<strong>本实验每轮更新函数预测，但不重新学习超参数</strong>，便于单独观察“选点—观测—更新”的循环。候选仅在 401 点网格中搜索；已评估网格位置被排除。</p>
${note('“已观察到的最好值”只可能保持或降低；模型推荐点的真实值未必更好。一次没有改进的实验，仍可能帮助排除一个看似有希望的区域。')}
<p>显示真值只用于课后核对；选点计算仅访问已有观测和 GP 预测。停止于预算不代表证明了全局最优，采集函数本身的优化也有误差。</p>`},
{id:'multid',group:'05 / 从预测到决策',title:'两个输入，不等于两个输出',lead:'将一维的“曲线”变成二维的“响应面”，预测公式保持不变。',body:`
${e`\mathbf x=(x_1,x_2)^T,\qquad f(\mathbf x)=\sin x_1+\cos x_2,\qquad (x_1,x_2)\in[0,5]^2`}
<p>每个位置仍只有一个标量输出。输入向量有两个分量，核函数中的距离需要同时考虑两个方向的长度尺度。</p>
${lab('multid','实验 10 · 二维预测与最大方差采样')}
<p>这次用最大后验方差来选择新样本，目的是补充模型知识，<strong>并没有直接奖励较低的目标值</strong>。它属于主动学习式采样，不能与优化目标的 EI 混为一谈。</p>
<p>初始 5 个 LHS 样本，最多 15 个；无噪声数据、零均值、RBF 幅度固定为 1。两幅图分别画预测均值和潜在函数标准差，网格 31 × 31。真值图与均方根误差仅供教学核对。</p>`},
{id:'numerics',group:'06 / 计算实现与工程判断',title:'计算实现：公式写求逆，计算做方程求解',lead:'这是预测、超参数学习和 BO 循环共用的计算工具；理解主线后，再来看它们怎样稳定高效地算出来。',body:`
<p>前面已经知道要计算什么：GP 的预测均值与方差、超参数的边际似然，以及采集函数需要的预测结果。本节统一解决这些公式里的矩阵运算。<strong>它支撑循环中的多处计算，并不是每轮选点后的最后一个步骤。</strong></p>
<p>例如 ${i`\boldsymbol\alpha=K_y^{-1}(\mathbf y-\mathbf m)`} 等价于求解 ${i`K_y\boldsymbol\alpha=\mathbf y-\mathbf m`}。我们需要的是 α，而不是逆矩阵中的所有元素。</p>
<p>若 ${i`K_y\succ0`}，可以分解为 ${i`K_y=LL^T`}，L 是对角线为正的下三角矩阵。正的独立噪声方差可使半正定的 K 变为正定；无噪声、重复点或极长尺度则可能造成奇异或病态。</p>
${e`L\mathbf b=\mathbf y-\mathbf m,\qquad L^T\boldsymbol\alpha=\mathbf b`}
${e`L\mathbf v=k_*,\qquad\mu_*=m_*+k_*^T\boldsymbol\alpha,\qquad s_*^2=k_{**}-\mathbf v^T\mathbf v`}
${table(['任务','使用 L 的方式'],[['预测均值','前代、回代求 α，再作内积'],['预测方差','一次前代求 v，再计算其平方范数'],['计算行列式',i`\log|K_y|=2\sum_i\log L_{ii}`],['抽取相关高斯样本',i`\mathbf f=\mathbf m+L\mathbf z,\quad\mathbf z\sim\mathcal N(0,I)`]])}
${detail('为什么 Lz 能产生所需协方差？',`${e`\mathbb E[L\mathbf z]=0,\quad\operatorname{Cov}(L\mathbf z)=LIL^T=K_y`}<p>每次先抽取相互独立的标准正态数，再通过 L 混合，便得到具有目标相关性的向量。先验函数采样用潜在函数 K 的因子；带噪观测采样才用 Kᵧ 的因子。</p>`)}
${note('数值 jitter 是为了稳定分解而添加的很小对角扰动；观测噪声是统计模型的一部分。二者在矩阵里形式类似，解释和量级不同。')}
<p>标准稠密精确 GP 的训练分解约需 ${i`O(n^3)`} 运算、${i`O(n^2)`} 存储；同一组数据上的预测可以复用分解。本网页用小规模精确计算，固定加入 10⁻⁹ 的对角 jitter；函数抽样用 10⁻⁸，避免密集网格数值退化。</p>`},
{id:'engineering',group:'06 / 计算实现与工程判断',title:'模型看起来确定，工程上就可靠了吗？',lead:'不确定性始终以所选模型为条件。数据尺度、核假设与验证方式都影响结论。',body:`
<h2>输入、输出分别做尺度处理</h2>
${e`\widetilde x_j=\frac{x_j-a_j}{b_j-a_j},\qquad\widetilde y=\frac{y-\bar y}{s_y}`}
${e`\mu_y=\bar y+s_y\mu_{\widetilde y},\qquad s_y^{\mathrm{pred}}=s_y s_{\widetilde y}^{\mathrm{pred}}`}
<p>这里 ${i`\bar y,s_y`} 是训练数据的中心与尺度；若输出为常数，需另选非零尺度。标准差乘尺度，方差乘尺度的平方。输入单位改变时，长度尺度也要相应改变。缩放不会创造数据中缺失的信息。</p>
${table(['问题','先检查什么'],[['曲线过度平滑或局部波动很大','长度尺度、核光滑性、噪声与均值函数是否合理'],['离数据很远，预测仍然很自信','模型假设与超参数是否过度约束；是否遗漏结构变化'],['拟合很好，推荐的工况却不可用','硬约束、可行域、评估失败与实验安全边界'],['新增数据后算不动','样本数增长引发稠密分解成本；考虑近似或结构化方法'],['高维搜索预算耗尽','有效维数、变量筛选、局部方法和先验结构']])}
<p>“二十维”“几百次评估”可以帮助理解传统 GP-BO 常见的应用规模，但不是所有方法的硬上限。可扩展性受样本数、维度、核结构和所用近似共同影响。</p>
${detail('工程拓展：约束也可能是未知函数',`${e`\min_{\mathbf x\in\mathcal X}f(\mathbf x)\quad\text{s.t.}\quad c_j(\mathbf x)\le0`}<p>可以分别对目标与约束建模。若在模型条件下作相应独立性假设，常用的直观扩展是 EI 乘可行概率，但它不提供实验安全保证。已知的硬约束应直接筛选；未知的安全约束还需要专门的决策和验证设计。</p>`)}
${note('最终推荐应返回原模型或实验确认，并记录预算、初始点、随机种子、失败样本和重复运行结果。最好的代理预测，不一定是最好的已验证方案。')}`},
{id:'practice',group:'06 / 计算实现与工程判断',title:'用五个问题检查整条链路',lead:'如果能解释这几件事，公式和交互实验就连接起来了。',body:`
${detail('1. 十个样本、三个输入变量，X 与 K 分别多大？','<p>X 为 10 × 3；K 为 10 × 10。核矩阵的两个索引都对应样本，而不是变量种类。</p>')}
${detail('2. 给定核与输入，改变 y，预测方差会怎样？','<p>在超参数和噪声固定时，潜在函数后验方差不变。预测均值会改变。若同时重新学习超参数，就不能沿用这个结论。</p>')}
${detail('3. 无噪声数据是否意味着任何位置都没有不确定性？','<p>不是。严格无噪声且核矩阵可逆时，已观测位置可精确插值；未观测位置仍有不确定性。网页中微小 jitter 使数值结果只接近这一极限。</p>')}
${detail('4. 最小化时，为什么不能直接最大化 μ + κs？','<p>该分数同时奖励较高均值和不确定性，适合最大化目标。最小化应最小化 μ − κs，或最大化 −μ + κs。</p>')}
${detail('5. 最大方差采样与贝叶斯优化的选点相同吗？','<p>最大方差主要补充未知区域的信息，不直接评价目标好坏；EI、PI 和 LCB 将预测收益与不确定性联系起来。不同任务应使用不同选点标准。</p>')}
<h2>下一步阅读</h2><div class="references"><p><a href="https://gaussianprocess.org/gpml/" target="_blank" rel="noopener">Rasmussen & Williams (2006), Gaussian Processes for Machine Learning</a>：第 2 章预测，第 4 章核，第 5 章模型选择。先对照符号，再看完整推导。</p><p><a href="https://arxiv.org/abs/1807.02811" target="_blank" rel="noopener">Frazier (2018), A Tutorial on Bayesian Optimization</a>：将代理预测、采集函数与顺序实验放回同一个决策框架。</p><p>Deshwal, Simon & Doppa (2021), <em>Bayesian optimization of nanoporous materials</em>, Molecular Systems Design & Engineering, 6, 1066–1086：阅读材料设计应用时，辨认输入、评价成本和初始设计。</p></div>
<p class="small">本讲义用于教学理解。交互函数均为合成案例，不代表聚烯烃过程的真实实验结果。正文、图形与计算在本地完成；外部文献链接需要网络。</p>`}
];
}
