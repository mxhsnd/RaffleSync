# RaffleSync

最小可行抽奖系统，包含：
- 扫码报名页
- 报名成功编号展示
- 后台登录
- 报名名单查看
- 奖项管理
- 抽奖
- 兑奖核验
- PostgreSQL 持久化
- Docker 一键部署
- 后台切换 5 套票据样式

## 默认账号
- 用户名：`admin`
- 密码：`admin123`

## 本地开发
### 1. 启动 PostgreSQL
创建数据库 `rafflesync`，然后执行：

```bash
psql -U postgres -d rafflesync -f backend/sql/schema.sql
```

### 2. 启动后端
```bash
cp .env.example .env
npm install --prefix backend
npm run dev --prefix backend
```

### 3. 启动前端
```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

前端默认地址：`http://localhost:5173`
后端默认地址：`http://localhost:3000`
抽奖大屏地址：`http://localhost:5173/screen`
后台地址：`http://localhost:5173/admin/login`

## Docker 部署
在项目根目录执行：

```bash
docker compose up --build -d
```

当前仓库里的 Docker 配置使用了可访问镜像源和避免本机端口冲突的映射：
- 前端：`http://localhost:18080`
- 后端：`http://localhost:13000`
- PostgreSQL：`localhost:55432`

抽奖大屏：
- `http://localhost:18080/screen`

后台：
- `http://localhost:18080/admin/login`

## Tailscale Funnel
如果要把前端公开到互联网，可在部署机器上执行：

```bash
tailscale funnel 18080
```

示例访问地址：
- 首页：`https://<your-device>.tail*.ts.net/`
- 后台：`https://<your-device>.tail*.ts.net/admin/login`

前端已配置为通过同域 `/api` 访问后端，适合通过 Funnel 直接在手机端报名与查询。

## 票据样式切换
后台总览页支持切换 5 套完全不同的票据展示风格：
- Aurora
- Retro
- Minimal
- Festival
- Blueprint

切换后会同步影响：
- 报名成功页
- 查询抽奖编号结果页

## 说明
- PostgreSQL 首次启动时会自动执行 `backend/sql/schema.sql`
- 前端默认通过 `/api` 访问后端；本地开发环境可继续使用 `http://localhost:3000/api`
- 手机端输入框已调整为不触发 iPhone/Safari 聚焦自动放大
- 如部署到服务器，请按你的实际端口、域名或反向代理配置调整 `docker-compose.yml`
