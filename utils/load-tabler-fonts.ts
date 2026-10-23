/**
 * Tabler 图标字体加载
 * - App / Web：styles/x-base.css 的 @font-face 本地 /static/fonts
 * - 微信小程序：App.onLaunch → uni.loadFontFace（global）
 *   默认：utils/tabler-mp-fonts.ts 的子集 ttf Data URL（无网络、无域名白名单）
 *   备选：USE_CDN_FALLBACK = true 时拉 HTTPS 全量（需 CORS / 合法域名）
 *
 * 注意：勿再依赖 WXSS @font-face + base64/woff2（微信端经常不生效；Skyline 不支持 woff2）。
 * Data URL 需基础库 ≥ 3.7.9；建议开发者工具与真机基础库调到 3.7.9+。
 */

// #ifdef MP-WEIXIN
import { TABLER_ICONS_BASE64, TABLER_ICONS_FILLED_BASE64 } from './tabler-mp-fonts'

/** true 时小程序端改用下方 HTTPS 全量字体（默认 false，用本地 base64 子集） */
const USE_CDN_FALLBACK = false

/** 国内 CDN：BootCDN tabler-icons@3.44.0 */
const TABLER_ICONS_URL =
	'https://cdn.bootcdn.net/ajax/libs/tabler-icons/3.44.0/fonts/tabler-icons.ttf'
const TABLER_ICONS_FILLED_URL =
	'https://cdn.bootcdn.net/ajax/libs/tabler-icons/3.44.0/fonts/tabler-icons-filled.ttf'

/**
 * 加载单个字体族
 * @param family CSS font-family 名
 * @param sourceUrl HTTPS 地址或 data:font/ttf;... Data URL（勿再包一层 url()）
 */
function loadOne(family: string, sourceUrl: string): void {
	if (sourceUrl.length == 0) {
		return
	}
	uni.loadFontFace({
		global: true,
		family: family,
		source: 'url("' + sourceUrl + '")',
		success: () => {
			console.log('[tabler-font] loaded', family)
		},
		fail: (err) => {
			const msg = err != null && err.errMsg != null ? '' + err.errMsg : 'fail'
			console.warn('[tabler-font] load fail', family, msg)
		},
	})
}
// #endif

/**
 * 微信小程序冷启动加载 Tabler 字体（须在 App.onLaunch 调用，global 才全局生效）
 * 其它端为空操作（走本地 @font-face）
 */
export function loadTablerFonts(): void {
	// #ifdef MP-WEIXIN
	if (USE_CDN_FALLBACK) {
		loadOne('tabler-icons', TABLER_ICONS_URL)
		loadOne('tabler-icons-filled', TABLER_ICONS_FILLED_URL)
		return
	}
	// Data URL：基础库 3.7.9+；格式用 ttf（官方推荐，兼容优于 woff2）
	loadOne(
		'tabler-icons',
		'data:font/ttf;charset=utf-8;base64,' + TABLER_ICONS_BASE64,
	)
	if (TABLER_ICONS_FILLED_BASE64.length > 0) {
		loadOne(
			'tabler-icons-filled',
			'data:font/ttf;charset=utf-8;base64,' + TABLER_ICONS_FILLED_BASE64,
		)
	}
	// #endif
}
