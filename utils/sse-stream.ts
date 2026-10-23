/**
 * SSE 流式请求（对齐 blog-home-uniapp sse-stream）
 * 数据来源：uni.request enableChunked；App/小程序端分片回调，结束时 success 收尾
 * 副作用：持有 RequestTask，abort 可中断
 */
import { getBaseUrl } from '../api/config'
import { getToken } from './storage'

export type SseStreamOptions = {
	/** 相对路径如 /rag/query-stream，或完整 URL */
	path: string
	body: any
	/** 已去掉 data: 前缀的单行 JSON / [DONE] */
	onMessage: (data: string) => void
	onError?: (message: string) => void
	onDone?: () => void
}

let sseBuffer = ''

/**
 * 解析 SSE 文本块，按行回调 onMessage
 */
function feedSseChunk(text: string, onMessage: (data: string) => void, onDone?: () => void): void {
	sseBuffer = sseBuffer + text
	const lines = sseBuffer.split('\n')
	sseBuffer = lines.length > 0 ? lines[lines.length - 1] : ''
	const end = lines.length > 0 ? lines.length - 1 : 0
	for (let i = 0; i < end; i++) {
		const trimmed = lines[i].trim()
		if (trimmed.indexOf('data:') != 0) continue
		const data = trimmed.substring(5).trim()
		if (data == '[DONE]') {
			if (onDone != null) onDone()
			continue
		}
		if (data.length > 0) onMessage(data)
	}
}

/**
 * ArrayBuffer → UTF-8 字符串（无 TextDecoder 时降级）
 */
function arrayBufferToUtf8(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	let out = ''
	for (let i = 0; i < bytes.length; i++) {
		out = out + String.fromCharCode(bytes[i])
	}
	try {
		return decodeURIComponent(escape(out))
	} catch (_) {
		return out
	}
}

/**
 * 发起 SSE POST，返回 abort 函数
 */
export function startSseStream(options: SseStreamOptions): () => void {
	sseBuffer = ''
	let aborted = false
	/** 避免 chunk + success 各调一次 onDone */
	let finished = false
	const base = getBaseUrl()
	const url =
		options.path.indexOf('http') == 0
			? options.path
			: base + (options.path.indexOf('/') == 0 ? options.path : '/' + options.path)
	const header: Record<string, string> = {
		'Content-Type': 'application/json;charset=UTF-8',
		Accept: 'text/event-stream',
	}
	const token = getToken()
	if (token.length > 0) {
		header['Authorization'] = 'Bearer ' + token
	}

	/**
	 * 收尾回调（只触发一次）
	 */
	function finishOnce(): void {
		if (finished || aborted) return
		finished = true
		if (options.onDone != null) options.onDone()
	}

	const task = uni.request({
		url,
		method: 'POST',
		header,
		data: options.body,
		enableChunked: true,
		responseType: 'arraybuffer',
		timeout: 120000,
		success: (res) => {
			if (aborted) return
			const code = res.statusCode != null ? res.statusCode : 0
			if (code >= 400) {
				if (options.onError != null) options.onError('请求失败 (' + code + ')')
				return
			}
			// 部分端无 onChunkReceived，success 时一次性解析完整体
			if (res.data != null && typeof res.data !== 'string') {
				const text = arrayBufferToUtf8(res.data as ArrayBuffer)
				if (text.length > 0) {
					feedSseChunk(text, options.onMessage, finishOnce)
				}
			} else if (typeof res.data === 'string' && (res.data as string).length > 0) {
				feedSseChunk(res.data as string, options.onMessage, finishOnce)
			}
			finishOnce()
		},
		fail: (err) => {
			if (aborted) return
			if (options.onError != null) {
				options.onError(err.errMsg != null ? err.errMsg : '流式请求失败')
			}
		},
	}) as any

	// App / 小程序：分片回调（若基座支持）
	if (task != null && typeof task.onChunkReceived === 'function') {
		task.onChunkReceived((res: { data: ArrayBuffer }) => {
			if (aborted) return
			const text = arrayBufferToUtf8(res.data)
			feedSseChunk(text, options.onMessage, finishOnce)
		})
	}

	return () => {
		aborted = true
		try {
			if (task != null && typeof task.abort === 'function') {
				task.abort()
			}
		} catch (_) {}
	}
}

/**
 * 从 AI SDK UI Message Stream 的 data JSON 提取 text-delta
 */
export function parseUiTextDelta(data: string): string {
	try {
		const chunk = JSON.parse(data)
		if (chunk != null && chunk.type == 'text-delta' && chunk.delta != null) {
			return '' + chunk.delta
		}
		return ''
	} catch (_) {
		return ''
	}
}
