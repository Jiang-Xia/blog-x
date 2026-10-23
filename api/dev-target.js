/**
 * 联调目标（api/config.ts 与 vite.config.js 共用，改一处即可）
 *
 * - 本地 Nest：API_ORIGIN=http://localhost:5000，API_PREFIX=/api/v1
 * - 线上 Nest：API_ORIGIN=https://jiang-xia.top，API_PREFIX=/x-blog/api/v1
 * - 本地 Go：  API_ORIGIN=http://localhost:8000，API_PREFIX=/api/v1
 *
 * Web 开发：浏览器请求 WEB_DEV_PROXY_PREFIX，由 vite 转发到 origin+prefix（防 CORS）
 */

/** @type {string} 后端 origin，无尾斜杠 */
export const API_ORIGIN = 'https://jiang-xia.top'

/** @type {string} API 路径前缀，须以 / 开头（线上 Nest 必须是 /x-blog/api/v1，不是 /api/v1） */
export const API_PREFIX = '/x-blog/api/v1'

/** @type {string} Web Vite 代理前缀（同源） */
export const WEB_DEV_PROXY_PREFIX = '/x-api'
