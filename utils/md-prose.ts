/**
 * Markdown/HTML 正文排版后处理（内联 style）
 * rich-text 不吃页面 .prose CSS，须给 h/p/ul/blockquote/a/img/table/hr 写 style
 * 色板跟 ThemeTokens：深色下 ink 变浅，避免写死 #1c1a17 导致无对比
 * 实现避开 Map，便于 App UTS 编译
 */
import type { ThemeTokens } from '../constants/theme'

/** 排版用色（由 tokens 推导；缺省时用亮色小卡默认） */
type ProseColors = {
	text: string
	muted: string
	link: string
	border: string
	quoteBg: string
	thBg: string
	accent: string
}

/** 各标签内联 style 集合 */
type ProseStyles = {
	h1: string
	h2: string
	h3: string
	h4: string
	h5: string
	h6: string
	p: string
	ul: string
	ol: string
	li: string
	blockquote: string
	a: string
	img: string
	hr: string
	table: string
	th: string
	td: string
	strong: string
	em: string
	del: string
}

/** 亮色默认（对齐 LIGHT_NEUTRAL + mint） */
const LIGHT_COLORS: ProseColors = {
	text: '#1c1a17',
	muted: '#5c574f',
	link: '#2a8f76',
	border: '#ebe6df',
	quoteBg: 'rgba(61,184,154,0.08)',
	thBg: 'rgba(28,26,23,0.04)',
	accent: '#3db89a',
}

/**
 * 从主题令牌取 rich-text 可用的绝对色值（勿用 CSS 变量）
 */
function colorsFromTokens(t: ThemeTokens): ProseColors {
	return {
		text: t.ink,
		muted: t.ink2,
		link: t.accentDeep,
		border: t.bg2,
		quoteBg: t.accentTint,
		thBg: t.line,
		accent: t.accent,
	}
}

/**
 * 按色板拼各标签 style 串
 */
function buildStyles(c: ProseColors): ProseStyles {
	return {
		h1:
			'font-size:22px;line-height:1.35;font-weight:700;color:' +
			c.text +
			';margin:20px 0 10px;',
		h2:
			'font-size:19px;line-height:1.35;font-weight:700;color:' +
			c.text +
			';margin:18px 0 8px;',
		h3:
			'font-size:17px;line-height:1.4;font-weight:700;color:' +
			c.text +
			';margin:16px 0 8px;',
		h4:
			'font-size:15px;line-height:1.4;font-weight:700;color:' +
			c.text +
			';margin:14px 0 6px;',
		h5:
			'font-size:14px;line-height:1.45;font-weight:700;color:' +
			c.text +
			';margin:12px 0 6px;',
		h6:
			'font-size:13px;line-height:1.45;font-weight:700;color:' +
			c.muted +
			';margin:12px 0 6px;',
		p: 'font-size:15px;line-height:1.75;color:' + c.text + ';margin:10px 0;',
		ul: 'margin:8px 0;padding-left:22px;color:' + c.text + ';',
		ol: 'margin:8px 0;padding-left:22px;color:' + c.text + ';',
		li: 'font-size:15px;line-height:1.7;color:' + c.text + ';margin:4px 0;',
		blockquote:
			'margin:12px 0;padding:10px 14px;border-left:4px solid ' +
			c.accent +
			';background-color:' +
			c.quoteBg +
			';color:' +
			c.muted +
			';',
		a: 'color:' + c.link + ';text-decoration:underline;',
		img: 'max-width:100%;height:auto;border-radius:10px;margin:12px 0;display:block;',
		hr: 'margin:20px 0;border:none;border-top:1px solid ' + c.border + ';height:0;',
		table:
			'width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;color:' +
			c.text +
			';',
		th:
			'border:1px solid ' +
			c.border +
			';padding:8px 10px;background-color:' +
			c.thBg +
			';font-weight:700;text-align:left;color:' +
			c.text +
			';',
		td: 'border:1px solid ' + c.border + ';padding:8px 10px;color:' + c.muted + ';',
		strong: 'font-weight:700;color:' + c.text + ';',
		em: 'font-style:italic;color:' + c.muted + ';',
		del: 'text-decoration:line-through;color:' + c.muted + ';',
	}
}

/**
 * 给开标签追加 style（已有 style 则拼接；同属性后写覆盖前写）
 */
