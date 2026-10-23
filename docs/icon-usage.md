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
| `static/fonts/tabler-icons.ttf` | 线性字体（5247 图标） |
| `static/fonts/tabler-icons-filled.ttf` | 面性字体（1057 图标） |
| `components/x-icon/x-icon.uvue` | 图标组件 |
| `components/x-icon/icons.ts` | 名称→字形映射（自动生成，勿手改） |
| `styles/x-base.css` | `@font-face` 全局注册 |
| `scripts/gen-tabler-icons.py` | 映射表生成脚本 |

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
