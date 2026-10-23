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

/** 创建文章入参（对齐 Nest create；tags/cover 可空） */
export type CreateArticleBody = {
	title: string
	description: string
	content: string
	/** publish | draft */
	status: string
	category?: string
	cover?: string
	tags?: number[]
}

/**
 * 创建文章：POST /article/create（需登录）
 * @returns 新建 id（兼容 data.id / data.info.id）
 */
export async function createArticle(body: CreateArticleBody): Promise<string> {
	const res = await post('/article/create', {
		title: body.title,
		description: body.description,
		content: body.content,
		contentHtml: '',
		status: body.status,
		category: body.category != null ? body.category : '',
		cover: body.cover != null ? body.cover : '',
		tags: body.tags != null ? body.tags : [],
	})
	if (res == null) return ''
	if (res.id != null) return '' + res.id
	if (res.info != null && res.info.id != null) return '' + res.info.id
	return ''
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
 * 标签名列表（GET /tag；字段优先 label，兼容 name/value）
 */
export async function fetchTagNames(): Promise<string[]> {
	const tags = await fetchTags()
	const names: string[] = []
	for (let i = 0; i < tags.length; i++) {
		names.push(tags[i].label)
	}
	return names
}

/** 标签墙单项（展示用 label，勿本地 map 颜色） */
export type TagWallItem = {
	id: string
	label: string
}

/**
 * 标签墙列表
 */
export async function fetchTags(): Promise<TagWallItem[]> {
	const res = await get('/tag', { isDelete: true }, { silent: true })
	const arr = Array.isArray(res) ? res : res != null && res.list != null ? res.list : []
	const list: TagWallItem[] = []
	for (let i = 0; i < arr.length; i++) {
		const t = arr[i]
		const label =
			t.label != null
				? '' + t.label
				: t.name != null
					? '' + t.name
					: t.value != null
						? '' + t.value
						: ''
		if (label.length == 0) continue
		list.push({
			id: t.id != null ? '' + t.id : '' + i,
			label,
		})
	}
	return list
}
