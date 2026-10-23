/**
 * 用户 / 个人中心类型
 * 联调字段对齐 GET /user/info；展示勿本地 dict 回显
 */

	/** 「我的」页 / Pinia 资料 */
	export type UserProfile = {
		/** 用户 id，未登录为 0 */
		id: number
		nickname: string
		/**
		 * 头像完整 URL（来自 /user/info.avatar，经 resolveStaticUrl）
		 * 空串表示无头像，UI 回退 avatarIcon
		 */
		avatarUrl: string
		/** 无真实头像时的 Tabler 图标名 */
		avatarIcon: string
		/** 简介一行（服务端 intro） */
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
