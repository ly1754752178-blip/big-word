# 变量体系设计方案 v0.1

## 设计原则

1. **扁平命名** — 用 `_` 分隔层级（如 `player_stamina`），兼容当前 `Record<string, string|number>` 类型和 `formatVariables` 格式化
2. **按更新来源分类** — 系统自动更新 / LLM 通过 `<vars>` 更新 / 玩家手动编辑
3. **按更新频率分层** — 每回合刷新 / 场景切换刷新 / 事件触发刷新

---

## 一、变量分类总览

### 图例
- 🖥️ 系统托管（游戏引擎每回合自动写入）
- 🤖 LLM 可变（AI 通过 `<vars>` 标签在叙事中更新）
- 👤 玩家可改（VariablePanel 手动编辑）
- ⚡ 高频（每回合刷新）
- 🕐 中频（场景/事件切换时刷新）
- ❄️ 低频/静态（基本不变）

---

## 二、玩家状态层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `player_name` | string | `"山田凉"` | 👤 | ❄️ | 玩家角色名 |
| `player_age` | number | `17` | 🖥️ | ❄️ | 年龄 |
| `player_gender` | string | `"女"` | 👤 | ❄️ | 性别 |
| `player_identity` | string | `"秀华高校二年级生"` | 🖥️ | ❄️ | 社会身份 |
| `player_stamina` | number | `80` | 🖥️🤖 | ⚡ | 体力 0-100 |
| `player_mental` | number | `65` | 🖥️🤖 | ⚡ | 精神 0-100 |
| `player_health` | number | `90` | 🖥️🤖 | ⚡ | 健康 0-100 |
| `player_mood` | string | `"愉悦"` | 🤖 | ⚡ | 当前情绪 |
| `player_fatigue` | number | `30` | 🖥️🤖 | ⚡ | 疲劳度 0-100 |
| `player_conditions` | string | `"轻微感冒"` | 🖥️🤖 | 🕐 | 异常状态（逗号分隔） |
| `player_height` | number | `165` | 👤 | ❄️ | 身高 cm |
| `player_weight` | number | `52` | 👤 | ❄️ | 体重 kg |
| `player_age_stage` | string | `"青少年"` | 🖥️ | ❄️ | 年龄阶段 |
| `player_social_eval` | string | `"普通高中生"` | 🖥️🤖 | 🕐 | 社会评价 |

---

## 三、时空环境层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `time_year` | number | `2024` | 🖥️ | ⚡ | 年 |
| `time_month` | number | `6` | 🖥️ | ⚡ | 月 |
| `time_day` | number | `15` | 🖥️ | ⚡ | 日 |
| `time_weekday` | string | `"星期六"` | 🖥️ | ⚡ | 星期 |
| `time_hour` | number | `14` | 🖥️ | ⚡ | 时 |
| `time_minute` | number | `30` | 🖥️ | ⚡ | 分 |
| `time_period` | string | `"午后"` | 🖥️ | ⚡ | 时段（清晨/上午/午后/傍晚/深夜）|
| `time_sky` | string | `"晴朗"` | 🖥️ | ⚡ | 天气 |
| `time_season` | string | `"初夏"` | 🖥️ | ⚡ | 季节 |
| `time_festival` | string | `""` | 🖥️ | 🕐 | 当前节日名（无则空） |

---

## 四、位置场景层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `location_current` | string | `"下北泽商店街"` | 🖥️🤖 | 🕐 | 当前地点名 |
| `location_type` | string | `"商店街"` | 🖥️ | 🕐 | 地点类型（家/学校/公司/商店/餐厅/公园/车站）|
| `scene_type` | string | `"日常闲逛"` | 🤖 | 🕐 | 当前场景类型 |
| `scene_tone` | string | `"轻松"` | 🤖 | 🕐 | 场景基调（轻松/紧张/温馨/悲伤/欢乐/神秘）|
| `characters_present` | string | `"后藤一里, 喜多郁代"` | 🤖 | 🕐 | 当前在场角色（逗号分隔） |

---

## 五、社交关系层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `social_active_char` | string | `"后藤一里"` | 🤖 | 🕐 | 当前互动的主要角色 |
| `social_affection` | number | `65` | 🤖 | 🕐 | 与当前角色的好感度 0-100 |
| `social_trust` | number | `50` | 🤖 | 🕐 | 与当前角色的信任度 0-100 |
| `social_stage` | string | `"朋友"` | 🤖 | 🕐 | 关系阶段（陌生人/相识/朋友/亲密/恋人）|
| `social_mood` | string | `"开心"` | 🤖 | 🕐 | 对方当前情绪 |
| `social_last_event` | string | `"一起去了咖啡馆"` | 🤖 | 🕐 | 最近一次互动事件摘要 |

