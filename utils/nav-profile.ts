/**
 * 跳转用户对外公开主页（对齐 Nuxt `/user/:uid`）
 * 目标页：/pages-blog/profile/index?uid=
 */

/**
 * 进入公开主页；uid≤0 时无跳转
 */
export function goPublicProfile(uid: number): void {
	if (uid <= 0) return
	uni.navigateTo({ url: '/pages-blog/profile/index?uid=' + uid })
}

/**
 * 从留言板 address 解析站内 uid（如 /user/12、.../user/12）
 * 无法识别返回 0
 */
export function parseUidFromAddress(address: string): number {
	if (address == null || address.length == 0) return 0
	const s = address.trim()
	// 纯数字当作 uid
	const asNum = parseInt(s, 10)
	if (!isNaN(asNum) && '' + asNum === s && asNum > 0) return asNum
	const m = s.match(/\/user\/(\d+)(?:\?|$|\/)/)
	if (m != null && m[1] != null) {
		const n = parseInt(m[1], 10)
		return isNaN(n) ? 0 : n
	}
	return 0
}
