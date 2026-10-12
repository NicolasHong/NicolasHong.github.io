window.OPT_CHAPTERS.push({id:'ch08',number:'08',title:'导数计算：从函数程序到可靠的局部信息',subtitle:'Calculating Derivatives · 有限差分、稀疏结构与自动微分',pages:'193–219',sections:[
{id:'routes',title:'需要的是哪一种导数信息',pages:'193–195',lead:'先明确求解器需要什么，再决定怎样计算，而不是默认形成所有导数矩阵。',body:String.raw`
<p>对标量目标 \(f:\mathbb R^n\to\mathbb R\)，梯度有 \(n\) 个元素，Hessian 有 \(n^2\) 个位置。对向量函数 \(r:\mathbb R^n\to\mathbb R^m\)，统一采用</p>
\[J_{ij}(x)=\frac{\partial r_i}{\partial x_j}(x),\qquad J(x)\in\mathbb R^{m\times n}.\]
<p>Newton–CG 需要的是 \(Gv\)，某些线性化方法需要 \(Jv\) 或 \(J^Tw\)。这些乘积通常比完整矩阵更便宜。</p>
<div class="table-wrap"><table><tr><th>路线</th><th>核心操作</th><th>主要边界</th></tr><tr><td>手工解析</td><td>推导并编码导数</td><td>模型修改后需同步维护与核验</td></tr><tr><td>符号微分</td><td>变换代数表达式</td><td>表达式膨胀、程序控制流处理</td></tr><tr><td>有限差分</td><td>扰动输入，比较函数值</td><td>截断、消减与求值误差</td></tr><tr><td>自动微分（AD）</td><td>对程序的基本运算应用链式法则</td><td>记录开销、不可微操作与程序语义</td></tr></table></div>
<p>AD 没有有限差分步长，因此没有差分截断误差；但仍有浮点误差，且得到的是所执行程序的导数，不自动等于连续物理模型的精确灵敏度。</p>`},
{id:'finite-difference',title:'前向与中心差分：从 Taylor 展开推导',pages:'195–197',lead:'导数由有限扰动估计，误差阶来自被舍弃的 Taylor 项。',body:String.raw`
<p>令 \(e_i\) 为第 \(i\) 个坐标单位向量，\(h_i>0\)。前向差分为</p>
\[D_i^+f(x)=\frac{f(x+h_ie_i)-f(x)}{h_i}.\]
<details><summary>前向差分为什么是一阶精度</summary><div><p>当二阶导数连续时，</p>
\[f(x+h_ie_i)=f(x)+h_i\partial_i f(x)+\frac{h_i^2}{2}\partial_{ii}f(x+t h_ie_i).\]
<p>两边减去 \(f(x)\) 再除以 \(h_i\)，可见若 \(|\partial_{ii}f|\leq L\)，误差不超过 \(Lh_i/2\)。注意线性项为 \(h_i\partial_i f\)，不能遗漏步长。</p></div></details>
\[D_i^cf(x)=\frac{f(x+h_ie_i)-f(x-h_ie_i)}{2h_i}=\partial_i f(x)+O(h_i^2).\]
<details><summary>中心差分如何消去二次项</summary><div><p>在 Hessian 局部 Lipschitz 等充分光滑条件下，分别对正负扰动展开：</p>
\[f(x\pm he_i)=f(x)\pm h\partial_i f(x)+\tfrac12h^2\partial_{ii}f(x)+O(h^3).\]
<p>两式相减时常数与二次项抵消，除以 \(2h\) 后剩 \(O(h^2)\)。两个余项不必相等，只需都受同阶上界控制。</p></div></details>
<p>完整前向差分梯度需 \(n+1\) 次函数评价（基准值可复用）。中心差分梯度本身需 \(2n\) 次；若还要目标值 \(f(x)\)，总计 \(2n+1\) 次。边界或定义域限制可能使对称扰动不可用，此时要调整差分方案。</p>`},
{id:'step-error',title:'步长为什么不能无限小',pages:'195–197',lead:'减小截断误差的同时，会放大函数求值误差。',body:String.raw`
<p>设每次函数求值的绝对误差至多 \(\delta\)。前向差分两个函数值相减，误差最多放大为 \(2\delta/h\)：</p>
\[E_+(h)\leq\frac L2h+\frac{2\delta}{h}.\]
\[h_*^2=\frac{4\delta}{L},\qquad E_+(h_*)=O(\sqrt\delta).\]
<p>若 \(\delta\approx uL_f\)，且函数与变量已合理缩放，就得到常见量级 \(h\sim\sqrt u\)。IEEE 双精度舍入到最近数时 \(u=2^{-53}\)，而 JavaScript 的 <code>Number.EPSILON</code> 是 \(2^{-52}\)，二者不要混为同一个定义。</p>
<details><summary>中心差分的最优量级</summary><div><p>若截断误差上界为 \(Ah^2\)，则</p>
\[E_c(h)\leq Ah^2+\frac\delta h,\quad
E_c'(h)=2Ah-\frac\delta{h^2}=0\Rightarrow h_*^3=\frac\delta{2A}.\]
<p>所以步长量级为 \(u^{1/3}\)，误差量级为 \(u^{2/3}\)。这是简化误差模型下的平衡，不是所有仿真函数的固定最佳参数。</p></div></details>
<div data-demo="deriv-error"></div>
<p>实践中可用 \(h_i=h_{\rm rel}\max\{1,|x_i|\}\) 或物理尺度设定扰动，并确认浮点表示中 \(x_i+h_i\ne x_i\)。若函数来自容差较松的 ODE/PDE 求解器，\(\delta\) 可能远大于机器舍入误差，应扫描步长并调整内部求解精度。</p>`},
{id:'jacobian',title:'Jacobian：逐列计算，还是只计算一次作用',pages:'197–198',lead:'一个方向扰动给出 Jv，逐坐标扰动才给出完整 J。',body:String.raw`
\[r(x+hv)=r(x)+hJ(x)v+O(h^2\|v\|^2).\]
\[J(x)v\approx\frac{r(x+hv)-r(x)}h.\]
<p>误差为 \(O(h\|v\|^2)\)，当 \(v\) 固定时通常简记为 \(O(h)\)。基准 \(r(x)\) 已知时只需一次新的向量函数评价。一次向量评价会输出 \(m\) 个数，不意味着这次评价的算术成本与 \(m\) 无关。</p>
\[J(x)e_j\approx\frac{r(x+h_je_j)-r(x)}{h_j},\qquad j=1,\ldots,n.\]
<p>完整稠密 Jacobian 通常需 \(n\) 次额外评价，并要存储 \(mn\) 个数。对于方向算法，没有必要先形成矩阵再乘向量。</p>
<details><summary>为什么一次普通方向扰动不能恢复任意稠密矩阵</summary><div><p>得到 \(Jv\) 只有 \(m\) 个方程，而 \(J\) 有 \(mn\) 个未知元素。除非有稀疏性或其他先验结构，单次压缩不足以恢复矩阵。下一节利用已知结构，让不同列互不干扰。</p></div></details>`},
{id:'coloring',title:'稀疏着色：一次扰动恢复多列',pages:'198–201',lead:'同一组列不能在任何一行里同时出现潜在非零元素。',body:String.raw`
<p>构造列相交图：每列对应一个顶点；若两列在某一行都有结构非零，就连边。相邻顶点使用不同颜色，同色列可一起扰动。</p>
\[p^{(c)}=\sum_{j\in C_c}h_je_j,\qquad
J_{ij}\approx\frac{r_i(x+p^{(c)})-r_i(x)}{h_j}\quad(j\in C_c,\ (i,j)\in\Omega).\]
<p>由于同一行里最多一个同色活跃变量，能把差分解码到对应列。若错误地把冲突列染成同色，获得的是若干导数贡献之和，无法直接分开。</p>
<h2>原创例：一维相邻单元的非线性残差</h2>
\[r_i(x)=\sin x_i+2x_i-x_{i-1}-x_{i+1},\qquad x_0=x_{n+1}=0.\]
\[J_{ii}=\cos x_i+2,\qquad J_{i,i\pm1}=-1.\]
<p>三对角结构中，按列编号模 3 着色即可；三列在某个内部行同时非零，所以 \(n\geq3\) 时三色也是该直接恢复方式的最少颜色。完整前向差分从 \(n+1\) 次降到 4 次向量评价。</p>
<div data-demo="deriv-coloring"></div>
<p>必须使用结构模式而非当前数值非零模式。图着色也适用于 AD 种子压缩；差分近似误差与着色是否正确是两个独立问题。</p>`},
{id:'hessian',title:'Hessian 与 Hessian–向量积的差分',pages:'201–202',lead:'有梯度时，对梯度作差分；只有函数值时，二阶信息更昂贵也更敏感。',body:String.raw`
\[G(x)v\approx\frac{g(x+hv)-g(x)}h,\qquad
G(x)v\approx\frac{g(x+hv)-g(x-hv)}{2h}.\]
<p>前者在 Hessian 局部 Lipschitz 时有 \(O(h)\) 误差；后者的 \(O(h^2)\) 精度需要梯度函数有足够高阶光滑性，例如 \(f\in C^4\) 且相关导数局部有界。不能仅凭 \(f\in C^2\) 就保证二阶误差阶。</p>
<p>逐坐标差分梯度可得 \(\widetilde G\)。有限差分通常破坏精确对称性，可取 \((\widetilde G+\widetilde G^T)/2\)，但对称化不会消除全部误差，也不保证正定。</p>
<h2>只有函数值时</h2>
\[G_{ij}(x)\approx\frac{f(x+h e_i+h e_j)-f(x+h e_i)-f(x+h e_j)+f(x)}{h^2}.\]
<p>在充分光滑条件下为 \(O(h)\) 精度。\(i=j\) 时首项是 \(f(x+2he_i)\)。形成对称稠密矩阵需至多 \(1+n+n(n+1)/2\) 个不同评价点，成本为 \(O(n^2)\)。</p>
<details><summary>混合项为什么留下来</summary><div><p>将 \(p=h(e_i+e_j)\)、\(he_i\)、\(he_j\) 代入二阶 Taylor 公式，按上式相减。常数、线性项以及各自的平方项抵消，只留下 \(h^2G_{ij}\) 与 \(O(h^3)\) 余项。</p></div></details>
<p>函数求值噪声在二阶公式中被 \(h^{-2}\) 放大。对 Newton–CG 而言，如果直接提供高质量 \(Gv\)，通常不必承担完整 Hessian 的形成与存储成本。</p>`},
{id:'sparse-hessian',title:'利用对称性，进一步减少 Hessian 扰动次数',pages:'202–204',lead:'Hessian 既稀疏又对称，比一般 Jacobian 多了一类可恢复信息。',body:String.raw`
<p>考虑原创箭头结构函数</p>
\[f(x)=\tfrac12x_1^2+\tfrac12\sum_{i=2}^n a_ix_i^2+x_1\sum_{i=2}^n\sin x_i,\qquad a_i>0.\]
\[G_{11}=1,\quad G_{1i}=G_{i1}=\cos x_i,\quad G_{ii}=a_i-x_1\sin x_i\ (i\geq2),\]
<p>其余非对角元素为零。若把梯度当普通向量函数，其 Jacobian 第一行含所有列，列相交图需要 \(n\) 种颜色。</p>
<ol><li>沿 \(e_1\) 差分梯度，恢复第一列；利用对称性同时得到第一行。</li><li>沿 \(e_2+\cdots+e_n\) 差分梯度，只读取输出第 2 至 \(n\) 项，分别恢复剩余对角元素。</li></ol>
<p>基准梯度之外，只需两次梯度评价。第二次扰动中第一项梯度同时受到多个变量影响，不能将它误解成某个单独的非对角元素。</p>
<h2>一般稀疏 Hessian 的着色</h2><p>构造邻接图：变量为顶点，非对角结构非零为边。教材给出的直接恢复条件要求相邻点不同色，且任何包含四个不同顶点的三边路径至少出现三种颜色（星着色条件）。普通图的合法二色着色未必满足 Hessian 恢复要求。</p>
<p>箭头图是星形，可以用中心一种颜色、其余顶点另一种颜色。恢复算法要明确用到了哪些已知对称元素，而不是只把 Jacobian 着色的公式原样照搬。</p>`},
{id:'graph',title:'自动微分：把程序拆成基本运算的计算图',pages:'204–206',lead:'节点保存数值，边保存局部依赖；链式法则把局部导数连接起来。',body:String.raw`
<p>用一个原创的三变量函数贯穿演示：</p>
\[f(x)=e^{x_1x_2}+\sin x_3+x_1x_3.\]
\[v_1=x_1x_2,\quad v_2=e^{v_1},\quad v_3=\sin x_3,\quad
v_4=x_1x_3,\quad v_5=v_2+v_3,\quad f=v_5+v_4.\]
<p>节点按照依赖顺序计算。输入 \(x_1\) 被两个分支使用，反向传播时必须汇总两个分支的贡献。实际 AD 工具可通过源代码变换、运算重载等方式建立或隐式处理这些依赖，不要求使用者手动画图。</p>
<p>这与符号微分的区别是：AD 可以在给定点传播数值导数，不必先生成一个展开后的巨大代数表达式。与有限差分的区别是：没有 \(h\) 或函数值相减估计斜率。</p>
<div data-demo="deriv-ad"></div>
<p>演示可以逐个节点执行前向切向传播或反向伴随累加。反向尚未处理完时，中间伴随值只是部分累计，不能提前当作完整导数。</p>`},
{id:'forward',title:'前向模式：让每个数值带着一个方向导数',pages:'206–207, 212',lead:'输入方向 v 是种子，沿计算图正向传播，得到 Jv。',body:String.raw`
<p>对输入初始化 \(\dot x_i=v_i\)。如果节点 \(z=\phi(a,b)\)，同时计算</p>
\[\dot z=\phi_a\dot a+\phi_b\dot b.\]
<div class="table-wrap"><table><tr><th>数值运算</th><th>切向运算</th></tr><tr><td>\(z=a+b\)</td><td>\(\dot z=\dot a+\dot b\)</td></tr><tr><td>\(z=ab\)</td><td>\(\dot z=b\dot a+a\dot b\)</td></tr><tr><td>\(z=a/b\)</td><td>\(\dot z=\dot a/b-a\dot b/b^2\)</td></tr><tr><td>\(z=\phi(a)\)</td><td>\(\dot z=\phi'(a)\dot a\)</td></tr></table></div>
<p>上节函数最终输出 \(\dot f=g(x)^Tv\)。对向量函数则得到 \(Jv\)。一个方向的工作量通常是原函数评价的小常数倍，不需要形成 Jacobian。</p>
<details><summary>用双数理解前向传播</summary><div><p>设形式符号 \(\varepsilon^2=0\)，将变量写成 \(a+\dot a\varepsilon\)。相乘：</p>
\[(a+\dot a\varepsilon)(b+\dot b\varepsilon)=ab+(b\dot a+a\dot b)\varepsilon.\]
<p>这正是乘法链式法则。\(\varepsilon\) 不是一个很小的浮点数，而是用于编码一阶系数的代数符号。</p></div></details>
<p>稠密完整梯度可用 \(n\) 个坐标种子逐次计算，也可成批传播。前者重复扫图，后者增加每个节点携带的数据；两者的工作量都随种子数增长。结构着色能减少所需种子。</p>`},
{id:'reverse',title:'反向模式：一次反扫累积所有输入灵敏度',pages:'207–210',lead:'标量输出只有一个种子，却可以得到所有输入偏导。',body:String.raw`
<p>先前向计算并保留所需中间值，所有伴随初始化为零，只令 \(\bar f=1\)。逆序处理节点 \(z=\phi(a,b)\)：</p>
\[\bar a\mathrel{+}=\bar z\phi_a,\qquad\bar b\mathrel{+}=\bar z\phi_b.\]
<p>这里是“加上”，不是赋值覆盖。共享输入从多个后继节点接收贡献，最终输入伴随组成梯度。</p>
<details><summary>贯穿例子的解析校验</summary><div><p>令 \(E=e^{x_1x_2}\)。指数分支给出 \(x_2E,x_1E\)，正弦分支给出 \(\cos x_3\)，乘积分支给出 \(x_3,x_1\)，所以</p>
\[g(x)=\begin{bmatrix}x_2E+x_3\\x_1E\\\cos x_3+x_1\end{bmatrix}.\]
<p>若覆盖而非累加 \(x_1\) 或 \(x_3\) 的伴随，就会漏掉某一项。这是检查反向实现的直接例子。</p></div></details>
<h2>计算少，不代表存储少</h2><p>在基本运算模型下，标量函数的反向梯度算术量可控制在原评价的小常数倍，倍率不随输入维数线性增长。但总运算仍随程序规模增长，计算图和中间状态可能很大，不能把这句话理解为“梯度常数时间”。</p>
<p>检查点技术保存少量关键状态，在反扫时重算中间区间，用额外算术换取内存。动态过程仿真尤其需要评估时间步状态的保存与重算代价。</p>`},
{id:'vector-ad',title:'向量输出、稀疏种子与部分可分目标',pages:'210–213',lead:'前向按输入方向工作，反向按输出权重工作。',body:String.raw`
\[\text{前向种子 }v\in\mathbb R^n:\ Jv\in\mathbb R^m;\qquad
\text{反向种子 }w\in\mathbb R^m:\ J^Tw\in\mathbb R^n.\]
<p>反向相当于对标量 \(w^Tr(x)\) 求梯度，求导时 \(w\) 固定。稠密完整 Jacobian 的前向需要 \(n\) 个独立种子，反向需要 \(m\) 个。输入少、输出多时前向常有优势；输出少、输入多时反向常有优势，还需考虑稀疏性和内存。</p>
<p>列着色压缩前向种子；对 \(J^T\) 做类似结构分析可以压缩反向种子。也可混合两种模式覆盖矩阵不同区域。</p>
<h2>部分可分目标的联系</h2>
\[f(x)=\sum_{i=1}^{n_e}f_i(x),\quad r(x)=(f_1(x),\ldots,f_{n_e}(x))^T,\quad g=J^T\mathbf1.\]
<p>每个元素只依赖少数变量，所以 \(J\) 的每行稀疏；某一列仍可能出现在许多元素中，不能仅凭部分可分性断言每列也很稀疏。可以按元素计算局部导数后组装，也可直接用输出全为 1 的反向种子得到总梯度。</p>
<details><summary>一个适合实现核验的恒等式</summary><div>
\[w^T(Jv)=v^T(J^Tw).\]
<p>用固定但不同的 \(v,w\) 对照两种模式，可以发现转置、索引和累加错误。恒等式通过仍需检查它们是否对正确的原函数求导。</p></div></details>`},
{id:'second-ad',title:'二阶自动微分与 Hessian–向量积',pages:'213–216',lead:'对方向导数再求梯度，得到 Newton–CG 所需的二阶作用。',body:String.raw`
<p>对固定方向 \(v\)，先定义方向导数 \(d_vf=g^Tv\)，然后求梯度：</p>
\[\nabla_x(g(x)^Tv)=G(x)v.\]
<p>可先前向生成方向导数程序，再反向求其梯度；也可对反向梯度程序做前向微分。两者都避免形成完整 Hessian；方向 \(v\) 在本次求导中必须视作常量。</p>
<details><summary>二阶前向链式法则</summary><div><p>令 \(D_pz=\nabla z^Tp\)、\(D_{pq}z=p^T\nabla^2z\,q\)。若 \(z=\phi(a)\)：</p>
\[D_{pq}z=\phi''(a)(D_pa)(D_qa)+\phi'(a)D_{pq}a.\]
<p>若 \(z=ab\)：</p>
\[D_{pq}z=bD_{pq}a+aD_{pq}b+(D_pa)(D_qb)+(D_qa)(D_pb).\]
<p>输入节点的二阶量均为零。只传播 \(D_p,D_q,D_{pq}\) 可得到一个双线性曲率；传播所有坐标组合才形成完整 Hessian。</p></div></details>
<details><summary>演示使用的“伴随切向”递推</summary><div><p>节点 \(z=\phi(a_1,\ldots,a_s)\)，前向已知 \(a_i,\dot a_i\)。反扫时同时传播伴随及其方向导数：</p>
\[\bar a_i\mathrel{+}=\bar z\phi_i,\qquad
\dot{\bar a}_i\mathrel{+}=\dot{\bar z}\phi_i+\bar z\sum_j\phi_{ij}\dot a_j.\]
<p>输出种子为 \(\bar f=1,\dot{\bar f}=0\)；最终输入的 \(\dot{\bar x}\) 就是 \(Gv\)。演示通过基本节点的局部导数执行这一递推，解析 Hessian 仅用于独立对照。</p></div></details>
<div data-demo="deriv-hvp"></div>
<p>若只需要 \(p^TGp\)，可用 \(\psi(t)=f(x+tp)\) 的二阶导数。交叉元素也可由极化公式恢复：</p>
\[G_{ij}=\tfrac12\big[(e_i+e_j)^TG(e_i+e_j)-e_i^TGe_i-e_j^TGe_j\big].\]
<p>完整 Hessian 即便计算高效，输出和存储仍可能需要 \(O(n^2)\)。稀疏着色可减少种子数，但必须正确解码。</p>`},
{id:'verification',title:'导数检验：阶数、方向与程序语义',pages:'216–219；补充验证方法',lead:'导数计算程序不报错，只能说明程序运行了，不能说明模型灵敏度正确。',body:String.raw`
<h2>方向 Taylor 检验</h2><p>选非零固定方向 \(v\)，逐步减小 \(h\)，计算</p>
\[R_0(h)=|f(x+hv)-f(x)|,\quad
R_1(h)=|f(x+hv)-f(x)-h g(x)^Tv|.\]
<p>对光滑目标且未碰到消减误差时，通常 \(R_0=O(h)\)、\(R_1=O(h^2)\)。若方向导数恰好为零，\(R_0\) 可能更快。若梯度有固定误差，\(R_1\) 往往退化到一阶。第一个方向测试通过后，还应换点、换方向。</p>
\[\|g(x+hv)-g(x)-hG(x)v\|=O(h^2)\]
<p>最后一式在 Hessian 局部 Lipschitz 时可用于检验 Hessian–向量积；再用 \(u^TGv\approx v^TGu\) 检查对称性。不要用同一份有错误的解析表达式同时产生“结果”和“标准答案”。</p>
<h2>AD 的准确性边界</h2><ul><li>分支：AD 沿执行路径求导；在切换点，导数可能不存在，或者路径导数不等于数学函数的导数。</li><li>离散仿真：若 \(\widehat f=f+\tau\)，即使 \(|\tau|\) 小，\(|\nabla\tau|\) 也未必小。</li><li>迭代求解：固定迭代次数的程序导数、收敛解的隐式导数，可能是不同对象；要明确计算目标。</li><li>非光滑操作：绝对值、截断和事件切换，需要与模型和算法的可微性假设一起处理。</li></ul>
<p>这些是程序与数学对象的边界，不是某一个 AD 软件的性能排名。实际模型应同时检查离散精度、内部求解容差和导数一致性。</p>`},
{id:'practice',title:'把导数接口接回建模与优化',pages:'217–219；原创练习',lead:'形成一套可复用的导数工作流，而不只记住差分公式。',body:String.raw`
<ol><li>写清目标、残差和变量尺度，确定定义域与光滑性。</li><li>检查求解器需要 \(g\)、\(J\)、\(Jv\)、\(J^Tw\) 还是 \(Gv\)。</li><li>利用元素分解和结构非零模式选择差分或 AD 种子。</li><li>在小实例上以独立解析式和方向差分交叉核验。</li><li>记录评价次数、内存和误差，再决定内层容差。</li></ol>
<details><summary>自测 1：前向差分误差约为 Ah+B/h，最佳步长是什么？</summary><div><p>求导得到 \(A-B/h^2=0\)，所以 \(h_*=\sqrt{B/A}\)。函数求值噪声增加时，最佳扰动通常应该增大，而不是减小。</p></div></details>
<details><summary>自测 2：万维输入、单个输出，要计算完整梯度，用哪种 AD 模式？</summary><div><p>在一般稠密依赖下，反向通常比逐坐标前向更经济。但还要确认计算图存储是否可承受，以及是否能利用局部元素结构。若只需一个方向导数，前向就很合适。</p></div></details>
<details><summary>自测 3：AD 和有限差分不一致，一定是 AD 错了吗？</summary><div><p>不一定。可能是差分步长或噪声问题、分支切换、实现错误，也可能比较的是不同离散模型。先做步长扫描和简单点解析校验，逐项缩小原因。</p></div></details>
<details><summary>自测 4：Newton–CG 内层求解很精确，但 Gv 很不准，会怎样？</summary><div><p>它可能仅仅精确求解了错误的线性模型。需要把导数误差与强迫项一起考虑，不能用更小的内层残差补救不可靠的导数接口。</p></div></details>
<p>可回到<a href="#ch07/newton-cg">第 7 章 Newton–CG</a>检查数据流：模型程序 → 梯度/曲率作用 → 内层迭代 → 外层接受与停止。若导数不可获得，可继续阅读<a href="#ch09/black-box">第 9 章无导数优化</a>。</p>`}
]});
