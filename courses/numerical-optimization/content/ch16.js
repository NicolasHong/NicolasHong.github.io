window.OPT_CHAPTERS.push({id:'ch16',number:'16',title:'二次规划：约束二次模型的求解',subtitle:'Quadratic Programming · KKT、零空间、活跃集与内点法',pages:'448–496',sections:[
{id:'equality',title:'等式 QP 与 KKT 系统',pages:'448–454',lead:'二次目标加线性约束，把局部优化转化为结构化线性代数。',body:String.raw`
\[\min_x\ q(x)=\tfrac12x^TGx+g^Tx,\quad Ax=b,\qquad G=G^T.\]
\[Gx+g-A^T\lambda=0,\quad Ax=b,\qquad
\begin{bmatrix}G&-A^T\\-A&0\end{bmatrix}\begin{bmatrix}x\\\lambda\end{bmatrix}
=\begin{bmatrix}-g\\-b\end{bmatrix}.\]
<p>把约束行同时乘负一后得到对称不定矩阵。\(A\) 满行秩且 \(Z^TGZ\succ0\) 时 KKT 矩阵可逆，存在唯一等式最优解；不要求整个 \(G\) 正定。若约化曲率有负方向，沿等式可行射线目标无界；半正定退化情况可能多解或因线性项导致无界。</p>`},
{id:'direct',title:'完整分解、Schur 补与零空间',pages:'454–459',lead:'三种表示求解同一个问题，但对稀疏性和正定性的要求不同。',body:String.raw`
<p>完整 KKT 可使用带枢轴的对称不定分解，支持不定 \(G\)。若 \(G\) 可逆且 Schur 补可用，</p>
\[AG^{-1}A^T\lambda=b+AG^{-1}g,\qquad x=G^{-1}(A^T\lambda-g).\]
<p>\(G\succ0\) 时 Schur 补正定；以上符号由 \(Ax=b\) 直接核对。所有“逆”在算法里用系统求解实现。</p>
\[x=x_p+Zz,\quad Ax_p=b,\ AZ=0,\qquad
(Z^TGZ)z=-Z^T(Gx_p+g).\]
<p>零空间法适合约束多、自由度少的情形，但显式 \(Z\) 可能很稠密；范围空间法适合约束较少的情形。选择应结合矩阵填充、数值秩与可重复分解成本。</p>`},
{id:'iterative',title:'约化 CG 与投影 CG',pages:'459–463',lead:'大规模 QP 可以只计算矩阵作用，但必须把迭代保持在可行子空间。',body:String.raw`
\[H_R=Z^TGZ,\quad H_Rz=-Z^T(Gx_p+g).\]
<p>\(H_R\succ0\) 时可用 CG。其矩阵作用为 \(v\mapsto Z^TGZv\)，预条件器也必须在约化空间一致定义。不定曲率时普通 CG 的最小化保证不适用，需相应负曲率处理。</p>
\[P_H=Z(Z^THZ)^{-1}Z^T,\qquad H\ \text{在零空间上正定}.\]
<p>投影 CG 以这个约束预条件作用产生可行方向。实现可通过增广系统隐式计算，不必形成 \(Z\)。舍入误差会造成可行漂移，需重投影与残差修正。预条件器不能破坏约束零空间不变性。</p>`},
{id:'inequality',title:'不等式 QP、凸性与退化',pages:'463–467',lead:'KKT 与二阶理论在二次模型上成为精确代数条件。',body:String.raw`
\[\min\tfrac12x^TGx+g^Tx,\quad A_{\mathcal E}x=b_{\mathcal E},\quad A_{\mathcal I}x\geq b_{\mathcal I}.\]
\[Gx+g-A^T\lambda=0,\quad \lambda_{\mathcal I}\geq0,\quad
\lambda_i(a_i^Tx-b_i)=0.\]
<p>\(G\succeq0\) 的凸 QP 中，KKT 足以证明全局最优；\(G\succ0\) 且可行时最优点唯一。非凸 QP 仍可能有边界局部解，需要临界锥二阶条件，KKT 本身不足够。</p>
<p>线性约束允许较强的乘子存在结果，但冗余活跃行仍会让特定 KKT 系统奇异。算法要维护独立工作集，处理弱活跃约束和多个乘子表示。</p>`},
{id:'active-set',title:'可行活跃集算法',pages:'467–478',lead:'沿当前工作集的等式子问题移动，在阻挡约束处改变集合。',body:String.raw`
\[\min_p\ \tfrac12p^TGp+(Gx+g)^Tp,\quad A_{\mathcal W}p=0.\]
<p>从原始可行点开始，\(\mathcal W\) 包含等式与选中的绑定不等式。若 \(p\ne0\)，按尚未绑定的不等式限制步长：</p>
\[\alpha=\min\left(1,\min_{i\notin\mathcal W:\ a_i^Tp<0}
\frac{a_i^Tx-b_i}{-a_i^Tp}\right).\]
<p>如果 \(\alpha<1\)，把阻挡约束加入工作集。若 \(p=0\)，计算工作集乘子；全部不等式乘子非负则最优，否则删除一个负乘子不等式。删除等式是不允许的。</p>
<div data-demo="qp-active"></div>
<p>课堂例子是严格凸二维 QP，展示每一次加入/删除与最后 KKT 证书。一般退化情形还需反循环、秩与容差保护。</p>`},
{id:'factors',title:'终止、因子更新与热启动',pages:'472–480',lead:'工作集每次只改变少量约束，可复用分解。',body:String.raw`
<p>在非退化凸问题与适当选取规则下，可以通过有限工作集转换到达最优。零步长、相关约束和乘子并列可能使简单版本循环；完整求解器需要明确的防退化机制。</p>
<p>工作集加入/删除一行可更新 QR 或约化 Cholesky 因子，而不是每次全量重算。连续控制中的相邻 QP 往往结构与最优活跃集接近，因此适合热启动。</p>
<p>沿用上次工作集需要先修复当前可行性和独立性；不能直接把旧解当成新问题最优。稀疏与大型问题常更适合 KKT 直接或迭代方法。</p>`},
{id:'interior',title:'QP 原始—对偶内点法',pages:'480–485',lead:'给线性规划内点系统加入目标 Hessian。',body:String.raw`
\[y=Ax-b>0,\quad\lambda>0,\quad
Gx+g-A^T\lambda=0,\quad Y\lambda=\mu\mathbf1.\]
\[G\Delta x-A^T\Delta\lambda=-r_d,\quad
A\Delta x-\Delta y=-r_p,\quad
\Lambda\Delta y+Y\Delta\lambda=-r_c.\]
<p>这里 \(r_p=Ax-b-y\)、\(r_c=Y\lambda-\mu\mathbf1\)。消去 \(\Delta y,\Delta\lambda\) 得到核心曲率</p>
\[G+A^TY^{-1}\Lambda A.\]
<p>凸性和适当秩条件使系统可求解；非凸 QP 不会仅因添加障碍就自动变成全局可解。等式约束通过额外 KKT 块处理，松弛和乘子使用 fraction-to-boundary 保护。</p>`},
{id:'projection',title:'边界 QP 的梯度投影',pages:'485–490',lead:'盒约束下，投影路径可快速识别固定变量。',body:String.raw`
\[l\leq x\leq u,\qquad x(t)=\Pi_{[l,u]}(x-t\nabla q(x)),\quad t\geq0.\]
<p>投影是逐分量截断，路径在变量碰到边界时发生折点。广义 Cauchy 点沿这条分段线性路径寻找二次模型的第一个适当局部极小点；然后在尚自由的变量子空间进一步优化。</p>
\[R_\tau(x)=x-\Pi_{[l,u]}(x-\tau\nabla q(x)).\]
<p>\(R_\tau=0\) 等价于盒约束的一阶驻点；凸 QP 中它也是全局最优条件。非凸情况下仍需二阶信息。投影方法不像普通梯度法那样要求完整梯度趋零。</p>`},
{id:'practice',title:'QP 自检与 SQP 接口',pages:'490–496',lead:'QP 的作用既是独立资源分配，也是非线性约束算法的内层模型。',body:String.raw`
<ol><li>推导 Schur 补右端的符号，与完整 KKT 解比较。</li><li>构造 \(G\) 不定但 \(Z^TGZ\succ0\) 的等式 QP，解释为何仍有唯一解。</li><li>对活跃集演示核验阻挡比率和被删除乘子的符号。</li><li>为什么盒约束解处 \(\nabla q\) 可以非零？计算投影残差。</li></ol>
<p>下一部分先介绍 <a href="#ch17/quadratic">罚函数和增广 Lagrangian</a>，再把 QP 与非线性模型结合为 SQP。</p>`}
]});
