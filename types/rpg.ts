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
	/** questCode，领取时原样提交 */
	id: string
	title: string
	desc: string
	icon: string
	/** checkin | read | other */
	kind: string
	/** 已领取（claimed） */
	done: boolean
	/** 已完成未领取，可点领取 */
	claimable: boolean
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
	/** 真实头像完整 URL（优先于 emoji） */
	avatarUrl?: string
	level: number
	score: number
	isMe?: boolean
}
