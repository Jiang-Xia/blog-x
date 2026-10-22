/**
 * HTTP 请求封装占位（本阶段页面走 mock，不发起真实请求）
 * 联调时按 x-07：uni.request + 解包 { code, data, message }
 */

type RequestOptions = {
	url: string
	method?: string
	data?: any
}

/**
 * GET 占位：当前直接 reject，提示走 mock
 */
export function get(url: string, _data?: any): Promise<any> {
	return Promise.reject(new Error('[blog-x] api 未联调，请使用 mock。url=' + url))
}

/**
 * POST 占位
 */
export function post(url: string, _data?: any): Promise<any> {
	return Promise.reject(new Error('[blog-x] api 未联调，请使用 mock。url=' + url))
}

/**
 * 通用请求占位（预留签名）
 */
export function request(_opts: RequestOptions): Promise<any> {
	return Promise.reject(new Error('[blog-x] api 未联调'))
}