---

## 六、经济状况层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `finance_cash` | number | `15000` | 🖥️🤖 | 🕐 | 现金（日元） |
| `finance_income_level` | string | `"普通打工族"` | 🖥️🤖 | ❄️ | 收入水平描述 |
| `finance_recent_expense` | string | `"吉他弦 800円"` | 🤖 | 🕐 | 最近一笔支出 |

---

## 七、当前事务层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `affair_active_project` | string | `"文化祭演出准备"` | 🖥️🤖 | 🕐 | 当前进行中的项目 |
| `affair_project_progress` | number | `60` | 🖥️🤖 | 🕐 | 项目进度 0-100 |
| `affair_next_event` | string | `"明天与乐队合练"` | 🖥️🤖 | 🕐 | 下一个日程事件 |
| `affair_pending_choice` | string | `""` |  🤖 | 🕐 | 当前待做的决定（空=无） |

---

## 八、叙事上下文层

| 变量名 | 类型 | 示例值 | 来源 | 频率 | 说明 |
|--------|------|--------|------|------|------|
| `narrative_last_summary` | string | `"和朋友们去了咖啡馆，聊了乐队的事"` | 🤖 | ⚡ | 上一段叙事的摘要 |
| `narrative_ongoing_thread` | string | `"组建乐队的梦想"` | 🤖 | 🕐 | 当前叙事主线关键词 |
| `narrative_recent_decision` | string | `"决定参加文化祭"` | 🤖 | 🕐 | 最近的玩家选择 |

---

## 九、完整变量清单（按优先级）

### P0 — 必须（每回合都需要的基础上下文）
```
player_name, player_stamina, player_mental, player_health, player_mood,
time_period, time_sky, time_season, time_weekday,
location_current, location_type,
finance_cash
```

### P1 — 重要（影响叙事质量和AI决策）
```
player_age, player_identity, player_fatigue, player_conditions,
time_festival, time_hour,
scene_type, scene_tone, characters_present,
social_active_char, social_affection, social_trust, social_stage,
affair_active_project, affair_next_event,
narrative_last_summary
```

### P2 — 锦上添花（丰富细节）
```
player_gender, player_height, player_weight, player_age_stage,
player_social_eval,
social_mood, social_last_event,
finance_income_level, finance_recent_expense,
affair_project_progress, affair_pending_choice,
narrative_ongoing_thread, narrative_recent_decision
```

---

## 十、变量流转示意

```
┌─────────────────────────────────────────────────────────┐
│                    每回合开始                             │
│                                                         │
│  🖥️ 游戏引擎写入高频变量                                    │
│  (time_*, player_stamina/mental/health, location_*)     │
│                                                         │
│  ↓ 组装 Prompt（变量注入 "当前游戏状态" 块）              │
│  ↓ 发送给 LLM                                           │
│  ↓ LLM 生成叙事 + <vars> 更新                            │
│                                                         │
│  🤖 extractVariables() 提取 LLM 的变量更新               │
│  🤖 deepMerge() 合并到会话状态                           │
│                                                         │
│  ↓ 下回合开始，变量已经是更新后的状态                     │
└─────────────────────────────────────────────────────────┘
```

---

## 十一、当前限制与改进建议

1. **`formatVariables` 不支持嵌套对象** — `prompt-assembler.ts:48-53` 中 `Object.entries` 扁平输出，嵌套对象会显示 `[object Object]`。建议保持扁平命名方案（已采用）。
2. **无数组类型** — `Record<string, string|number>` 不支持数组。`characters_present` 使用逗号分隔字符串代替。
3. **无类型安全** — 变量全是 `string|number`，无法区分整数/浮点/枚举。初期可接受，后期可考虑引入变量 schema 校验。
4. **系统变量与 LLM 变量混在一起** — 没有隔离机制。当前设计用命名前缀区分来源，但无法阻止 LLM 覆盖系统变量（有时这是需要的，如 player_mood）。

---

## 十二、下一步

1. 确认变量清单是否覆盖了你关心的游戏维度
2. 确定哪些变量应该由系统自动同步（需要写 `GameState → Variables` 的桥接代码）
3. 确定 `narrative_last_summary` 等叙事变量的管理方式
4. 是否需要为特定角色定制专属变量（如与某角色的特殊事件计数）
