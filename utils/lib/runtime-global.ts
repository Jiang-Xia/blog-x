/**
 * 跨端运行时全局对象（App 蒸汽 / H5 / 微信小程序）
 *
 * 勿假设存在 window：小程序与部分 App JS 引擎只有 globalThis / global。
 */

/**
 * 取得可挂载属性的全局对象（UMD 库、crypto polyfill 共用）
 * @returns 全局对象；极端环境回落空对象，避免写 undefined.xxx 崩溃
 */
export function getRuntimeGlobal(): any {
	// #ifdef MP-WEIXIN
	// 微信小程序：优先 global（与部分基础库 / 分包上下文更一致），再 globalThis
	// @ts-ignore 小程序运行时注入 global
	if (typeof global !== 'undefined' && global != null) {
		// @ts-ignore
		return global
	}
	// #endif
	// #ifdef H5
	// H5：优先 window，兼容 iframe / worker 边界
	if (typeof window !== 'undefined') {
		return window
	}
	// #endif
	if (typeof globalThis !== 'undefined') {
		return globalThis
	}
	if (typeof self !== 'undefined') {
		return self
	}
	return {}
}
