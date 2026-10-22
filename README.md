# blog-x

uni-app x（uvue）版博客前端：与 `blog-home-nuxt`、`blog-home-uniapp` 同源，后端对接 `blog-server`（协议 `{ code, data, message }`）。

编译目标见 `platformConfig.json`：本地以 **APP-ANDROID** 为主，发行目标含 **MP-WEIXIN**（微信小程序）。

UI 对齐 [`prototypes/blog-app-xiaoka-style.html`](../prototypes/blog-app-xiaoka-style.html)。**联调层已接入**：`api/` 请求核 + 注册表 + 业务 modules；页面默认打真实接口，失败回落 `mock/`（`USE_MOCK=true` 可整页挡板）。

## 目录结构

```
blog-x/
├── pages/            # 主包：主壳 Tab + 高频二级页
├── pages-blog/       # 分包：归档 / 留言 / 友链 / 收藏 / 审核 / AI 等
├── pages-rpg/        # 分包：抽奖 / 排行 / 日历 / 充值
├── pages-tool/       # 分包：实用工具（占位）
├── components/       # x-tab-* / x-navbar / x-toast / x-empty / x-tip-sheet
├── composables/      # useMockStore / useApiOrMock
├── mock/             # 原型静态数据与失败回落
├── types/            # TS 类型
├── api/              # 联调：config / request / registry / modules / mocks
├── utils/            # storage / toast / tabNav
├── pages.json
├── manifest.json
└── docs/
```

## API 联调

| 文件 | 作用 |
|------|------|
| [`api/config.ts`](api/config.ts) | `API_ORIGIN` + `API_PREFIX`、`USE_MOCK`（HBuilderX 无 Vite 时改此文件） |
| [`api/request.ts`](api/request.ts) | `uni.request`，解包 `{ code, data, message }`，Bearer + 401 refresh |
| [`api/registry.ts`](api/registry.ts) | 接口注册表（新增接口追加一行） |
| [`api/createApi.ts`](api/createApi.ts) | 按注册表生成薄封装（类 shopkeeper-cli） |
| [`api/modules/*`](api/modules) | 带适配的业务方法（页面优先用这里） |
| [`api/mocks/`](api/mocks) | 同名方法挡板，`USE_MOCK` 时合并 |

默认 baseURL：`http://localhost:5000/api/v1`（Nest `blog-server`）。改 Go 本地：`API_ORIGIN = 'http://localhost:8000'`。

路径与 [blog-home-uniapp/src/api](../blog-home-uniapp/src/api) / [blog-home-nuxt/api](../blog-home-nuxt/api) 对齐，**禁止自造 URL**。

```ts
import { fetchArticleList } from '@/api/modules/article'
// 或
import { apis } from '@/api'
await apis.getAllTag()
```

## 常用页面（原型 ↔ 路径）

| 原型 screen | 路径 | 包 |
|-------------|------|-----|
| home / discover / rpg / me | `/pages/index/index`（`uni-tab` + tab-bar-blur，`?tab=0~3`） | 主包主壳 |
| discover / rpg / me（旧路径） | `/pages/discover|rpg/entry|me/...` 重定向到主壳对应 Tab | 兼容 |
| search / detail / login / notify | `/pages/search|detail|login|notify/...` | 主包 |
| archive / guestbook / links / favorites / inbox / profile / audit / ai | `/pages-blog/<模块>/index` | 博客分包 |
| lottery / rank / calendar / recharge | `/pages-rpg/<模块>/index` | RPG 分包 |
| tipSheet | 详情页内 `x-tip-sheet` | 组件 |

底栏：`uni_modules/uni-tab-bar` 的 **tab-bar-blur**。切 Tab 用 `utils/tabNav.goTab`，**不要**用 `uni.switchTab`。

示意 Toast（无独立页）：写文章、标签墙、背包装扮。审核台仍 mock（无 C 端对等 API）。

## 分包约定

| 分包 root | 说明 |
| --- | --- |
| `pages/` | 启动主壳、详情、搜索、登录、消息；旧 Tab 路径仅重定向 |
| `pages-blog/` | 阅读 / 用户内容 / AI / 审核 |
| `pages-rpg/` | 玩法页（中心 UI 在主壳 `x-tab-rpg`） |
| `pages-tool/` | 工具箱 |

## 开发与验证

- 运行/编译：HBuilderX（无独立 Vite dev server）。
- 联调前启动 `blog-server`（默认 :5000），按需改 `api/config.ts`。
- Android：运行到自定义基座；微信：发行后用微信开发者工具打开产物。
- Agent 勿自动启动 HBuilderX / 开发者工具。
- 验收清单：[`docs/qa-checklist.md`](docs/qa-checklist.md)。

更多约定：`docs/project-conventions.md`、`docs/page-development-guide.md`。
