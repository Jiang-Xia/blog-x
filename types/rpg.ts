/**
 * RPG 冒险相关类型（mock）
 */

/** 冒险中心英雄区 */
export type RpgHero = {
	travelerName: string
	level: number
	expToNext: number
	expBarPercent: number
	diamonds: number
	coins: number
	lotteryTickets: number
	streakDays: number
	weatherBuff: string
}

/** 每日任务 */
export type RpgQuest = {
	id: string
	title: string
	desc: string
	icon: string
	/** checkin | read */
	kind: string
	done: boolean
	progressLabel?: string
}

/** 抽奖格 */
export type LotteryCell = {
	index: number
	emoji: string
	label: string
}

/** 充值档位 */
export type RechargeSku = {
	id: string
	diamonds: number
	priceYuan: number
	/** 额外赠送说明 */
	bonusLabel?: string
}

/** 排行榜行 */
export type RankRow = {
	rank: number
	name: string
	emoji: string
	level: number
	score: number
	isMe?: boolean
}
