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
	/** 模糊：标题（与 description/content 同关键词时对齐 Nuxt 全站搜） */
	title?: string
	/** 模糊：摘要 */
	description?: string
	/** 模糊：正文 */
	content?: string
	/** 精确：分类 UUID */
	category?: string
	/** 精确：标签 UUID 列表 */
	tags?: string[]
	client?: boolean
} = {}): Promise<{ list: ArticleSummary[]; total: number }> {
	const body: Record<string, any> = {
		page: params.page != null ? params.page : 1,
		pageSize: params.pageSize != null ? params.pageSize : 10,
		client: params.client != null ? params.client : true,
	}
	if (params.title != null && params.title.length > 0) body.title = params.title
	if (params.description != null && params.description.length > 0) {
		body.description = params.description
	}
	if (params.content != null && params.content.length > 0) body.content = params.content
	if (params.category != null && params.category.length > 0) body.category = params.category
	if (params.tags != null && params.tags.length > 0) body.tags = params.tags
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

/** 详情接口附带的相邻文章 */
export type AdjacentArticle = {
	id: string
	title: string
}

/** 详情 + 上一篇/下一篇 */
export type ArticleInfoBundle = {
	article: ArticleDetail
	prev: AdjacentArticle | null
	next: AdjacentArticle | null
}

/**
 * 解析 prev/next 简要行
 */
function mapAdjacent(raw: any): AdjacentArticle | null {
	if (raw == null || raw.id == null) return null
	const id = '' + raw.id
	if (id.length == 0) return null
	return {
		id,
		title: raw.title != null ? '' + raw.title : '',
	}
}

/**
 * 文章详情（404 静默）：data 为 { info, prev?, next? }，正文在 info
 */
export async function fetchArticleInfo(id: string | number): Promise<ArticleInfoBundle | null> {
	if (id == null || id === '') return null
	try {
		const res = await get('/article/info', { id }, { silent: true })
		if (res == null || res.info == null) return null
		return {
			article: mapArticleDetail(res.info),
			prev: mapAdjacent(res.prev),
			next: mapAdjacent(res.next),
		}
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
 * 相关文章（Nest：{ list }，同作者优先；兼容偶发裸数组）
 */
export async function fetchRelatedArticles(id: string | number, limit = 6): Promise<ArticleSummary[]> {
	const res = await get('/article/related', { id, limit }, { silent: true })
	const arr =
		res != null && res.list != null && Array.isArray(res.list)
			? res.list
			: Array.isArray(res)
				? res
				: []
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

/** 标签墙单项（color 来自后端，勿本地调色） */
export type TagWallItem = {
	id: string
	label: string
	/** 标签自带色（文字/边框） */
	color: string
}

/**
 * 标签墙列表（Nest：裸数组，字段 label / color）
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
			color: t != null && t.color != null && ('' + t.color).length > 0 ? '' + t.color : '#2a8f76',
		})
	}
	return list
}

/**
 * 作者创作统计（对齐 Nuxt getAuthorStats → GET /article/author-stats）
 */
export async function fetchAuthorStats(): Promise<{
	published: number
	totalLikes: number
}> {
	try {
		const res = await get('/article/author-stats', null, { silent: true })
		return {
			published: res != null && res.published != null ? Number(res.published) : 0,
			totalLikes: res != null && res.totalLikes != null ? Number(res.totalLikes) : 0,
		}
	} catch (_) {
		return { published: 0, totalLikes: 0 }
	}
}
