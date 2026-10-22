/**
 * 原型阶段跨页可变状态（签到、钻石、赞藏、角标）
 * 数据来源：本地 mock，不写 blog-server
 */
import { rpgHeroSeed } from '../mock/data'

const diamonds = ref(rpgHeroSeed.diamonds)
const streakDays = ref(rpgHeroSeed.streakDays)
const checkedInToday = ref(false)
const notifyBadge = ref(5)
const inboxBadge = ref(3)
const homeTodayTitle = ref('已读 2 篇 · 待签到')
const homeStreakLabel = ref('连续 7 天')
/** 已点赞文章 id 列表 */
const likedIds = ref([] as string[])
/** 已收藏文章 id 列表 */
const favIds = ref([] as string[])

/**
 * 获取跨页 mock 状态（模块单例 refs）
 */
export function useMockStore() {
	return {
		diamonds,
		streakDays,
		checkedInToday,
		notifyBadge,
		inboxBadge,
		homeTodayTitle,
		homeStreakLabel,
		likedIds,
		favIds,
	}
}

/**
 * 执行每日签到：更新 streak、首页文案
 */
export function doMockCheckin(): { ok: boolean; toastTitle: string; toastDesc: string } {
	if (checkedInToday.value) {
		return { ok: false, toastTitle: '今日已签到', toastDesc: '明天再来哦' }
	}
	checkedInToday.value = true
	streakDays.value = streakDays.value + 1
	diamonds.value = diamonds.value + 5
	homeTodayTitle.value = '已读 2 篇 · 已签到'
	homeStreakLabel.value = '连续 ' + streakDays.value + ' 天'
	return { ok: true, toastTitle: '签到成功', toastDesc: '经验 +20 · 钻石 +5' }
}

/**
 * 充值增加钻石
 * @param amount 钻石数量
 */
export function addMockDiamonds(amount: number): void {
	diamonds.value = diamonds.value + amount
}

/**
 * 切换点赞，返回切换后是否已赞
 */
export function toggleMockLike(articleId: string): boolean {
	const idx = likedIds.value.indexOf(articleId)
	if (idx >= 0) {
		likedIds.value.splice(idx, 1)
		return false
	}
	likedIds.value.push(articleId)
	return true
}

/**
 * 切换收藏，返回切换后是否已藏
 */
export function toggleMockFav(articleId: string): boolean {
	const idx = favIds.value.indexOf(articleId)
	if (idx >= 0) {
		favIds.value.splice(idx, 1)
		return false
	}
	favIds.value.push(articleId)
	return true
}

/**
 * 是否已赞
 */
export function isMockLiked(articleId: string): boolean {
	return likedIds.value.indexOf(articleId) >= 0
}

/**
 * 是否已藏
 */
export function isMockFaved(articleId: string): boolean {
	return favIds.value.indexOf(articleId) >= 0
}

/**
 * 消息全部已读：清空角标
 */
export function clearNotifyBadge(): void {
	notifyBadge.value = 0
}
