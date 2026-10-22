/**
 * 文章 / 分类 / 标签 API（对齐 blog-home-uniapp api/article）
 * 路径见 registry ARTICLE_ROWS；本文件提供带适配的业务方法
 */
import { get, post } from '../request'
import { mapArchives, mapArticleDetail, mapArticleSummary } from '../adapters/article'
import type { ArticleDetail, ArticleSummary } from '../../types/article'
import type { ArchiveMonth } from '../../types/notify'

/**
 * 文章分页列表
 */
export async function fetchArticleList(params: {
	page?: number
	pageSize?: number
	title?: string
	category?: string
	client?: boolean
} = {}): Promise<{ list: ArticleSummary[]; total: number }> {
	const body = {
		page: params.page != null ? params.page : 1,
		pageSize: params.pageSize != null ? params.pageSize : 10,
		client: params.client != null ? params.client : true,
		title: params.title,
		category: params.category,
	}
	const res = await post('/article/list', body)
	const rawList = res != null && res.list != null ? res.list : []
	const list: ArticleSummary[] = []
	for (let i = 0; i < rawList.length; i++) {
		list.push(mapArticleSummary(rawList[i]))
	}
	const total =
		res != null && res.pagination != null && res.pagination.total != null
			? Number(res.pagination.total)
			: list.length
	return { list, total }
}

/**
 * 文章详情（404 静默）
 */
export async function fetchArticleInfo(id: string | number): Promise<ArticleDetail | null> {
	if (id == null || id === '') return null
	try {
		const res = await get('/article/info', { id }, { silent: true })
		if (res == null) return null
		return mapArticleDetail(res)
	} catch (_) {
		return null
	}
}

/**
 * 上报浏览量
 */
export function reportArticleViews(id: string | number): Promise<any> {
	return post('/article/views', { id }, { silent: true })
}

/**
 * 归档
 */
export async function fetchArchives(): Promise<ArchiveMonth[]> {
	const res = await get('/article/archives')
	return mapArchives(res)
}

/**
 * 相关文章
 */
export async function fetchRelatedArticles(id: string | number, limit = 6): Promise<ArticleSummary[]> {
	const res = await get('/article/related', { id, limit }, { silent: true })
	const arr = Array.isArray(res) ? res : res != null && res.list != null ? res.list : []
	const list: ArticleSummary[] = []
	for (let i = 0; i < arr.length; i++) {
		list.push(mapArticleSummary(arr[i]))
	}
	return list
}

/**
 * 分类名列表（用于首页 chip）
 */
export async function fetchCategoryNames(): Promise<string[]> {
	const res = await get('/category', { isDelete: true }, { silent: true })
	const arr = Array.isArray(res) ? res : res != null && res.list != null ? res.list : []
	const names: string[] = ['全部']
	for (let i = 0; i < arr.length; i++) {
		const n = arr[i].name != null ? '' + arr[i].name : ''
		if (n.length > 0) names.push(n)
	}
	return names
}

/**
 * 标签名列表
 */
export async function fetchTagNames(): Promise<string[]> {
	const res = await get('/tag', { isDelete: true }, { silent: true })
	const arr = Array.isArray(res) ? res : res != null && res.list != null ? res.list : []
	const names: string[] = []
	for (let i = 0; i < arr.length; i++) {
		const n = arr[i].name != null ? '' + arr[i].name : ''
		if (n.length > 0) names.push(n)
	}
	return names
}
