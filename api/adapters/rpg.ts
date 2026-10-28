/**
 * RPG 服务端字段 → 小卡 UI 展示模型
 * 数据来源：blog-server /rpg/*（形状对齐 blog-home-nuxt）
 */
import type {
	DrawResult,
	LotteryPoolItem,
	LotteryRecord,
	RankRow,
	RpgHero,
	RpgQuest,
} from '../../types/rpg'
import { toIconName } from '../../utils/icon-name'
import { resolveStaticUrl } from '../../utils/static-url'

/**
 * 相对时间文案（抽奖记录 createTime 兜底）
 */
function formatLotteryTime(raw: any): string {
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
 * 解析管理端上传的物品图标 URL（API iconUrl → 完整域名）
 */
function mapIconUrl(raw: any): string {
	const u = raw != null ? ('' + raw).trim() : ''
	return u.length > 0 ? resolveStaticUrl(u) : ''
}

/**
 * status + 可选 weather → RpgHero
 */
export function mapRpgHero(status: any, weather: any = null): RpgHero {
	const level = status != null && status.level != null ? Number(status.level) : 1
	const exp = status != null && status.exp != null ? Number(status.exp) : 0
	const next = status != null && status.nextLevelExp != null ? Number(status.nextLevelExp) : 100
	const need = Math.max(next - exp, 0)
	const pct = next > 0 ? Math.min(100, Math.floor((exp / next) * 100)) : 0
	const weatherLabel =
		weather != null && weather.label != null
			? '' + weather.label
			: weather != null && weather.name != null
				? '' + weather.name
				: '天气 Buff'
	return {
		travelerName: status != null && status.nickname != null ? '' + status.nickname : '旅行者',
		level,
		expToNext: need,
		expBarPercent: pct,
		diamonds: status != null && status.currency != null ? Number(status.currency) : 0,
		coins: status != null && status.coin != null ? Number(status.coin) : 0,
		lotteryTickets: status != null && status.lotteryTickets != null ? Number(status.lotteryTickets) : 0,
		streakDays: status != null && status.signDays != null ? Number(status.signDays) : 0,
		weatherBuff: weatherLabel,
		lotteryPityCounter:
			status != null && status.lotteryPityCounter != null ? Number(status.lotteryPityCounter) : 0,
		lotteryLegendaryPityCounter:
			status != null && status.lotteryLegendaryPityCounter != null
				? Number(status.lotteryLegendaryPityCounter)
				: 0,
	}
}

/**
 * 将单条任务 → RpgQuest（Nest：questCode/name/progress/completed/claimed）
 */
function mapOneQuest(q: any, index: number): RpgQuest {
	const code = q.questCode != null ? '' + q.questCode : q.code != null ? '' + q.code : '' + index
	const claimed = q.claimed === true
	const completed = q.completed === true || claimed
	const progress =
		q.progress != null && q.targetCount != null
			? q.progress + '/' + q.targetCount
			: q.progress != null && q.target != null
				? q.progress + '/' + q.target
				: undefined
	const kind =
		code.indexOf('sign') >= 0 || code.indexOf('checkin') >= 0
			? 'checkin'
			: code.indexOf('read') >= 0 || code.indexOf('view') >= 0
				? 'read'
				: 'other'
	return {
		id: code,
		title: q.name != null ? '' + q.name : q.title != null ? '' + q.title : code,
		desc:
			progress != null
				? '进度 ' + progress
				: q.description != null
					? '' + q.description
					: '',
		icon: toIconName(q.icon != null ? '' + q.icon : 'pin', 'pin'),
		kind,
		done: claimed,
		claimable: completed && !claimed,
		progressLabel: progress,
	}
}

/**
 * 我的任务 → RpgQuest[]
 * Nest：{ daily, bounty, weekly, special }（展平；首页芯片用总数）
 */
export function mapRpgQuests(raw: any): RpgQuest[] {
	const list: RpgQuest[] = []
	if (raw == null) return list
	const keys = ['daily', 'bounty', 'weekly', 'special']
	let idx = 0
	for (let k = 0; k < keys.length; k++) {
		const group = raw[keys[k]]
		if (group == null || !Array.isArray(group)) continue
		for (let i = 0; i < group.length; i++) {
			list.push(mapOneQuest(group[i], idx))
			idx++
		}
	}
	return list
}

/**
 * 奖池 → LotteryPoolItem[]（Nest：裸数组；过滤未关联系统物品）
 * 对齐 Nuxt filterLinkedLotteryPool：itemLinked === false 丢弃
 */
export function mapLotteryPool(raw: any): LotteryPoolItem[] {
	const list: LotteryPoolItem[] = []
	const arr = Array.isArray(raw) ? raw : []
	for (let i = 0; i < arr.length; i++) {
		const p = arr[i]
		if (p == null) continue
		if (p.itemLinked === false) continue
			list.push({
				id: p.id != null ? Number(p.id) : i + 1,
				itemCode: p.itemCode != null ? '' + p.itemCode : p.code != null ? '' + p.code : '' + i,
				name: p.name != null ? '' + p.name : p.label != null ? '' + p.label : '奖品',
				rarity: p.rarity != null ? '' + p.rarity : 'common',
				rarityLabel: p.rarityLabel != null ? '' + p.rarityLabel : '',
				rarityColor: p.rarityColor != null ? '' + p.rarityColor : '',
				icon: toIconName(p.icon != null ? '' + p.icon : 'sparkles', 'sparkles'),
				iconUrl: mapIconUrl(p.iconUrl),
				itemLinked: p.itemLinked !== false,
			})
	}
	return list
}

/**
 * 抽奖历史 → LotteryRecord[]（Nest：{ list, pagination } 或裸数组）
 */
export function mapLotteryHistory(raw: any): LotteryRecord[] {
	const list: LotteryRecord[] = []
	const arr = raw != null && Array.isArray(raw.list) ? raw.list : Array.isArray(raw) ? raw : []
	for (let i = 0; i < arr.length; i++) {
		const r = arr[i]
		if (r == null) continue
		list.push({
			id: r.id != null ? Number(r.id) : i + 1,
			poolName:
				r.poolName != null
					? '' + r.poolName
					: r.itemName != null
						? '' + r.itemName
						: '奖品',
			poolRarity: r.poolRarity != null ? '' + r.poolRarity : r.rarity != null ? '' + r.rarity : '',
			rarityLabel: r.rarityLabel != null ? '' + r.rarityLabel : '',
			rarityColor: r.rarityColor != null ? '' + r.rarityColor : '',
			icon: toIconName(r.icon != null ? '' + r.icon : 'sparkles', 'sparkles'),
			iconUrl: mapIconUrl(r.iconUrl),
			timeLabel: formatLotteryTime(r.createTime),
		})
	}
	return list
}

/**
 * 抽奖结果 → DrawResult[]（Nest：DrawResult[]，元素含 item / rewardDetail）
 */
export function mapDrawResults(raw: any): DrawResult[] {
	const list: DrawResult[] = []
	const arr = Array.isArray(raw) ? raw : raw != null && Array.isArray(raw.rewards) ? raw.rewards : []
	for (let i = 0; i < arr.length; i++) {
		const row = arr[i]
		if (row == null) continue
		const item = row.item != null ? row.item : row
		list.push({
			name: item.name != null ? '' + item.name : '奖品',
			icon: toIconName(item.icon != null ? '' + item.icon : 'sparkles', 'sparkles'),
			iconUrl: mapIconUrl(item.iconUrl),
			rarity: item.rarity != null ? '' + item.rarity : '',
			rarityLabel: item.rarityLabel != null ? '' + item.rarityLabel : '',
			rarityColor: item.rarityColor != null ? '' + item.rarityColor : '',
			rewardDetail: row.rewardDetail != null ? '' + row.rewardDetail : '',
		})
	}
	return list
}

/**
 * 按维度拼分数展示文案（对齐 Nuxt LeaderboardPanel.getScoreText）
 */
function scoreLabelOf(r: any, type: string): string {
	if (r != null && r.score != null) return '' + Number(r.score)
	switch (type) {
		case 'exp':
			return (r.exp != null ? Number(r.exp) : 0) + ' 经验'
		case 'reputation':
			return (r.reputation != null ? Number(r.reputation) : 0) + ' 声望'
		case 'currency':
			return (r.currency != null ? Number(r.currency) : 0) + ' 钻石'
		case 'signDays':
			return (r.totalSignDays != null ? Number(r.totalSignDays) : 0) + ' 天'
		case 'level':
			return 'LV' + (r.level != null ? Number(r.level) : 1)
		default:
			return r.score != null ? '' + Number(r.score) : '0'
	}
}

/**
 * 排行榜 → RankRow[]（Nest：裸数组）
 * @param type 当前维度，用于无 score 时拼单位
 */
export function mapRankRows(raw: any, myUid: number = 0, type: string = 'exp'): RankRow[] {
	const list: RankRow[] = []
	const arr = Array.isArray(raw) ? raw : []
	for (let i = 0; i < arr.length; i++) {
		const r = arr[i]
		const uid = r.uid != null ? Number(r.uid) : 0
		const avatarRaw = r.avatar != null ? '' + r.avatar : ''
		const score = r.score != null ? Number(r.score) : 0
		list.push({
			rank: r.rank != null ? Number(r.rank) : i + 1,
			uid: isNaN(uid) ? 0 : uid,
			name: r.nickname != null ? '' + r.nickname : '用户',
			icon: 'paw',
			avatarUrl: avatarRaw.length > 0 ? resolveStaticUrl(avatarRaw) : '',
			level: r.level != null ? Number(r.level) : 1,
			score,
			scoreLabel: scoreLabelOf(r, type),
			isMe: myUid > 0 && uid === myUid,
		})
	}
	return list
}
