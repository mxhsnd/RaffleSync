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

启动后：
- 前端：`http://localhost:8080`
- 后端：`http://localhost:3000`
- PostgreSQL：`localhost:5432`

抽奖大屏：
- `http://localhost:8080/screen`

后台：
- `http://localhost:8080/admin/login`

## 说明
- PostgreSQL 首次启动时会自动执行 `backend/sql/schema.sql`
- 前端构建时默认访问 `http://localhost:3000/api`
- 如部署到服务器，请把 `docker-compose.yml` 中前端构建参数和后端环境变量改成你的实际域名或内网地址
