/**
 * 用户 / 个人中心类型（mock）
 */

/** 「我的」页资料 */
export type UserProfile = {
	nickname: string
	avatarEmoji: string
	/** 简介一行 */
	bio: string
	articleCount: number
	favoriteCount: number
	likeReceived: number
}

/** 公开主页 RPG 展示块 */
export type PublicRpgCard = {
	titleName: string
	guildName: string
	rankLabel: string
	petLabel: string
	streakDays: number
}
