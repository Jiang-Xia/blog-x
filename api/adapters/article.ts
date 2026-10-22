/**
 * 文章服务端字段 → 小卡 UI 展示模型
 * 数据来源：blog-server /article/*；展示字段优先用后端 enrich，勿本地 dict 回显状态码
 */
import type { ArticleDetail, ArticleSummary } from '../../types/article'
import type { ArchiveMonth } from '../../types/notify'

const COVER_PALETTE = [
	{ c1: '#c8efe4', c2: '#b8e0f0', emoji: '📗' },
	{ c1: '#ffe8d6', c2: '#f6d9a8', emoji: '💰' },
	{ c1: '#e8dff8', c2: '#d6e8ff', emoji: '🧩' },
	{ c1: '#fde2e2', c2: '#f5d0d0', emoji: '📝' },
]

/**
 * 相对时间文案（无后端 timeLabel 时兜底）
 */
function formatTimeLabel(raw: any): string {
	if (raw == null || raw === '') return ''
	const s = '' + raw
	if (s.indexOf('T') < 0 && s.indexOf('-') < 0) return s
	const t = Date.parse(s)
	if (isNaN(t)) return s
	const diff = Date.now() - t
	const day = 24 * 60 * 60 * 1000
	if (diff < day) return '今天'
	if (diff < 2 * day) return '昨天'
	if (diff < 7 * day) return Math.floor(diff / day) + ' 天前'
	return s.substring(0, 10)
}

/**
 * 按 id 选封面色（稳定伪随机）
 */
function coverOf(id: string | number) {
	const n = typeof id === 'number' ? id : parseInt('' + id, 10)
	const idx = isNaN(n) ? 0 : Math.abs(n) % COVER_PALETTE.length
	return COVER_PALETTE[idx]
}

/**
 * 列表项 → ArticleSummary
 */
export function mapArticleSummary(raw: any): ArticleSummary {
	const id = raw != null && raw.id != null ? '' + raw.id : ''
	const cover = coverOf(id)
	const cat =
		raw != null && raw.category != null && raw.category.name != null
			? '' + raw.category.name
			: raw != null && raw.categoryName != null
				? '' + raw.categoryName
				: '未分类'
	const likes = raw != null && raw.likes != null ? Number(raw.likes) : 0
	const comments = raw != null && raw.commentCount != null ? Number(raw.commentCount) : 0
	const pinned = raw != null && (raw.topping === true || raw.topping === 1)
	return {
		id,
		title: raw != null && raw.title != null ? '' + raw.title : '',
		categoryName: cat,
		timeLabel: formatTimeLabel(raw != null ? raw.createTime : null),
		likeCount: likes,
		commentCount: comments,
		coverEmoji: cover.emoji,
		coverC1: cover.c1,
		coverC2: cover.c2,
		pinned: pinned,
	}
}

/**
 * 详情 → ArticleDetail
 */
export function mapArticleDetail(raw: any): ArticleDetail {
	const base = mapArticleSummary(raw)
	const user = raw != null ? raw.userInfo : null
	const views = raw != null && raw.views != null ? Number(raw.views) : 0
	const ai =
		raw != null && raw.aiSummary != null
			? '' + raw.aiSummary
			: raw != null && raw.description != null
				? '' + raw.description
				: ''
	return {
		id: base.id,
		title: base.title,
		categoryName: base.categoryName,
		timeLabel: base.timeLabel,
		likeCount: base.likeCount,
		commentCount: base.commentCount,
		coverEmoji: base.coverEmoji,
		coverC1: base.coverC1,
		coverC2: base.coverC2,
		pinned: base.pinned,
		authorName: user != null && user.nickname != null ? '' + user.nickname : '作者',
		authorEmoji: '🦊',
		readLabel: views > 0 ? views + ' 阅读' : '',
		aiSummary: ai,
	}
}

/**
 * 归档接口 → ArchiveMonth[]
 * 兼容常见形态：[{ month, count, articles? }] 或按年分组
 */
export function mapArchives(raw: any): ArchiveMonth[] {
	const list: ArchiveMonth[] = []
	if (raw == null) return list
	const arr = Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const item = arr[i]
		const monthLabel =
			item.month != null
				? '' + item.month
				: item.monthLabel != null
					? '' + item.monthLabel
					: item.date != null
						? '' + item.date
						: ''
		const count = item.count != null ? Number(item.count) : item.total != null ? Number(item.total) : 0
		let articleId: string | undefined
		let articleTitle: string | undefined
		const arts = item.articles != null ? item.articles : item.list
		if (arts != null && arts.length > 0) {
			articleId = arts[0].id != null ? '' + arts[0].id : undefined
			articleTitle = arts[0].title != null ? '' + arts[0].title : undefined
		}
		list.push({ monthLabel, count, articleId, articleTitle })
	}
	return list
}
