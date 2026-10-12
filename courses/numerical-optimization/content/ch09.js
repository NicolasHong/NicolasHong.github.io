window.OPT_CHAPTERS.push({id:'ch09',number:'09',title:'无导数优化：用函数评价建立搜索依据',subtitle:'Derivative-Free Optimization · 插值模型、方向轮询与噪声',pages:'220–244',sections:[
{id:'black-box',title:'没有导数时，仍然要明确目标与代价',pages:'220–223',lead:'黑箱、实验和含噪模拟，要求重新衡量一次函数评价能够提供的信息。',body:String.raw`
<p>考虑 \(\min_x f(x)\)，但接口只返回函数值。无导数方法包括有限差分驱动的优化、插值模型、直接搜索与单纯形反射。它们使用的信息不同，不能都理解为“随机试参数”。教材主要讨论光滑无约束问题及求值噪声；无导数并不自动意味着全局优化或非光滑收敛保证。</p>
\[\widehat f(x)=f(x)+\epsilon(x),\quad |\epsilon(x)|\leq\delta,\qquad
\left|\frac{\widehat f(x+he_i)-\widehat f(x)}h-\partial_i f(x)\right|\leq C h+\frac{2\delta}h.\]
<p>差分需要 \(n\) 次额外评价形成梯度。若评价来自昂贵实验，应同时考虑安全可行域、重复测量和预算。噪声可能随机，也可能来自离散误差；它们不一定随重复平均同样减小。</p>
<details><summary>怎样解释噪声地板</summary><div><p>若模型改善量已经和 \(\delta\) 同阶，仅凭两次评价难以稳定判断哪个点更好。继续缩小扰动可能放大误差；应提高评价精度、重复采样或接受当前可分辨的精度。</p></div></details>`},
{id:'models',title:'用采样点拟合局部二次模型',pages:'223–227',lead:'模型梯度与 Hessian 来自插值，不能当作已知精确导数。',body:String.raw`
\[m(x_k+p)=a+g_m^Tp+\tfrac12p^TB_mp,\qquad m(y_i)=f(y_i).\]
<p>完整二次模型有 \((n+1)(n+2)/2\) 个独立系数；二维为 6 个，十维为 66 个。点数等于系数数目只是必要计数，插值矩阵还必须非奇异。</p>
\[m(x)=\sum_{j=1}^q\alpha_j\phi_j(x),\qquad V_{ij}=\phi_j(y_i),\qquad V\alpha=f(Y).\]
<p>可选单项式、Newton 或 Lagrange 多项式基。对称 Hessian 只存独立元素。把 \(p\) 按信赖域尺度归一化，可避免不同次数单项式相差过大。</p>
<details><summary>一维例：三个函数值如何给出曲率</summary><div>\[g_m=\frac{f(x+h)-f(x-h)}{2h},\quad B_m=\frac{f(x+h)-2f(x)+f(x-h)}{h^2},\quad a=f(x).\]<p>这里模型二阶项为 \(B_mp^2/2\)。这些公式也是插值与差分的交点，仍受噪声和步长影响。</p></div></details>`},
{id:'geometry',title:'好模型需要好的采样几何',pages:'227–229',lead:'被拒绝的模型步，可能意味着半径过大，也可能意味着插值点摆放不良。',body:String.raw`
<p>共线点不足以辨认二维横向变化；聚得太近的点又容易产生病态矩阵。Lagrange 基满足 \(\ell_i(y_j)=\delta_{ij}\)，于是 \(m(x)=\sum_i f(y_i)\ell_i(x)\)。在目标邻域内，过大的 \(|\ell_i|\) 会放大采样误差。</p>
\[\min_{\|p\|\leq\Delta_k}m_k(x_k+p),\qquad
\rho_k=\frac{f(x_k)-f(x_k+p_k)}{m_k(x_k)-m_k(x_k+p_k)}.\]
<p>需要正预测下降后才使用比值。好步纳入采样集；坏步可能触发几何改善，或在几何已足够好时缩小半径。不能把所有模型失败都只归因于步长。</p>
\[\min_{a,g,B=B^T}\|B-B_{\rm old}\|_F^2\quad\text{s.t. }m(y_i)=f(y_i).\]
<p>使用较少采样点时，可用最小改动原则补足欠定自由度。它与拟牛顿的联系是“保留旧曲率、满足新信息”；这里约束的是函数值，而非梯度割线。目标只惩罚 Hessian，存在性与唯一性仍取决于插值结构。</p>`},
{id:'poll',title:'模式搜索：用正生成方向覆盖下降机会',pages:'231–234',lead:'一次失败轮询，在一定条件下也提供梯度小的证据。',body:String.raw`
<p>对方向集 \(D_k\)，评价 \(x_k+\alpha_kd\)。若某方向满足 \(f(x_k+\alpha_kd)<f(x_k)-\omega(\alpha_k)\)，接受；否则缩短 \(\alpha_k\)。常用 \(\omega(\alpha)=c\alpha^2\)，并要求方向长度有一致上下界、方向余弦测度有一致正下界：</p>
\[\kappa(D)=\min_{\|v\|=1}\max_{d\in D}\frac{v^Td}{\|d\|}>0.\]
<p>坐标的正负方向 \(\{\pm e_i\}\) 是一种正生成集，其余弦测度为 \(1/\sqrt n\)。只用 \(\{e_i\}\) 不覆盖所有下降方向。</p>
<details><summary>失败轮询为什么约束梯度</summary><div><p>设梯度 Lipschitz 常数为 \(L\)，取 \(g^Td\leq-\kappa\|g\|\|d\|\)。Taylor 上界与“没有充分下降”的事实给出</p>
\[\kappa\|g\|\|d\|\leq\frac L2\alpha\|d\|^2+\frac{\omega(\alpha)}\alpha.\]
<p>若步长趋零、方向条件一致且 \(\omega(\alpha)/\alpha\to0\)，失败轮询点的梯度可趋零。浮点与噪声会使这种渐近推理停止在有限精度。</p></div></details>
<div data-demo="dfo-poll"></div>`},
{id:'directions',title:'坐标搜索与共轭方向方法',pages:'229–231, 234–238',lead:'坐标易实现，但方向之间的耦合决定效率。',body:String.raw`
<p>循环坐标搜索逐次最小化 \(t\mapsto f(x+te_i)\)。高度倾斜的狭谷会导致沿坐标缓慢折返；一般光滑非凸问题中，单纯循环独立方向也不能无条件保证梯度趋零。</p>
<p>共轭方向方法则在一轮线搜索后，从轮首到轮末的净位移构造新方向。对正定二次函数，若获得真正的 \(A\)-共轭方向和精确线搜索，可利用第 5 章有限终止性质。Powell 型方法通过方向替换改善这一结构。</p>
\[u=x_{\rm end}-x_{\rm start},\qquad \min_t f(x_{\rm end}+tu).\]
<p>非线性函数的平均曲率随位置改变，精确二次结论不直接延伸。实际一维搜索仍有评价成本，方向更新也必须避免退化。对变量耦合较弱的问题，坐标搜索可能有实用价值。</p>`},
{id:'nelder-mead',title:'Nelder–Mead：移动一个采样单纯形',pages:'238–240',lead:'用 n+1 个顶点的函数值排序，再做反射、扩张、收缩或缩小。',body:String.raw`
<p>排序 \(f(z_1)\leq\cdots\leq f(z_{n+1})\)。排除最差点后的<strong>平均</strong>为 \(\bar z=\frac1n\sum_{i=1}^nz_i\)。围绕它构造候选：</p>
\[z_r=\bar z+(\bar z-z_{n+1}),\quad z_e=\bar z+2(\bar z-z_{n+1}),\]
\[z_{oc}=\bar z+\tfrac12(\bar z-z_{n+1}),\quad z_{ic}=\bar z+\tfrac12(z_{n+1}-\bar z).\]
<p>反射足够好时直接替换最差点；优于最优点时尝试扩张；效果较差时尝试外部或内部收缩；仍不改善则把其余顶点缩向最好点 \(z_i\leftarrow(z_i+z_1)/2\)。判别需使用各候选的真实函数值。</p>
<p>它和第 13 章线性规划的单纯形法是不同算法。单纯形直径变小、函数值差变小，都不单独证明一阶最优；退化与停滞需要诊断和重启。教材讨论其有限的收敛理论，不宜据一次成功演示声称普遍可靠。</p>`},
{id:'filtering',title:'隐式滤波：先辨认大尺度趋势',pages:'240–242',lead:'在含噪目标上，差分尺度本身也是算法参数。',body:String.raw`
<p>用不一定很小的 \(h\) 形成 \(g_h\)，沿 \(-g_h\) 进行有限次数回溯；若该尺度上不能继续取得下降，再缩小 \(h\)。它试图先忽略小尺度波动，再逐渐分辨细节。</p>
\[g_{h,i}(x)=\frac{\widehat f(x+he_i)-\widehat f(x)}h,\qquad
\widehat f(x-tg_h)\leq\widehat f(x)-c_1t\|g_h\|^2.\]
<p>右侧使用差分近似，不是精确方向导数，所以不能直接套用标准 Armijo 的全部证明。噪声必须与尺度和精度要求相匹配；如果能增加仿真精度或采样数，可在缩小 \(h\) 时同步减小误差。</p>
<p>它并非任意噪声下都能恢复全局最优。固定噪声地板下继续缩小 \(h\)，可能只得到越来越不稳定的方向。</p>`},
{id:'practice',title:'黑箱优化的实验记录与选型',pages:'242–244',lead:'成功标准应包含预算、可分辨精度和独立复测。',body:String.raw`
<ol><li>小规模可重复评价：比较差分梯度与插值模型。</li><li>噪声显著：先估计噪声水平，调整尺度或重复次数。</li><li>方向轮询：记录所有候选评价和失败缩步，不能只数接受步。</li><li>结束时复测候选最优点，并与附近扰动比较。</li></ol>
<details><summary>自测：二维六个点能否必然确定二次模型？</summary><div><p>不能；点的位置必须使插值矩阵非奇异。六个点共线只提供一条线上的信息。</p></div></details>
<details><summary>自测：模式搜索能否只保留两个正坐标方向？</summary><div><p>不能覆盖所有下降方向。需要正生成方向集，通常加入负方向或其他足够覆盖方向。</p></div></details>
<p>下一章把目标的结构显式写出来：<a href="#ch10/structure">最小二乘</a>可以利用残差而不是把它们全压成单个黑箱数值。</p>`}
]});
