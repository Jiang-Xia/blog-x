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

export type AuditItem = {
	id: string
	kind: string
	summary: string
	highlight?: string
}

export type ArchiveMonth = {
	monthLabel: string
	count: number
	articleId?: string
	articleTitle?: string
}
