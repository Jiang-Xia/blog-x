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
| `static/fonts/*-subset.ttf` | 子集字体（脚本生成；小程序 base64 来源 / CDN 备用） |
| `components/x-icon/x-icon.uvue` | 图标组件 |
| `components/x-icon/icons.ts` | 子集映射，线上各端引用（脚本生成，勿手改） |
| `components/x-icon/icons-full.ts` | 全量映射（预览页/开发用，脚本生成） |
| `styles/x-base.css` | `@font-face`：仅 App/Web 本地 ttf（MP 不声明） |
| `utils/tabler-mp-fonts.ts` | 小程序子集 ttf 的 base64（脚本生成，勿手改） |
| `utils/load-tabler-fonts.ts` | MP：`loadFontFace` 加载子集 Data URL（默认）或 CDN 全量 |
| `utils/icon-name.ts` | 历史 emoji / 任意字符串 → Tabler 名（联调兜底） |
| `scripts/gen-tabler-icons.py` | 全量映射生成脚本（升级字体库时用） |
| `scripts/subset-icons.py` | 子集化脚本（**新增/改动图标引用后必须重跑**） |
| `scripts/icon-whitelist.txt` | 动态图标名白名单 |

业务字段约定：`coverIcon` / `authorIcon` / `avatarIcon` / 通知与抽奖的 `icon` 均为 Tabler 名；接口若仍返回 emoji，经 `toIconName` 后再交给 `x-icon`。

## 微信小程序（字体子集化）

小程序 **不支持** WXSS 引用包内 `/static/fonts/*.ttf`，且全量字体 1.8MB 无法接受。  
WXSS `@font-face` + base64/woff2 在微信端也经常不生效（Skyline 不支持 woff2）。

**当前方案：`uni.loadFontFace` + 子集 ttf Data URL**（零网络、零域名白名单）：

- `scripts/subset-icons.py` 扫描引用 → 裁剪子集 ttf → base64 写入 `utils/tabler-mp-fonts.ts`
- `App.onLaunch` → `loadTablerFonts()` → `uni.loadFontFace({ global: true, source: url("data:font/ttf;...") })`
- 需基础库 **≥ 3.7.9**（`manifest.json` 已设 `mp-weixin.libVersion`）；开发者工具调试基础库请同步调高
- 实测：约 48 个图标，全量 1.83MB → 子集约 14KB + 7KB ttf

**工作流：页面里新增 `<x-icon name="xxx" />` 后，重跑一次：**

```bash
C:/Users/96379/.workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/subset-icons.py
```

- 脚本自动扫描 `name="x"` / `:name="'x'"` / `name: 'x'` / `icon: 'x'` 四种写法
- **动态拼接的图标名**（如接口下发再映射的）必须加进 `scripts/icon-whitelist.txt`，否则真机会渲染为空白
- 拼写错误会打印 WARN，别忽略
- 控制台应出现 `[tabler-font] loaded tabler-icons`；若 `load fail` 先查基础库版本

**备选方案**（`utils/load-tabler-fonts.ts` 中 `USE_CDN_FALLBACK = true`）：`uni.loadFontFace` 拉 HTTPS 全量字体——需 CORS，且 BootCDN 为 3.44.0 与映射表有版本差；仅当 Data URL 在极旧基础库不可用时再启用。

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
- **游戏内容资产**（RPG 物品 / 宠物 / 抽奖奖品）：用 `x-rpg-item-icon`，只展示物品自身图标：
  1. 后端 enrich 的 `iconUrl`（`/static/rpgAssets/itemIcon/...`，经 `resolveStaticUrl`）
  2. 无上传图则 `x-icon`（物品 `icon` 键经 `toIconName`；`fallback` 如 `sparkles` / `gift` / `paw`）
- 不消费 `itemTypeIcon` / `rarityIcon`；勿前端按 icon 键拼本地路径，勿为稀有度/类型再建 dict
