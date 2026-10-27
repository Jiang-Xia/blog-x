/**
 * 静态资源 URL：上传返回 /static/...，image 组件需拼完整域名
 * 数据来源：api/config STATIC_BASE_URL（对齐 uniapp getStaticBaseUrl / Nuxt staticBaseUrl）
 * 注意：项目内字体/tabbar 走本地 /static/...，勿把整个 /static 代理到后端
 */
import { STATIC_BASE_URL } from '../api/config'

/**
 * 静态资源根（无尾斜杠）
 * 线上示例：https://jiang-xia.top/x-api/blog-server
 * 本地示例：http://localhost:5000
 */
export function getStaticBaseUrl(): string {
	return STATIC_BASE_URL
}

/**
 * 将 /static 相对路径解析为可访问完整 URL
 * 已是 http(s) / base64 则原样返回
 */
export function resolveStaticUrl(path: string = ''): string {
	if (path.length == 0) return ''
	if (path.indexOf('http') == 0 || path.indexOf('base64') >= 0) return path
	if (path.indexOf('/static') == 0) return getStaticBaseUrl() + path
	return path
}

/**
 * 从完整 URL 或带网关前缀的路径提取 /static/...（供 PATCH avatar 落库）
 * 例：https://jiang-xia.top/x-api/blog-server/static/uploads/avatar/xx.jpg → /static/uploads/avatar/xx.jpg
 */
export function toStaticPath(url: string = ''): string {
	if (url.length == 0) return ''
	if (url.indexOf('/static') == 0) return url
	const idx = url.indexOf('/static/')
	if (idx >= 0) return url.substring(idx)
	return url
}
