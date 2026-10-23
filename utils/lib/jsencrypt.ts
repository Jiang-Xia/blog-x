/**
 * jsencrypt 加载器（vendored UMD）
 *
 * - 全端顶层副作用 import：把 vendor 打进模块图，并挂 globalThis.JSEncrypt
 *   （仅函数内 require：微信小程序会报 module is not defined；Android App 无 require）
 * - 解析：优先读 getRuntimeGlobal().JSEncrypt；仅微信小程序再兜底 require 返回值
 * - H5：勿对 CJS 做具名 import（Vite ESM 会报无导出）
 */
import './ensure-crypto-random'
import { getRuntimeGlobal } from './runtime-global'

// @ts-ignore 副作用执行 UMD，挂 JSEncrypt
import '../vendor/jsencrypt.min.js'

/**
 * 解析 JSEncrypt 构造函数（全局优先；微信小程序再兜底 require）
 */
function resolveJSEncrypt(): any {
	const g = getRuntimeGlobal()
	if (g != null && typeof g.JSEncrypt === 'function') {
		return g.JSEncrypt
	}
	// #ifdef MP-WEIXIN
	// 小程序：若 UMD 只写了 module.exports、未挂全局，读 require 缓存并回写
	// @ts-ignore 微信小程序运行时提供 require
	const raw: any = require('../vendor/jsencrypt.min.js')
	if (typeof raw === 'function') {
		if (g != null) {
			g.JSEncrypt = raw
		}
		return raw
	}
	if (raw != null && typeof raw.default === 'function') {
		return raw.default
	}
	if (raw != null && typeof raw.JSEncrypt === 'function') {
		return raw.JSEncrypt
	}
	// #endif
	throw new Error('jsencrypt load failed')
}

/** JSEncrypt 构造函数 */
export const JSEncrypt = resolveJSEncrypt()
