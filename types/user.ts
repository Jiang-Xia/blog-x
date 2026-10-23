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
		 * 头像相对路径（/user/info.avatar，供 PATCH /user/edit）
		 * 空串表示无头像
		 */
		avatar: string
		/**
		 * 头像完整 URL（avatar 经 resolveStaticUrl）
		 * 空串时 UI 回退 avatarIcon
		 */
		avatarUrl: string
		/** 无真实头像时的 Tabler 图标名 */
		avatarIcon: string
		/** 简介一行（服务端 intro） */
		bio: string
		/** 个人主页 URL（服务端 homepage） */
		homepage: string
		articleCount: number
		favoriteCount: number
		likeReceived: number
	}

	/** PATCH /user/edit 入参（对齐 blog-home-nuxt UpdateUserProfileParams） */
	export type UpdateUserProfileParams = {
		id: number
		nickname: string
		intro?: string
		homepage?: string
		avatar?: string
	}

/** 公开主页 RPG 展示块 */
export type PublicRpgCard = {
	titleName: string
	guildName: string
	rankLabel: string
	petLabel: string
	streakDays: number
}
