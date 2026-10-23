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
├── store/            # Pinia：user（登录态 / 资料 / 自动登录）
├── mock/             # 原型静态数据与失败回落
├── types/            # TS 类型
├── api/              # 联调：config / request / registry / modules / mocks
├── utils/            # storage / gateway-crypto / vendor / toast / tabNav
├── pages.json
├── manifest.json
└── docs/
```

## 登录与 Pinia

- `main.ts` 挂载 `createPinia()`；业务态用 `useUserStore()`。
- 支持 **账号登录**（验证码）与 **微信一键登录**（小程序 `uni.login` → `/user/auth/wechat/miniprogram`）。
- 双 token 仍落在 `utils/storage.ts`；资料缓存 `UserProfileKey` 供冷启动瞬时展示。
- `App.uvue` `onLaunch` 调用 `tryAutoLogin()`：有缓存 token 则自动恢复并拉 `/user/info`。
- 登录页：`/pages/login/login`；「我的」未登录引导登录，已登录可退出。

## API 联调

| 文件 | 作用 |
|------|------|
| [`api/config.ts`](api/config.ts) | `API_ORIGIN` / `USE_MOCK` / `OPEN_ENCRYPT` / `OPEN_REQUEST_LOG` / `GATEWAY_CRYPTO` |
| [`api/request.ts`](api/request.ts) | `uni.request`：解包、Bearer、加密网关、401 refresh、开发日志 |
| [`api/registry.ts`](api/registry.ts) | 接口注册表（新增接口追加一行） |
| [`api/createApi.ts`](api/createApi.ts) | 按注册表生成薄封装（类 shopkeeper-cli） |
| [`api/modules/*`](api/modules) | 带适配的业务方法（页面优先用这里） |
| [`api/mocks/`](api/mocks) | 同名方法挡板，`USE_MOCK` 时合并 |
| [`utils/gateway-crypto/`](utils/gateway-crypto) | 对齐 Nuxt：`/encrypt` 信封加解密（aes） |

默认 baseURL：`http://localhost:5000/api/v1`（Nest `blog-server`）。改 Go 本地：`API_ORIGIN = 'http://localhost:8000'`。

### 鉴权头 / 加密 / 开发日志（对齐 Nuxt）

- 登录后请求自动带 `Authorization: Bearer <token>`（从登录响应 `info.accessToken` 落盘）。
- `OPEN_ENCRYPT=true`：路径加 `/encrypt`；有 body 走信封，GET/DELETE 走 `X-Gateway-*` 自定义头；响应验签解密。
- 账号登录密码经 `encryptLoginPassword`（RSA）后再提交。
- `OPEN_REQUEST_LOG=true`：仅打印加解密密文出入参（`[gateway-crypto] encrypt out` / `decrypt in`）与失败类日志；**不打印明文 body / 请求起止**。
- 开关均在 `api/config.ts`；须与 Nest `app_gatewayCrypto=aes` 一致。若后端未开网关，将 `OPEN_ENCRYPT` 改为 `false`。

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
| archive / guestbook / links / favorites / inbox / profile / audit / ai / tags / write | `/pages-blog/<模块>/index` | 博客分包 |
| lottery / rank / calendar / recharge / backpack | `/pages-rpg/<模块>/index` | RPG 分包 |
| tipSheet | 详情页内 `x-tip-sheet`（钻石 tip + 站点赞赏） | 组件 |

底栏：`uni_modules/uni-tab-bar` 的 **tab-bar-blur**。切 Tab 用 `utils/tabNav.goTab`，**不要**用 `uni.switchTab`。

已联调：详情评论、收件箱回复、任务领奖、标签墙、钻石/站点打赏、AI 流式、签到日历网格（sign-info 推算）、消息分段过滤、首页今日进度（签到+任务）、写文章（`/article/create`）、背包装扮（inventory/loadout）。审核台仍 mock（无 C 端对等 API）；工具箱分包仍占位。

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
