/**
 * 登录态变更事件（避免 request ↔ Pinia 循环依赖）
 * clearToken 时通知；App / Store 侧注册后 hydrate
 */

type AuthClearedHandler = () => void

const clearedHandlers: AuthClearedHandler[] = []

/**
 * 注册「本地 token 已清除」回调（可多次；冷启动注册一次即可）
 */
export function onAuthCleared(handler: AuthClearedHandler): void {
	clearedHandlers.push(handler)
}

/**
 * 通知监听方：storage 登录态已清空，请同步 Pinia
 */
export function emitAuthCleared(): void {
	for (let i = 0; i < clearedHandlers.length; i++) {
		clearedHandlers[i]()
	}
}
