/**
 * Markdown → HTML：uni-cmark 解析 + 正文排版 + 代码高亮
 * 须先 ensureMarkdownReady（App.onLaunch 已调）；供详情 rich-text
 *
 * 链路：md2html → enhanceProseHtml（标题/列表/引用等内联 style）
 *      → enhanceCodeBlocks（fenced 语言条+高亮、行内 code 胶囊）
 * rich-text 不吃页面 CSS，样式必须写进 HTML
 */
import {
	initMd2html,
	isMd2htmlAvailable,
	md2html,
} from '@/uni_modules/uni-cmark'
import { enhanceCodeBlocks } from './code-highlight'
import { enhanceProseHtml } from './md-prose'

/** 是否已完成 initMd2html（Web/小程序需加载 WASM） */
let inited = false

/**
 * 初始化 cmark（应用生命周期内一次即可）
 */
export async function ensureMarkdownReady(): Promise<boolean> {
	try {
		await initMd2html()
		inited = isMd2htmlAvailable()
		return inited
	} catch (_) {
		inited = false
		return false
	}
}

/**
 * 统一后处理：排版 + 代码
 */
function polishHtml(html: string): string {
	return enhanceCodeBlocks(enhanceProseHtml(html))
}

/**
 * 将 Markdown 转为可展示 HTML
 */
export function renderMarkdownToHtml(md: string): string {
	if (md == null || md.length == 0) return ''
	if (!inited && !isMd2htmlAvailable()) return ''
	try {
		const html = md2html(md)
		if (html == null || ('' + html).length == 0) return ''
		return polishHtml('' + html)
	} catch (_) {
		return ''
	}
}

/**
 * 对已有 HTML（如后端 contentHtml）补排版与代码高亮
 */
export function enhanceArticleHtml(html: string): string {
	if (html == null || html.length == 0) return ''
	return polishHtml(html)
}
