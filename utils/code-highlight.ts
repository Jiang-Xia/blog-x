/**
 * 代码块后处理：语言标签 + 简易语法高亮（内联 style）+ 详情分段
 * 原因：uni-cmark 只出 <pre><code class="language-xx">，不做高亮；
 * rich-text 大多不应用页面 CSS，必须把颜色写进 style；
 * 一键复制须原生按钮，故 segmentArticleBody 把 fenced 拆出给 x-code-block；
 * 宽表易挤成竖排，故同时拆出 table 给详情页 scroll-x
 * 实现避开 Map / replace 回调，便于 App UTS 编译
 */
import { findNextTableRange, wrapTablesForOverflow } from './md-prose'

const PRE_STYLE =
	'margin:12px 0;padding:0;border-radius:12px;overflow:hidden;background-color:#1c1a17;border:1px solid #3a3630;'
const LANG_BAR_STYLE =
	'padding:6px 12px;font-size:11px;font-weight:600;color:#c4bdb3;background-color:#2a2825;'
const CODE_STYLE =
	'display:block;padding:12px;font-size:13px;line-height:1.55;color:#e8e4dc;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all;'
/** 行内 `code`：胶囊底 + 等宽字（rich-text 须内联 style） */
const INLINE_CODE_STYLE =
	'padding:1px 6px;border-radius:6px;font-size:13px;line-height:1.4;color:#c45c26;background-color:rgba(232,137,122,0.14);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;'

const C_KW = '#ff7b72'
const C_STR = '#a5d6ff'
const C_NUM = '#79c0ff'
const C_CMT = '#8b949e'
const C_FN = '#d2a8ff'
const C_TYPE = '#ffa657'

const KW_JS =
	'const,let,var,function,return,if,else,for,while,do,switch,case,break,continue,class,extends,new,this,super,import,export,from,default,async,await,try,catch,finally,throw,typeof,instanceof,in,of,null,undefined,true,false,void,yield,static,get,set'
const KW_TS =
	KW_JS +
	',implements,interface,type,enum,keyof,readonly,public,private,protected,abstract,namespace,module,declare,as,is,never,any,unknown,string,number,boolean,object'
const KW_PY =
	'def,class,return,if,elif,else,for,while,break,continue,pass,import,from,as,try,except,finally,raise,with,yield,lambda,True,False,None,and,or,not,in,is,global,nonlocal,async,await'
const KW_GO =
	'func,return,if,else,for,range,switch,case,break,continue,go,defer,select,chan,map,struct,interface,type,var,const,package,import,true,false,nil,make,new,len,cap,append'
const KW_SQL =
	'SELECT,FROM,WHERE,AND,OR,NOT,INSERT,INTO,VALUES,UPDATE,SET,DELETE,CREATE,TABLE,INDEX,JOIN,LEFT,RIGHT,INNER,OUTER,ON,AS,ORDER,BY,GROUP,HAVING,LIMIT,OFFSET,NULL,TRUE,FALSE,DISTINCT'
const KW_BASH =
	'if,then,else,elif,fi,for,while,do,done,case,esac,in,function,return,export,local,echo,exit,cd,source'
const KW_JSON = 'true,false,null'

/**
 * 按语言取关键字 CSV
 */
function keywordsCsv(lang: string): string {
	if (lang == 'javascript') return KW_JS
	if (lang == 'typescript') return KW_TS
	if (lang == 'python') return KW_PY
	if (lang == 'go') return KW_GO
	if (lang == 'sql') return KW_SQL
	if (lang == 'bash') return KW_BASH
	if (lang == 'json') return KW_JSON
	return ''
}

/**
 * 词是否在 CSV 关键字表中
 */
function isKeyword(word: string, lang: string): boolean {
	const csv = keywordsCsv(lang)
	if (csv.length == 0) return false
	const parts = csv.split(',')
	const target = lang == 'sql' ? word.toUpperCase() : word
	for (let i = 0; i < parts.length; i++) {
		if (parts[i] == target) return true
	}
	return false
}

