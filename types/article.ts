/**
 * 文章相关类型
 * 联调字段对齐 blog-server /article/*；展示名用后端 enrich，勿本地 dict 回显
 */

/** 分类筛选 chip（id 空表示「全部」） */
export type CategoryChip = {
	/** 分类 UUID；空串=全部 */
	id: string
	/** 展示名（后端 label） */
	label: string
}

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
	/**
	 * 封面完整 URL（resolveStaticUrl(cover)）；空则用 coverIcon 占位
	 */
	coverUrl: string
	/** 无封面时的 Tabler 占位图标名 */
	coverIcon: string
	/** 无封面时渐变色 1 */
	coverC1: string
	/** 无封面时渐变色 2 */
	coverC2: string
	/** 是否置顶 */
	pinned?: boolean
	/** 热度文案（发现页） */
	hotLabel?: string
}

/** 详情页文章 */
export type ArticleDetail = ArticleSummary & {
	/** 作者用户 id（0=未知） */
	authorUid: number
	/** 作者昵称 */
	authorName: string
	/** 作者头像 URL；空则用 authorIcon */
	authorAvatarUrl: string
	/** 作者头像 Tabler 图标兜底 */
	authorIcon: string
	/** 阅读量文案 */
	readLabel: string
	/** AI 摘要 / 简介短文 */
	aiSummary: string
	/** 正文 Markdown（无 HTML 时展示） */
	content: string
	/** 正文 HTML（优先 rich-text） */
	contentHtml: string
		/** 文章简介 */
		description: string
		/** 标签展示名列表（后端 label） */
		tagLabels: string[]
		/** 标签完整项（含 id/color，供着色与精确筛选跳转） */
		tags: { id: string; label: string; color: string }[]
	}
