# RaffleSync

毕业晚会抽奖系统，纯静态前端实现，支持控制台页面和大屏展示页联动。

## 页面

- `index.html`：大屏展示页
- `admin.html`：后台控制页

## 本地运行

在项目目录启动静态服务：

```bash
python3 -m http.server 8000
```

然后打开：

- 大屏展示页：http://localhost:8000/index.html
- 后台控制页：http://localhost:8000/admin.html

## 使用说明

1. 先打开大屏展示页。
2. 再打开后台控制页。
3. 在后台选择抽奖环节并开始抽取，大屏会同步展示动画和结果。

## 技术说明

项目不依赖后端服务，页面间通信使用浏览器的 `BroadcastChannel` API。字体文件已打包在项目内，无需额外安装。
