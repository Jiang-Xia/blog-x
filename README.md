# blog-x

uni-app x（uvue）版博客前端：与 `blog-home-nuxt`、`blog-home-uniapp` 同源，后端对接 `blog-server`（协议 `{ code, data, message }`）。

编译目标见 `platformConfig.json`：本地以 **APP-ANDROID** 为主，发行目标含 **MP-WEIXIN**（微信小程序）。

当前阶段已按 [`prototypes/blog-app-xiaoka-style.html`](../prototypes/blog-app-xiaoka-style.html) 落地 **小卡风格 UI + mock 交互**；`api/request.ts` 仅为联调占位，页面数据走 `mock/` 与 `composables/useMockStore.ts`。

## 目录结构

```
blog-x/
├── pages/            # 主包：主壳 Tab + 高频二级页
├── pages-blog/       # 分包：归档 / 留言 / 友链 / 收藏 / 审核 / AI 等
├── pages-rpg/        # 分包：抽奖 / 排行 / 日历 / 充值
├── pages-tool/       # 分包：实用工具（占位）
├── components/       # x-tab-* / x-navbar / x-toast / x-empty / x-tip-sheet
├── composables/      # useMockStore 跨页状态
├── mock/             # 原型静态数据
├── types/            # TS 类型
├── api/              # request 占位（未联调）
├── utils/            # storage / toast / tabNav
├── pages.json
├── manifest.json
└── docs/
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

底栏：`uni_modules/uni-tab-bar` 的 **tab-bar-blur**（半透明毛玻璃悬浮），图标文案对齐原型 ⌂ / ◎ / ✦ / ☺。切 Tab 用 `utils/tabNav.goTab`，**不要**用 `uni.switchTab`（已无 pages.json 原生 tabBar）。

示意 Toast（无独立页）：写文章、标签墙、背包装扮。

## 分包约定

| 分包 root | 说明 |
| --- | --- |
| `pages/` | 启动主壳、详情、搜索、登录、消息；旧 Tab 路径仅重定向 |
| `pages-blog/` | 阅读 / 用户内容 / AI / 审核 |
| `pages-rpg/` | 玩法页（中心 UI 在主壳 `x-tab-rpg`） |
| `pages-tool/` | 工具箱 |

跳转示例：`uni.navigateTo({ url: '/pages-blog/archives/index' })`（path 含 root）；回 Tab：`goTab(TAB_HOME)`。

## 开发与验证

- 运行/编译：HBuilderX（无独立 Vite dev server）。
- Android：运行到自定义基座；微信：发行后用微信开发者工具打开产物。
- Agent 勿自动启动 HBuilderX / 开发者工具。
- 验收清单：[`docs/qa-checklist.md`](docs/qa-checklist.md)。

更多约定：`docs/project-conventions.md`、`docs/page-development-guide.md`。
