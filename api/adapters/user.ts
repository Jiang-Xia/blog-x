/**
 * 用户 / 通知 / 留言 / 友链适配
 * 数据来源：blog-server user / notification / msgboard / link / comment
 */
import type { PublicRpgCard, UserProfile } from '../../types/user'
import type {
		FriendLink,
		GuestbookItem,
		GuestbookReply,
		InboxItem,
		NotifyItem,
	} from '../../types/notify'
import { parseUidFromAddress } from '../../utils/nav-profile'
import { resolveStaticUrl } from '../../utils/static-url'

	/**
	 * /user/info → UserProfile（avatar / intro / homepage 直出；勿本地 dict 回显）
	 */
	export function mapUserProfile(raw: any, extras: Record<string, number> = {}): UserProfile {
		const idRaw = raw != null && raw.id != null ? Number(raw.id) : 0
		const avatarRaw =
			raw != null && raw.avatar != null ? ('' + raw.avatar).trim() : ''
		return {
			id: isNaN(idRaw) ? 0 : idRaw,
			nickname: raw != null && raw.nickname != null ? '' + raw.nickname : '游客',
			avatar: avatarRaw,
			avatarUrl: avatarRaw.length > 0 ? resolveStaticUrl(avatarRaw) : '',
			avatarIcon: 'paw',
			bio: raw != null && raw.intro != null ? '' + raw.intro : '',
			homepage: raw != null && raw.homepage != null ? '' + raw.homepage : '',
			articleCount: extras.articleCount != null ? extras.articleCount : 0,
			favoriteCount: extras.favoriteCount != null ? extras.favoriteCount : 0,
			likeReceived: extras.likeReceived != null ? extras.likeReceived : 0,
		}
	}

/**
 * 从 loadout 拼宠物展示名
 */
function petLabelOf(loadout: any): string {
	if (loadout == null || loadout.pet == null) return ''
	const pet = loadout.pet
	const nick = pet.nickname != null ? ('' + pet.nickname).trim() : ''
	if (nick.length > 0) return nick
	const cfg = pet.config
	if (cfg != null && cfg.name != null) return '' + cfg.name
	return ''
}

/**
 * 公开 RPG → PublicRpgCard
 * 对齐 Nest PublicRpgStatusVo：level / reputation / totalSignDays / loadout
 * 亦可吞 /user/public 整包（含 completedAchievements）
 */
