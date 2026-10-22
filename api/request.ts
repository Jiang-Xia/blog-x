/**
 * HTTP 请求核：uni.request + 解包 { code, data, message }
 * 对齐 blog-home-nuxt request：Bearer 鉴权头、/encrypt 网关
 * 开发日志：失败类仍走 reqLog；加解密出入参见 gateway-crypto/log（不打明文）
 */
import {
	getBaseUrl,
	OPEN_ENCRYPT,
	OPEN_REQUEST_LOG,
	REQUEST_TIMEOUT,
	SUCCESS_CODES,
} from './config'
import {
	createGatewayEnvelope,
	createGatewayKeyHeaders,
	openGatewayEnvelope,
	type GatewaySession,
} from '../utils/gateway-crypto'
import {
	clearToken,
	getRefreshToken,
	getToken,
	setAuthTokens,
} from '../utils/storage'

/** 请求可选行为 */
export type RequestOpts = {
	/** 为 true 时不弹全局错误 toast */
	silent?: boolean
	/** 跳过 401 刷新（刷新接口自身使用） */
	skipAuthRefresh?: boolean
	header?: Record<string, string>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

let refreshing = false
let refreshQueue: Array<() => void> = []

/**
 * 开发态失败类日志（成功起止与明文 body 不打印；密文出入参见 gateway-crypto）
 */
function reqLog(msg: string, level: string = 'log'): void {
	if (!OPEN_REQUEST_LOG) return
	if (level == 'warn') {
		console.warn(msg)
	} else if (level == 'error') {
		console.error(msg)
	} else {
		console.log(msg)
	}
}

/**
 * 判断业务码是否成功
 */
function isBizOk(code: number | null | undefined): boolean {
	if (code == null) return false
	for (let i = 0; i < SUCCESS_CODES.length; i++) {
		if (SUCCESS_CODES[i] === code) return true
	}
	return false
}

/**
 * 拼接 query 到 url
 */
function appendQuery(url: string, query: Record<string, any> | null): string {
	if (query == null) return url
	const parts: string[] = []
	const keys = Object.keys(query)
	for (let i = 0; i < keys.length; i++) {
		const k = keys[i]
		const v = query[k]
		if (v === null || v === undefined) continue
		parts.push(encodeURIComponent(k) + '=' + encodeURIComponent('' + v))
	}
	if (parts.length == 0) return url
	const qs = parts.join('&')
	return url.indexOf('?') >= 0 ? url + '&' + qs : url + '?' + qs
}

/**
 * 相对路径加 /encrypt 前缀（已含 encrypt 或绝对 URL 不改）
 */
function withEncryptPrefix(path: string): string {
	if (!OPEN_ENCRYPT) return path
	if (path.indexOf('http://') == 0 || path.indexOf('https://') == 0) return path
	if (path.indexOf('/encrypt') == 0 || path.indexOf('encrypt/') >= 0) return path
	const p = path.indexOf('/') == 0 ? path : '/' + path
	return '/encrypt' + p
}

/**
 * 拼完整 URL（已是 http 则原样）
 */
function resolveUrl(path: string): string {
	if (path.indexOf('http://') == 0 || path.indexOf('https://') == 0) {
		return path
	}
	const base = getBaseUrl()
	const p = path.indexOf('/') == 0 ? path : '/' + path
	return base + p
}

/**
 * 错误 toast（与 x-07 一致）
 */
function showErrToast(message: string): void {
	uni.showToast({
		title: message.length > 0 ? message : '请求错误',
		icon: 'none',
		duration: 2000,
	})
}

/**
 * 跳转登录页
 */
function goLogin(): void {
	uni.navigateTo({
		url: '/pages/login/login',
		fail: () => {
			uni.reLaunch({ url: '/pages/login/login' })
		},
	})
}

/**
 * 从响应体取 message
 */
function pickMessage(body: any): string {
	if (body == null) return '请求错误'
	if (typeof body.message === 'string' && body.message.length > 0) return body.message
	if (typeof body.msg === 'string' && body.msg.length > 0) return body.msg
	return '请求错误'
}

/**
 * 解密网关响应；URL 含 encrypt 且有 session 才解
 */
function decryptMsg(body: any, url: string, session: GatewaySession | null): any {
	const need = url.indexOf('encrypt') >= 0
	if (need && body != null && body.content != null && body.iv != null && session != null) {
		return openGatewayEnvelope(body, session)
	}
	return body
}

/**
 * 组装鉴权 + 网关自定义头
 * - 登录后：Authorization: Bearer <token>
 * - 加密 GET/DELETE：X-Gateway-Alg / Enc-Key / Ts / Sign
 */
function buildHeaders(
	method: HttpMethod,
	body: any,
	extra: Record<string, string> | null,
	encryptPath: string,
): { header: Record<string, string>; session: GatewaySession | null; body: any } {
	const header: Record<string, string> = {
		'Content-Type': 'application/json;charset=UTF-8',
	}
	if (extra != null) {
		const hk = Object.keys(extra)
		for (let i = 0; i < hk.length; i++) {
			header[hk[i]] = extra[hk[i]]
		}
	}

	// 登录后鉴权头（与 Nuxt getTk 一致）
	const token = getToken()
	if (token.length > 0) {
		header['Authorization'] = 'Bearer ' + token
	}

	let session: GatewaySession | null = null
	let finalBody = body
	const openEncrypt = OPEN_ENCRYPT && encryptPath.indexOf('encrypt') >= 0
	const canHaveBody = method == 'POST' || method == 'PUT' || method == 'PATCH'

	if (openEncrypt) {
		if (canHaveBody && finalBody != null) {
			const packed = createGatewayEnvelope(finalBody)
			finalBody = packed.envelope
			session = packed.session
		} else {
			const keyed = createGatewayKeyHeaders()
			const gh = keyed.headers
			const ghk = Object.keys(gh)
			for (let i = 0; i < ghk.length; i++) {
				header[ghk[i]] = gh[ghk[i]]
			}
			session = keyed.session
		}
	}

	return { header, session, body: finalBody }
}

/**
 * 用 refreshToken 换新 access（原生 uni.request，避免递归进 401 队列；同样走加密网关）
 */
function rawRefreshToken(): Promise<boolean> {
	const rt = getRefreshToken()
	if (rt.length == 0) {
		return Promise.resolve(false)
	}
	const path = withEncryptPrefix('/user/refresh')
	const finalUrl = appendQuery(resolveUrl(path), { token: rt })
	const built = buildHeaders('GET', null, null, path)

	return new Promise((resolve) => {
		uni.request({
			url: finalUrl,
			method: 'GET',
			header: built.header,
			timeout: REQUEST_TIMEOUT,
			success: (res) => {
				let body = res.data as any
				try {
					body = decryptMsg(body, path, built.session)
				} catch (e) {
					reqLog('请求结束 fail decrypt --------------> ' + path, 'error')
					resolve(false)
					return
				}
				if (res.statusCode == 200 && body != null && isBizOk(body.code) && body.data != null) {
					const d = body.data
					const access = d.accessToken != null ? '' + d.accessToken : ''
					const refresh = d.refreshToken != null ? '' + d.refreshToken : rt
					if (access.length > 0) {
						setAuthTokens(access, refresh)
						resolve(true)
						return
					}
				}
				resolve(false)
			},
			fail: () => {
				reqLog('请求结束 fail onRequestError --------------> ' + path, 'error')
				resolve(false)
			},
		})
	})
}

/**
 * 核心请求：成功 resolve(data)，失败 reject
 * @param method HTTP 方法
 * @param url 相对路径或绝对 URL
 * @param data GET/DELETE 为 query，其余为 body
 * @param opts silent / skipAuthRefresh / header
 */
export function request(
	method: HttpMethod,
	url: string,
	data: any = null,
	opts: RequestOpts | null = null,
): Promise<any> {
	const silent = opts != null && opts.silent == true
	const skipRefresh = opts != null && opts.skipAuthRefresh == true
	const extraHeader = opts != null && opts.header != null ? opts.header : null

	const encryptPath = withEncryptPrefix(url)
	let finalUrl = resolveUrl(encryptPath)
	let body: any = data
	if (method == 'GET' || method == 'DELETE') {
		if (data != null) {
			finalUrl = appendQuery(finalUrl, data as Record<string, any>)
		}
		body = null
	}

	const built = buildHeaders(method, body, extraHeader, encryptPath)
	const header = built.header
	const gatewaySession = built.session
	body = built.body

	return new Promise((resolve, reject) => {
		uni.request({
			url: finalUrl,
			method: method,
			data: body,
			header: header,
			timeout: REQUEST_TIMEOUT,
			success: async (res) => {
				const status = res.statusCode
				let bodyRes = res.data as any
				try {
					bodyRes = decryptMsg(bodyRes, encryptPath, gatewaySession)
				} catch (e) {
					reqLog('请求结束 fail decrypt --------------> ' + encryptPath, 'error')
					if (!silent) showErrToast('响应解密失败')
					reject(e)
					return
				}

				const code = bodyRes != null ? bodyRes.code : null
				const is401 = status == 401 || code == 401

				if (is401 && !skipRefresh) {
					reqLog('请求结束 fail 401 --------------> ' + encryptPath, 'warn')
					const rt = getRefreshToken()
					if (rt.length == 0) {
						clearToken()
						if (!silent) showErrToast('请先登录')
						goLogin()
						reject(bodyRes != null ? bodyRes : res)
						return
					}
					refreshQueue.push(() => {
						request(method, url, data, opts).then(resolve).catch(reject)
					})
					if (!refreshing) {
						refreshing = true
						const ok = await rawRefreshToken()
						refreshing = false
						const q = refreshQueue
						refreshQueue = []
						if (ok) {
							for (let i = 0; i < q.length; i++) {
								q[i]()
							}
						} else {
							clearToken()
							if (!silent) showErrToast('登录已过期，请重新登录')
							goLogin()
							reject(bodyRes != null ? bodyRes : res)
						}
					}
					return
				}

				if (status >= 200 && status < 300) {
					if (code != null && !isBizOk(code)) {
						const errMsg = pickMessage(bodyRes)
						reqLog('请求结束 fail biz --------------> ' + encryptPath + ' ' + errMsg, 'warn')
						if (!silent) showErrToast(errMsg)
						reject(bodyRes)
						return
					}
					resolve(bodyRes != null ? bodyRes.data : null)
					return
				}

				reqLog('请求结束 fail onResponseError --------------> ' + encryptPath, 'error')
				if (!silent) showErrToast(pickMessage(bodyRes))
				reject(res)
			},
			fail: () => {
				reqLog('请求结束 fail onRequestError --------------> ' + encryptPath, 'error')
				if (!silent) showErrToast('网络错误，换个网络试试')
				reject(new Error('network'))
			},
		})
	})
}

/** GET：query 放第二参 */
export function get(url: string, query: any = null, opts: RequestOpts | null = null): Promise<any> {
	return request('GET', url, query, opts)
}

/** POST：body 放第二参 */
export function post(url: string, data: any = null, opts: RequestOpts | null = null): Promise<any> {
	return request('POST', url, data, opts)
}

/** PUT */
export function put(url: string, data: any = null, opts: RequestOpts | null = null): Promise<any> {
	return request('PUT', url, data, opts)
}

/** PATCH */
export function patch(url: string, data: any = null, opts: RequestOpts | null = null): Promise<any> {
	return request('PATCH', url, data, opts)
}

/** DELETE：query 放第二参 */
export function del(url: string, query: any = null, opts: RequestOpts | null = null): Promise<any> {
	return request('DELETE', url, query, opts)
}
