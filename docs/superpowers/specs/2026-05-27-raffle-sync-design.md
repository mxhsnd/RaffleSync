# RaffleSync 双屏抽奖系统设计

## 目标

构建一个纯静态毕业晚会抽奖系统。控制台页面在电脑主屏操作，大屏展示页面投屏显示，两者通过 HTML5 `BroadcastChannel` 实时同步。系统包含两轮常规抽奖和一轮院长纪念品抽奖，所有轮次共享同一份名单状态，任何学生不得跨轮次重复中奖。

## 文件结构

- `index.html`：大屏展示页，只负责展示动画、轮次状态和开奖结果。
- `admin.html`：后台控制页，只负责发送指令、控制流程和展示控制状态。
- `data.js`：测试数据源，生成 3000 名学生，5 个学院各 600 人。
- `display.js`：大屏端动画逻辑和 `BroadcastChannel` 接收端。
- `control.js`：控制端交互逻辑、去重抽奖算法和 `BroadcastChannel` 发送端。
- `styles.css`：Tailwind 无法直接覆盖的高级视觉效果和动画。

## 数据模型

`data.js` 暴露 `studentData` 数组。每条记录使用统一结构：

```javascript
{ college, className, name, studentId, isDrawn }
```

测试数据包含 5 个学院，每个学院 600 人，总计 3000 人。控制端加载后以这份数组作为唯一抽奖状态源。中奖后立即将对应学生的 `isDrawn` 设为 `true`。

## 抽奖流程

### 常规抽奖 A/B

控制台支持切换到 `NORMAL_A` 或 `NORMAL_B`，设置抽取人数，点击开始滚动后发送：

```javascript
{ action: 'START_ROLL_NORMAL', count }
```

点击停止开奖时，控制端从全名单中筛选 `isDrawn === false` 的学生，随机抽取指定人数，逐个设为 `true`，并发送：

```javascript
{ action: 'STOP_ROLL_NORMAL', winners }
```

大屏在开始阶段显示高速跳动名字网格，停止后以 Grid 卡片依次弹入展示中奖名单。

### 院长纪念品抽奖

控制台切换到 `DEAN_DRAW` 后显示 5 个学院的独立面板。每个学院支持抽取和重抽。

首次抽取时，控制端从该学院 `isDrawn === false` 的学生中随机抽取 1 人，设为 `true`，发送滚动和结果消息：

```javascript
{ action: 'START_ROLL_DEAN', college }
{ action: 'STOP_ROLL_DEAN', winner }
```

重抽时，控制端先将该学院上一位中奖者恢复为 `isDrawn=false`，再从该学院剩余未中奖学生中抽取新 winner 并设为 `true`，发送：

```javascript
{ action: 'REROLL_DEAN', college, previousWinnerId }
{ action: 'STOP_ROLL_DEAN', winner }
```

大屏固定展示 5 张学院卡片，对应学院滚动并定格结果。

## 通信协议

通信通道统一使用：

```javascript
new BroadcastChannel('raffle-sync')
```

支持以下动作：

- `SWITCH_ROUND`
- `START_ROLL_NORMAL`
- `STOP_ROLL_NORMAL`
- `START_ROLL_DEAN`
- `STOP_ROLL_DEAN`
- `REROLL_DEAN`

消息允许附带展示所需字段，例如 `round`、`roundLabel`、`count`、`college`、`winner`、`winners`。

## 视觉设计

大屏采用暗色星空科技风，优先使用当前目录中的 `background.png`，同时 CSS 预留 `bg.jpg` 替换空间。所有核心卡片使用半透明玻璃拟态：`bg-white/10`、`backdrop-blur-md`、`border-white/20`、柔和阴影和圆角。

姓名、学院、中奖状态等核心信息使用白色大字号文字，并配合发光文字阴影。卡片边缘和中奖状态使用科技蓝、霓虹紫、琥珀金 glow。所有出现、消失和状态切换都带淡入淡出或轻微位移动画，避免生硬切换。

## 验证方式

在浏览器中同时打开 `admin.html` 和 `index.html`：

1. 切换常规 A，设置人数，开始滚动并停止开奖，确认大屏同步展示中奖卡片。
2. 切换常规 B，再次开奖，确认不会抽到 A 轮已中奖者。
3. 切换院长抽奖，分别抽取 5 个学院，确认每院独立定格。
4. 对任一学院执行重抽，确认旧 winner 恢复可抽，新 winner 替换展示。
5. 观察 UI 是否符合暗色科技、玻璃拟态、发光文字和流畅动画要求。
