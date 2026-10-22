/**
 * Token / 本地存储读写集中处
 * 联调 blog-server：Authorization Bearer 由此读写
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
 * 读取 refresh token
 */
export function getRefreshToken(): string {
	const v = uni.getStorageSync(RefreshTokenKey)
	return typeof v === 'string' ? v : ''
}

/**
 * 写入 refresh token
 */
export function setRefreshToken(token: string): void {
	uni.setStorageSync(RefreshTokenKey, token)
}

/**
 * 同时写入双 token（登录 / refresh 成功后）
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
	setToken(accessToken)
	if (refreshToken.length > 0) {
		setRefreshToken(refreshToken)
	}
}

/**
 * 清除登录态
 */
export function clearToken(): void {
	uni.removeStorageSync(TokenKey)
	uni.removeStorageSync(RefreshTokenKey)
}
