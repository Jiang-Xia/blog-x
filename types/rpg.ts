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
	/** Tabler 图标名（奖品展示；游戏资产图另走 static/images/rpg） */
	icon: string
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

/** 排行榜周期（对齐 Nuxt LeaderboardPeriod） */
export type LeaderboardPeriod = 'total' | 'week' | 'month' | 'season'

/** 排行榜维度（对齐 Nuxt LeaderboardScoreType） */
export type LeaderboardScoreType = 'exp' | 'signDays' | 'level' | 'reputation' | 'currency'

/** 排行榜行 */
export type RankRow = {
	rank: number
	/** 用户 uid，点头像进公开主页 */
	uid: number
	name: string
	/** 无头像时的 Tabler 图标名 */
	icon: string
	/** 真实头像完整 URL（优先于 icon） */
	avatarUrl?: string
	level: number
	score: number
	/** 分数旁展示文案（含单位，由 adapter 按 type 组装） */
	scoreLabel: string
	isMe?: boolean
}
