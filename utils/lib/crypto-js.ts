/**
 * crypto-js 加载器（vendored UMD）
 *
 * - 微信小程序 / App：读 require 返回值（UMD 的 module.exports = CryptoJS）
 * - H5：副作用 import 后读 globalThis.CryptoJS（避免 Vite 对 CJS 具名导入报错）
 */
import './ensure-crypto-random'
import { getRuntimeGlobal } from './runtime-global'

// #ifdef H5
// @ts-ignore
import '../vendor/crypto-js.js'
// #endif

/**
 * 解析 CryptoJS 命名空间（require 返回值优先，再回落全局）
 */
function resolveCrypto(): any {
	// #ifndef H5
	// @ts-ignore uni-app x 编译到 MP/App 后为 require
	const raw: any = require('../vendor/crypto-js.js')
	if (raw != null && raw.AES != null) {
		const g = getRuntimeGlobal()
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
	const g = getRuntimeGlobal()
	if (g != null && g.CryptoJS != null && g.CryptoJS.AES != null) {
		return g.CryptoJS
	}
	throw new Error('crypto-js load failed')
}

/** CryptoJS 命名空间（AES / HmacSHA256 / enc 等） */
export const CryptoJS = resolveCrypto()
