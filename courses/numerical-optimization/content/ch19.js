window.OPT_CHAPTERS.push({id:'ch19',number:'19',title:'非线性内点法：扰动 KKT 与障碍路径',subtitle:'Nonlinear Interior Methods · 原始—对偶、线搜索与信赖域',pages:'563–597',sections:[
{id:'perturbed',title:'松弛变量与扰动互补',pages:'563–566',lead:'保持正的是松弛和不等式乘子，不一定是原约束残差。',body:String.raw`
\[\min f(x),\quad c_{\mathcal E}(x)=0,\quad c_{\mathcal I}(x)-s=0,\quad s\geq0.\]
\[L=f-y^Tc_{\mathcal E}-z^T(c_{\mathcal I}-s),\quad z\geq0.\]
\[\begin{aligned}g-A_{\mathcal E}^Ty-A_{\mathcal I}^Tz&=0,\\
c_{\mathcal E}&=0,\quad c_{\mathcal I}-s=0,\\
Sz&=\mu\mathbf1,\quad s,z>0.\end{aligned}\]
<p>\(\mu\to0\) 恢复互补 KKT。非可行初值可以满足 \(s,z>0\) 但不满足 \(c_{\mathcal I}=s\)，因此“内点”不自动表示物理模型可行。等式乘子 \(y\) 没有正性要求。</p>
<div data-demo="nlp-barrier"></div>`},
{id:'barrier',title:'障碍子问题与同伦两种解释',pages:'564–566,583–587',lead:'同一个扰动系统可以来自障碍优化，也可以看作 KKT 的平滑延拓。',body:String.raw`
\[\min_{x,s>0}f(x)-\mu\sum_i\log s_i\quad
\text{s.t. }c_{\mathcal E}=0,\ c_{\mathcal I}-s=0.\]
\[-\mu S^{-1}\mathbf1+z=0\quad\Longleftrightarrow\quad Sz=\mu\mathbf1.\]
<p>乘以 \(S\) 不改变正松弛下的解，但会改变 Newton 线性化，因此原始障碍 Newton 与原始—对偶 Newton 产生的迭代一般不同。</p>
<p>经典 primal barrier 直接使用 \(f-\mu\sum\log c_i(x)\)，要求不等式严格可行初值并保护原约束正性；引入独立松弛后可以容许原始残差，初始化更灵活。非凸问题可能有多个局部障碍分支，不能照搬 LP 的唯一中心路径。</p>`},
{id:'newton',title:'完整原始—对偶线性系统',pages:'566–572',lead:'Lagrangian Hessian、Jacobian 与互补对角块共同决定步。',body:String.raw`
\[r_d=g-A_E^Ty-A_I^Tz,\quad r_E=c_E,\quad r_I=c_I-s,\quad r_c=Sz-\mu\mathbf1.\]
\[\begin{bmatrix}H&0&-A_E^T&-A_I^T\\
0&Z&0&S\\A_E&0&0&0\\A_I&-I&0&0\end{bmatrix}
\begin{bmatrix}p_x\\p_s\\p_y\\p_z\end{bmatrix}
=-\begin{bmatrix}r_d\\r_c\\r_E\\r_I\end{bmatrix}.\]
<p>\(H=\nabla^2_{xx}L\)，\(S=\operatorname{diag}(s),Z=\operatorname{diag}(z)\)。消去松弛与不等式乘子：</p>
\[\Sigma=S^{-1}Z,\quad
\begin{bmatrix}H+A_I^T\Sigma A_I&-A_E^T\\A_E&0\end{bmatrix}
\begin{bmatrix}p_x\\p_y\end{bmatrix}
=\begin{bmatrix}-r_d-A_I^TS^{-1}r_c-A_I^T\Sigma r_I\\-r_E\end{bmatrix}.\]
<details><summary>消元符号核对</summary><div>\[p_s=A_Ip_x+r_I,\qquad
p_z=-S^{-1}r_c-\Sigma A_Ip_x-\Sigma r_I.\]
<p>把第二式代入第一行即可得到约化系统。实现应逐块验证残差，以避免混用 \(c\geq0\) 与 \(c\leq0\) 约定。</p></div></details>`},
{id:'curvature',title:'原始曲率、原始—对偶曲率与非凸修正',pages:'570–575',lead:'正的障碍对角项不能自动消除所有负曲率。',body:String.raw`
\[\Sigma_{\rm PD}=S^{-1}Z,\qquad\Sigma_{\rm primal}=\mu S^{-2}.\]
<p>在精确中心点 \(z_i=\mu/s_i\) 时二者相同，离开中心时不同。原始—对偶系统独立跟踪乘子，并避免直接微分有理互补式的某些边界问题。</p>
<p>\(H+A_I^T\Sigma A_I\) 可能仍不定，需要惯性检查、对角修正、信赖域或负曲率控制。等式约束存在时重点仍是约束零空间上的曲率。稀疏对称不定分解和结构预条件器是主要工具。</p>
<p>拟 Newton 需近似 Lagrangian Hessian，并处理边界曲率与正定保护。线性求解误差和正则化残差要纳入外层停止判据。</p>`},
{id:'parameters',title:'障碍参数与边界步长',pages:'572–576',lead:'减少障碍要与内层求解进度、互补均衡和正性协调。',body:String.raw`
\[\mu_{k+1}=\sigma_k\mu_k,\quad0<\sigma_k<1,\qquad
\alpha_s=\min\left(1,\min_{p_{s,i}<0}\frac{-\tau s_i}{p_{s,i}}\right).\]
<p>对 \(z\) 使用类似边界公式，\(0<\tau<1\)。外层固定 \(\mu\) 求到与它匹配的容差再减少，是经典策略；自适应和预测策略可更积极，但不能让个别松弛过早贴零。</p>
\[\bar\mu=s^Tz/m_I,\qquad\sigma=(\mu_{\rm aff}/\bar\mu)^3\quad\text{一种试探启发式}.\]
<p>借用 LP 预测策略可以选障碍参数，非凸与非可行性仍需额外接受机制。只减平均互补不保证其他 KKT 残差减小。</p>`},
{id:'line-search',title:'线搜索内点法与 merit',pages:'575–578',lead:'边界安全限制和充分下降限制同时存在。',body:String.raw`
\[\phi_{\mu,\rho}(x,s)=f(x)-\mu\sum_i\log s_i+
\rho\|(c_E(x),c_I(x)-s)\|_1.\]
<p>先计算保护正性的最大步，再以障碍 merit 方向导数回溯；罚系数确保约束改善得到足够权重。若修正后的原始曲率仍不能给下降方向，需要重新生成步，不能无限缩步掩盖错误方向。</p>
<p>filter 可以替代单一 merit，但仍需近可行切换、恢复、边界保护和相应收敛框架。选择性 SOC 有助于避免 Maratos 效应。</p>
<p>停止分两层：内层检查扰动 KKT 残差 \(E(v;\mu)\)，外层检查未扰动残差 \(E(v;0)\)。障碍子问题解足够准不等于原问题已经足够准。</p>`},
{id:'trust',title:'信赖域内点法与缩放松弛',pages:'578–583',lead:'使用相对松弛变化来适应接近零的边界变量。',body:String.raw`
\[\widetilde p=(p_x,S^{-1}p_s),\qquad
\|\widetilde p\|\leq\Delta,\quad p_s\geq-\tau s.\]
<p>法向步降低 \((c_E,c_I-s)\) 的线性化残差；切向步在相应零空间内改善障碍二次模型。相对松弛尺度避免小松弛分量在普通欧氏半径中被忽视。</p>
<p>使用真实障碍 merit 减少与模型预测减少决定接受和半径；不定曲率可通过截断投影 CG 处理。乘子估计、障碍更新和子问题精度必须匹配。教材展示了这一分解如何形成大型稀疏算法。</p>`},
{id:'convergence',title:'可行性恢复、全局化与局部速度',pages:'587–593',lead:'非线性内点法继承了非凸约束问题的困难，不能靠障碍项绕过。',body:String.raw`
<p>线搜索可能停在约束违反的驻点；秩退化、障碍分支异常和不可行模型需要明确处理。全局化分析依赖光滑、有界、约束资格和充分进度等条件，通常给一阶 KKT 聚点结论。</p>
<p>规则解、SOSC、严格互补等局部假设下，通过足够快地减 \(\mu\)、收紧内层容差、令边界参数 \(\tau\to1\) 并允许全步，可以获得超线性乃至更快收敛。固定保守边界比例可能限制局部速度。</p>
<p>退化最优点不一定严格互补；这时上述速率保证要重新审视。非凸问题的小 KKT 残差不构成全局最优证书，也不自动排除鞍点。</p>`},
{id:'diagnostics',title:'统一 KKT 报告与标量障碍例子',pages:'593–597',lead:'演示用可手算问题展示边界乘子与障碍偏差。',body:String.raw`
\[\min_{x\geq0}\tfrac12(x+a)^2,\quad a>0,\qquad x_*=0,\ z_*=a.\]
\[x+a-\mu/x=0,\qquad
x_\mu=\frac{2\mu}{\sqrt{a^2+4\mu}+a},\quad z_\mu=x_\mu+a.\]
<p>用有理化表达避免小 \(\mu\) 时相减消去。有 \(x_\mu z_\mu=\mu\)，原驻点残差为零但互补未达零，\(x_\mu\sim\mu/a\)。这显示为什么还需要减少障碍。</p>
\[E(v;0)=\max\big(\|r_d\|_\infty,\|r_E\|_\infty,\|r_I\|_\infty,
\|s\odot z\|_\infty,\|\min(s,0)\|_\infty,\|\min(z,0)\|_\infty\big).\]
<p>实际模型应使用相应尺度化指标，并直接复核原约束与物理域。标量演示是障碍路径解释，非通用 NLP 求解器。</p>`},
{id:'synthesis',title:'全课程方法地图与后续扩展',pages:'593–597',lead:'算法选择取决于模型结构、导数和可验证的求解目标。',body:String.raw`
<div class="table-wrap"><table><thead><tr><th>模型结构</th><th>主要方法</th><th>核心验证</th></tr></thead><tbody>
<tr><td>光滑无约束</td><td>线搜索、信赖域、BFGS、有限记忆与 Krylov</td><td>梯度与曲率</td></tr>
<tr><td>昂贵/无导数</td><td>插值模型、轮询、隐式过滤</td><td>预算、几何、噪声尺度</td></tr>
<tr><td>最小二乘 / 方程</td><td>GN、LM / Newton、Broyden、延拓</td><td>残差、秩与真实根</td></tr>
<tr><td>LP / 凸 QP</td><td>单纯形、活跃集、原始—对偶内点</td><td>可行性、互补与对偶证书</td></tr>
<tr><td>一般非线性约束</td><td>AL、SQP、非线性内点</td><td>完整 KKT 与局部二阶条件</td></tr></tbody></table></div>
<ol><li>把同一等式问题分别写为罚子问题、AL 子问题和 SQP 子问题。</li><li>比较 LP 与 NLP 内点线性系统，指出 Hessian 和非线性 Jacobian 的差异。</li><li>将一个工程计算结果写成可行性、驻点、互补、物理域与局部/全局证据报告。</li></ol>
<p>编号章节至此完整。内容按章节文件和独立演示模块组织，后续可增补矩阵计算、真实 PSE 模型、算法实验与习题解析，不需要重写导航。书末附录可另作为数学工具参考；本轮未展开附录正文。</p>`}
]});
