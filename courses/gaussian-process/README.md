# 高斯过程与贝叶斯优化交互讲义

公开独立页面：/courses/gaussian-process/，入口位于 /teaching/。
18 节、10 个交互实验。后续公开版修改以本目录为准。

- content-source.mjs：正文与 LaTeX 公式源文件。
- build.mjs：运行 `node build.mjs /path/to/katex.mjs` 生成离线 MathML 的 content.js。
- app.js、models.js、styles.css：导航、交互、数值计算与样式。
- verify.cjs：运行 `node verify.cjs` 检查数值计算与内容结构。

在仓库根目录运行 `python -m http.server 8765 --bind 127.0.0.1`，可预览此目录的独立页面。
修改运行文件后须更新 index.html 对应的缓存版本。源代码与验证脚本不进入 Jekyll 发布产物。
原始 PPT、笔记和教材未包含在本目录。reaction-ai 下的本地课程保持独立，不随本讲义发布。
