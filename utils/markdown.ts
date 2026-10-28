/**
 * Markdown → HTML：uni-cmark 解析 + 正文排版 + 代码高亮
 * 须先 ensureMarkdownReady（App.onLaunch 已调）；供详情 rich-text
 *
 * 链路：md2html → enhanceProseHtml（标题/列表/引用/表格等内联 style，跟主题令牌）
 *      → segmentArticleBody / enhanceCodeBlocks（fenced 高亮、行内 code、表格横滑）
 * 详情页用分段渲染：代码块可复制；表格走 scroll-x（防窄屏竖排）
 * rich-text 不吃页面 CSS，样式必须写进 HTML；切深色须重传 tokens 再 enhance
 */
import {
	initMd2html,
	isMd2htmlAvailable,
	md2html,
} from '@/uni_modules/uni-cmark'
import type { ThemeTokens } from '../constants/theme'
import {
	enhanceCodeBlocks,
	segmentArticleBody,
	type ArticleBodySegment,
} from './code-highlight'
import { enhanceProseHtml } from './md-prose'

export type { ArticleBodySegment }

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
 * 统一后处理：排版 + 代码（整段 HTML，无复制按钮）
 * @param tokens 主题令牌，写入正文内联色；null 用亮色默认
 */
function polishHtml(html: string, tokens: ThemeTokens | null = null): string {
	return enhanceCodeBlocks(enhanceProseHtml(html, tokens))
}

/**
 * 排版后切成 html/code 分段（详情页可交互复制）
 * @param tokens 主题令牌，写入正文内联色；null 用亮色默认
 */
function polishToSegments(
	html: string,
	tokens: ThemeTokens | null = null,
): ArticleBodySegment[] {
	return segmentArticleBody(enhanceProseHtml(html, tokens))
}

/**
 * 将 Markdown 转为可展示 HTML
 * @param tokens 可选主题令牌（深色正文对比）
 */
export function renderMarkdownToHtml(
	md: string,
	tokens: ThemeTokens | null = null,
): string {
	if (md == null || md.length == 0) return ''
	if (!inited && !isMd2htmlAvailable()) return ''
	try {
		const html = md2html(md)
		if (html == null || ('' + html).length == 0) return ''
		return polishHtml('' + html, tokens)
	} catch (_) {
		return ''
	}
}

/**
 * Markdown → 正文分段（含可复制代码块）
 * @param tokens 可选主题令牌（深色正文对比）
 */
export function renderMarkdownToSegments(
	md: string,
	tokens: ThemeTokens | null = null,
): ArticleBodySegment[] {
	if (md == null || md.length == 0) return []
	if (!inited && !isMd2htmlAvailable()) return []
	try {
		const html = md2html(md)
		if (html == null || ('' + html).length == 0) return []
		return polishToSegments('' + html, tokens)
	} catch (_) {
		return []
	}
}

/**
 * 对已有 HTML（如后端 contentHtml）补排版与代码高亮
 * @param tokens 可选主题令牌（深色正文对比）
 */
export function enhanceArticleHtml(
	html: string,
	tokens: ThemeTokens | null = null,
): string {
	if (html == null || html.length == 0) return ''
	return polishHtml(html, tokens)
}

/**
 * 已有 HTML → 正文分段（含可复制代码块）
 * @param tokens 可选主题令牌（深色正文对比）
 */
export function enhanceArticleToSegments(
	html: string,
	tokens: ThemeTokens | null = null,
): ArticleBodySegment[] {
	if (html == null || html.length == 0) return []
	return polishToSegments(html, tokens)
}
