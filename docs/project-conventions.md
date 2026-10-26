# blog-x 工程约定总览

uni-app x 版博客前端（规划中）：与 `blog-home-nuxt`（Web 主站）、`blog-home-uniapp`（uni-app 小程序/App）同源的第三个前端载体，后端均为 `blog-server`（协议 `{ code, data, message }`）。

## 技术栈

- uni-app x（uvue）· Vue 3 `<script setup>` + TypeScript
- 蒸汽模式（manifest `vapor: true`）· 样式隔离 `styleIsolationVersion: 2`
- uni-ui x 官方组件库（easycom）
- 编译目标：`APP-ANDROID` + `MP-WEIXIN`（`platformConfig.json`）
- 运行/编译：HBuilderX（无独立 Vite / CLI dev server）
- 微信小程序：主包 + `pages-blog` / `pages-rpg` / `pages-tool` 分包（见 README「分包约定」）

## Cursor 规则索引

| 规则 | 作用范围 | 内容 |
|------|----------|------|
| `x-00-core` | 全局 | 项目总览、目录职责、变更原则 |
| `x-01-structure` | `*.{uvue,uts,ts}` | 目录与模块边界 |
| `x-02-uvue-style` | `*.uvue` | uvue + TS 编码风格、生命周期 |
| `x-03-conditional-platform` | `*.{uvue,uts,ts,json}` | 条件编译与多端差异 |
| `x-04-commenting-hard-requirement` | 全局 | 注释规范（新功能必注释） |
| `x-05-page-development` | `pages/**/*.uvue` | 页面开发与样式约束 |
| `x-06-uni-modules` | `pages/**/*.uvue` | uni_modules / uni-ui x 使用 |
| `x-07-api-request-contract` | `api/**,utils/**` | 请求封装与联调契约（预留） |
| `x-08-commit-message` | 全局 | 提交信息格式 |
| `x-09-testing-and-artifacts` | 全局 | 测试验收与产物约束 |

配套文档：`docs/page-development-guide.md`（页面开发展开说明）。

## 关键约定速查

1. **模板**：只用 uni-app x 内置组件；文字包 `<text>`；禁 DOM/web 库。
2. **样式**：class 选择器 + rpx/px + flex；运行时主题走 `useTheme` + `var(--x-*)`；`$uni-*` 编译期兜底；组件样式走 class/externalClass。
3. **路由**：新页面按主包/分包归类后在 `pages.json` 登记；首页保持 `pages` 第一项；四 Tab 在主壳 `pages/index`（`uni-tab` tab-bar-blur），用 `goTab` 切换，无原生 tabBar。
4. **分包**：低频/大体量进 `pages-blog|pages-rpg|pages-tool`；跳转 path 含 root；可用 `preloadRule` 预下载。
5. **注释**：新文件顶 + 导出函数中文 JSDoc；条件编译必注释；展示数据只用 API 字段。
6. **请求**：统一 `api/request.ts` 解包 `{ code, data, message }`；token 集中 `utils/storage.ts`。联调目标见 `api/dev-target.js`；`USE_MOCK` / `WEB_DEV_PROXY` / `OPEN_ENCRYPT` / `OPEN_REQUEST_LOG` 见 `api/config.ts`；Web 代理见 `vite.config.js`。新增接口改 `api/registry.ts` + `modules/`。页面用 `apiOrMock` 失败回落 `mock/`。
7. **鉴权与加密**：有 token 带 `Authorization: Bearer`；`OPEN_ENCRYPT` 时走 `/encrypt` + `utils/gateway-crypto`（对齐 Nuxt）；`OPEN_REQUEST_LOG` 只打加解密密文出入参与失败日志，不打明文。
8. **登录态**：Pinia `store/user.ts`（`main.ts` 已 `app.use(createPinia())`）。账号 / 微信登录、退出、冷启动 `tryAutoLogin` 只走 Store；页面勿散落写 token。蒸汽模式用原版 Pinia（见官方 store 文档）。
9. **提交**：Conventional Commits + 中文 subject（`<type>(<scope>): <中文简述>`）。
10. **产物**：`unpackage/` 禁改禁提交；验证由用户在 HBuilderX / 微信开发者工具触发。
