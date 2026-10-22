/**
 * Token / 本地存储读写集中处（本阶段页面走 mock，仅预留键名）
 * 联调 blog-server 时由此读写 Authorization
 */

export const TokenKey = 'blog_x_token'
export const RefreshTokenKey = 'blog_x_refresh_token'

/**
 * 读取 access token
 */
export function getToken(): string {
	const v = uni.getStorageSync(TokenKey)
	return typeof v === 'string' ? v : ''
}

/**
 * 写入 access token
 */
export function setToken(token: string): void {
	uni.setStorageSync(TokenKey, token)
}

/**
 * 清除登录态
 */
export function clearToken(): void {
	uni.removeStorageSync(TokenKey)
	uni.removeStorageSync(RefreshTokenKey)
}
