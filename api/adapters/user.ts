/**
 * 用户 / 通知 / 留言 / 友链适配
 * 数据来源：blog-server user / notification / msgboard / link / comment
 */
import type { PublicRpgCard, UserProfile } from '../../types/user'
import type {
	FriendLink,
	GuestbookItem,
	InboxItem,
	NotifyItem,
} from '../../types/notify'

/**
 * /user/info → UserProfile
 */
export function mapUserProfile(raw: any, extras: Record<string, number> = {}): UserProfile {
	const idRaw = raw != null && raw.id != null ? Number(raw.id) : 0
	return {
		id: isNaN(idRaw) ? 0 : idRaw,
		nickname: raw != null && raw.nickname != null ? '' + raw.nickname : '游客',
		avatarEmoji: '🦊',
		bio: raw != null && raw.intro != null ? '' + raw.intro : '',
		articleCount: extras.articleCount != null ? extras.articleCount : 0,
		favoriteCount: extras.favoriteCount != null ? extras.favoriteCount : 0,
		likeReceived: extras.likeReceived != null ? extras.likeReceived : 0,
	}
}

/**
 * 公开 RPG → PublicRpgCard
 */
export function mapPublicRpg(raw: any): PublicRpgCard {
	return {
		titleName: raw != null && raw.titleName != null ? '' + raw.titleName : raw != null && raw.title != null ? '' + raw.title : '旅行者',
		guildName: raw != null && raw.guildName != null ? '' + raw.guildName : '暂无公会',
		rankLabel: raw != null && raw.rankLabel != null ? '' + raw.rankLabel : '',
		petLabel: raw != null && raw.petLabel != null ? '' + raw.petLabel : '',
		streakDays: raw != null && raw.signDays != null ? Number(raw.signDays) : 0,
	}
}

/**
 * 将后端 type 归入分段：comment | like | system（展示文案仍来自 payload）
 */
function mapNotifySegKind(type: string): string {
	const t = type.toLowerCase()
	if (t.indexOf('comment') >= 0 || t.indexOf('reply') >= 0) return 'comment'
	if (t.indexOf('like') >= 0 || t.indexOf('collect') >= 0 || t.indexOf('tip') >= 0) return 'like'
	return 'system'
}

/**
 * 从 type + payload 拼标题（对齐 Nuxt NavNotificationBell）
 */
function mapNotifyTitle(type: string, payload: any): string {
	const art =
		payload != null && payload.articleTitle != null ? '' + payload.articleTitle : ''
	if (type.indexOf('comment') >= 0 || art.length > 0) {
		return '收到新评论 · ' + (art.length > 0 ? art : '文章')
	}
	if (type.indexOf('like') >= 0) return '收到新点赞'
	if (type.indexOf('collect') >= 0) return '收到新收藏'
	if (type.length > 0) return type
	return '系统通知'
}

/**
 * 从 payload 拼摘要
 */
function mapNotifyDesc(payload: any): string {
	if (payload == null) return '点击查看详情'
	if (payload.commentContent != null) {
		const text = '' + payload.commentContent
		return text.length > 48 ? text.substring(0, 48) + '...' : text
	}
	if (payload.nickname != null) {
		return '' + payload.nickname + ' 互动了你的文章'
	}
	if (payload.fromNickname != null) {
		return '' + payload.fromNickname + ' 互动了你的文章'
	}
	if (payload.content != null) return '' + payload.content
	return '点击查看详情'
}

/**
 * 通知列表 → NotifyItem[]
 * 数据来源：GET /notification/list（type + payload，勿本地 dict 回显业务名）
 */
export function mapNotifyItems(raw: any): NotifyItem[] {
	const list: NotifyItem[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const n = arr[i]
		const type = n.type != null ? '' + n.type : n.kind != null ? '' + n.kind : 'system'
		const payload = n.payload != null ? n.payload : null
		const emoji =
			n.emoji != null
				? '' + n.emoji
				: type.indexOf('comment') >= 0
					? '💬'
					: type.indexOf('like') >= 0
						? '❤️'
						: '🔔'
		list.push({
			id: n.id != null ? '' + n.id : '' + i,
			emoji,
			title:
				n.title != null && ('' + n.title).length > 0
					? '' + n.title
					: mapNotifyTitle(type, payload),
			desc:
				n.content != null
					? '' + n.content
					: n.desc != null
						? '' + n.desc
						: mapNotifyDesc(payload),
			kind: mapNotifySegKind(type),
		})
	}
	return list
}

/**
 * 留言 → GuestbookItem[]（扁平 pId=0 为主楼）
 */
export function mapGuestbookItems(raw: any): GuestbookItem[] {
	const list: GuestbookItem[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	let floor = 0
	for (let i = 0; i < arr.length; i++) {
		const m = arr[i]
		const pId = m.pId != null ? Number(m.pId) : 0
		if (pId > 0) continue
		floor++
		let reply: string | undefined
		for (let j = 0; j < arr.length; j++) {
			const c = arr[j]
			if (Number(c.pId) === Number(m.id)) {
				reply = (c.name != null ? c.name + '：' : '') + (c.comment != null ? c.comment : '')
				break
			}
		}
		list.push({
			id: m.id != null ? '' + m.id : '' + i,
			floor,
			author: m.name != null ? '' + m.name : '访客',
			content: m.comment != null ? '' + m.comment : '',
			reply,
		})
	}
	return list
}

/**
 * 友链 → FriendLink[]
 */
export function mapFriendLinks(raw: any): FriendLink[] {
	const list: FriendLink[] = []
	const arr = Array.isArray(raw) ? raw : raw != null && raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const l = arr[i]
		list.push({
			id: l.id != null ? '' + l.id : '' + i,
			name: l.title != null ? '' + l.title : '',
			url: l.url != null ? '' + l.url : '',
		})
	}
	return list
}

/**
 * 评论收件箱 → InboxItem[]
 * 数据来源：GET /comment/on-my-articles（含 userInfo.id 供回复）
 */
export function mapInboxItems(raw: any): InboxItem[] {
	const list: InboxItem[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const c = arr[i]
		const ui = c.userInfo != null ? c.userInfo : null
		const replyUid =
			ui != null && ui.id != null
				? '' + ui.id
				: c.uid != null
					? '' + c.uid
					: '0'
		list.push({
			id: c.id != null ? '' + c.id : '' + i,
			articleTitle:
				c.articleTitle != null
					? '' + c.articleTitle
					: c.title != null
						? '' + c.title
						: '文章',
			author:
				ui != null && ui.nickname != null
					? '' + ui.nickname
					: c.nickname != null
						? '' + c.nickname
						: c.userName != null
							? '' + c.userName
							: '用户',
			content: c.content != null ? '' + c.content : '',
			replyUid,
			articleId: c.articleId != null ? '' + c.articleId : undefined,
		})
	}
	return list
}
