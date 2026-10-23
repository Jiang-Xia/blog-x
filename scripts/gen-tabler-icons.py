# -*- coding: utf-8 -*-
"""
从 @tabler/icons-webfont 的 CSS 生成 components/x-icon/icons.ts 映射表。

用法：
  1. npm 下载 @tabler/icons-webfont（或从 GitHub release 拿 dist/）
  2. python scripts/gen-tabler-icons.py <dist目录路径>

dist 目录需包含 tabler-icons.css 和 tabler-icons-filled.css。
生成后 static/fonts/ 下需有对应版本的 tabler-icons.ttf / tabler-icons-filled.ttf。
"""
import re
import sys
import io

# 输出按名称排序写入。全量映射存 icons-full.ts（开发/预览页用），
# 线上使用的 icons.ts（子集）由 scripts/subset-icons.py 从本文件裁剪生成。
OUT_PATH = r"D:/study/myGithub/blog-x/components/x-icon/icons-full.ts"

HEADER = """/**
 * Tabler Icons 字形映射表 —— 由 scripts/gen-tabler-icons.py 自动生成，请勿手改。
 * 源：@tabler/icons-webfont {version}
 * 升级流程：下载新版 webfont -> 更新 static/fonts/*.ttf -> 重跑生成脚本
 */

export interface IconGlyph {{
\tname: string
\tunicode: string
}}

/** 线性图标（tabler-icons.ttf），共 {outline_count} 个 */
export const ICON_OUTLINE: IconGlyph[] = [{outline_body}
]

/** 面性图标（tabler-icons-filled.ttf），共 {filled_count} 个 */
export const ICON_FILLED: IconGlyph[] = [{filled_body}
]
"""


def parse(css_path: str) -> dict:
    css = open(css_path, encoding="utf-8").read()
    blocks = re.findall(r"\.ti-([a-z0-9-]+):before\s*\{([^}]*)\}", css)
    result = {}
    for name, body in blocks:
        m = re.search(r"content:\s*\"\\([0-9a-f]{4,6})\"", body)
        if m:
            result[name] = to_js_escape(m.group(1))
    return result


def to_js_escape(hex_str: str) -> str:
    """码点转 TS 字符串转义：BMP 用 \\uXXXX，增补平面拆 UTF-16 代理对。"""
    cp = int(hex_str, 16)
    if cp <= 0xFFFF:
        return "\\u%04x" % cp
    cp -= 0x10000
    hi = 0xD800 + (cp >> 10)
    lo = 0xDC00 + (cp & 0x3FF)
    return "\\u%04x\\u%04x" % (hi, lo)


def render(entries: dict, indent: str = "\t") -> str:
    lines = []
    for name in sorted(entries):
        lines.append('{indent}\t{{ name: \'{name}\', unicode: \'{uni}\' }},'.format(
            indent=indent, name=name, uni=entries[name]))
    return "\n" + "\n".join(lines)


def main():
    dist = sys.argv[1] if len(sys.argv) > 1 else "."
    outline = parse(dist + "/tabler-icons.css")
    filled = parse(dist + "/tabler-icons-filled.css")
    if not outline:
        print("ERROR: 未从 tabler-icons.css 解析到任何图标", file=sys.stderr)
        sys.exit(1)

    version = ""
    m = re.search(r"Tabler Icons ([0-9.]+)", open(dist + "/tabler-icons.css", encoding="utf-8").read(400))
    if m:
        version = m.group(1)

    body = HEADER.format(
        version=version,
        outline_count=len(outline),
        filled_count=len(filled),
        outline_body=render(outline),
        filled_body=render(filled),
    )
    with io.open(OUT_PATH, "w", encoding="utf-8", newline="\n") as f:
        f.write(body)
    print("outline: %d, filled: %d -> %s" % (len(outline), len(filled), OUT_PATH))
    # 重名检查（filled 与 outline 同名时字体不同，x-icon 按 filled 标志切换字体，无需去重）
    print("overlap with same name:", len(set(outline) & set(filled)))


if __name__ == "__main__":
    main()
