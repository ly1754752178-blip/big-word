# 场景印象图横向化设计

## 背景

当前主界面右侧面板顶部有一块正方形的【场景印象图】区域，使用渐变与 SVG 风景剪影作为占位背景。为了增强场景氛围并减少该区域对纵向空间的占用，需要将其改为横向长方形，并导入指定的动漫场景图。

## 目标

- 将右侧面板顶部的【场景印象图】从正方形改为 **16:9 横向长方形**。
- 导入 `F:\AI\gongcheng\场景动漫化.png` 并在该区域内展示。
- 图片使用 **object-fit: cover** 方式填满容器，保持比例并居中裁剪。
- 城市地图 / 全国地图区域本身保持原有背景，不被场景图覆盖。

## 关键改动

### 1. SceneImpression 组件改造

文件：`src/components/map/SceneImpression.tsx`

- 新增可选属性 `imageUrl?: string`。
- 当传入 `imageUrl` 时：
  - 使用 `<img>` 标签渲染图片。
  - 图片样式：`w-full h-full object-cover`。
  - 组件外层容器使用 `aspect-video` 保持 16:9 比例。
- 当未传入 `imageUrl` 时：
  - 保持现有的渐变背景与风景剪影，作为降级占位。

### 2. RightPanel 布局调整

文件：`src/components/layout/RightPanel.tsx`

- 场景印象图容器不再使用 `flex-[2]`。
- 改为自适应高度，由内部 `SceneImpression` 的 `aspect-video` 决定高度。
- 向 `SceneImpression` 传入图片路径：`/images/scene-anime.png`。

### 3. MiniMap 背景保持不变

文件：`src/components/map/MiniMap.tsx`

- 内部使用的 `<SceneImpression className="absolute inset-0" />` 不传入 `imageUrl`。
- 因此城市地图 / 全国地图仍使用原有渐变风景背景，不会受到场景图影响。

### 4. 资源文件

- 将 `F:\AI\gongcheng\场景动漫化.png` 复制到项目 `public/images/scene-anime.png`。
- 组件通过绝对路径 `/images/scene-anime.png` 引用，Vite 开发服务器可直接提供该静态资源。

## 成功标准

- 页面启动后，右侧面板顶部的场景印象图区域显示为 16:9 横向长方形。
- 区域内展示 `场景动漫化.png`，并以 cover 方式填满、居中裁剪。
- 切换到城市地图 / 全国地图时，地图背景仍为原有渐变剪影，不影响标记可读性。
- 页面整体布局无错位、无溢出。

## 依赖与风险

- 依赖：目标图片文件必须存在于 `F:\AI\gongcheng\场景动漫化.png`。
- 风险：图片文件较大时可能影响首次加载，可通过 Vite 静态资源机制自动处理，无需额外优化。
