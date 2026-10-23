/**
 * 消息 / 留言 / 友链 / 审核类型（mock）
 */

export type NotifyItem = {
	id: string
	emoji: string
	title: string
	desc: string
	/** 分段过滤：comment | like | system（由 type 归类，见 mapNotifySegKind） */
	kind: string
}

export type GuestbookItem = {
	id: string
	floor: number
	author: string
	content: string
	/** 真实头像完整 URL（无则空，UI 用首字兜底） */
	avatarUrl?: string
	reply?: string
}

export type FriendLink = {
	id: string
	name: string
	url: string
}

export type InboxItem = {
	/** 评论 id，回复时作 parentId */
	id: string
	articleTitle: string
	author: string
	content: string
	/** 评论者 uid，回复时作 replyUid */
	replyUid: string
	articleId?: string
}

/** @deprecated 旧 mock 结构；审核台已改用 api/modules/audit.AuditHit */
export type AuditItem = {
	id: string
	kind: string
	summary: string
	highlight?: string
}

/** 归档单篇文章（接口真实字段） */
export type ArchiveArticle = {
	id: string
	title: string
	timeLabel?: string
}

/** 归档月块（由 archives year/data 展平） */
export type ArchiveMonth = {
	monthLabel: string
	count: number
	articleId?: string
	articleTitle?: string
	/** 该月全部文章（真实归档） */
	articles?: ArchiveArticle[]
}

/** 归档年块（对齐 GET /article/archives） */
export type ArchiveYear = {
	year: string
	months: ArchiveMonth[]
}
