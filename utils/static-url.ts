/**
 * 静态资源 URL：上传返回 /static/...，image 组件需拼完整域名
 * 数据来源：api/config API_ORIGIN；Web 开发态走 Vite `/static` 代理（与 uniapp 同构）
 */
import { API_ORIGIN, WEB_DEV_PROXY } from '../api/config'

/**
 * 静态资源根（无尾斜杠）；/static 挂在站点 origin，不在 /api/v1 下
 * Web + 代理开启时返回空串，使 `/static/...` 走同源 Vite 代理，避免跨域图裂/鉴权问题
 */
export function getStaticBaseUrl(): string {
	// #ifdef WEB
	if (WEB_DEV_PROXY) {
		let isDev = false
		// @ts-ignore process 仅打包工具注入
		if (typeof process !== 'undefined' && process.env != null && process.env.NODE_ENV === 'development') {
			isDev = true
		}
		if (isDev) {
			return ''
		}
	}
	// #endif
	return API_ORIGIN.replace(/\/$/, '')
}

/**
 * 将 /static 相对路径解析为可访问完整 URL
 */
export function resolveStaticUrl(path: string = ''): string {
	if (path.length == 0) return ''
	if (path.indexOf('http') == 0 || path.indexOf('base64') >= 0) return path
	if (path.indexOf('/static') == 0) return getStaticBaseUrl() + path
	return path
}
