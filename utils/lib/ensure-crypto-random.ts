/**
 * 在加载 crypto-js / jsencrypt 之前注入同步 getRandomValues
 *
 * - H5 / 多数 App 蒸汽：已有 Web Crypto → 空操作
 * - 微信小程序：无 window.crypto；wx.getRandomValues 为异步 API，
 *   不能直接塞给 crypto-js（其 WordArray.random 要同步 TypedArray API）
 *
 * 副作用：挂到 getRuntimeGlobal().crypto
 * 须作为加载器 / main.ts 的靠前 import（与 bridge 内 polyfill 双保险、幂等）
 */
import { getRuntimeGlobal } from './runtime-global'

let ensured = false

/**
 * 同步填充 TypedArray（对齐 Web Crypto getRandomValues 同步语义）
 */
function syncGetRandomValues(typedArray: any): any {
	if (typedArray == null || typedArray.buffer == null) {
		throw new TypeError('Expected a TypedArray')
	}
	const g = getRuntimeGlobal()
	const nativeCrypto = g != null ? g.crypto : null
	if (
		nativeCrypto != null &&
		typeof nativeCrypto.getRandomValues === 'function' &&
		nativeCrypto.getRandomValues !== syncGetRandomValues
	) {
		return nativeCrypto.getRandomValues(typedArray)
	}
	const view = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength)
	for (let i = 0; i < view.length; i++) {
		view[i] = Math.floor(Math.random() * 256)
	}
	return typedArray
}

/**
 * 确保全局存在可用于 crypto-js 的 crypto.getRandomValues（幂等）
 */
export function ensureCryptoRandom(): void {
	if (ensured) {
		return
	}
	ensured = true
	const g = getRuntimeGlobal()
	if (g == null) {
		return
	}
	const existing = g.crypto
	if (existing != null && typeof existing.getRandomValues === 'function') {
		return
	}
	const poly = {
		getRandomValues: syncGetRandomValues,
	}
	try {
		g.crypto = poly
	} catch (_e) {
		try {
			Object.defineProperty(g, 'crypto', {
				value: poly,
				configurable: true,
				writable: true,
			})
		} catch (_e2) {
			console.warn('[ensure-crypto-random] 无法注入 crypto.getRandomValues')
		}
	}
	if (typeof globalThis !== 'undefined' && globalThis !== g) {
		try {
			const gc: any = globalThis
			if (gc.crypto == null || typeof gc.crypto.getRandomValues !== 'function') {
				gc.crypto = g.crypto
			}
		} catch (_e3) {
			// 忽略跨 realm 只读
		}
	}
}

// 模块加载即执行
ensureCryptoRandom()
