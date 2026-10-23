/**
 * 文章 / 分类 / 标签 API（对齐 blog-home-nuxt；data 形状仅认 blog-server）
 */
import { get, post } from '../request'
import { mapArchives, mapArticleDetail, mapArticleSummary } from '../adapters/article'
import type { ArticleDetail, ArticleSummary } from '../../types/article'
import type { ArchiveYear } from '../../types/notify'

/**
 * 文章分页列表 → { list, pagination.total }
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
			: 0
	return { list, total }
}

/**
 * 文章详情（404 静默）：data 为 { info, prev?, next? }，正文在 info
 */
export async function fetchArticleInfo(id: string | number): Promise<ArticleDetail | null> {
	if (id == null || id === '') return null
	try {
		const res = await get('/article/info', { id }, { silent: true })
		if (res == null || res.info == null) return null
		return mapArticleDetail(res.info)
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

/** 创建文章入参（对齐 Nest create；category/tags 为 UUID） */
export type CreateArticleBody = {
	title: string
	description: string
	content: string
	/** publish | draft | scheduled */
	status: string
	category?: string
	cover?: string
	/** 标签 UUID 列表 */
	tags?: string[]
	/** 定时发布时间，仅 status=scheduled 时生效 */
	scheduledPublishAt?: string
}

/**
 * 创建文章：POST /article/create（需登录）
 * @returns 新建 id（Nest/Nuxt：data.id，偶发 data.info.id）
 */
export async function createArticle(body: CreateArticleBody): Promise<string> {
	const payload: Record<string, any> = {
		title: body.title,
		description: body.description,
		content: body.content,
		contentHtml: '',
		status: body.status,
		category: body.category != null ? body.category : '',
		cover: body.cover != null ? body.cover : '',
		tags: body.tags != null ? body.tags : [],
	}
	if (body.status == 'scheduled' && body.scheduledPublishAt != null && body.scheduledPublishAt.length > 0) {
		payload.scheduledPublishAt = body.scheduledPublishAt
	}
	const res = await post('/article/create', payload)
	if (res == null) return ''
	if (res.id != null) return '' + res.id
	if (res.info != null && res.info.id != null) return '' + res.info.id
	return ''
}

/**
 * 归档（Nest：[{ year, data: { January: Article[] } }]）
 */
export async function fetchArchives(): Promise<ArchiveYear[]> {
	const res = await get('/article/archives')
	return mapArchives(res)
}

/**
 * 相关文章（裸数组）
 */
export async function fetchRelatedArticles(id: string | number, limit = 6): Promise<ArticleSummary[]> {
	const res = await get('/article/related', { id, limit }, { silent: true })
	const arr = Array.isArray(res) ? res : []
	const list: ArticleSummary[] = []
	for (let i = 0; i < arr.length; i++) {
		list.push(mapArticleSummary(arr[i]))
	}
	return list
}

/** 分类选项（创作页 picker；展示用 label） */
export type CategoryOption = {
	id: string
	label: string
}

/**
 * 分类列表（Nest：裸数组，字段 label）
 */
export async function fetchCategories(): Promise<CategoryOption[]> {
	const res = await get('/category', { isDelete: true }, { silent: true })
	const arr = Array.isArray(res) ? res : []
	const list: CategoryOption[] = []
	for (let i = 0; i < arr.length; i++) {
		const c = arr[i]
		const label = c != null && c.label != null ? '' + c.label : ''
		if (label.length == 0) continue
		list.push({
			id: c.id != null ? '' + c.id : '' + i,
			label,
		})
	}
	return list
}

/**
 * 分类名列表（用于首页 chip）
 */
export async function fetchCategoryNames(): Promise<string[]> {
	const cats = await fetchCategories()
	const names: string[] = ['全部']
	for (let i = 0; i < cats.length; i++) {
		names.push(cats[i].label)
	}
	return names
}

/**
 * 标签名列表
 */
export async function fetchTagNames(): Promise<string[]> {
	const tags = await fetchTags()
	const names: string[] = []
	for (let i = 0; i < tags.length; i++) {
		names.push(tags[i].label)
	}
	return names
}

/** 标签墙单项 */
export type TagWallItem = {
	id: string
	label: string
}

/**
 * 标签墙列表（Nest：裸数组，字段 label）
 */
export async function fetchTags(): Promise<TagWallItem[]> {
	const res = await get('/tag', { isDelete: true }, { silent: true })
	const arr = Array.isArray(res) ? res : []
	const list: TagWallItem[] = []
	for (let i = 0; i < arr.length; i++) {
		const t = arr[i]
		const label = t != null && t.label != null ? '' + t.label : ''
		if (label.length == 0) continue
		list.push({
			id: t.id != null ? '' + t.id : '' + i,
			label,
		})
	}
	return list
}
