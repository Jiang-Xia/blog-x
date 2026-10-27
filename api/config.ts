/**
 * 接口环境配置（对齐 shopkeeper-cli request/config + env；加密/日志对齐 blog-home-nuxt）
 * 联调目标：api/dev-target.js（与 vite.config.js Web 代理共用）
 */

// @ts-ignore 与 vite 共用的纯 JS 常量，无类型声明
import {
	API_ORIGIN as TARGET_ORIGIN,
	API_PREFIX as TARGET_PREFIX,
	STATIC_BASE_URL as TARGET_STATIC,
	WEB_DEV_PROXY_PREFIX as TARGET_PROXY_PREFIX,
} from './dev-target.js'

/**
 * 是否合并 api/mocks 挡板（仅 apis 注册表层；页面禁止 if(USE_MOCK)）
 * 见 x-10-data-contract-simplicity.mdc
 */
export const USE_MOCK = false

/**
 * API 根地址 — 联调对象仅 blog-server
 * 切换本地/线上：改 api/dev-target.js（勿只改此处）
 * - 本地：http://localhost:5000 + /api/v1
 * - 线上 Nest：https://jiang-xia.top + /x-blog/api/v1
 */
export const API_ORIGIN = ('' + TARGET_ORIGIN).replace(/\/$/, '')
export const API_PREFIX = ('' + TARGET_PREFIX).startsWith('/')
	? ('' + TARGET_PREFIX).replace(/\/$/, '')
	: '/' + ('' + TARGET_PREFIX).replace(/\/$/, '')

/**
 * 静态资源根（上传 /static/... 拼完整 URL；对齐 uniapp VITE_STATIC_BASEURL）
 * 线上：https://jiang-xia.top/x-api/blog-server；本地：与 API_ORIGIN 同
 */
export const STATIC_BASE_URL = ('' + TARGET_STATIC).replace(/\/$/, '')

/**
 * Web 本地开发是否走 Vite 同源代理（manifest/vite :3008 → API_ORIGIN）
 * true：浏览器请求 WEB_DEV_PROXY_PREFIX，避免直连线上/异端口 CORS
 * App / 小程序忽略此开关，始终直连完整地址
 */
export const WEB_DEV_PROXY = true

/** Web 代理前缀（须与 vite.config.js / api/dev-target.js 一致） */
export const WEB_DEV_PROXY_PREFIX = ('' + TARGET_PROXY_PREFIX).replace(/\/$/, '')

/**
 * 当前请求 baseURL（无尾斜杠）
 * Web + development + WEB_DEV_PROXY：返回同源前缀；其余端返回 origin+prefix
 */
export function getBaseUrl(): string {
	const full = API_ORIGIN + API_PREFIX
	// #ifdef WEB
	// Web 本地开发走 Vite 同源代理，避免 localhost:3008 直连 API_ORIGIN 触发 CORS
	if (WEB_DEV_PROXY) {
		let isDev = false
		// @ts-ignore process 仅打包工具注入
		if (typeof process !== 'undefined' && process.env != null && process.env.NODE_ENV === 'development') {
			isDev = true
		}
		if (isDev) {
			return WEB_DEV_PROXY_PREFIX.length > 0 ? WEB_DEV_PROXY_PREFIX : '/x-api'
		}
	}
	// #endif
	return full
}

/** 请求超时（ms） */
export const REQUEST_TIMEOUT = 60000

/** 业务成功码（与 blog-server / uniapp 一致） */
export const SUCCESS_CODES = [0, 200] as const

/**
 * 是否开启加密网关（对齐 Nuxt VITE_NUXT_OPEN_ENCRYPT）
 * true：相对路径前加 `/encrypt`，body/头走 gateway-crypto；须与 Nest 网关一致
 */
export const OPEN_ENCRYPT = false

/**
 * 网关算法套件（对齐 Nuxt VITE_NUXT_GATEWAY_CRYPTO / Nest app_gatewayCrypto）
 * blog-x 当前实现 aes；gm 未实现勿改
 */
export const GATEWAY_CRYPTO: 'aes' | 'gm' = 'aes'

/**
 * 开发模式日志开关
 * - true：打印加解密密文出入参（gateway-crypto）与请求失败类日志；不打印明文 body / 请求起止
 * - 发行前可改为 false
 */
export const OPEN_REQUEST_LOG = true
