# x-icon 图标使用指南

Tabler Icons 字体图标方案，跨端（Android / iOS / 鸿蒙 / Web）渲染完全一致，颜色尺寸任意可控。
**禁止在新代码中继续使用 emoji / 裸 Unicode 符号做图标。**

## 基础用法

```html
<x-icon name="arrow-left" />
<x-icon name="heart" :size="20" color="#e05656" />
<x-icon name="circle-check" filled color="#3db89a" />  <!-- 面性（实心）版本 -->
```

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | String | `''` | Tabler 原生图标名（如 `arrow-left`、`heart`、`diamond`、`sword`） |
| `filled` | Boolean | `false` | 面性版本；该图标无面性时自动回退线性 |
| `size` | Number | `18` | 尺寸（px） |
| `color` | String | `'#1c1a17'` | 颜色 |

组件经 easycom 自动注册，无需 import。

## 怎么找图标

1. **App 内检索（推荐）**：打开开发辅助页 `pages-dev/icons/index`，搜索图标名，点击即复制
2. **官网**：https://tabler.io/icons （线性版直接用原名；面性版即官网带 filled 后缀的图标，去掉 `-filled` 后缀 + `filled` 属性）

## 涉及文件

| 路径 | 说明 |
| --- | --- |
| `static/fonts/tabler-icons.ttf` | 线性字体（5247 图标；App/Web 本地） |
| `static/fonts/tabler-icons-filled.ttf` | 面性字体（1057 图标；App/Web 本地） |
| `components/x-icon/x-icon.uvue` | 图标组件 |
| `components/x-icon/icons.ts` | 名称→字形映射（自动生成，勿手改） |
| `styles/x-base.css` | App/Web `@font-face`（小程序条件编译排除） |
| `utils/load-tabler-fonts.ts` | 微信小程序 `uni.loadFontFace`（自建 HTTPS，勿用国外 CDN） |
| `utils/icon-name.ts` | 历史 emoji / 任意字符串 → Tabler 名（联调兜底） |
| `scripts/gen-tabler-icons.py` | 映射表生成脚本 |

业务字段约定：`coverIcon` / `authorIcon` / `avatarIcon` / 通知与抽奖的 `icon` 均为 Tabler 名；接口若仍返回 emoji，经 `toIconName` 后再交给 `x-icon`。

## 微信小程序

小程序 **不支持** WXSS 引用包内 `/static/fonts/*.ttf`，须在 `App.onLaunch` 用 `uni.loadFontFace` 拉 **自建 HTTPS** 字体。

当前线性字体：

`https://jiang-xia.top/x-api/blog-server/static/uploads/2026-10/28193d11434442f9b0a696ff9a29fa4c-tabler-icons.ttf`

1. 开发工具：`manifest.json` → `mp-weixin.setting.urlCheck: false` 时可先不配域名
2. **正式版 / 体验版**：微信公众平台 → **downloadFile 合法域名** 增加 `jiang-xia.top`
3. 重新编译后控制台应出现 `[tabler-font] loaded tabler-icons`
4. 面性字体：上传 `tabler-icons-filled.ttf` 后，把完整 URL 填进 `TABLER_ICONS_FILLED_URL`
5. 若真机加载失败，检查响应 `Content-Type` 是否为 `font/ttf`（当前多为 `application/octet-stream`，必要时在 Nginx 补 MIME）

## 升级图标库

```bash
# 1. 下载新版 @tabler/icons-webfont（npm 包或 GitHub release 的 dist/）
curl -L <tarball地址> -o tabler.tgz && tar -xzf tabler.tgz
# 2. 覆盖字体文件
cp package/dist/fonts/tabler-icons.ttf  static/fonts/
cp package/dist/fonts/tabler-icons-filled.ttf static/fonts/
# 3. 重新生成映射表
python scripts/gen-tabler-icons.py package/dist
```

## 彩色图标 / 游戏资产约定

- **UI 图标**（导航、按钮、空状态）：一律 `x-icon`，需要"彩色感"用 渐变色块 + 白色图标 组合
- **游戏内容资产**（RPG 物品 / 宠物）：走图片 `static/images/rpg/{iconKey}.png`，不用字体图标
