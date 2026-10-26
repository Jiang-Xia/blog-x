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
		/**
		 * 角色名列表（/user/info.roles[].roleName）
		 * 用于管理模式入口：超级管理员 / 管理员
		 */
		roleNames: string[]
		/** 角色 id 列表（roles[].id；1=超级管理员） */
		roleIds: number[]
	}

	/** PATCH /user/edit 入参（对齐 blog-home-nuxt UpdateUserProfileParams） */
	export type UpdateUserProfileParams = {
		id: number
		nickname: string
		intro?: string
		homepage?: string
		avatar?: string
	}

/** 公开主页 RPG 展示块（对齐 PublicRpgStatusVo /user/public loadout） */
export type PublicRpgCard = {
	/** 冒险等级 */
	level: number
	/** 声望 */
	reputation: number
	/** 装备称号名（loadout.title.name） */
	titleName: string
	/** 头像框名（loadout.avatarFrame.name） */
	frameName: string
	/** 宠物展示名（nickname 或 config.name） */
	petLabel: string
	/** 累计签到天数（totalSignDays） */
	streakDays: number
	/** 已完成成就名（最多若干条，来自 /user/public） */
	achievements: string[]
}
