/**
 * 文章服务端字段 → 小卡 UI 展示模型
 * 数据来源：blog-server /article/*；展示字段优先用后端 enrich，勿本地 dict 回显状态码
 */
import type { ArticleDetail, ArticleSummary } from '../../types/article'
import type { ArchiveArticle, ArchiveMonth, ArchiveYear } from '../../types/notify'
import { resolveStaticUrl } from '../../utils/static-url'

const COVER_PALETTE = [
	{ c1: '#c8efe4', c2: '#b8e0f0', icon: 'book' },
	{ c1: '#ffe8d6', c2: '#f6d9a8', icon: 'coin' },
	{ c1: '#e8dff8', c2: '#d6e8ff', icon: 'puzzle' },
	{ c1: '#fde2e2', c2: '#f5d0d0', icon: 'pencil' },
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
 * 按 id 选封面色（无真实 cover 时稳定伪随机占位）
 */
function coverOf(id: string | number) {
	const n = typeof id === 'number' ? id : parseInt('' + id, 10)
	const idx = isNaN(n) ? 0 : Math.abs(n) % COVER_PALETTE.length
	return COVER_PALETTE[idx]
}

/**
 * 从文章 raw 解析封面完整 URL（优先 cover 字段）
 */
function coverUrlOf(raw: any): string {
	if (raw == null || raw.cover == null) return ''
	const path = ('' + raw.cover).trim()
	if (path.length == 0) return ''
	return resolveStaticUrl(path)
}

/**
 * 从 userInfo.avatar 解析头像 URL
 */
function avatarUrlOf(user: any): string {
	if (user == null || user.avatar == null) return ''
	const path = ('' + user.avatar).trim()
	if (path.length == 0) return ''
	return resolveStaticUrl(path)
}

/**
 * 标签数组 → 展示名列表（Nest tag.label）
 */
function tagLabelsOf(raw: any): string[] {
	const out: string[] = []
	if (raw == null || !Array.isArray(raw.tags)) return out
	for (let i = 0; i < raw.tags.length; i++) {
		const t = raw.tags[i]
		if (t == null || t.label == null) continue
		const label = '' + t.label
		if (label.length > 0) out.push(label)
	}
	return out
}

/**
 * 列表项 → ArticleSummary（封面取文章 cover）
 */
export function mapArticleSummary(raw: any): ArticleSummary {
	const id = raw != null && raw.id != null ? '' + raw.id : ''
	const palette = coverOf(id)
	const cat =
		raw != null && raw.category != null && raw.category.label != null
			? '' + raw.category.label
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
		coverUrl: coverUrlOf(raw),
		coverIcon: palette.icon,
		coverC1: palette.c1,
		coverC2: palette.c2,
		pinned: pinned,
	}
}

/**
 * 详情 → ArticleDetail（作者头像 / 正文 / 标签）
 */
export function mapArticleDetail(raw: any): ArticleDetail {
	const base = mapArticleSummary(raw)
	const user = raw != null ? raw.userInfo : null
	const views = raw != null && raw.views != null ? Number(raw.views) : 0
	const description =
		raw != null && raw.description != null ? '' + raw.description : ''
	const ai =
		raw != null && raw.aiSummary != null
			? '' + raw.aiSummary
			: description
	const uidRaw =
		raw != null && raw.uid != null
			? Number(raw.uid)
			: user != null && user.id != null
				? Number(user.id)
				: 0
	return {
		id: base.id,
		title: base.title,
		categoryName: base.categoryName,
		timeLabel: base.timeLabel,
		likeCount: base.likeCount,
		commentCount: base.commentCount,
		coverUrl: base.coverUrl,
		coverIcon: base.coverIcon,
		coverC1: base.coverC1,
		coverC2: base.coverC2,
		pinned: base.pinned,
		authorUid: isNaN(uidRaw) ? 0 : uidRaw,
		authorName: user != null && user.nickname != null ? '' + user.nickname : '作者',
		authorAvatarUrl: avatarUrlOf(user),
		authorIcon: 'paw',
		readLabel: views > 0 ? views + ' 阅读' : '',
		aiSummary: ai,
		content: raw != null && raw.content != null ? '' + raw.content : '',
		contentHtml: raw != null && raw.contentHtml != null ? '' + raw.contentHtml : '',
		description,
		tagLabels: tagLabelsOf(raw),
	}
}

/**
 * 英文月名 → 中文展示
 */
function monthLabelOf(en: string): string {
	const map: Record<string, string> = {
		January: '1 月',
		February: '2 月',
		March: '3 月',
		April: '4 月',
		May: '5 月',
		June: '6 月',
		July: '7 月',
		August: '8 月',
		September: '9 月',
		October: '10 月',
		November: '11 月',
		December: '12 月',
	}
	return map[en] != null ? map[en] : en
}

/**
 * 单月文章列表 → ArchiveArticle[]
 */
function mapArchiveArticles(arts: any): ArchiveArticle[] {
	const list: ArchiveArticle[] = []
	if (arts == null || !Array.isArray(arts)) return list
	for (let i = 0; i < arts.length; i++) {
		const a = arts[i]
		list.push({
			id: a.id != null ? '' + a.id : '' + i,
			title: a.title != null ? '' + a.title : '',
			timeLabel: a.createTime != null ? formatTimeLabel(a.createTime) : undefined,
		})
	}
	return list
}

/**
 * 归档接口 → ArchiveYear[]（Nest：[{ year, data: { January: Article[] } }]）
 */
export function mapArchives(raw: any): ArchiveYear[] {
	const years: ArchiveYear[] = []
	const arr = Array.isArray(raw) ? raw : []
	for (let i = 0; i < arr.length; i++) {
		const item = arr[i]
		if (item == null || item.year == null || item.data == null || typeof item.data !== 'object') {
			continue
		}
		const months: ArchiveMonth[] = []
		const data = item.data
		const keys = Object.keys(data)
		for (let k = 0; k < keys.length; k++) {
			const en = keys[k]
			const arts = mapArchiveArticles(data[en])
			months.push({
				monthLabel: monthLabelOf(en),
				count: arts.length,
				articleId: arts.length > 0 ? arts[0].id : undefined,
				articleTitle: arts.length > 0 ? arts[0].title : undefined,
				articles: arts,
			})
		}
		years.push({ year: '' + item.year, months })
	}
	return years
}

/**
 * 展平为月列表
 */
export function flattenArchiveMonths(years: ArchiveYear[]): ArchiveMonth[] {
	const list: ArchiveMonth[] = []
	for (let i = 0; i < years.length; i++) {
		const ms = years[i].months
		for (let j = 0; j < ms.length; j++) {
			list.push(ms[j])
		}
	}
	return list
}
