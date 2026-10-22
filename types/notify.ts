/**
 * 消息 / 留言 / 友链 / 审核类型（mock）
 */

export type NotifyItem = {
	id: string
	emoji: string
	title: string
	desc: string
	/** all | comment | like | system — 原型分段仅 UI，字段预留 */
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
	id: string
	articleTitle: string
	author: string
	content: string
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
