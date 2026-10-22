/**
 * 联调辅助：USE_MOCK 或请求失败时回落 mock，避免页面空白
 */
import { USE_MOCK } from '../api/config'

/**
 * 优先调真实 API；失败或 USE_MOCK 时返回 fallback
 * @param task 真实请求
 * @param fallback mock / 默认值
 */
export async function apiOrMock<T>(task: () => Promise<T>, fallback: T): Promise<T> {
	if (USE_MOCK) {
		return fallback
	}
	try {
		return await task()
	} catch (_) {
		return fallback
	}
}
