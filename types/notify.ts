/**
 * 消息 / 留言 / 友链 / 审核类型（mock）
 */

export type NotifyItem = {
	id: string
	/** Tabler 图标名 */
	icon: string
	title: string
	desc: string
	/** 分段过滤：comment | like | system（由 type 归类，见 mapNotifySegKind） */
	kind: string
	/**
	 * 关联文章 id（payload.articleId）；有则点击跳详情，无则不可跳转
	 */
	articleId?: string
}

/** 留言板子回复（pId>0） */
export type GuestbookReply = {
	id: string
	author: string
	content: string
	/** 站内 uid（address 解析）；0=无 */
	uid: number
	address: string
	avatarUrl?: string
	/** 被回复者昵称（respondent） */
	respondent: string
}

export type GuestbookItem = {
	id: string
	floor: number
	author: string
	content: string
	/** 真实头像完整 URL（无则空，UI 用首字兜底） */
	avatarUrl?: string
	/**
	 * 站内用户 uid（从 address 解析 /user/:uid；0=无法跳公开主页）
	 * 留言表无 uid 列，靠 address 约定
	 */
	uid: number
	/** 用户填写的个人主页地址（外链或 /user/:uid） */
	address: string
	/** 嵌套回复列表（同页扁平 list 中 pId=本楼 id） */
	replies: GuestbookReply[]
}

	export type FriendLink = {
		id: string
		name: string
		url: string
		/** 个签 / 简介（后端 desp） */
		desp?: string
		/** 图标 URL */
		icon?: string
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
	/** 排序辅助：createTime 毫秒时间戳（映射内部使用） */
	createTime?: number
}

/** 归档月块（由 archives year/data 展平） */
export type ArchiveMonth = {
	monthLabel: string
	count: number
	articleId?: string
	articleTitle?: string
	/** 该月全部文章（真实归档） */
	articles?: ArchiveArticle[]
	/** 排序辅助：月序 1~12（映射内部使用） */
	monthIndex?: number
}

/** 归档年块（对齐 GET /article/archives） */
export type ArchiveYear = {
	year: string
	months: ArchiveMonth[]
}
