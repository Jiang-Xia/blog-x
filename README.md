# blog-x

uni-app x（uvue）版博客前端：与 `blog-home-nuxt`、`blog-home-uniapp` 同源，后端对接 `blog-server`（协议 `{ code, data, message }`）。

编译目标见 `platformConfig.json`：本地以 **APP-ANDROID** 为主，发行目标含 **MP-WEIXIN**（微信小程序）。

## 目录结构

```
blog-x/
├── pages/            # 主包：冷启动 + TabBar（体积预算内）
├── pages-blog/       # 分包：阅读 / 用户内容
├── pages-rpg/        # 分包：RPG 冒险
├── pages-tool/       # 分包：实用工具
├── components/       # 跨页面复用（待建）
├── api/              # 请求封装（待建）
├── uni_modules/      # uni-ui x 等
├── static/           # 静态资源
├── pages.json        # 页面注册、subPackages、preloadRule、tabBar
├── manifest.json     # 应用信息与 mp-weixin 配置
└── docs/             # 工程约定与页面开发指南
```

## 分包约定（微信小程序）

对齐 `blog-home-uniapp` 的语义分包名；拆分方式参考商户端 uni-app（`subPackages` + `preloadRule`）以控制主包体积。

| 分包 root | 说明 | 跳转示例 |
| --- | --- | --- |
| `pages/` | 主包：首页、详情、搜索、Tab 壳页、登录等 | `/pages/index/index` |
| `pages-blog/` | 归档、分类、友链、留言、用户中心等 | `/pages-blog/index/index` |
| `pages-rpg/` | 冒险中心与玩法页 | `/pages-rpg/index/index` |
| `pages-tool/` | 工具箱（体积大、低频） | `/pages-tool/index/index` |

**原则**

1. **主包只放**：启动页、TabBar、高频入口；完整业务进对应分包。
2. **新增页面**：低频/大体量 → 写入对应 `pages-*`，并在 `pages.json` → `subPackages` 登记。
3. **预下载**：用 `preloadRule` 在进入主包高频页后预拉相关分包（见现有首页 → `pages-blog`）。
4. **路径**：`uni.navigateTo({ url: '/pages-blog/archives/index' })`（root + path，与 uni-app / uni-app x 一致）。

当前 `pages-blog` / `pages-rpg` / `pages-tool` 仅为占位页，业务落地时替换并补文档对照表。

## 开发与验证

- 运行/编译：HBuilderX（无独立 Vite dev server）。
- Android：运行到自定义基座；微信：发行 → 微信小程序，用微信开发者工具打开 `unpackage/dist/dev/mp-weixin`（或 release 产物）。
- Agent 勿自动启动 HBuilderX / 开发者工具；验证由人工触发。

更多约定：`docs/project-conventions.md`、`docs/page-development-guide.md`。