export function mapPublicRpg(raw: any): PublicRpgCard {
	const loadout = raw != null ? raw.loadout : null
	const title = loadout != null ? loadout.title : null
	const frame = loadout != null ? loadout.avatarFrame : null
	const levelRaw = raw != null && raw.level != null ? Number(raw.level) : 1
	const repRaw = raw != null && raw.reputation != null ? Number(raw.reputation) : 0
	const signRaw =
		raw != null && raw.totalSignDays != null
			? Number(raw.totalSignDays)
			: raw != null && raw.signDays != null
				? Number(raw.signDays)
				: 0
	const achRaw =
		raw != null && raw.completedAchievements != null && Array.isArray(raw.completedAchievements)
			? raw.completedAchievements
			: []
	const achievements: string[] = []
	for (let i = 0; i < achRaw.length && achievements.length < 6; i++) {
		const a = achRaw[i]
		const name =
			a != null && a.name != null
				? '' + a.name
				: a != null && a.title != null
					? '' + a.title
					: ''
		if (name.length > 0) achievements.push(name)
	}
	return {
		level: isNaN(levelRaw) || levelRaw < 1 ? 1 : levelRaw,
		reputation: isNaN(repRaw) ? 0 : repRaw,
		titleName: title != null && title.name != null ? '' + title.name : '',
		frameName: frame != null && frame.name != null ? '' + frame.name : '',
		petLabel: petLabelOf(loadout),
		streakDays: isNaN(signRaw) ? 0 : signRaw,
		achievements,
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
 * Nest：{ list, pagination }，字段 type + payload
 */
export function mapNotifyItems(raw: any): NotifyItem[] {
	const list: NotifyItem[] = []
	const arr = raw != null && raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const n = arr[i]
		const type = n.type != null ? '' + n.type : 'system'
		const payload = n.payload != null ? n.payload : null
		const icon =
			type.indexOf('comment') >= 0 ? 'message' : type.indexOf('like') >= 0 ? 'heart' : 'bell'
		list.push({
			id: n.id != null ? '' + n.id : '' + i,
			icon,
			title:
				n.title != null && ('' + n.title).length > 0
					? '' + n.title
					: mapNotifyTitle(type, payload),
			desc: n.content != null ? '' + n.content : mapNotifyDesc(payload),
			kind: mapNotifySegKind(type),
		})
	}
	return list
}

/**
 * 单条留言子回复映射
 */
function mapGuestbookReply(c: any): GuestbookReply {
	const address = c != null && c.address != null ? ('' + c.address).trim() : ''
	const avatarRaw = c != null && c.avatar != null ? '' + c.avatar : ''
	return {
		id: c != null && c.id != null ? '' + c.id : '',
		author: c != null && c.name != null ? '' + c.name : '访客',
		content: c != null && c.comment != null ? '' + c.comment : '',
		uid: parseUidFromAddress(address),
		address,
		avatarUrl: avatarRaw.length > 0 ? resolveStaticUrl(avatarRaw) : '',
		respondent: c != null && c.respondent != null ? '' + c.respondent : '',
	}
}

/**
 * 留言 → GuestbookItem[]（Nest：{ list }，扁平 pId=0 为主楼；子回复全部挂入 replies）
 */
export function mapGuestbookItems(raw: any): GuestbookItem[] {
	const list: GuestbookItem[] = []
	const arr = raw != null && raw.list != null ? raw.list : []
	let floor = 0
	for (let i = 0; i < arr.length; i++) {
		const m = arr[i]
		const pId = m.pId != null ? Number(m.pId) : 0
		if (pId > 0) continue
		floor++
		const rootId = m.id != null ? Number(m.id) : 0
		const replies: GuestbookReply[] = []
		for (let j = 0; j < arr.length; j++) {
			const c = arr[j]
			if (Number(c.pId) === rootId && rootId > 0) {
				replies.push(mapGuestbookReply(c))
			}
		}
		const avatarRaw = m.avatar != null ? '' + m.avatar : ''
		const address = m.address != null ? ('' + m.address).trim() : ''
		list.push({
			id: m.id != null ? '' + m.id : '' + i,
			floor,
			author: m.name != null ? '' + m.name : '访客',
			content: m.comment != null ? '' + m.comment : '',
			avatarUrl: avatarRaw.length > 0 ? resolveStaticUrl(avatarRaw) : '',
			uid: parseUidFromAddress(address),
			address,
			replies,
		})
	}
	return list
}

/**
 * 友链 → FriendLink[]（Nest：裸数组）
 */
export function mapFriendLinks(raw: any): FriendLink[] {
	const list: FriendLink[] = []
	const arr = Array.isArray(raw) ? raw : []
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
 * Nest：{ list }，含 userInfo.id 供回复
 */
export function mapInboxItems(raw: any): InboxItem[] {
	const list: InboxItem[] = []
	const arr = raw != null && raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const c = arr[i]
		const ui = c.userInfo != null ? c.userInfo : null
		const replyUid =
			ui != null && ui.id != null ? '' + ui.id : c.uid != null ? '' + c.uid : '0'
		list.push({
			id: c.id != null ? '' + c.id : '' + i,
			articleTitle: c.articleTitle != null ? '' + c.articleTitle : '文章',
			author:
				ui != null && ui.nickname != null
					? '' + ui.nickname
					: '用户',
			content: c.content != null ? '' + c.content : '',
			replyUid,
			articleId: c.articleId != null ? '' + c.articleId : undefined,
		})
	}
	return list
}
