/**
 * jsencrypt 加载器（vendored UMD）
 *
 * - 微信小程序 / App：UMD 命中 CommonJS，只写 module.exports，**必须读 require 返回值**
 *   （仅副作用 import + 读 globalThis 会失败）
 * - H5：Vite ESM 下对 CJS 具名 import 不友好；副作用执行 UMD 后读 globalThis.JSEncrypt
 */
import './ensure-crypto-random'
import { getRuntimeGlobal } from './runtime-global'

// #ifdef H5
// H5：副作用执行 UMD，把构造函数挂到 globalThis
// @ts-ignore
import '../vendor/jsencrypt.min.js'
// #endif

/**
 * 解析 JSEncrypt 构造函数（require 返回值优先，再回落全局）
 */
function resolveJSEncrypt(): any {
	// #ifndef H5
	// 小程序 / App：直接拿 CJS 导出（函数本体）
	// @ts-ignore uni-app x 编译到 MP/App 后为 require
	const raw: any = require('../vendor/jsencrypt.min.js')
	if (typeof raw === 'function') {
		const g = getRuntimeGlobal()
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
	const g = getRuntimeGlobal()
	if (g != null && typeof g.JSEncrypt === 'function') {
		return g.JSEncrypt
	}
	throw new Error('jsencrypt load failed')
}

/** JSEncrypt 构造函数 */
export const JSEncrypt = resolveJSEncrypt()
