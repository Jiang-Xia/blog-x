/**
 * Web 开发代理：浏览器同源请求 /x-api → 转发到 API_ORIGIN+API_PREFIX，避免 CORS
 * 目标与前缀见 api/dev-target.js（与 api/config.ts 共用）
 * 文档：https://doc.dcloud.net.cn/uni-app-x/web/ （配置devServer允许跨域）
 */
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { API_ORIGIN, API_PREFIX, WEB_DEV_PROXY_PREFIX } from './api/dev-target.js'

const origin = String(API_ORIGIN || '').replace(/\/$/, '')
const apiPrefix = String(API_PREFIX || '/api/v1').replace(/\/$/, '')
const proxyPrefix = String(WEB_DEV_PROXY_PREFIX || '/x-api').replace(/\/$/, '')

export default defineConfig({
	plugins: [uni()],
	server: {
		port: 3008,
		proxy: {
			// http://localhost:3008/x-api/article/list → {origin}{apiPrefix}/article/list
			[proxyPrefix]: {
				target: origin,
				changeOrigin: true,
				rewrite: (path) => apiPrefix + path.replace(new RegExp('^' + proxyPrefix), ''),
			},
			// 封面/头像等 /static（本地 Nest 挂根；线上若走 /x-api/blog-server 见 README）
			'/static': {
				target: origin,
				changeOrigin: true,
			},
		},
	},
})
