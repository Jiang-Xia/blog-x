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
2. **样式**：class 选择器 + rpx/px + flex；主题变量走 `uni.scss`；组件样式走 class/externalClass。
3. **路由**：新页面按主包/分包归类后在 `pages.json` 登记；首页保持 `pages` 第一项；TabBar 仅主包。
4. **分包**：低频/大体量进 `pages-blog|pages-rpg|pages-tool`；跳转 path 含 root；可用 `preloadRule` 预下载。
5. **注释**：新文件顶 + 导出函数中文 JSDoc；条件编译必注释；展示数据只用 API 字段。
6. **请求**（预留）：统一 `api/request.ts` 解包 `{ code, data, message }`；token 集中 `utils/storage.ts`。
7. **提交**：Conventional Commits + 中文 subject（`<type>(<scope>): <中文简述>`）。
8. **产物**：`unpackage/` 禁改禁提交；验证由用户在 HBuilderX / 微信开发者工具触发。
