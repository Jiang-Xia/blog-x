/**
 * 用户登录态 Pinia Store
 * 数据来源：token 读写 utils/storage；资料 GET /user/info；登录走 api/modules/auth
 * 副作用：写双 token、缓存资料、清登录态
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { USE_MOCK } from '../api/config'
import {
	fetchUserInfo,
	loginByAccount as apiLoginByAccount,
	loginByWeixin as apiLoginByWeixin,
	logoutLocal,
} from '../api/modules/auth'
import { meProfile } from '../mock/data'
import type { UserProfile } from '../types/user'
import {
	clearToken,
	getCachedProfile,
	getToken,
	setCachedProfile,
	setToken,
} from '../utils/storage'

/** 未登录占位资料 */
function emptyProfile(): UserProfile {
	return {
		id: 0,
		nickname: '未登录',
		avatarEmoji: '🦊',
		bio: '登录后同步收藏与冒险进度',
		articleCount: 0,
		favoriteCount: 0,
		likeReceived: 0,
	}
}

export const useUserStore = defineStore('user', () => {
	/** 是否已登录（与 storage token 同步，供模板响应式） */
	const loggedIn = ref(false)
	/** 冷启动自动登录是否已结束 */
	const bootstrapped = ref(false)
	/** 当前用户展示资料 */
	const profile = ref(emptyProfile() as UserProfile)
	/** 登录请求中，防重复点 */
	const submitting = ref(false)

	const isLoggedIn = computed((): boolean => {
		return loggedIn.value
	})

	/**
	 * 根据 storage token 同步 loggedIn，并尽量恢复本地缓存资料
	 */
	function hydrateFromStorage(): void {
		const hasToken = getToken().length > 0
		loggedIn.value = hasToken
		if (!hasToken) {
			profile.value = emptyProfile()
			return
		}
		const cached = getCachedProfile()
		if (cached != null) {
			profile.value = cached
		} else if (profile.value.id == 0) {
			// 有 token 尚无缓存：避免仍显示「未登录」
			profile.value = {
				id: 0,
				nickname: '已登录',
				avatarEmoji: '🦊',
				bio: '正在同步资料…',
				articleCount: 0,
				favoriteCount: 0,
				likeReceived: 0,
			}
		}
	}

	/**
	 * 写入资料并落盘缓存（供下次冷启动瞬时展示）
	 */
	function setProfile(next: UserProfile): void {
		profile.value = next
		if (next.id > 0) {
			setCachedProfile(next)
		}
	}

	/**
	 * 拉取 /user/info 并更新 store
	 */
	async function refreshProfile(): Promise<UserProfile> {
		const info = await fetchUserInfo()
		setProfile(info)
		loggedIn.value = true
		return info
	}

	/**
	 * 登录成功后的公共收尾：标记已登录并拉资料
	 */
	async function afterLoginSuccess(): Promise<void> {
		loggedIn.value = true
		if (USE_MOCK) {
			setProfile({
				id: 1,
				nickname: meProfile.nickname,
				avatarEmoji: meProfile.avatarEmoji,
				bio: meProfile.bio,
				articleCount: meProfile.articleCount,
				favoriteCount: meProfile.favoriteCount,
				likeReceived: meProfile.likeReceived,
			})
			return
		}
		try {
			await refreshProfile()
		} catch (_) {
			// token 已写入；资料失败时仍视为已登录，页面可稍后重试
		}
	}

	/**
	 * 账号密码登录（api 层 RSA 加密密码，对齐 Nuxt encryptLoginPassword）
	 * @returns 是否完成登录（重复点击返回 false）
	 */
	async function loginByAccount(form: {
		username: string
		password: string
		authCode: string
		captchaId: string
	}): Promise<boolean> {
		if (submitting.value) return false
		submitting.value = true
		try {
			if (USE_MOCK) {
				setToken('mock_token_' + Date.now())
				await afterLoginSuccess()
				return true
			}
			await apiLoginByAccount({
				username: form.username,
				password: form.password,
				authCode: form.authCode,
				captchaId: form.captchaId,
			})
			await afterLoginSuccess()
			return true
		} finally {
			submitting.value = false
		}
	}

	/**
	 * 微信一键登录（uni.login → POST /user/auth/wechat/miniprogram）
	 * @returns 是否完成登录（重复点击返回 false）
	 */
	async function loginByWeixin(): Promise<boolean> {
		if (submitting.value) return false
		submitting.value = true
		try {
			if (USE_MOCK) {
				setToken('mock_wx_token_' + Date.now())
				await afterLoginSuccess()
				return true
			}
			await apiLoginByWeixin()
			await afterLoginSuccess()
			return true
		} finally {
			submitting.value = false
		}
	}

	/**
	 * 退出：清 token + 资料缓存（clearToken 已含 UserProfileKey）
	 */
	function logout(): void {
		logoutLocal()
		loggedIn.value = false
		profile.value = emptyProfile()
	}

	/**
	 * 冷启动自动登录：有缓存 token 则恢复态并静默拉 /user/info
	 * 失败则清登录态（refresh 已在 request 层尝试）
	 */
	async function tryAutoLogin(): Promise<void> {
		hydrateFromStorage()
		if (!loggedIn.value) {
			bootstrapped.value = true
			return
		}
		if (USE_MOCK) {
			await afterLoginSuccess()
			bootstrapped.value = true
			return
		}
		try {
			await refreshProfile()
		} catch (_) {
			clearToken()
			loggedIn.value = false
			profile.value = emptyProfile()
		}
		bootstrapped.value = true
	}

	return {
		loggedIn,
		bootstrapped,
		profile,
		submitting,
		isLoggedIn,
		hydrateFromStorage,
		setProfile,
		refreshProfile,
		loginByAccount,
		loginByWeixin,
		logout,
		tryAutoLogin,
	}
})
