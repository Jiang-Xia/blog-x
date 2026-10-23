# -*- coding: utf-8 -*-
"""
Tabler 字体子集化：按代码实际引用裁剪字体 + 映射表，解决小程序包体积问题。

用法（用装了 fonttools 的 venv 跑）：
  C:/Users/96379/.workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/subset-icons.py

流程：
  1. 扫描源码中 x-icon 的 name 引用（name="x" / :name="'x'" / name: 'x' / icon: 'x'）
     + scripts/icon-whitelist.txt（动态拼名、条件显示的图标写这里）+ 内置 STARTER 常用集
  2. 校验名称存在于 icons-full.ts，未知名称报警（多半是手滑写错图标名）
  3. 生成：
     - components/x-icon/icons.ts        仅含用到的映射（线上各端引用）
     - static/fonts/tabler-icons-subset.ttf / -filled-subset.ttf（备用/CDN 上传）
     - utils/tabler-mp-fonts.ts          小程序 loadFontFace 用的 base64 ttf（勿用 wxss @font-face）
  4. icons-full.ts 与全量 ttf 保持不动（开发/预览页用）

说明：微信小程序 WXSS 内联 base64/woff2 不可靠；须 App.onLaunch → uni.loadFontFace
（Data URL ttf，基础库 ≥ 3.7.9）。CDN 全量仅作备选。

图标找不到了？优先怀疑：动态拼的 name 没进白名单。加一行重跑即可。
"""
import base64
import io
import os
import re
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL_TS = os.path.join(ROOT, "components", "x-icon", "icons-full.ts")
OUT_TS = os.path.join(ROOT, "components", "x-icon", "icons.ts")
FULL_TTF = os.path.join(ROOT, "static", "fonts", "tabler-icons.ttf")
FULL_TTF_FILLED = os.path.join(ROOT, "static", "fonts", "tabler-icons-filled.ttf")
OUT_TTF = os.path.join(ROOT, "static", "fonts", "tabler-icons-subset.ttf")
OUT_TTF_FILLED = os.path.join(ROOT, "static", "fonts", "tabler-icons-filled-subset.ttf")
OUT_MP_FONTS_TS = os.path.join(ROOT, "utils", "tabler-mp-fonts.ts")
# 旧方案遗留：wxss @font-face base64 woff2，微信端经常不生效，生成空壳避免误用
OUT_MP_CSS = os.path.join(ROOT, "styles", "tabler-mp.css")
WHITELIST = os.path.join(ROOT, "scripts", "icon-whitelist.txt")

SCAN_DIRS = ["pages", "pages-blog", "pages-rpg", "pages-tool", "components", "store", "utils", "composables", "api"]
SCAN_EXCLUDE = ["pages-dev", "icons-full.ts", "icons.ts"]
SCAN_EXT = (".uvue", ".ts", ".uts")

# 无论如何都保留的常用兜底集（防止零引用时字体为空 / 漏扫描）
STARTER = [
    "home", "search", "heart", "message-circle", "user", "settings", "bell",
    "plus", "trash", "edit", "arrow-left", "arrow-right", "chevron-left",
    "chevron-right", "x", "check", "star", "share", "refresh", "clock",
]

NAME_PATTERNS = [
    re.compile(r"""name\s*=\s*["']([a-z0-9][a-z0-9-]*)["']"""),
    re.compile(r"""name\s*:\s*["']([a-z0-9][a-z0-9-]*)["']"""),
    re.compile(r"""icon\s*[:=]\s*["']([a-z0-9][a-z0-9-]*)["']"""),
]


def parse_full_ts():
    """解析 icons-full.ts -> (outline: {name: unicode}, filled: {...})"""
    src = io.open(FULL_TS, encoding="utf-8").read()
    sections = re.split(r"export const (ICON_OUTLINE|ICON_FILLED)", src)
    result = {}
    for i in range(1, len(sections), 2):
        key = "filled" if sections[i] == "ICON_FILLED" else "outline"
        entries = re.findall(r"""\{\s*name:\s*'([a-z0-9-]+)',\s*unicode:\s*'((?:\\u[0-9a-f]{4})+)'\s*\}""", sections[i + 1])
        result[key] = dict(entries)
    return result.get("outline", {}), result.get("filled", {})


def collect_used_names():
    names = set(STARTER)
    for d in SCAN_DIRS:
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [x for x in dirnames if x not in SCAN_EXCLUDE and x != "node_modules"]
            for fn in filenames:
                if not fn.endswith(SCAN_EXT):
                    continue
                if any(ex in fn for ex in SCAN_EXCLUDE):
                    continue
                text = io.open(os.path.join(dirpath, fn), encoding="utf-8").read()
                for pat in NAME_PATTERNS:
                    names.update(pat.findall(text))
    if os.path.exists(WHITELIST):
        for line in io.open(WHITELIST, encoding="utf-8"):
            line = line.split("#")[0].strip()
            if line:
                names.add(line)
    return names


def escapes_to_codepoints(uni: str) -> list:
    """'\\ud800\\ude55' 这类 TS 转义串 -> 真实码点列表（BMP 直接收，代理对拼回增补平面）"""
    parts = [p for p in uni.split("\\u") if p]
    cps = []
    i = 0
    while i < len(parts):
        v = int(parts[i], 16)
        if 0xD800 <= v <= 0xDBFF and i + 1 < len(parts):
            lo = int(parts[i + 1], 16)
            cps.append(0x10000 + (v - 0xD800) * 0x400 + (lo - 0xDC00))
            i += 2
        else:
            cps.append(v)
            i += 1
    return cps


