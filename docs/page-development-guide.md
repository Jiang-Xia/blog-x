# blog-x 页面开发指南

> 配套 Cursor 规则：`.cursor/rules/x-05-page-development.mdc`（规则是约束摘要，本文是展开说明）。

## 1. 新建页面流程

1. **归类建文件**（微信主包体积预算；对齐 blog-home-uniapp）：
   - 主包（启动 / TabBar / 高频）：`pages/<模块>/<页面名>.uvue`
   - 博客分包：`pages-blog/<模块>/<页面名>.uvue`
   - RPG 分包：`pages-rpg/<模块>/<页面名>.uvue`
   - 工具分包：`pages-tool/<模块>/<页面名>.uvue`
   - 页面私有组件放同级 `components/`
2. **登记路由**：
   - 主包 → `pages.json` → `pages`：

```jsonc
{
  "path": "pages/detail/detail", // 文章详情（主包高频）
  "style": {
    "navigationBarTitleText": "文章详情"
  }
}
```

   - 分包 → `subPackages` 对应 root 下追加相对 path：

```jsonc
{
  "root": "pages-blog",
  "pages": [
    {
      "path": "archives/index", // 文章归档（分包）
      "style": { "navigationBarTitleText": "文章归档" }
    }
  ]
}
```

   - 首页必须保持主包 `pages` 第一项；标题走 `navigationBarTitleText`
   - 可选：`preloadRule` 在进入主包页后预下载分包（示例：首页 → `pages-blog`；冒险 entry → `pages-rpg`）
3. **写页面**：`<script setup lang="ts">` + uni-app x 内置组件（见 §2）。
4. **验证**：HBuilderX 运行 Android 基座；发行微信小程序后用微信开发者工具核对分包（见 `x-09`，Agent 勿自动启动）。

### 现网 Tab / 分包实例（小卡原型）

| 用途 | path |
|------|------|
| 首页 Tab | `pages/index/index` |
| 发现 Tab | `pages/discover/discover` |
| 冒险 Tab（中心 UI） | `pages/rpg/entry` |
| 我的 Tab | `pages/me/me` |
| 文章详情 | `pages/detail/detail` |
| 归档 | `pages-blog/archives/index` |
| 幸运抽奖 | `pages-rpg/lottery/index` |

本阶段数据来自 `mock/data.ts`；联调后改为 `api/*.ts`（见 `x-07`）。验收见 `docs/qa-checklist.md`。

## 2. uvue 模板与内置组件

- **文字必须包在 `<text>` 内**：App 端原生渲染，`view` 里的裸文本行为不可靠。
- 图片用 `<image>`，显式给宽高；`src` 用绝对路径 `/static/...`。
- 常用内置组件：

| 组件 | 用途 |
|------|------|
| `view` | 容器（默认 flex、纵向） |
| `text` | 文本 |
| `image` | 图片 |
| `scroll-view` | 滚动容器（列表页标配） |
| `swiper / swiper-item` | 轮播 |
| `button / input / textarea` | 表单基础件 |
| `refresh-box`（uni_modules） | 下拉刷新 |

- 禁用浏览器标签（div/span/img/…）与 DOM API。

## 3. 生命周期与路由

```vue
<script setup lang="ts">
// 页面加载：接参并做类型处理
onLoad((options) => {
  const id = options?.id;
  if (!id) return;
});

onShow(() => {});   // 页面显示
onReady(() => {});  // 首次渲染完成
onHide(() => {});   // 页面隐藏
onUnload(() => {}); // 页面卸载（清理 uni.$on 监听、定时器）
</script>
```

- 主包跳转：`uni.navigateTo({ url: '/pages/detail/detail?id=1' })`；返回 `uni.navigateBack()`。
- 分包跳转：`uni.navigateTo({ url: '/pages-blog/archives/index' })`（path **必须含** root）。
- 主壳四 Tab 在 `/pages/index/index`（`uni-tab` + tab-bar-blur）；切 Tab 用 `utils/tabNav.goTab(TAB_*)`，**不要**用 `uni.switchTab`（无原生 tabBar）。
- 轻量跨页事件：`uni.$emit / uni.$on / uni.$off`（onUnload 必须 $off）。

## 4. 样式体系

App 端为原生渲染，CSS 是**子集**：

| 项 | 规则 |
|------|------|
| 选择器 | 只用 class 选择器；不支持标签/后代/通配/伪类等复杂选择器 |
| 单位 | `rpx`（750 设计稿基准）/ `px`；避免 em/rem/vh/vw |
| 布局 | 默认 flex；行布局显式 `flex-direction: row`（或复用 `App.uvue` 的 `.uni-row`） |
| 不支持 | `float`、复杂伪元素；`position: fixed` 差异需真机验证 |
| 主题 | 颜色/字号/间距变量用 `uni.scss` 的 `$uni-*`；页面独有色值才写死 |

组件间样式隔离由 manifest `styleIsolationVersion: 2` 管理：

- 页面样式默认不影响子组件内部；`App.uvue` 基类也**不会**进组件
- 组件若使用 `x-card` / `x-chip` / `x-page-tab` 等，须在自身 `<style>` 中 `@import '../../styles/x-base.css';`（或相对路径）
- 自定义组件子节点样式 → 通过 **externalClass** 开放（uni-ui x 全系组件遵循此约定）

## 5. 数据请求（预留）

`api/` 层搭建后遵循 `x-07-api-request-contract.mdc`：

- 页面只调 `api/<模块>.ts` 的函数，拿到的已是解包后的 `data`
- token 读写集中在 `utils/storage.ts`
- 错误提示统一 `uni.showToast({ title, icon: 'none' })`

## 6. 条件编译

端差异用条件编译并**注释原因**（详见 `x-03-conditional-platform.mdc`）：

```vue
<script setup lang="ts">
// #ifdef APP-ANDROID
// Android 端特有逻辑，如返回键拦截
// #endif
</script>
```

当前 `platformConfig.json` 含 `APP-ANDROID` 与 `MP-WEIXIN`；增减平台先改 targets。

## 7. 使用 uni-ui x 组件

- easycom 自动注册：模板直接 `<uni-rate />`、`<uni-nav-bar-x />` 等，无需 import
- 组件属性只控功能逻辑，**样式全部通过 class / externalClass 自定义**
- 组件清单见 `x-06-uni-modules.mdc`

## 8. 新增页面 Checklist

- [ ] 已按主包/分包归类，`pages.json` 已登记（含标题、注释）
- [ ] 分包跳转 path 含 root（如 `/pages-rpg/index/index`）
- [ ] 文字都在 `<text>` 内；无浏览器标签
- [ ] 只用 class 选择器、rpx/px 单位、flex 布局
- [ ] `onLoad` 参数有判空；`onUnload` 清理了监听/定时器
- [ ] 新增函数有中文 JSDoc（`x-04`）
- [ ] 端差异已条件编译 + 注释
- [ ] HBuilderX Android 基座 / 微信开发者工具验证通过