/**
 * HTML 实体解码
 */
function decodeEntities(s: string): string {
	return s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&')
}

/**
 * HTML 转义
 */
function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

/**
 * 着色 span
 */
function span(color: string, text: string): string {
	return '<span style="color:' + color + ';">' + escapeHtml(text) + '</span>'
}

/**
 * 归一化语言 id
 */
function normalizeLang(raw: string): string {
	const lower = raw.toLowerCase().trim()
	if (lower.length == 0) return 'text'
	if (lower == 'js' || lower == 'jsx') return 'javascript'
	if (lower == 'ts' || lower == 'tsx') return 'typescript'
	if (lower == 'py') return 'python'
	if (lower == 'sh' || lower == 'shell' || lower == 'zsh') return 'bash'
	if (lower == 'yml') return 'yaml'
	if (lower == 'golang') return 'go'
	if (lower == 'htm' || lower == 'vue') return 'html'
	return lower
}

/**
 * 从 code 开标签解析 language
 */
function langFromCodeAttrs(attrs: string): string {
	const marker = 'class="'
	let start = attrs.indexOf(marker)
	let quoteLen = marker.length
	if (start < 0) {
		start = attrs.indexOf("class='")
		quoteLen = 7
	}
	if (start < 0) return 'text'
	const valueStart = start + quoteLen
	const quote = attrs.charAt(start + 6)
	const end = attrs.indexOf(quote, valueStart)
	if (end < 0) return 'text'
	const cls = attrs.substring(valueStart, end)
	const parts = cls.split(' ')
	for (let i = 0; i < parts.length; i++) {
		const p = parts[i]
		if (p.indexOf('language-') == 0) return normalizeLang(p.substring(9))
		if (p.indexOf('lang-') == 0) return normalizeLang(p.substring(5))
	}
	return 'text'
}

/**
 * 单行简易高亮
 */
function highlightLine(line: string, lang: string): string {
	if (line.length == 0) return ''
	let out = ''
	let i = 0
	const n = line.length

	while (i < n) {
		const ch = line.charAt(i)

		if (
			(ch == '/' && i + 1 < n && line.charAt(i + 1) == '/') ||
			(ch == '#' && (lang == 'bash' || lang == 'python' || lang == 'yaml'))
		) {
			out += span(C_CMT, line.substring(i))
			break
		}
		if (ch == '/' && i + 1 < n && line.charAt(i + 1) == '*') {
			const end = line.indexOf('*/', i + 2)
			if (end >= 0) {
				out += span(C_CMT, line.substring(i, end + 2))
				i = end + 2
				continue
			}
			out += span(C_CMT, line.substring(i))
			break
		}
		if (ch == '"' || ch == "'" || ch == '`') {
			const quote = ch
			let j = i + 1
			while (j < n) {
				if (line.charAt(j) == '\\' && j + 1 < n) {
					j += 2
					continue
				}
				if (line.charAt(j) == quote) {
					j++
					break
				}
				j++
			}
			out += span(C_STR, line.substring(i, j))
			i = j
			continue
		}
		if (
			(ch >= '0' && ch <= '9') ||
			(ch == '.' && i + 1 < n && line.charAt(i + 1) >= '0' && line.charAt(i + 1) <= '9')
		) {
			let j = i + 1
			while (j < n) {
				const c = line.charAt(j)
				if (
					(c >= '0' && c <= '9') ||
					c == '.' ||
					c == 'x' ||
					c == 'X' ||
					c == 'e' ||
					c == 'E' ||
					c == '_'
				) {
					j++
				} else break
			}
			out += span(C_NUM, line.substring(i, j))
			i = j
			continue
		}
		if (
			(ch >= 'a' && ch <= 'z') ||
			(ch >= 'A' && ch <= 'Z') ||
			ch == '_' ||
			ch == '$'
		) {
			let j = i + 1
			while (j < n) {
				const c = line.charAt(j)
				if (
					(c >= 'a' && c <= 'z') ||
					(c >= 'A' && c <= 'Z') ||
					(c >= '0' && c <= '9') ||
					c == '_' ||
					c == '$'
				) {
					j++
				} else break
			}
			const word = line.substring(i, j)
			if (isKeyword(word, lang)) {
				out += span(C_KW, word)
			} else {
				let p = j
				while (p < n && (line.charAt(p) == ' ' || line.charAt(p) == '\t')) p++
				if (p < n && line.charAt(p) == '(') {
					out += span(C_FN, word)
				} else if (
					word.charAt(0) >= 'A' &&
					word.charAt(0) <= 'Z' &&
					(lang == 'typescript' || lang == 'javascript' || lang == 'go')
				) {
					out += span(C_TYPE, word)
				} else {
					out += escapeHtml(word)
				}
			}
			i = j
			continue
		}
		out += escapeHtml(ch)
		i++
	}
	return out
}

