# LinguaFrame English Video Learning MVP

一个基于 Next.js + React + TypeScript 的英语视频学习网站 MVP。支持示例视频、本地视频、本地字幕、当前字幕跟随、英文/中文/双语字幕切换、0.2x-2x 倍速播放、高亮可点击单词、mock 词典接口、发音、词卡弹窗和 localStorage 生词收藏。

## 技术栈

- Next.js App Router
- React + TypeScript
- TailwindCSS
- Framer Motion
- lucide-react

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 用户系统和数据库

项目已接入 NextAuth + Prisma + PostgreSQL。

1. 复制并修改环境变量：

```bash
cp .env.example .env
```

2. 配置 PostgreSQL：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/linguaframe?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
```

3. 初始化数据库：

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

4. 启动：

```bash
npm run dev
```

默认管理员账号由 `.env` 里的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 创建。

## 页面

- `/login`：登录
- `/register`：注册
- `/`：普通用户学习前台，未登录不可进入
- `/admin`：管理员后台，仅 `admin` 可访问
- `/admin/videos`：管理员视频与字幕管理，支持上传、编辑、发布、下架、删除
- `/admin/settings`：管理员网站设置，控制网站名称、Logo、主题色、首页文案和播放器说明

普通用户只能通过前台看到 `published = true` 的视频。所有 `/api/admin/*` 接口都会校验 admin 权限。

## 示例资源

- 示例视频 URL：`https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`
- 示例字幕：`public/sample.vtt`

页面首次加载会自动读取示例双语字幕。你也可以点击“本地视频”和“加载字幕”上传自己的视频、WebVTT 或 SRT 字幕文件。字幕文件如果同时包含英文行和中文行，播放器会自动拆成双语字幕；如果只有英文，则中文模式会显示暂无中文字幕。

## API

```http
GET /api/word?text=curiosity
```

接口当前使用 mock 数据，返回字段包括：

- `word`
- `phonetic`
- `audioText`
- `chinese`
- `english`
- `example`
- `forms`

现在会优先读取数据库里的 `DictionaryWord`，没有命中时再使用 `lib/mockDictionary.ts` 作为 mock fallback。

## 目录结构

```text
app/
  api/word/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  SubtitleViewer.tsx
  VideoPlayer.tsx
  WordCard.tsx
lib/
  mockDictionary.ts
  sampleConfig.ts
  subtitleParser.ts
public/
  sample.vtt
types/
  index.ts
```
