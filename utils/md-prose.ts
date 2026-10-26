/**
 * Markdown/HTML 正文排版后处理（内联 style）
 * rich-text 不吃页面 .prose CSS，须给 h/p/ul/blockquote/a/img/table/hr 写 style
 * 色板对齐 blog-x 小卡：正文 #1c1a17 / 次要 #5c574f / 强调 #3db89a
 */

const C_TEXT = '#1c1a17'
const C_MUTED = '#5c574f'
const C_LINK = '#2a8f76'
const C_BORDER = '#ebe6df'
const C_QUOTE_BG = 'rgba(61,184,154,0.08)'
const C_TH_BG = 'rgba(28,26,23,0.04)'

const STYLE_H1 =
	'font-size:22px;line-height:1.35;font-weight:700;color:' +
	C_TEXT +
	';margin:20px 0 10px;'
const STYLE_H2 =
	'font-size:19px;line-height:1.35;font-weight:700;color:' +
	C_TEXT +
	';margin:18px 0 8px;'
const STYLE_H3 =
	'font-size:17px;line-height:1.4;font-weight:700;color:' +
	C_TEXT +
	';margin:16px 0 8px;'
const STYLE_H4 =
	'font-size:15px;line-height:1.4;font-weight:700;color:' +
	C_TEXT +
	';margin:14px 0 6px;'
const STYLE_H5 =
	'font-size:14px;line-height:1.45;font-weight:700;color:' +
	C_TEXT +
	';margin:12px 0 6px;'
const STYLE_H6 =
	'font-size:13px;line-height:1.45;font-weight:700;color:' +
	C_MUTED +
	';margin:12px 0 6px;'
const STYLE_P =
	'font-size:15px;line-height:1.75;color:' + C_TEXT + ';margin:10px 0;'
const STYLE_UL = 'margin:8px 0;padding-left:22px;color:' + C_TEXT + ';'
const STYLE_OL = 'margin:8px 0;padding-left:22px;color:' + C_TEXT + ';'
const STYLE_LI = 'font-size:15px;line-height:1.7;color:' + C_TEXT + ';margin:4px 0;'
const STYLE_BQ =
	'margin:12px 0;padding:10px 14px;border-left:4px solid #3db89a;background-color:' +
	C_QUOTE_BG +
	';color:' +
	C_MUTED +
	';'
const STYLE_A = 'color:' + C_LINK + ';text-decoration:underline;'
const STYLE_IMG =
	'max-width:100%;height:auto;border-radius:10px;margin:12px 0;display:block;'
const STYLE_HR =
	'margin:20px 0;border:none;border-top:1px solid ' + C_BORDER + ';height:0;'
const STYLE_TABLE =
	'width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;color:' +
	C_TEXT +
	';'
const STYLE_TH =
	'border:1px solid ' +
	C_BORDER +
	';padding:8px 10px;background-color:' +
	C_TH_BG +
	';font-weight:700;text-align:left;color:' +
	C_TEXT +
	';'
const STYLE_TD =
	'border:1px solid ' + C_BORDER + ';padding:8px 10px;color:' + C_MUTED + ';'
const STYLE_STRONG = 'font-weight:700;color:' + C_TEXT + ';'
const STYLE_EM = 'font-style:italic;color:' + C_MUTED + ';'
const STYLE_DEL = 'text-decoration:line-through;color:' + C_MUTED + ';'

/**
 * 给开标签追加 style（已有 style 则拼接）
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
			const merged = old.length > 0 && old.charAt(old.length - 1) == ';' ? old + style : old + ';' + style
			return openTag.substring(0, valueStart) + merged + openTag.substring(valueEnd)
		}
	}
	const styleIdx2 = lower.indexOf("style='")
	if (styleIdx2 >= 0) {
		const valueStart = styleIdx2 + 7
		const valueEnd = openTag.indexOf("'", valueStart)
		if (valueEnd > valueStart) {
			const old = openTag.substring(valueStart, valueEnd)
			const merged = old.length > 0 && old.charAt(old.length - 1) == ';' ? old + style : old + ';' + style
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
 */
export function enhanceProseHtml(html: string): string {
	if (html == null || html.length == 0) return ''
	let s = html
	s = styleOpenTags(s, 'h1', STYLE_H1)
	s = styleOpenTags(s, 'h2', STYLE_H2)
	s = styleOpenTags(s, 'h3', STYLE_H3)
	s = styleOpenTags(s, 'h4', STYLE_H4)
	s = styleOpenTags(s, 'h5', STYLE_H5)
	s = styleOpenTags(s, 'h6', STYLE_H6)
	s = styleOpenTags(s, 'p', STYLE_P)
	s = styleOpenTags(s, 'ul', STYLE_UL)
	s = styleOpenTags(s, 'ol', STYLE_OL)
	s = styleOpenTags(s, 'li', STYLE_LI)
	s = styleOpenTags(s, 'blockquote', STYLE_BQ)
	s = styleOpenTags(s, 'a', STYLE_A)
	s = styleOpenTags(s, 'img', STYLE_IMG)
	s = styleOpenTags(s, 'hr', STYLE_HR)
	s = styleOpenTags(s, 'table', STYLE_TABLE)
	s = styleOpenTags(s, 'th', STYLE_TH)
	s = styleOpenTags(s, 'td', STYLE_TD)
	s = styleOpenTags(s, 'strong', STYLE_STRONG)
	s = styleOpenTags(s, 'em', STYLE_EM)
	s = styleOpenTags(s, 'del', STYLE_DEL)
	return s
}
