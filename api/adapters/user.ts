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
	return {
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
 * 通知列表 → NotifyItem[]
 */
export function mapNotifyItems(raw: any): NotifyItem[] {
	const list: NotifyItem[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const n = arr[i]
		list.push({
			id: n.id != null ? '' + n.id : '' + i,
			emoji: n.emoji != null ? '' + n.emoji : '🔔',
			title: n.title != null ? '' + n.title : '',
			desc: n.content != null ? '' + n.content : n.desc != null ? '' + n.desc : '',
			kind: n.type != null ? '' + n.type : n.kind != null ? '' + n.kind : 'system',
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
 */
export function mapInboxItems(raw: any): InboxItem[] {
	const list: InboxItem[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const c = arr[i]
		list.push({
			id: c.id != null ? '' + c.id : '' + i,
			articleTitle: c.articleTitle != null ? '' + c.articleTitle : c.title != null ? '' + c.title : '文章',
			author: c.nickname != null ? '' + c.nickname : c.userName != null ? '' + c.userName : '用户',
			content: c.content != null ? '' + c.content : '',
		})
	}
	return list
}