/**
 * 整段代码高亮
 */
function highlightCode(source: string, lang: string): string {
	const lines = source.replace(/\r\n/g, '\n').split('\n')
	let out = ''
	for (let i = 0; i < lines.length; i++) {
		if (i > 0) out += '\n'
		out += highlightLine(lines[i], lang)
	}
	return out
}

/**
 * 展示用语言名
 */
function langLabel(lang: string): string {
	if (lang == 'text' || lang.length == 0) return 'CODE'
	return lang.toUpperCase()
}

/** 解析出的 fenced 代码块（供原生复制按钮与 rich-text 高亮） */
type ParsedFencedBlock = {
	start: number
	end: number
	lang: string
	/** 纯文本源码（复制用） */
	code: string
	/** 仅高亮后的 inner HTML（已 escape + span） */
	highlighted: string
}

/**
 * 找下一个 <pre ...><code ...>...</code></pre>
 * @returns 解析结果；找不到返回空
 */
function findNextFencedBlock(
	html: string,
	from: number,
): ParsedFencedBlock | null {
	const preOpen = html.indexOf('<pre', from)
	if (preOpen < 0) return null
	const preTagEnd = html.indexOf('>', preOpen)
	if (preTagEnd < 0) return null
	const codeOpen = html.indexOf('<code', preTagEnd)
	if (codeOpen < 0 || codeOpen - preTagEnd > 32) return null
	const codeTagEnd = html.indexOf('>', codeOpen)
	if (codeTagEnd < 0) return null
	const codeClose = html.indexOf('</code>', codeTagEnd)
	if (codeClose < 0) return null
	const preClose = html.indexOf('</pre>', codeClose)
	if (preClose < 0) return null

	const codeAttrs = html.substring(codeOpen + 5, codeTagEnd)
	const body = html.substring(codeTagEnd + 1, codeClose)
	const lang = langFromCodeAttrs(codeAttrs)
	let code = decodeEntities(body)
	if (code.length > 0 && code.charAt(code.length - 1) == '\n') {
		code = code.substring(0, code.length - 1)
	}
	return {
		start: preOpen,
		end: preClose + 6,
		lang,
		code,
		highlighted: highlightCode(code, lang),
	}
}

/**
 * 把解析块拼成仍可塞进 rich-text 的 HTML（无复制按钮；兼容旧路径）
 */
function buildFencedBlockHtml(block: ParsedFencedBlock): string {
	return (
		'<div style="' +
		PRE_STYLE +
		'">' +
		'<div style="' +
		LANG_BAR_STYLE +
		'">' +
		escapeHtml(langLabel(block.lang)) +
		'</div>' +
		'<pre style="margin:0;padding:0;background:transparent;"><code style="' +
		CODE_STYLE +
		'">' +
		block.highlighted +
		'</code></pre></div>'
	)
}

/**
 * 代码块正文 HTML（供原生外壳内的 rich-text，不含语言条）
 */
function buildCodeInnerHtml(highlighted: string): string {
	return (
		'<pre style="margin:0;padding:0;background:transparent;"><code style="' +
		CODE_STYLE +
		'">' +
		highlighted +
		'</code></pre>'
	)
}

