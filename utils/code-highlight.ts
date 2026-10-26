/**
 * 代码块后处理：语言标签 + 简易语法高亮（内联 style）
 * 原因：uni-cmark 只出 <pre><code class="language-xx">，不做高亮；
 * rich-text 大多不应用页面 CSS，必须把颜色写进 style
 * 实现避开 Map / replace 回调，便于 App UTS 编译
 */

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

/**
 * 找下一个 <pre ...><code ...>...</code></pre>
 * @returns 替换后的块 HTML；找不到返回空
 */
function findAndBuildNextBlock(
	html: string,
	from: number,
): { start: number; end: number; html: string } | null {
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
	const highlighted = highlightCode(code, lang)
	const built =
		'<div style="' +
		PRE_STYLE +
		'">' +
		'<div style="' +
		LANG_BAR_STYLE +
		'">' +
		escapeHtml(langLabel(lang)) +
		'</div>' +
		'<pre style="margin:0;padding:0;background:transparent;"><code style="' +
		CODE_STYLE +
		'">' +
		highlighted +
		'</code></pre></div>'

	return {
		start: preOpen,
		end: preClose + 6,
		html: built,
	}
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
 * 增强全部 fenced 代码块，再增强行内 `code`
 */
export function enhanceCodeBlocks(html: string): string {
	if (html == null || html.length == 0) return ''
	// 1) fenced：语言条 + 高亮
	let step1 = ''
	let cursor = 0
	while (cursor < html.length) {
		const block = findAndBuildNextBlock(html, cursor)
		if (block == null) {
			step1 += html.substring(cursor)
			break
		}
		step1 += html.substring(cursor, block.start)
		step1 += block.html
		cursor = block.end
	}
	// 2) 行内 code
	let out = ''
	cursor = 0
	while (cursor < step1.length) {
		const inline = findAndBuildNextInline(step1, cursor)
		if (inline == null) {
			out += step1.substring(cursor)
			break
		}
		out += step1.substring(cursor, inline.start)
		out += inline.html
		cursor = inline.end
	}
	return out
}