def subset_font(src_path, out_path, codepoints, flavor=None):
    opts = subset.Options()
    opts.layout_features = []  # 图标字体不需要 OpenType 特性，缩小体积
    opts.name_IDs = ["*"]
    font = subset.load_font(src_path, opts)
    s = subset.Subsetter(opts)
    s.populate(unicodes=codepoints)
    s.subset(font)
    opts.flavor = flavor
    subset.save_font(font, out_path, opts)


def file_to_base64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


def render_mp_fonts_ts(outline_b64, filled_b64):
    """生成 loadFontFace 用的 base64 ttf 常量（微信推荐 ttf，Data URL 需基础库 ≥ 3.7.9）"""
    lines = [
        "/**",
        " * 微信小程序 Tabler 子集字体 base64（ttf）—— 由 scripts/subset-icons.py 生成，请勿手改。",
        " * 经 utils/load-tabler-fonts.ts → uni.loadFontFace(Data URL) 加载；勿再写入 wxss @font-face。",
        " */",
        "",
        "/** 线性子集 tabler-icons-subset.ttf */",
        "export const TABLER_ICONS_BASE64 = '%s'" % outline_b64,
        "",
        "/** 面性子集 tabler-icons-filled-subset.ttf；无面性时为空串 */",
        "export const TABLER_ICONS_FILLED_BASE64 = '%s'" % filled_b64,
        "",
    ]
    return "\n".join(lines)


def render_ts(outline, filled, count_note):
    lines = [
        "/**",
        " * Tabler 字形映射（子集 %s）—— 由 scripts/subset-icons.py 生成，请勿手改。" % count_note,
        " * 新增图标后重跑：python scripts/subset-icons.py",
        " * 动态拼接的图标名请加入 scripts/icon-whitelist.txt",
        " */",
        "",
        "export interface IconGlyph {",
        "\tname: string",
        "\tunicode: string",
        "}",
        "",
        "/** 线性图标（tabler-icons.ttf），共 %d 个 */" % len(outline),
        "export const ICON_OUTLINE: IconGlyph[] = [",
    ]
    for n in sorted(outline):
        lines.append("\t\t{ name: '%s', unicode: '%s' }," % (n, outline[n]))
    lines.append("]")
    lines.append("")
    lines.append("/** 面性图标（tabler-icons-filled.ttf），共 %d 个 */" % len(filled))
    lines.append("export const ICON_FILLED: IconGlyph[] = [")
    for n in sorted(filled):
        lines.append("\t\t{ name: '%s', unicode: '%s' }," % (n, filled[n]))
    lines.append("]")
    return "\n".join(lines) + "\n"


def main():
    outline_full, filled_full = parse_full_ts()
    if not outline_full:
        print("ERROR: icons-full.ts 解析失败", file=sys.stderr)
        sys.exit(1)

    used = collect_used_names()
    unknown = sorted(n for n in used if n not in outline_full)
    if unknown:
        print("WARN: 以下名称不在 Tabler 全集中（检查拼写，或从扫描误报中排除）:", ", ".join(unknown))
    used &= set(outline_full)
    print("引用到的图标：%d 个（含 starter 兜底 %d 个）" % (len(used), len(STARTER)))

    outline_sub = {n: outline_full[n] for n in used}
    filled_sub = {n: filled_full[n] for n in used if n in filled_full}

    # 1. 子集映射表（线上各端引用）
    io.open(OUT_TS, "w", encoding="utf-8", newline="\n").write(
        render_ts(outline_sub, filled_sub, "outline %d / filled %d" % (len(outline_sub), len(filled_sub))))

    # 2. 子集 ttf（outline / filled 各自码点，避免串字形）
    outline_cps = sorted(set(cp for uni in outline_sub.values() for cp in escapes_to_codepoints(uni)))
    filled_cps = sorted(set(cp for uni in filled_sub.values() for cp in escapes_to_codepoints(uni)))
    subset_font(FULL_TTF, OUT_TTF, outline_cps)
    filled_b64 = ""
    if filled_sub:
        subset_font(FULL_TTF_FILLED, OUT_TTF_FILLED, filled_cps)
        filled_b64 = file_to_base64(OUT_TTF_FILLED)

    # 3. 小程序 loadFontFace Data URL（ttf base64）；废弃 wxss @font-face 方案
    outline_b64 = file_to_base64(OUT_TTF)
    io.open(OUT_MP_FONTS_TS, "w", encoding="utf-8", newline="\n").write(
        render_mp_fonts_ts(outline_b64, filled_b64))
    io.open(OUT_MP_CSS, "w", encoding="utf-8", newline="\n").write(
        "/* 已废弃：微信 WXSS @font-face + base64/woff2 不可靠。\n"
        " * 小程序字体改由 utils/tabler-mp-fonts.ts + load-tabler-fonts.ts（loadFontFace）加载。\n"
        " * 本文件仅作占位，x-base.css 不再 @import。\n"
        " */\n")

    for p in (OUT_TTF, OUT_TTF_FILLED, OUT_MP_FONTS_TS, OUT_TS):
        if os.path.exists(p):
            print("%8.1f KB  %s" % (os.path.getsize(p) / 1024, os.path.relpath(p, ROOT)))
    print("done: outline %d / filled %d -> icons.ts + tabler-mp-fonts.ts" % (len(outline_sub), len(filled_sub)))


if __name__ == "__main__":
    main()
