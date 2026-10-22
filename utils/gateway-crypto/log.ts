/**
 * 网关日志：受 api/config OPEN_REQUEST_LOG 控制
 * - 耗时：logTiming / logTimingSince
 * - 加解密出入参：logCrypto（只打密文侧，禁止明文 body）
 */
import { OPEN_REQUEST_LOG } from '../../api/config'

/** 开发环境打印 `[gateway-crypto] label Xms` */
export function logTiming(label: string, ms: number): void {
	if (OPEN_REQUEST_LOG) {
		console.log('[gateway-crypto] ' + label + ' ' + ms + 'ms')
	}
}

/** 以 startedAt 计算耗时并打印 */
export function logTimingSince(label: string, startedAt: number): void {
	logTiming(label, Date.now() - startedAt)
}

/**
 * Hex / 长串截断展示（>32 位 → `前32…(长度)`），避免控制台刷屏
 */
export function shortHex(v: string | null | undefined): string {
	if (v == null) return ''
	const s = '' + v
	if (s.length <= 32) return s
	return s.substring(0, 32) + '…(' + s.length + ')'
}

/**
 * 加解密出入参日志（仅密文侧字段；调用方勿传入明文 body）
 */
export function logCrypto(label: string, payload: Record<string, any> | null): void {
	if (!OPEN_REQUEST_LOG) return
	if (payload == null) {
		console.log('[gateway-crypto] ' + label)
		return
	}
	console.log('[gateway-crypto] ' + label, payload)
}
