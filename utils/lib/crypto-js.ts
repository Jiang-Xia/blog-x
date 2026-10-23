/**
 * crypto-js 加载器（vendored UMD）
 *
 * - 全端顶层副作用 import：微信小程序才能把 vendor 打进模块图；Android App 无 require
 * - 解析：UMD 已挂 globalThis / global，读 getRuntimeGlobal().CryptoJS
 * - 仅微信小程序再兜底 require（UMD 只写 module.exports 时）
 * - H5：勿对 CJS 做具名 import（Vite ESM 会报无导出）
 */
import './ensure-crypto-random'
import { getRuntimeGlobal } from './runtime-global'

// @ts-ignore 副作用执行 UMD，挂 CryptoJS
import '../vendor/crypto-js.js'

/**
 * 解析 CryptoJS 命名空间（全局优先；微信小程序再兜底 require）
 */
function resolveCrypto(): any {
	const g = getRuntimeGlobal()
	if (g != null && g.CryptoJS != null && g.CryptoJS.AES != null) {
		return g.CryptoJS
	}
	// #ifdef MP-WEIXIN
	// 小程序：若 UMD 只写了 module.exports，读 require 缓存并回写全局
	// @ts-ignore 微信小程序运行时提供 require
	const raw: any = require('../vendor/crypto-js.js')
	if (raw != null && raw.AES != null) {
		if (g != null) {
			g.CryptoJS = raw
		}
		return raw
	}
	if (raw != null && raw.default != null && raw.default.AES != null) {
		return raw.default
	}
	if (raw != null && raw.CryptoJS != null && raw.CryptoJS.AES != null) {
		return raw.CryptoJS
	}
	// #endif
	throw new Error('crypto-js load failed')
}

/** CryptoJS 命名空间（AES / HmacSHA256 / enc 等） */
export const CryptoJS = resolveCrypto()
