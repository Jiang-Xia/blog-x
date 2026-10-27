/**
 * 联调目标（api/config.ts 与 vite.config.js 共用，改一处即可）
 *
 * - 本地 Nest：API_ORIGIN=http://localhost:5000，API_PREFIX=/api/v1，STATIC=同 origin
 * - 线上 Nest：API_ORIGIN=https://jiang-xia.top，API_PREFIX=/x-blog/api/v1，
 *              STATIC_BASE_URL=https://jiang-xia.top/x-api/blog-server
 * - 本地 Go：  API_ORIGIN=http://localhost:8000，API_PREFIX=/api/v1，STATIC=同 origin
 * - 线上 Go：  STATIC_BASE_URL=https://go.jiang-xia.top/x-api/blog-server
 *
 * Web 开发：浏览器请求 WEB_DEV_PROXY_PREFIX，由 vite 转发到 origin+prefix（防 CORS）
 * 上传图预览：resolveStaticUrl 拼 STATIC_BASE_URL + /static/...（勿用 API_ORIGIN 直拼）
 */

/** @type {string} 后端 origin，无尾斜杠 */
export const API_ORIGIN = 'https://jiang-xia.top'

/** @type {string} API 路径前缀，须以 / 开头（线上 Nest 必须是 /x-blog/api/v1，不是 /api/v1） */
export const API_PREFIX = '/x-blog/api/v1'

/**
 * 静态资源根（无尾斜杠）：上传返回 /static/... 时拼完整 URL
 * 线上网关路径与 API_PREFIX 不同（/x-api/blog-server），本地与 API_ORIGIN 相同
 * @type {string}
 */
export const STATIC_BASE_URL = 'https://jiang-xia.top/x-api/blog-server'

/** @type {string} Web Vite 代理前缀（同源） */
export const WEB_DEV_PROXY_PREFIX = '/x-api'
