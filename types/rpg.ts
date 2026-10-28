/**
 * RPG 冒险相关类型
 * 展示字段（稀有度文案/色、iconUrl 等）由后端 enrich，勿本地 dict 回显
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
	/** 史诗保底计数（来自 /rpg/status） */
	lotteryPityCounter: number
	/** 传说保底计数（来自 /rpg/status） */
	lotteryLegendaryPityCounter: number
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

/**
 * 抽奖奖池项（对齐 Nuxt LotteryPoolItem）
 * rarityLabel/rarityColor/iconUrl 来自后端 enrich，勿本地 map
 */
export type LotteryPoolItem = {
	id: number
	itemCode: string
	name: string
	rarity: string
	/** 后端 rarityLabel，勿本地 map */
	rarityLabel: string
	/** 后端 rarityColor */
	rarityColor: string
	/** 物品 icon 键 → Tabler 兜底名（无 iconUrl 时） */
	icon: string
	/** 管理端上传图标完整 URL；优先展示 */
	iconUrl: string
	/** 未关联系统物品时应过滤（与后端 getPool 一致） */
	itemLinked: boolean
}

/**
 * 3×3 转盘格（由奖池前 8 项映射；中心为「抽一次」）
 * @deprecated 优先用 LotteryPoolItem；保留 index/label 兼容旧 mock
 */
export type LotteryCell = {
	index: number
	/** Tabler 图标名（奖品展示；游戏资产图优先走 iconUrl） */
	icon: string
	label: string
	iconUrl?: string
	rarityColor?: string
}

/** 抽奖支付方式：券 / 钻石 */
export type LotteryCurrency = 'ticket' | 'currency'

/**
 * 抽奖记录（对齐 Nuxt LotteryRecord；展示字段后端 enrich）
 */
export type LotteryRecord = {
	id: number
	poolName: string
	poolRarity: string
	rarityLabel: string
	rarityColor: string
	icon: string
	iconUrl: string
	/** 相对时间或 YYYY-MM-DD */
	timeLabel: string
}

/**
 * 单次抽奖结果（POST /rpg/lottery/draw 数组元素）
 */
export type DrawResult = {
	name: string
	icon: string
	iconUrl: string
	rarity: string
	rarityLabel: string
	rarityColor: string
	rewardDetail: string
}

/**
 * 充值快捷面额展示（元）
 * 实际下单用 amountYuan；钻石按汇率本地预览，以服务端履约为准
 */
export type RechargeSku = {
	id: string
	/** 充值金额（元） */
	amountYuan: number
	/** 预计到账钻石（= amountYuan × 汇率，仅展示） */
	diamonds: number
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
