/**
 * 文章相关类型（本阶段 mock；字段形态对齐后续 blog-server / nuxt）
 */

/** 列表/卡片用文章摘要 */
export type ArticleSummary = {
	/** 文章 id */
	id: string
	/** 标题 */
	title: string
	/** 分类展示名（后端 enrich 字段，勿本地 map） */
	categoryName: string
	/** 相对时间文案 */
	timeLabel: string
	/** 点赞数 */
	likeCount: number
	/** 评论数 */
	commentCount: number
	/** 封面占位 emoji */
	coverEmoji: string
	/** 封面渐变色 1 */
	coverC1: string
	/** 封面渐变色 2 */
	coverC2: string
	/** 是否置顶 */
	pinned?: boolean
	/** 热度文案（发现页） */
	hotLabel?: string
}

/** 详情页文章 */
export type ArticleDetail = ArticleSummary & {
	/** 作者昵称 */
	authorName: string
	/** 作者头像 emoji */
	authorEmoji: string
	/** 阅读量文案 */
	readLabel: string
	/** AI 摘要短文 */
	aiSummary: string
}
