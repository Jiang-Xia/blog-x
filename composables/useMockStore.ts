/**
 * 跨页 UI 会话态（角标、签到展示文案等）
 * 由各页用真实 API 结果写入；不再承担 mock 登录 / 赞藏 / 充值
 */
const diamonds = ref(0)
const streakDays = ref(0)
const checkedInToday = ref(false)
const notifyBadge = ref(0)
const inboxBadge = ref(0)
const homeTodayTitle = ref('待签到')
const homeStreakLabel = ref('连续 0 天')

/**
 * 跨页 UI 状态（模块单例 refs）
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
	}
}

/**
 * 消息全部已读：清空角标
 */
export function clearNotifyBadge(): void {
	notifyBadge.value = 0
}
