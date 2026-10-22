/**
 * 根据 API_ROWS 生成薄封装（类 shopkeeper-cli createRpcApi）
 * 调用约定：apis.xxx(params?) → 自动填 path、GET 走 query、写方法走 body
 */
import { API_ROWS, fillPath, type ApiRow } from './registry'
import { del, get, patch, post, put, type RequestOpts } from './request'

export type ApiFn = (params?: Record<string, any> | null, opts?: RequestOpts | null) => Promise<any>

/**
 * 为单行注册表生成请求函数
 */
function buildFn(row: ApiRow): ApiFn {
	return (params: Record<string, any> | null = null, opts: RequestOpts | null = null) => {
		const filled = fillPath(row.path, params)
		const rest = filled.rest
		const hasRest = Object.keys(rest).length > 0
		const payload = hasRest ? rest : null
		if (row.method == 'GET') {
			return get(filled.url, payload, opts)
		}
		if (row.method == 'POST') {
			return post(filled.url, payload != null ? payload : {}, opts)
		}
		if (row.method == 'PUT') {
			return put(filled.url, payload != null ? payload : {}, opts)
		}
		if (row.method == 'PATCH') {
			return patch(filled.url, payload != null ? payload : {}, opts)
		}
		return del(filled.url, payload, opts)
	}
}

/**
 * 生成只读 API 对象（方法名 → 请求函数）
 */
export function createApi(): Record<string, ApiFn> {
	const api: Record<string, ApiFn> = {}
	for (let i = 0; i < API_ROWS.length; i++) {
		const row = API_ROWS[i]
		api[row.name] = buildFn(row)
	}
	return api
}
