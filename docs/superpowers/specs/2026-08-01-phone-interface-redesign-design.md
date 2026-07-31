# 手机界面全方位重制设计

> 日期：2026-08-01  
> 分支：feature/talent-detail-modal  
> 状态：已确认

## 背景

当前游戏内手机界面外框较为简陋（纯色圆角条 + 简单屏幕），APP 图标使用 Lucide 图标加彩色背景块，整体质感与真实智能手机差距较大。用户希望参考提供的样机图片，对手机外框、状态栏、APP 图标进行全面重制，使其更接近真实日系智能手机的视觉体验。

## 目标

1. 重制手机外框美术效果，精细复刻参考图的金属边框、圆角、刘海、侧键、底部指示条。
2. 状态栏左上角显示当前游戏时间，右上角显示信号 / WiFi / 电量图标。
3. 使用用户提供的真实 APP 图标素材，替换并增删当前手机界面中的 APP。
4. 处理图标素材中的白边、异色边角与外轮廓，保留 APP 本身图标。

## 参考资源

- `F:\AI\gongcheng\手机风格重制.jpg`
- `F:\AI\gongcheng\手机风格重制2.jpg`
- `F:\AI\gongcheng\LINE.jpg`
- `F:\AI\gongcheng\X.jpg`
- `F:\AI\gongcheng\PayPay.jpg`
- `F:\AI\gongcheng\Google Maps.jpg`
- `F:\AI\gongcheng\Yahoo! JAPAN.jpg`
- `F:\AI\gongcheng\TimeTree.jpg`
- `F:\AI\gongcheng\Gmail.jpg`
- `F:\AI\gongcheng\Instagram.jpg`
- `F:\AI\gongcheng\系统设置.jpg`
- `F:\AI\gongcheng\YouTube.jpg`
- `F:\AI\gongcheng\tiktok.jpg`

## 设计决策

### 1. 手机外框

参考 iPhone 风格样机：

- **尺寸**：保持当前约 288px × 560px 的显示区域，外框整体略大于屏幕区域。
- **边框**：银灰色金属质感边框，使用多层 `box-shadow` 与渐变模拟金属反光。
- **圆角**：外框圆角约 44px–48px，屏幕圆角约 38px–40px。
- **刘海 / Dynamic Island**：屏幕顶部中央黑色胶囊形刘海，内嵌听筒/前置摄像头细节。
- **侧键**：左侧音量键 + 静音键，右侧电源键，使用绝对定位的小矩形表现。
- **底部 Home 指示条**：屏幕底部中央细长圆角条，白色半透明。
- **屏幕**：奶油白背景，带轻微内阴影模拟屏幕下沉效果。

### 2. 状态栏

- **左上角**：当前游戏时间，格式 `HH:mm`（如 `09:45`），使用无衬线数字字体。
- **右上角**：信号塔图标、WiFi 图标、电量图标，黑色/深灰色，与参考图一致。
- 状态栏高度约 28px，位于屏幕安全区内、刘海下方。

### 3. APP 布局

采用 **3 列 × 4 行** 网格：

- 共 11 个 APP。
- 前 9 个填满首屏 3×3 区域。
- 第 10、11 个位于第四行左侧两个位置，右侧留空。
- 每个 APP 为图标 + 名称纵向排列，图标尺寸约 56px，名称使用 11px 深色文字。

### 4. APP 图标

- 使用用户提供的 jpg 图片作为 APP 图标。
- 图标复制到项目 `public/phone-icons/` 目录。
- 图标渲染为圆角矩形（约 22% 圆角，即 `rounded-[22%]`），与 iOS APP 图标一致。
- 通过裁剪或 CSS 遮罩去除白边、异色边角与外轮廓，保留 APP 主体。
- 不再使用 Lucide 图标 + 彩色背景块。

### 5. APP 名称与替换映射

| 新 APP | 英文名 | 替换/新增 | 说明 |
|--------|--------|-----------|------|
| LINE | LINE | 替代聊天、消息、动态 | 点击后继承旧 ChatApp 功能 |
| X | X | 新增 | 占位，后续可接入 SNS |
| Instagram | Instagram | 替代相册 | 占位 |
| PayPay | PayPay | 替代钱包 | 占位 |
| Google Maps | Google Maps | 替代旅行 | 占位 |
| Yahoo! JAPAN | Yahoo! JAPAN | 替代新闻 | 占位 |
| TimeTree | TimeTree | 替代日程 | 占位 |
| Gmail | Gmail | 替代邮件 | 占位 |
| 系统设置 | Settings | 新增 | 占位 |
| YouTube | YouTube | 新增 | 占位 |
| TikTok | TikTok | 新增 | 占位 |

### 6. APP 详情页

- LINE 打开原有 `ChatApp`。
- 其余 APP 默认显示占位页：APP 图标 + 名称 + "该应用功能将在后续版本开放"。
- 占位页保留返回按钮。

## 技术方案

### 文件改动

1. **`src/types/index.ts`**
   - 更新 `PhoneAppId` 类型为新的 APP ID 集合。

2. **`src/data/mockData.ts`**
   - 更新 `phoneApps` 数组，使用新的 APP ID、名称、图标路径、颜色（可选）。

3. **`src/components/layout/Phone/PhoneFrame.tsx`**
   - 重写手机外框结构，实现金属边框、刘海、侧键、底部指示条。

4. **`src/components/layout/Phone/PhoneAppGrid.tsx`**
   - 改用 `img` 渲染 APP 图标，3 列 × 4 行网格。

5. **`src/components/layout/Phone/PhoneAppScreen.tsx`**
   - 更新 `appIconMap`，移除已删除 APP 的渲染逻辑。
   - LINE 映射到 `ChatApp`。

6. **`src/components/layout/Phone/index.tsx`**
   - 更新状态栏时间位置到左上角，保留右上角状态图标。

7. **`public/phone-icons/`**
   - 新增 APP 图标图片文件。

### 图标处理

- 将 `F:\AI\gongcheng\*.jpg` 复制到 `public/phone-icons/`。
- 对于有明显白边/异色边角的图标（如 Yahoo! JAPAN、TimeTree、Instagram），使用 CSS `object-fit: cover` 配合 `overflow-hidden rounded-[22%]` 进行视觉裁剪，必要时手动预处理图片文件。
- YouTube 图标注意使用圆角方形整体，而非仅红色播放按钮区域。

## 成功标准

- 手机外框视觉接近参考图，金属边框、刘海、侧键、底部指示条可见。
- 状态栏左上角显示当前时间，右上角显示信号/WiFi/电量。
- APP 图标全部替换为提供的真实图标，名称正确。
- 11 个 APP 按 3 列 × 4 行排列，无错位、遮挡。
- LINE 点击后仍能进入聊天界面。
- TypeScript 类型检查通过。
- 页面渲染无报错，图标无白边/异色边角。

## 依赖与风险

- 依赖：framer-motion、lucide-react、Tailwind CSS（已有）。
- 风险：图标图片尺寸/比例不一，需要统一裁剪或缩放。
- 风险：新 APP 数量 11 个，3×4 布局最后一行留空，需确认视觉可接受。
- 风险：部分图标自带阴影/描边，CSS 裁剪可能无法完全去除，必要时需手动修图。
