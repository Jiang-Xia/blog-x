/**
 * 静态资源 URL：上传返回 /static/...，image 组件需拼完整域名
 * 数据来源：api/config API_ORIGIN（与 uniapp getStaticBaseUrl 同构）
 * 注意：项目内字体/tabbar 走本地 /static/...，勿把整个 /static 代理到后端
 */
import { API_ORIGIN } from '../api/config'

/**
 * 静态资源根（无尾斜杠）；上传文件的 /static 挂在后端 origin，不在 /api/v1 下
 */
export function getStaticBaseUrl(): string {
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
