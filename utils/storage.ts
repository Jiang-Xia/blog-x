/**
 * Token / 本地存储读写集中处
 * 联调 blog-server：Authorization Bearer 由此读写；用户资料缓存供 Pinia 冷启动瞬时展示
 */
import type { UserProfile } from '../types/user'
import { emitAuthCleared } from './auth-events'
import { toIconName } from './icon-name'

export const TokenKey = 'blog_x_token'
export const RefreshTokenKey = 'blog_x_refresh_token'
/** 用户资料 JSON 缓存（非敏感；token 仍走 TokenKey） */
export const UserProfileKey = 'blog_x_user_profile'
/** 搜索历史关键词（字符串数组 JSON） */
export const SearchHistoryKey = 'blog_x_search_history'
/** 搜索历史最多条数 */
const SEARCH_HISTORY_MAX = 12

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
		const avatarUrl = o.avatarUrl != null ? ('' + o.avatarUrl).trim() : ''
		return {
			id: o.id != null ? Number(o.id) : 0,
			nickname: '' + o.nickname,
			avatarUrl,
			// 兼容旧字段 avatarEmoji（可能仍是 emoji）
			avatarIcon: toIconName(
				o.avatarIcon != null
					? '' + o.avatarIcon
					: o.avatarEmoji != null
						? '' + o.avatarEmoji
						: 'paw',
				'paw',
			),
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

/**
 * 读取搜索历史（最近在前）
 */
export function getSearchHistory(): string[] {
	const v = uni.getStorageSync(SearchHistoryKey)
	let arr: any = v
	if (typeof v === 'string') {
		try {
			arr = JSON.parse(v)
		} catch (_) {
			return []
		}
	}
	if (!Array.isArray(arr)) return []
	const out: string[] = []
	for (let i = 0; i < arr.length; i++) {
		const s = ('' + arr[i]).trim()
		if (s.length > 0) out.push(s)
	}
	return out
}

/**
 * 写入一条搜索关键词（去重置顶，截断上限）
 */
export function pushSearchHistory(keyword: string): string[] {
	const k = keyword.trim()
	if (k.length == 0) return getSearchHistory()
	const prev = getSearchHistory()
	const next: string[] = [k]
	for (let i = 0; i < prev.length; i++) {
		if (prev[i] != k) next.push(prev[i])
	}
	const clipped = next.length > SEARCH_HISTORY_MAX ? next.slice(0, SEARCH_HISTORY_MAX) : next
	uni.setStorageSync(SearchHistoryKey, clipped)
	return clipped
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory(): void {
	uni.removeStorageSync(SearchHistoryKey)
}