/**
 * 找下一个尚未加 style 的行内 <code>…</code>（非 pre 代码块）
 */
function findAndBuildNextInline(
	html: string,
	from: number,
): { start: number; end: number; html: string } | null {
	let search = from
	while (search < html.length) {
		const codeOpen = html.indexOf('<code', search)
		if (codeOpen < 0) return null
		const codeTagEnd = html.indexOf('>', codeOpen)
		if (codeTagEnd < 0) return null
		const openTag = html.substring(codeOpen, codeTagEnd + 1)
		// 已处理过的块级 code 带 style=，跳过
		if (openTag.indexOf('style=') >= 0) {
			const skipClose = html.indexOf('</code>', codeTagEnd)
			search = skipClose >= 0 ? skipClose + 7 : codeTagEnd + 1
			continue
		}
		// 落在 <pre>…</pre> 内则跳过（防漏网 fenced）
		const preBefore = html.lastIndexOf('<pre', codeOpen)
		const preCloseBefore = html.lastIndexOf('</pre>', codeOpen)
		if (preBefore > preCloseBefore) {
			const skipClose = html.indexOf('</code>', codeTagEnd)
			search = skipClose >= 0 ? skipClose + 7 : codeTagEnd + 1
			continue
		}
		const codeClose = html.indexOf('</code>', codeTagEnd)
		if (codeClose < 0) return null
		const body = html.substring(codeTagEnd + 1, codeClose)
		const raw = decodeEntities(body)
		// 行内无 language 标记：胶囊底 + 字符串/数字等轻量着色（不用 JS 关键字防误伤）
		const highlighted = highlightCode(raw, 'text')
		const built =
			'<code style="' + INLINE_CODE_STYLE + '">' + highlighted + '</code>'
		return {
			start: codeOpen,
			end: codeClose + 7,
			html: built,
		}
	}
	return null
}

/**
 * 只增强行内 `code`（fenced 已拆出时用）
 */
function enhanceInlineCodes(html: string): string {
	if (html == null || html.length == 0) return ''
	let out = ''
	let cursor = 0
	while (cursor < html.length) {
		const inline = findAndBuildNextInline(html, cursor)
		if (inline == null) {
			out += html.substring(cursor)
			break
		}
		out += html.substring(cursor, inline.start)
		out += inline.html
		cursor = inline.end
	}
	return out
}

/**
 * 文章正文分段（扁平字段，便于 App UTS；避免联合类型）
 * kind=html 时读 html；kind=code 时读 lang/langLabel/code/codeHtml；
 * kind=table 时读 html（整表），详情用 scroll-x 包 rich-text
 */
export type ArticleBodySegment = {
	/** html | code | table */
	kind: string
	/** 普通 HTML 段，或 table 的整表 HTML */
	html: string
	/** language-* 归一化名 */
	lang: string
	/** 顶栏展示名 */
	langLabel: string
	/** 剪贴板纯文本 */
	code: string
	/** 高亮代码 HTML（无外壳） */
	codeHtml: string
}

/**
 * 构造 HTML 分段
 */
function htmlSegment(html: string): ArticleBodySegment {
	return {
		kind: 'html',
		html,
		lang: '',
		langLabel: '',
		code: '',
		codeHtml: '',
	}
}

/**
 * 构造表格分段（外层 scroll-view 横滑，避免窄屏竖排）
 */
function tableSegment(tableHtml: string): ArticleBodySegment {
	const cols = countTableColumns(tableHtml)
	// rich-text 常按父宽布局；显式 min-width 让外层 scroll-view 能滑开
	const minW = Math.max(cols * 96, 280)
	return {
		kind: 'table',
		html:
			'<div style="min-width:' +
			minW +
			'px;">' +
			tableHtml +
			'</div>',
		lang: '',
		langLabel: '',
		code: '',
		codeHtml: '',
	}
}

/**
 * 构造代码分段
 */
