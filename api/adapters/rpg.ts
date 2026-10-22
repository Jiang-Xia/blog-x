/**
 * RPG 服务端字段 → 小卡 UI 展示模型
 * 数据来源：blog-server /rpg/*
 */
import type { LotteryCell, RankRow, RpgHero, RpgQuest } from '../../types/rpg'

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
				: weather != null && weather.buffName != null
					? '' + weather.buffName
					: '🎈 天气Buff'
	return {
		travelerName:
			status != null && status.nickname != null
				? '' + status.nickname
				: status != null && status.travelerName != null
					? '' + status.travelerName
					: '旅行者',
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
 * 任务列表 → RpgQuest[]
 */
export function mapRpgQuests(raw: any): RpgQuest[] {
	const list: RpgQuest[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const q = arr[i]
		const code = q.questCode != null ? '' + q.questCode : q.code != null ? '' + q.code : '' + i
		const done = q.claimed === true || q.done === true || q.status === 'claimed'
		const progress =
			q.progressLabel != null
				? '' + q.progressLabel
				: q.current != null && q.target != null
					? q.current + '/' + q.target
					: undefined
		list.push({
			id: code,
			title: q.title != null ? '' + q.title : q.name != null ? '' + q.name : code,
			desc: q.desc != null ? '' + q.desc : q.description != null ? '' + q.description : '',
			icon: q.icon != null ? '' + q.icon : '📌',
			kind: code.indexOf('sign') >= 0 || code.indexOf('checkin') >= 0 ? 'checkin' : 'read',
			done,
			progressLabel: progress,
		})
	}
	return list
}

/**
 * 奖池 → LotteryCell[]（最多 8 格外围）
 */
export function mapLotteryCells(raw: any): LotteryCell[] {
	const list: LotteryCell[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	const max = Math.min(arr.length, 8)
	for (let i = 0; i < max; i++) {
		const p = arr[i]
		list.push({
			index: i,
			emoji: p.icon != null ? '' + p.icon : p.emoji != null ? '' + p.emoji : '✨',
			label: p.name != null ? '' + p.name : p.label != null ? '' + p.label : '奖品',
		})
	}
	return list
}

/**
 * 排行榜 → RankRow[]
 */
export function mapRankRows(raw: any, myUid: number = 0): RankRow[] {
	const list: RankRow[] = []
	const arr = raw == null ? [] : Array.isArray(raw) ? raw : raw.list != null ? raw.list : []
	for (let i = 0; i < arr.length; i++) {
		const r = arr[i]
		const uid = r.uid != null ? Number(r.uid) : 0
		list.push({
			rank: r.rank != null ? Number(r.rank) : i + 1,
			name: r.nickname != null ? '' + r.nickname : r.name != null ? '' + r.name : '用户',
			emoji: '🦊',
			level: r.level != null ? Number(r.level) : 1,
			score: r.score != null ? Number(r.score) : r.exp != null ? Number(r.exp) : 0,
			isMe: myUid > 0 && uid === myUid,
		})
	}
	return list
}
