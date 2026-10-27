/**
 * API 统一出口：createApi + 可选 mock 挡板 + 业务 modules 再导出
 * 页面优先 import modules/*（含适配）；调试可用 apis.xxx
 */
import { USE_MOCK } from './config'
import { createApi, type ApiFn } from './createApi'
import { applyMocks } from './mocks/index'

const raw = createApi()
/** 注册表生成的薄封装（USE_MOCK 时合并挡板） */
export const apis: Record<string, ApiFn> = USE_MOCK ? applyMocks(raw) : raw

export {
	USE_MOCK,
	getBaseUrl,
	API_ORIGIN,
	API_PREFIX,
	STATIC_BASE_URL,
	WEB_DEV_PROXY,
	WEB_DEV_PROXY_PREFIX,
} from './config'
export { get, post, put, patch, del, request } from './request'
export { API_ROWS } from './registry'

export * from './modules/article'
export * from './modules/auth'
export * from './modules/interact'
export * from './modules/rpg'
export * from './modules/notification'
export * from './modules/resources'
export * from './modules/audit'