function codeSegment(block: ParsedFencedBlock): ArticleBodySegment {
	return {
		kind: 'code',
		html: '',
		lang: block.lang,
		langLabel: langLabel(block.lang),
		code: block.code,
		codeHtml: buildCodeInnerHtml(block.highlighted),
	}
}

/**
 * 首行 th/td 数量 → 估算列数（无表则 1）
 */
function countTableColumns(tableHtml: string): number {
	const trOpen = tableHtml.indexOf('<tr')
	if (trOpen < 0) return 1
	const trTagEnd = tableHtml.indexOf('>', trOpen)
	if (trTagEnd < 0) return 1
	const trClose = tableHtml.indexOf('</tr>', trTagEnd)
	if (trClose < 0) return 1
	const row = tableHtml.substring(trTagEnd + 1, trClose).toLowerCase()
	let cols = 0
	let i = 0
	while (i < row.length) {
		const th = row.indexOf('<th', i)
		const td = row.indexOf('<td', i)
		let next = -1
		if (th >= 0 && (td < 0 || th < td)) next = th
		else if (td >= 0) next = td
		if (next < 0) break
		const after = next + 3
		if (after < row.length) {
			const ch = row.charAt(after)
			if (ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '>') {
				cols++
			}
		}
		i = after
	}
	return cols > 0 ? cols : 1
}

/**
 * 将 HTML 段再按 table 切开（table → 原生横滑）
 */
function splitHtmlByTables(html: string): ArticleBodySegment[] {
	const out: ArticleBodySegment[] = []
	if (html == null || html.length == 0) return out
	let cursor = 0
	while (cursor < html.length) {
		const range = findNextTableRange(html, cursor)
		if (range == null) {
			const rest = html.substring(cursor)
			if (rest.length > 0) out.push(htmlSegment(rest))
			break
		}
		if (range.start > cursor) {
			out.push(htmlSegment(html.substring(cursor, range.start)))
		}
		out.push(tableSegment(html.substring(range.start, range.end)))
		cursor = range.end
	}
	return out
}

/**
 * 将含 fenced / table 的 HTML 切成可交互分段，并增强行内 code
 */
export function segmentArticleBody(html: string): ArticleBodySegment[] {
	const codeSplit: ArticleBodySegment[] = []
	if (html == null || html.length == 0) return codeSplit
	let cursor = 0
	while (cursor < html.length) {
		const block = findNextFencedBlock(html, cursor)
		if (block == null) {
			const rest = enhanceInlineCodes(html.substring(cursor))
			if (rest.length > 0) {
				codeSplit.push(htmlSegment(rest))
			}
			break
		}
		if (block.start > cursor) {
			const gap = enhanceInlineCodes(html.substring(cursor, block.start))
			if (gap.length > 0) {
				codeSplit.push(htmlSegment(gap))
			}
		}
		codeSplit.push(codeSegment(block))
		cursor = block.end
	}
	// html 段再拆表格，便于详情 scroll-x
	const out: ArticleBodySegment[] = []
	for (let i = 0; i < codeSplit.length; i++) {
		const seg = codeSplit[i]
		if (seg.kind != 'html') {
			out.push(seg)
			continue
		}
		const parts = splitHtmlByTables(seg.html)
		for (let j = 0; j < parts.length; j++) {
			out.push(parts[j])
		}
	}
	return out
}

/**
 * 增强全部 fenced 代码块，再增强行内 `code`，最后包表格横滑（整段 HTML，无复制按钮）
 */
export function enhanceCodeBlocks(html: string): string {
	if (html == null || html.length == 0) return ''
	// 1) fenced：语言条 + 高亮
	let step1 = ''
	let cursor = 0
	while (cursor < html.length) {
		const block = findNextFencedBlock(html, cursor)
		if (block == null) {
			step1 += html.substring(cursor)
			break
		}
		step1 += html.substring(cursor, block.start)
		step1 += buildFencedBlockHtml(block)
		cursor = block.end
	}
	// 2) 行内 code → 3) 表格 overflow-x
	return wrapTablesForOverflow(enhanceInlineCodes(step1))
}
