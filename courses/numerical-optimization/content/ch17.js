window.OPT_CHAPTERS.push({id:'ch17',number:'17',title:'罚函数与增广 Lagrangian',subtitle:'Penalty and Augmented Lagrangian Methods · 可行性、精确罚与乘子更新',pages:'497–528',sections:[
{id:'quadratic',title:'二次罚函数：把违反度加入目标',pages:'497–501',lead:'有限罚系数通常只能逼近约束解，不能使约束自动精确成立。',body:String.raw`
\[Q_\rho(x)=f(x)+\frac\rho2\left(\sum_{i\in\mathcal E}c_i(x)^2+
\sum_{i\in\mathcal I}\min(c_i(x),0)^2\right),\quad\rho>0.\]
<p>平方负部在零处一阶连续，通常不是二阶连续；等式罚函数在光滑数据下光滑。逐步提高 \(\rho\)，以内层无约束或边界约束算法近似最小化，外层检查原约束。</p>
\[\min\tfrac12\big((x_1-2)^2+x_2^2\big)\quad\text{s.t. }x_1=0.\]
<p>精确解为 \((0,0)\)。罚子问题解 \((2/(1+\rho),0)\) 在任意有限 \(\rho\) 下仍违反等式。演示用这个例子比较二次罚与增广 Lagrangian，并显示法向/切向曲率比。</p>
<div data-demo="penalty-al"></div>`},
{id:'framework',title:'外层罚更新与内层容差',pages:'501–505',lead:'只把罚系数变大而不准确求解子问题，不足以保证极限正确。',body:String.raw`
\[\|\nabla Q_{\rho_k}(x_k)\|\leq\tau_k,\qquad\rho_k\to\infty,\quad\tau_k\to0.\]
<p>如果精确全局子问题解存在且有聚点，在适当条件下可以证明可行聚点是原问题全局解。实际内层通常只求驻点；此时即使罚系数无穷，聚点也可能不可行，只是违反度平方的驻点。可行聚点加 LICQ 与内层驻点精度才支持 KKT 结论。</p>
\[\lambda_k=-\rho_k c(x_k)\quad\text{等式情形},\qquad
\nabla Q=g-A^T\lambda_k.\]
<p>等式乘子估计的负号来自 \(L=f-\lambda^Tc\)。不等式违反时同样令 \(\lambda_i=-\rho\min(c_i,0)\geq0\)。最终需要检查可行性、乘子符号、互补性和驻点，不能只检查罚函数梯度。</p>`},
{id:'conditioning',title:'罚系数引起的病态与改写',pages:'505–507',lead:'法向方向越来越硬，切向方向的原始曲率可能几乎不变。',body:String.raw`
\[\nabla^2Q_\rho=\nabla^2f+\rho\sum_i c_i\nabla^2c_i+\rho A^TA
=\nabla^2L(x,-\rho c)+\rho A^TA.\]
<p>接近规则可行点时，\(A^TA\) 在法向方向增大特征值，在切空间为零；因此常见条件数随 \(\rho\) 增大。并非所有问题都必然病态，例如满维独立等式或单维问题可能所有相关特征值一起增长。</p>
<details><summary>避免直接形成大罚 Hessian</summary><div><p>令 \(H=\nabla^2L\)、\(\lambda=-\rho c\)。Newton 方程 \((H+\rho A^TA)p=-g-\rho A^Tc\) 可以写为</p>
\[\begin{bmatrix}H&-A^T\\A&\rho^{-1}I\end{bmatrix}
\begin{bmatrix}p\\\delta\lambda\end{bmatrix}
=\begin{bmatrix}-g+A^T\lambda\\0\end{bmatrix}.\]
<p>第二行给 \(\delta\lambda=-\rho Ap\)，消元恢复原方程。增广表示避免显式形成 \(\rho A^TA\)，但仍需稳定的不定求解与正确缩放。</p></div></details>`},
{id:'exact',title:'ℓ1 精确罚与乘子阈值',pages:'507–511',lead:'有限罚系数可以保留局部解，代价是非光滑性。',body:String.raw`
\[\phi_\rho=f+\rho\left(\|c_{\mathcal E}\|_1+\|\min(c_{\mathcal I},0)\|_1\right).\]
<p>在规则性与二阶充分条件下，\(\rho>\|\lambda_*\|_\infty\) 可使原局部解也是精确罚函数的严格局部极小点。“精确”指解的对应性，不是某个数值迭代有限步必然精确可行，也不意味着所有罚函数局部点都正确。</p>
<details><summary>单变量阈值</summary><div><p>对 \(f(x)=\tfrac12(x-2)^2,c(x)=x=0\)，原乘子 \(\lambda_*=-2\)。罚函数 \(f+\rho|x|\) 在零处的次梯度区间为 \([-2-\rho,-2+\rho]\)，包含零当且仅当 \(\rho\geq2\)。二次罚则只有在 \(\rho\to\infty\) 时趋于零。</p></div></details>
<p>阈值与约束尺度有关；把单位不同的约束未经缩放混合进一个 ℓ1 范数会产生难以解释的罚权重。</p>`},
{id:'nonsmooth',title:'非光滑罚函数的平滑子问题',pages:'511–514',lead:'通过额外变量表示绝对值，比假装它处处可微更可靠。',body:String.raw`
\[\min_{x,v,w,t} f(x)+\rho\mathbf1^T(v+w+t),\]
\[c_{\mathcal E}(x)=v-w,\quad c_{\mathcal I}(x)\geq-t,\quad v,w,t\geq0.\]
<p>对固定 \(x\)，最小的 \(v+w\) 表示等式绝对违反，\(t\) 表示不等式负部。线性化这些约束后可形成 LP/QP 弹性子问题，即使原始线性化不可行也仍可求步。</p>
<p>若原问题不可行，大罚系数可能导向违反度的局部最小点；必须报告它是可行性恢复结果，不能称作原问题最优解。教材还讨论更一般罚范数与对应乘子对偶范数阈值。</p>`},
{id:'augmented',title:'等式增广 Lagrangian 的推导',pages:'514–519',lead:'用显式乘子补偿目标的法向梯度，减少对无限大罚系数的依赖。',body:String.raw`
\[\mathcal L_\rho(x,\lambda)=f(x)-\lambda^Tc(x)+\tfrac\rho2\|c(x)\|^2.\]
\[x_{k+1}\approx\arg\min_x\mathcal L_{\rho_k}(x,\lambda_k),\qquad
\lambda_{k+1}=\lambda_k-\rho_k c(x_{k+1}).\]
\[\nabla_x\mathcal L_\rho(x_{k+1},\lambda_k)=
\nabla f(x_{k+1})-A(x_{k+1})^T\lambda_{k+1}.\]
<p>内层梯度小，更新后的乘子即接近原 KKT 驻点条件。若 \(\lambda=\lambda_*\)，则原解处增广梯度精确为零；LICQ 和 SOSC 下足够大但有限的 \(\rho\) 可使增广 Hessian 正定。</p>
<p>乘子迭代不能脱离内层求解。局部收敛要求乘子初值、罚系数、子问题求解精度等条件；不会自动处理所有非凸初值或不规则约束。</p>`},
{id:'inequalities',title:'不等式与边界的实际处理',pages:'519–525',lead:'将一般不等式引入松弛，或使用投影型乘子更新。',body:String.raw`
\[c_{\mathcal I}(x)-s=0,\quad s\geq0.\]
<p>把松弛等式放入增广 Lagrangian，内层用边界约束算法求解 \((x,s)\)。原始变量自身的简单边界通常直接保留，不需要全部罚掉。</p>
\[\mathcal L^{\mathcal I}_\rho(x,\lambda)=f(x)+\frac1{2\rho}
\sum_{i\in\mathcal I}\left(\max(0,\lambda_i-\rho c_i(x))^2-\lambda_i^2\right),\]
\[\lambda_i^+=\max(0,\lambda_i-\rho c_i(x)).\]
<p>这类形式可由消去非负松弛得到；它保持非负不等式乘子。等式项仍用 \(-\lambda c+\rho c^2/2\)。平方正部带来二阶分段结构，不能假定处处有同一个光滑 Hessian。</p>`},
{id:'implementation',title:'罚更新、内层停止与工程诊断',pages:'519–526',lead:'只有可行性进展不足时才有理由继续提高罚系数。',body:String.raw`
<p>外层可以在违反度未按要求下降时增加 \(\rho\)，否则保持它并继续更新乘子。内层早期容差较松，后期随 KKT 误差收紧；重复使用上一解和适当曲率近似可以减少计算量。</p>
<p>检查 \(\|c\|\)、\(\|g-A^T\lambda\|\)、边界投影残差以及内层线性系统条件。约束无量纲化、独立性检查和参数域保护经常比盲目提高罚系数更有效。</p>
<p>对大规模状态方程，AL 可复用无约束/边界约束内层并保留分块结构；代价是嵌套迭代。SQP 则在每次外层步中直接使用约束线性化。</p>`},
{id:'practice',title:'罚方法自检与 SQP 连接',pages:'526–528',lead:'精确罚、增广乘子与二次罚各解决不同瓶颈。',body:String.raw`
<ol><li>手算演示的罚解、AL 内层解和 \(\lambda\) 递推，核对符号。</li><li>解释为什么 \(\rho A^TA\) 通常只强化法向曲率。</li><li>为什么罚函数梯度为零还不足以证明原问题 KKT？</li><li>从非负松弛消元推导不等式 AL 的正部表达式。</li></ol>
<p>下一章 <a href="#ch18/newton">SQP</a> 在原始—对偶空间建立 Newton 模型，精确罚函数则继续作为它的接受机制之一。</p>`}
]});
