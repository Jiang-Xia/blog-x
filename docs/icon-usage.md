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
| `static/fonts/tabler-icons.ttf` | 线性字体全量（5247 图标；App/Web 本地） |
| `static/fonts/tabler-icons-filled.ttf` | 面性字体全量（1057 图标；App/Web 本地） |
| `static/fonts/*-subset.ttf` | 子集字体（脚本生成，小程序 CDN 备用素材） |
| `components/x-icon/x-icon.uvue` | 图标组件 |
| `components/x-icon/icons.ts` | 子集映射，线上各端引用（脚本生成，勿手改） |
| `components/x-icon/icons-full.ts` | 全量映射（预览页/开发用，脚本生成） |
| `styles/x-base.css` | `@font-face`：App/Web 本地 ttf；MP 条件编译引入 tabler-mp.css |
| `styles/tabler-mp.css` | 小程序 base64 内联子集字体（脚本生成，勿手改） |
| `utils/load-tabler-fonts.ts` | MP 备选：loadFontFace 拉 CDN 全量（默认关闭） |
| `utils/icon-name.ts` | 历史 emoji / 任意字符串 → Tabler 名（联调兜底） |
| `scripts/gen-tabler-icons.py` | 全量映射生成脚本（升级字体库时用） |
| `scripts/subset-icons.py` | 子集化脚本（**新增/改动图标引用后必须重跑**） |
| `scripts/icon-whitelist.txt` | 动态图标名白名单 |

业务字段约定：`coverIcon` / `authorIcon` / `avatarIcon` / 通知与抽奖的 `icon` 均为 Tabler 名；接口若仍返回 emoji，经 `toIconName` 后再交给 `x-icon`。

## 微信小程序（字体子集化）

小程序 **不支持** WXSS 引用包内 `/static/fonts/*.ttf`，且全量字体 1.8MB 无法接受。

**当前方案：base64 内联子集**（零网络依赖、零域名配置、无 CDN 版本差）：

- `scripts/subset-icons.py` 扫描代码里实际引用的图标名 → fonttools 裁剪出子集 woff2（约 16KB）→ base64 写入 `styles/tabler-mp.css`
- `x-base.css` 通过 `#ifdef MP-WEIXIN` 条件编译引入
- 实测：48 个图标，字体 1.83MB → 14KB（ttf）/ 16KB（base64 css）

**工作流：页面里新增 `<x-icon name="xxx" />` 后，重跑一次：**

```bash
C:/Users/96379/.workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/subset-icons.py
```

- 脚本自动扫描 `name="x"` / `:name="'x'"` / `name: 'x'` / `icon: 'x'` 四种写法
- **动态拼接的图标名**（如接口下发再映射的）必须加进 `scripts/icon-whitelist.txt`，否则真机会渲染为空白
- 拼写错误会打印 WARN，别忽略

**备选方案**（`utils/load-tabler-fonts.ts` 中 `USE_CDN_FALLBACK = true`）：`uni.loadFontFace` 拉 HTTPS 全量字体——需配 downloadFile 合法域名 + CORS，且 BootCDN 为 3.44.0 与映射表有版本差；仅当 base64 方案在某些机型异常时再启用。

## 升级图标库

```bash
# 1. 下载新版 @tabler/icons-webfont（npm 包或 GitHub release 的 dist/）
curl -L <tarball地址> -o tabler.tgz && tar -xzf tabler.tgz
# 2. 覆盖字体文件
cp package/dist/fonts/tabler-icons.ttf  static/fonts/
cp package/dist/fonts/tabler-icons-filled.ttf static/fonts/
# 3. 重新生成全量映射表
python scripts/gen-tabler-icons.py package/dist
# 4. 重新子集化
C:/Users/96379/.workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/subset-icons.py
```

## 彩色图标 / 游戏资产约定

- **UI 图标**（导航、按钮、空状态）：一律 `x-icon`，需要"彩色感"用 渐变色块 + 白色图标 组合
- **游戏内容资产**（RPG 物品 / 宠物）：走图片 `static/images/rpg/{iconKey}.png`，不用字体图标
