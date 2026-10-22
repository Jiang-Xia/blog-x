/**
 * 应用入口：挂载 Pinia，统一管理登录态与用户资料
 *
 * ensure-crypto-random 须尽早执行：微信小程序无 Web Crypto 时，
 * 后续 gateway-crypto / 登录 RSA 依赖的 crypto-js 才能 WordArray.random。
 */
import './utils/lib/ensure-crypto-random'
import App from './App.uvue'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

export function createApp() {
	const app = createSSRApp(App)
	app.use(createPinia())
	return {
		app,
	}
}
