/**
 * 通知 / RAG（对齐 blog-home-nuxt api/notification + rag）
 */
import { get, patch } from '../request'
import { mapNotifyItems } from '../adapters/user'
import type { NotifyItem } from '../../types/notify'

/**
 * 通知列表
 */
export async function fetchNotifications(page = 1, pageSize = 20): Promise<NotifyItem[]> {
	const res = await get('/notification/list', { page, pageSize })
	return mapNotifyItems(res)
}

/**
 * 未读数
 */
export async function fetchUnreadCount(): Promise<number> {
	try {
		const res = await get('/notification/unread-count', null, { silent: true })
		if (typeof res === 'number') return res
		if (res != null && res.count != null) return Number(res.count)
		if (res != null && res.unread != null) return Number(res.unread)
		return 0
	} catch (_) {
		return 0
	}
}

/**
 * 标记已读（可传单条 id）
 */
export function markNotificationsRead(id?: number): Promise<any> {
	const qs = id != null ? '?id=' + id : ''
	return patch('/notification/read' + qs, {})
}

/**
 * RAG 配额（AI 页）
 */
export function fetchRagQuota(): Promise<any> {
	return get('/rag/quota', null, { silent: true })
}

/**
 * RAG 状态
 */
export function fetchRagStatus(): Promise<any> {
	return get('/rag/status', null, { silent: true })
}
