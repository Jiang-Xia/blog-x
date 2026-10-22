/**
 * Token / 本地存储读写集中处
 * 联调 blog-server：Authorization Bearer 由此读写；用户资料缓存供 Pinia 冷启动瞬时展示
 */
import type { UserProfile } from '../types/user'
import { emitAuthCleared } from './auth-events'

export const TokenKey = 'blog_x_token'
export const RefreshTokenKey = 'blog_x_refresh_token'
/** 用户资料 JSON 缓存（非敏感；token 仍走 TokenKey） */
export const UserProfileKey = 'blog_x_user_profile'

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
 * 清除登录态（含资料缓存，并通知 Pinia 对齐）
 */
export function clearToken(): void {
	uni.removeStorageSync(TokenKey)
	uni.removeStorageSync(RefreshTokenKey)
	uni.removeStorageSync(UserProfileKey)
	emitAuthCleared()
}

/**
 * 读取缓存的用户资料（自动登录瞬时展示）
 */
export function getCachedProfile(): UserProfile | null {
	const v = uni.getStorageSync(UserProfileKey)
	if (v == null || v === '') return null
	let o: any = v
	// 部分端可能存成 JSON 字符串
	if (typeof v === 'string') {
		try {
			o = JSON.parse(v)
		} catch (_) {
			return null
		}
	}
	if (o == null || o.nickname == null) return null
	return {
		id: o.id != null ? Number(o.id) : 0,
		nickname: '' + o.nickname,
		avatarEmoji: o.avatarEmoji != null ? '' + o.avatarEmoji : '🦊',
		bio: o.bio != null ? '' + o.bio : '',
		articleCount: o.articleCount != null ? Number(o.articleCount) : 0,
		favoriteCount: o.favoriteCount != null ? Number(o.favoriteCount) : 0,
		likeReceived: o.likeReceived != null ? Number(o.likeReceived) : 0,
	}
}

/**
 * 缓存用户资料
 */
export function setCachedProfile(profile: UserProfile): void {
	uni.setStorageSync(UserProfileKey, profile)
}

/**
 * 清除用户资料缓存
 */
export function clearCachedProfile(): void {
	uni.removeStorageSync(UserProfileKey)
}
