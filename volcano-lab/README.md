# VOLCANO LAB · 彩色火山绘本实验室

从会流动的火山封面出发，穿过分层视差开场和五段知识对话，亲手探索岩浆黏度与气体含量如何改变喷发表现。湖蓝天空、蓝紫岩层、珊瑚橙与明黄熔岩、奶油色烟云组成同一个二维手绘世界。

这是 `heyouu5544/lava-flow-garden` 仓库中的 `volcano-lab/` 项目。本次修改发生在实际 Git 检出目录 `github-sync/lava-flow-garden/volcano-lab/`，未将工作区外层的预览副本当作仓库。此前提交历史保留。

## 本地运行

在仓库根目录运行：

```powershell
node volcano-lab/serve.cjs
```

打开 http://127.0.0.1:4173/ 观看开场；http://127.0.0.1:4173/lab.html 直接进入实验台。原生 HTML、CSS、Canvas，无 npm 运行依赖和外部字体，也可直接打开 HTML 离线使用。

## 玩法与保留功能

- 点击「开始探索」，观看远景、村庄横移、山体推进、火山口和剖面的约 9 秒开场。可跳过镜头、跳过介绍或从实验台重新观看。
- 五段对话分别介绍火山、黏度、气体、操作和实验任务。文字出现时点击会立即显示全文，再点击进入下一段。Enter / 空格继续，Esc 进入实验；按钮支持 Tab 导航。减少动态效果设置下直接显示全文并跳过自动推镜。
- 两个 0–100 滑块有刻度、数值和键盘控制，四种组合预设有填色、深紫描边和 ✓ 标记。
- Trigger eruption 启动约 8.5 秒喷发，包含压力积累、释放和稳定阶段；运行中参数锁定、重复触发有说明，Reset 可随时取消。
- 低黏度形成快速、较远并分叉的熔岩流；高黏度形成短厚熔岩与近口穹丘；丰富气体增加喷泉、烟柱和碎屑。四项结果、原因解释与下一次实验建议保留原模型。
- 火山口、灰云、熔岩流和村庄观察会实际移动/放大镜头，显示明黄高亮并更新说明；可返回全景或查看山体剖面。
- 喷发后显示 Maunaulu、圣海伦斯或皮纳图博的教学类比，保留来源与局限；中间组合可能不选择案例。调参数后，上一轮结果仍明确注明原参数。
- 手机采用场景在前、参数在后的单列布局，触发时滚回场景。文字结果不依赖读图。

## 文件与美术

| 文件 | 用途 |
| --- | --- |
| `index.html` / `lab.html` | 开场入口 / 直接实验入口 |
| `storybook.css` | 彩色手绘界面、对话框、状态与响应式布局 |
| `js/scene.js` | 原创山体、植被、村庄、云、颗粒、三层视差与喷发动画 |
| `js/story.js` | 开场镜头、逐字讲解、键盘、跳过与重看 |
| `js/app.js` / `js/observer.js` | 实验生命周期、结果、Reset 与观察 |
| `js/model.js` / `js/history.js` | 保留的教学模型、历史资料与匹配规则 |
| `ASSETS.md` | 素材来源与原创绘制说明 |
| `VERIFICATION.md` | 本次实际验证结果与截图索引 |

旧版 `print.css`、`styles*.css`、旧三维脚本和旧截图保留为历史资料，当前入口只加载 `storybook.css` 和所列脚本。

## 检查

```powershell
node --test volcano-lab/tests/model.test.cjs volcano-lab/tests/history.test.cjs
node --check volcano-lab/js/scene.js
node --check volcano-lab/js/story.js
# 先启动本地服务，再运行真实 Edge 浏览器测试（Windows）：
node volcano-lab/tests/browser-smoke.cjs
```

浏览器脚本使用已安装的 Edge、临时独立配置和本机 CDP 端口 9333，无额外依赖；可用 `EDGE_PATH` 指定安装位置。截图写入 `screenshots/storybook-*.png`。浏览器检查属于开发者自动验证与截图审查，没有真实同学试用。

全部指数是教学相对指数，不是实际距离、高度、气体百分比、VEI 或真实安全边界，也不能用于喷发预测。
