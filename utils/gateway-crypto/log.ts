/**
 * 网关耗时日志：受 api/config OPEN_REQUEST_LOG 控制
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
