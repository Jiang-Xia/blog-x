/**
 * RPG 服务端字段 → 小卡 UI 展示模型
 * 数据来源：blog-server /rpg/*（形状对齐 blog-home-nuxt）
 */
import type { LotteryCell, RankRow, RpgHero, RpgQuest } from '../../types/rpg'
import { resolveStaticUrl } from '../../utils/static-url'

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
				: '🎈 天气Buff'
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
		icon: q.icon != null ? '' + q.icon : '📌',
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
 * 奖池 → LotteryCell[]（Nest：裸数组；最多 8 格外围）
 */
export function mapLotteryCells(raw: any): LotteryCell[] {
	const list: LotteryCell[] = []
	const arr = Array.isArray(raw) ? raw : []
	const max = Math.min(arr.length, 8)
	for (let i = 0; i < max; i++) {
		const p = arr[i]
		list.push({
			index: i,
			emoji: p.icon != null ? '' + p.icon : '✨',
			label: p.name != null ? '' + p.name : '奖品',
		})
	}
	return list
}

/**
 * 排行榜 → RankRow[]（Nest：裸数组）
 */
export function mapRankRows(raw: any, myUid: number = 0): RankRow[] {
	const list: RankRow[] = []
	const arr = Array.isArray(raw) ? raw : []
	for (let i = 0; i < arr.length; i++) {
		const r = arr[i]
		const uid = r.uid != null ? Number(r.uid) : 0
		const avatarRaw = r.avatar != null ? '' + r.avatar : ''
		list.push({
			rank: r.rank != null ? Number(r.rank) : i + 1,
			name: r.nickname != null ? '' + r.nickname : '用户',
			emoji: '🦊',
			avatarUrl: avatarRaw.length > 0 ? resolveStaticUrl(avatarRaw) : '',
			level: r.level != null ? Number(r.level) : 1,
			score: r.score != null ? Number(r.score) : 0,
			isMe: myUid > 0 && uid === myUid,
		})
	}
	return list
}