function appendOpenTagStyle(openTag: string, style: string): string {
	if (style.length == 0) return openTag
	const lower = openTag.toLowerCase()
	const styleIdx = lower.indexOf('style="')
	if (styleIdx >= 0) {
		const valueStart = styleIdx + 7
		const valueEnd = openTag.indexOf('"', valueStart)
		if (valueEnd > valueStart) {
			const old = openTag.substring(valueStart, valueEnd)
			const merged =
				old.length > 0 && old.charAt(old.length - 1) == ';' ? old + style : old + ';' + style
			return openTag.substring(0, valueStart) + merged + openTag.substring(valueEnd)
		}
	}
	const styleIdx2 = lower.indexOf("style='")
	if (styleIdx2 >= 0) {
		const valueStart = styleIdx2 + 7
		const valueEnd = openTag.indexOf("'", valueStart)
		if (valueEnd > valueStart) {
			const old = openTag.substring(valueStart, valueEnd)
			const merged =
				old.length > 0 && old.charAt(old.length - 1) == ';' ? old + style : old + ';' + style
			return openTag.substring(0, valueStart) + merged + openTag.substring(valueEnd)
		}
	}
	// <tag ...> → <tag ... style="...">
	if (openTag.charAt(openTag.length - 2) == '/') {
		// <hr /> / <img ... />
		return openTag.substring(0, openTag.length - 2) + ' style="' + style + '" />'
	}
	return openTag.substring(0, openTag.length - 1) + ' style="' + style + '">'
}

/**
 * 给所有指定开标签注入 style
 * @param tag 小写标签名，如 h1 / p / blockquote
 */
function styleOpenTags(html: string, tag: string, style: string): string {
	const needle = '<' + tag
	let out = ''
	let cursor = 0
	while (cursor < html.length) {
		const start = html.indexOf(needle, cursor)
		if (start < 0) {
			out += html.substring(cursor)
			break
		}
		// 避免匹配到 <pre 里的伪标签：下一字符须是空白、>、/ 或属性
		const after = start + needle.length
		if (after < html.length) {
			const next = html.charAt(after)
			const ok =
				next == ' ' ||
				next == '\t' ||
				next == '\n' ||
				next == '\r' ||
				next == '>' ||
				next == '/'
			if (!ok) {
				out += html.substring(cursor, after)
				cursor = after
				continue
			}
		}
		const end = html.indexOf('>', start)
		if (end < 0) {
			out += html.substring(cursor)
			break
		}
		out += html.substring(cursor, start)
		const openTag = html.substring(start, end + 1)
		out += appendOpenTagStyle(openTag, style)
		cursor = end + 1
	}
	return out
}

/**
 * 正文排版增强：标题/段落/列表/引用/链接/图/表/分隔线
 * 不处理 pre/code（交给 enhanceCodeBlocks）
 * @param tokens 当前主题令牌；null 时用亮色默认（兼容旧调用）
 */
export function enhanceProseHtml(html: string, tokens: ThemeTokens | null = null): string {
	if (html == null || html.length == 0) return ''
	const colors = tokens != null ? colorsFromTokens(tokens) : LIGHT_COLORS
	const st = buildStyles(colors)
	let s = html
	s = styleOpenTags(s, 'h1', st.h1)
	s = styleOpenTags(s, 'h2', st.h2)
	s = styleOpenTags(s, 'h3', st.h3)
	s = styleOpenTags(s, 'h4', st.h4)
	s = styleOpenTags(s, 'h5', st.h5)
	s = styleOpenTags(s, 'h6', st.h6)
	s = styleOpenTags(s, 'p', st.p)
	s = styleOpenTags(s, 'ul', st.ul)
	s = styleOpenTags(s, 'ol', st.ol)
	s = styleOpenTags(s, 'li', st.li)
	s = styleOpenTags(s, 'blockquote', st.blockquote)
	s = styleOpenTags(s, 'a', st.a)
	s = styleOpenTags(s, 'img', st.img)
	s = styleOpenTags(s, 'hr', st.hr)
	s = styleOpenTags(s, 'table', st.table)
	s = styleOpenTags(s, 'th', st.th)
	s = styleOpenTags(s, 'td', st.td)
	s = styleOpenTags(s, 'strong', st.strong)
	s = styleOpenTags(s, 'em', st.em)
	s = styleOpenTags(s, 'del', st.del)
	return s
}
