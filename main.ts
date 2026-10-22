/**
 * 应用入口：挂载 Pinia，统一管理登录态与用户资料
 */
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
