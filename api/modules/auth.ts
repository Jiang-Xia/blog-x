/**
 * 认证 / 用户 API（对齐 blog-home-uniapp / Nuxt：密码 RSA 加密后提交）
 */
import { get, post } from '../request'
import { encryptLoginPassword } from '../../utils/gateway-crypto'
import { clearToken, setAuthTokens } from '../../utils/storage'
import { mapPublicRpg, mapUserProfile } from '../adapters/user'
import type { PublicRpgCard, UserProfile } from '../../types/user'

/**
 * 从登录响应取出双 token 并落盘
 * Nest 返回 `{ info: { accessToken, refreshToken, token } }`；亦兼容扁平结构
 */
export function applyLoginTokens(data: any): void {
	if (data == null) return
	// 兼容 info 包装（blog-server login）与扁平（refresh / 部分端）
	const payload =
		data.info != null && typeof data.info === 'object' ? data.info : data
	const access =
		payload.accessToken != null
			? '' + payload.accessToken
			: payload.token != null
				? '' + payload.token
				: ''
	const refresh = payload.refreshToken != null ? '' + payload.refreshToken : ''
	if (access.length > 0) {
		setAuthTokens(access, refresh)
	}
}

/**
 * 图形验证码
 */
export function fetchAuthCode(): Promise<any> {
	return get('/user/authCode', { t: Date.now() }, { silent: true })
}

/**
 * 账号密码登录（密码 RSA 加密，与 Nuxt encryptLoginPassword 一致）
 */
export async function loginByAccount(form: {
	username: string
	password: string
	authCode?: string
	captchaId?: string
}): Promise<any> {
	const res = await post('/user/login', {
		loginType: 'account',
		username: form.username,
		password: encryptLoginPassword(form.password),
		authCode: form.authCode,
		captchaId: form.captchaId,
	})
	applyLoginTokens(res)
	return res
}

/**
 * 微信小程序 code 登录
 */
export async function loginByWxCode(code: string): Promise<any> {
	const res = await post('/user/auth/wechat/miniprogram', { code })
	applyLoginTokens(res)
	return res
}

/**
 * uni.login 取 code 后调微信登录（仅小程序 / App）
 */
export function loginByWeixin(): Promise<any> {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: async (loginRes) => {
				try {
					const code = loginRes.code != null ? '' + loginRes.code : ''
					if (code.length == 0) {
						reject(new Error('未获取到微信 code'))
						return
					}
					const data = await loginByWxCode(code)
					resolve(data)
				} catch (e) {
					reject(e)
				}
			},
			fail: (err) => {
				reject(err)
			},
		})
	})
}

/**
 * 当前用户信息
 */
export async function fetchUserInfo(): Promise<UserProfile> {
	const raw = await get('/user/info')
	return mapUserProfile(raw)
}

/**
 * 公开主页
 */
export function fetchPublicProfile(uid: string | number): Promise<any> {
	return get('/user/public/' + uid, null, { silent: true })
}

/**
 * 公开 RPG 卡
 */
export async function fetchPublicRpg(uid: string | number): Promise<PublicRpgCard> {
	const raw = await get('/rpg/public/' + uid + '/status', null, { silent: true })
	return mapPublicRpg(raw)
}

/**
 * 退出：清本地 token
 */
export function logoutLocal(): void {
	clearToken()
}
