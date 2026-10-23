/**
 * 接口环境配置（对齐 shopkeeper-cli request/config + env；加密/日志对齐 blog-home-nuxt）
 * 数据来源：常量默认值；HBuilderX 无 Vite 时改本文件即可切换联调目标
 */

/**
 * 是否合并 api/mocks 挡板（仅 apis 注册表层；页面禁止 if(USE_MOCK)）
 * 见 x-10-data-contract-simplicity.mdc
 */
export const USE_MOCK = false

/**
 * API 根地址（含前缀）— 联调对象仅 blog-server
 * - 本地：http://localhost:5000/api/v1
 * - 线上：https://jiang-xia.top/x-blog/api/v1
 */
export const API_ORIGIN = 'http://localhost:5000'
export const API_PREFIX = '/api/v1'

/** 拼接后的 baseURL，无尾斜杠 */
export function getBaseUrl(): string {
	const origin = API_ORIGIN.replace(/\/$/, '')
	const prefix = API_PREFIX.startsWith('/') ? API_PREFIX : '/' + API_PREFIX
	return origin + prefix.replace(/\/$/, '')
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
